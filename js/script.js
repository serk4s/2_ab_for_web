$(document).ready(function() {
    // Используем строгий режим
    "use strict";

    // Плавное появление всех секций при загрузке страницы
    $('section').hide().fadeIn(800);

    /* ================================================= */
    /* 1. Динамическое Портфолио (Загрузка из JSON) */
    /* ================================================= */
    function renderPortfolio(data) {
        const $portfolioGrid = $('#portfolio .portfolio-grid');
        $portfolioGrid.empty(); // Очищаем статический контент

        $.each(data, function(index, item) {
            // Условие для асимметрии (Проект 3, и любые с флагом is_large: true)
            const isLarge = item.is_large || index === 2; // index 2 - это Проект 3

            const $item = $('<div>', {
                class: 'portfolio-item' + (isLarge ? ' large-item' : '')
            });

            // Добавляем заголовок
            $('<h3>').text(item.title).appendTo($item);

            // Добавляем описание
            $('<p>').text(item.description).appendTo($item);

            // Добавляем ссылку
            $('<a>', {
                href: item.link,
                target: '_blank',
                text: 'ПОСМОТРЕТЬ'
            }).appendTo($item);

            $item.appendTo($portfolioGrid);
        });

        // Добавляем класс для асимметрии (нужно, чтобы CSS работал для динамического элемента)
        if ($('.large-item').length === 0) {
            $portfolioGrid.find('.portfolio-item').eq(2).addClass('large-item');
        }
    }

    // Загрузка данных из JSON
    $.getJSON('/Users/main/WebstormProjects/2_lab_for_web/data/portfolio.json', function(data) {
        renderPortfolio(data);
    }).fail(function() {
        console.error("Не удалось загрузить portfolio.json. Проверьте путь.");
        $('#portfolio .portfolio-grid').html('<p style="text-align: center;">Не удалось загрузить проекты. Проверьте путь (../data/portfolio.json) и содержимое JSON-файла.</p>');
    });


    /* ================================================= */
    /* 2. Модальное Окно и Форма Обратной Связи */
    /* ================================================= */
    const $modal = $('#contactModal'); // Селектор модального окна
    const $form = $('#contactForm');
    const $formStatus = $('#formStatus');

    // Открытие модального окна
    $('#openModalButton').on('click', function() {
        $modal.fadeIn(300); // Плавное появление
        $formStatus.hide().empty(); // Сброс статуса
        $form.trigger('reset'); // Очистка формы
    });

    // Закрытие по крестику
    $('.close-modal').on('click', function() {
        $modal.fadeOut(300); // Плавное исчезновение
    });

    // Закрытие по оверлею
    $modal.on('click', function(e) {
        if ($(e.target).is($modal)) {
            $modal.fadeOut(300);
        }
    });

    // Валидация и симуляция отправки формы
    $form.on('submit', function(e) {
        e.preventDefault();

        let isValid = true;
        const name = $('#name').val().trim();
        const email = $('#email').val().trim();
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

        // Сброс ошибок
        $form.find('input').removeClass('error-field');
        $formStatus.hide().empty();

        // Проверка имени
        if (name === "") {
            $('#name').addClass('error-field');
            isValid = false;
        }

        // Проверка email
        if (email === "" || !emailRegex.test(email)) {
            $('#email').addClass('error-field');
            isValid = false;
        }

        if (isValid) {
            // Симуляция отправки AJAX-запросом
            $formStatus.text('Отправка...').css('color', 'var(--color-accent)').slideDown(200);
            $('#submitButton').prop('disabled', true).text('ОТПРАВКА...');

            $.ajax({
                url: 'https://httpbin.org/post', // Эндпоинт для симуляции POST
                type: 'POST',
                data: $form.serialize(), // Собираем данные формы
                dataType: 'json',
                timeout: 1000 // Симуляция задержки 1 секунда
            }).done(function(response) {
                // Успешный ответ
                $formStatus.text('✅ Сообщение успешно отправлено!').css('color', 'var(--color-text)');
                $form.trigger('reset');
            }).fail(function() {
                // Ошибка
                $formStatus.text('❌ Ошибка отправки. Попробуйте позже.').css('color', '#ff0000');
            }).always(function() {
                // В любом случае
                $('#submitButton').prop('disabled', false).text('ОТПРАВИТЬ');
            });

        } else {
            $formStatus.text('Пожалуйста, заполните обязательные поля корректно.').css('color', '#ff0000').slideDown(200);
        }
    });

    /* ================================================= */
    /* 3. Кнопка "Наверх" (Scroll To Top) */
    /* ================================================= */
    const $scrollToTop = $('#scrollToTop');

    // Появление/скрытие кнопки
    $(window).on('scroll', function() {
        if ($(this).scrollTop() > 300) {
            $scrollToTop.fadeIn(200);
        } else {
            $scrollToTop.fadeOut(200);
        }
    });

    // Плавный скролл при клике
    $scrollToTop.on('click', function() {
        $('html, body').animate({scrollTop: 0}, 600);
    });


    /* ================================================= */
    /* 4. Выпадающее Меню (Мобильная версия) */
    /* ================================================= */
    // Создаем кнопку для мобильного меню
    const $mobileMenuButton = $('<button>', {
        id: 'mobileMenuButton',
        html: '&#9776;' // Гамбургер-иконка
    });

    // Вставляем кнопку рядом с заголовком
    $('header h1').after($mobileMenuButton);

    // Обработчик клика
    $mobileMenuButton.on('click', function() {
        $('header nav ul').slideToggle(300); // Плавное открытие/закрытие
    });

    // Закрытие меню после клика на ссылку в мобильной версии
    $('header nav a').on('click', function() {
        if ($(window).width() <= 767) {
            $('header nav ul').slideUp(300);
        }
    });


    /* ================================================= */
    /* 5. Подсветка Активного Пункта Меню при Скролле */
    /* ================================================= */
    const $navLinks = $('nav a');
    const $sections = $('section');

    // Обновление активного класса
    function updateActiveLink() {
        const scrollPos = $(document).scrollTop();

        $sections.each(function() {
            const $currentSection = $(this);
            const sectionTop = $currentSection.offset().top - 80; // Смещение для хедера
            const sectionBottom = sectionTop + $currentSection.outerHeight();
            const sectionId = $currentSection.attr('id');

            if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                $navLinks.removeClass('active');
                $('nav a[href="#' + sectionId + '"]').addClass('active');
            }
        });

        // Если находимся в самом верху (перед первой секцией)
        if (scrollPos < $('#about').offset().top - 80) {
            $navLinks.removeClass('active');
            $('nav a[href="#about"]').addClass('active');
        }
    }

    $(window).on('scroll', updateActiveLink);
    // Выполняем при загрузке
    updateActiveLink();


    /* ================================================= */
    /* 6. Карусель Навыков */
    /* ================================================= */
    const $carousel = $('.skills-carousel');
    const $skillsList = $('.skills-list');
    const $skills = $skillsList.children('div');
    const skillWidth = $skills.outerWidth(true); // Ширина элемента + margin
    let currentIndex = 0;

    if ($skills.length > 0) {
        // Устанавливаем ширину списка для flexbox (нужно для корректной прокрутки)
        $skillsList.css('width', $skills.length * skillWidth);
    }

    function updateCarousel() {
        const offset = -currentIndex * skillWidth;
        $skillsList.css('transform', `translateX(${offset}px)`);

        // Деактивация кнопок
        $('#prevSkill').prop('disabled', currentIndex === 0);
        $('#nextSkill').prop('disabled', currentIndex >= $skills.length - 1);
    }

    // Обработчики кнопок
    $('#nextSkill').on('click', function() {
        if (currentIndex < $skills.length - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    $('#prevSkill').on('click', function() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    // Автопрокрутка
    let autoScrollInterval = setInterval(function() {
        if (currentIndex < $skills.length - 1) {
            $('#nextSkill').trigger('click');
        } else {
            // Переход к первому элементу
            currentIndex = -1; // Чтобы при следующем клике сработал index 0
            $('#nextSkill').trigger('click');
        }
    }, 4000); // Автопрокрутка каждые 4 секунды

    // Остановить автопрокрутку при наведении на карусель
    $carousel.on('mouseenter', function() {
        clearInterval(autoScrollInterval);
    }).on('mouseleave', function() {
        autoScrollInterval = setInterval(function() {
            if (currentIndex < $skills.length - 1) {
                $('#nextSkill').trigger('click');
            } else {
                currentIndex = -1;
                $('#nextSkill').trigger('click');
            }
        }, 4000);
    });

    // Инициализация карусели
    updateCarousel();

});