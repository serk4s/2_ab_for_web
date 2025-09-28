$(document).ready(function() {
    "use strict";

    // 1. Простая анимация: Плавное появление всех секций при загрузке страницы
    $('section').css('opacity', 0).delay(200).each(function(i) {
        $(this).delay(i * 50).animate({ opacity: 1 }, 400);
    });

    /* ================================================= */
    /* 2. Динамическое Портфолио (Загрузка из JSON) */
    /* ================================================= */
    function renderPortfolio(data) {
        const $portfolioGrid = $('#portfolio .portfolio-grid');
        $portfolioGrid.empty();

        $.each(data, function(index, item) {
            // Асимметрия: третий элемент (индекс 2) или элемент с флагом is_large занимает 2 колонки
            const isLarge = item.is_large || index === 2;

            const $item = $('<div>', {
                class: 'portfolio-item' + (isLarge ? ' large-item' : '')
            });

            $('<h3>').text(item.title).appendTo($item);
            $('<p>').text(item.description).appendTo($item);
            $('<a>', {
                href: item.link,
                target: '_blank',
                text: 'ПОСМОТРЕТЬ'
            }).appendTo($item);

            $item.appendTo($portfolioGrid);
        });
    }

    // ИСПРАВЛЕНИЕ ПУТИ: Используем 'data/portfolio.json' относительно index.html
    $.getJSON('data/portfolio.json', function(data) {
        renderPortfolio(data);
    }).fail(function() {
        console.error("Не удалось загрузить portfolio.json. Проверьте путь и файл.");
        $('#portfolio .portfolio-grid').html('<p style="text-align: center; color: var(--color-accent); padding: 20px;">❌ Ошибка загрузки портфолио. Проверьте, что файл data/portfolio.json существует и корректен.</p>');
    });


    /* ================================================= */
    /* 3. Модальное Окно и Форма Обратной Связи */
    /* ================================================= */
    const $modal = $('#contactModal');
    const $form = $('#contactForm');
    const $formStatus = $('#formStatus');

    // Открытие модального окна (исправляет некликабельность кнопки)
    $('#openModalButton').on('click', function() {
        $modal.fadeIn(300);
        $formStatus.hide().empty();
        $form.trigger('reset').find('input, textarea').removeClass('error-field');
    });

    // Закрытие по крестику
    $('.close-modal').on('click', function() {
        $modal.fadeOut(300);
    });

    // Закрытие по оверлею
    $modal.on('click', function(e) {
        if ($(e.target).is($modal)) {
            $modal.fadeOut(300);
        }
    });

    // 4. Валидация и симуляция отправки формы
    $form.on('submit', function(e) {
        e.preventDefault();

        let isValid = true;
        const name = $('#name').val().trim();
        const email = $('#email').val().trim();
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

        $form.find('input').removeClass('error-field');
        $formStatus.hide().empty();

        if (name === "") {
            $('#name').addClass('error-field');
            isValid = false;
        }

        if (email === "" || !emailRegex.test(email)) {
            $('#email').addClass('error-field');
            isValid = false;
        }

        if (isValid) {
            // Симуляция отправки AJAX-запросом
            $formStatus.text('Отправка...').css('color', 'var(--color-accent)').slideDown(200);
            $('#submitButton').prop('disabled', true).text('ОТПРАВКА...');

            $.ajax({
                url: 'https://httpbin.org/post', // Тестовый эндпоинт
                type: 'POST',
                data: $form.serialize(),
                dataType: 'json',
                timeout: 1500
            }).done(function() {
                $formStatus.text('✅ Сообщение успешно отправлено!').css('color', 'var(--color-text)');
                $form.trigger('reset');
            }).fail(function() {
                $formStatus.text('❌ Ошибка отправки.').css('color', '#ff0000');
            }).always(function() {
                $('#submitButton').prop('disabled', false).text('ОТПРАВИТЬ');
            });

        } else {
            $formStatus.text('Пожалуйста, заполните обязательные поля корректно.').css('color', '#ff0000').slideDown(200);
        }
    });


    /* ================================================= */
    /* 5. Кнопка "Вверх" (Плавный скролл) */
    /* ================================================= */
    const $scrollToTop = $('#scrollToTop');

    $(window).on('scroll', function() {
        if ($(this).scrollTop() > 300) {
            $scrollToTop.fadeIn(200);
        } else {
            $scrollToTop.fadeOut(200);
        }
    });

    $scrollToTop.on('click', function() {
        $('html, body').animate({scrollTop: 0}, 600); // Плавный скролл
    });


    /* ================================================= */
    /* 6. Выпадающее Меню (Гамбургер) */
    /* ================================================= */
    // Кнопка добавляется в HTML в пункте 2.2
    $('#mobileMenuButton').on('click', function() {
        $('header nav ul').slideToggle(300); // Используем slideToggle
    });

    // Закрытие меню после клика на ссылку в мобильной версии
    $('header nav a').on('click', function() {
        if ($(window).width() <= 767) {
            $('header nav ul').slideUp(300);
        }
    });


    /* ================================================= */
    /* 7. Подсветка Активного Пункта Меню при Скролле */
    /* ================================================= */
    const $navLinks = $('nav a');
    const $sections = $('section');

    function updateActiveLink() {
        const scrollPos = $(document).scrollTop();

        $sections.each(function() {
            const $currentSection = $(this);
            // Учитываем высоту хедера и небольшой запас
            const sectionTop = $currentSection.offset().top - 100;
            const sectionBottom = sectionTop + $currentSection.outerHeight();
            const sectionId = $currentSection.attr('id');

            if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                $navLinks.removeClass('active');
                $('nav a[href="#' + sectionId + '"]').addClass('active');
            }
        });
    }

    $(window).on('scroll', updateActiveLink);
    // Инициализация при загрузке
    updateActiveLink();


    /* ================================================= */
    /* 8. Карусель Навыков */
    /* ================================================= */
    const $carousel = $('.skills-carousel');
    const $skillsList = $('.skills-list');
    const $skills = $skillsList.children('div');

    // Если элементов нет, прекращаем
    if ($skills.length === 0) return;

    let skillWidth = $skills.first().outerWidth(true);
    let currentIndex = 0;

    // Устанавливаем ширину списка для flexbox
    $skillsList.css('width', $skills.length * skillWidth);

    // Пересчитываем ширину при изменении размера окна
    $(window).on('resize', function() {
        skillWidth = $skills.first().outerWidth(true);
        $skillsList.css('width', $skills.length * skillWidth);
        updateCarousel(); // Сброс позиции при изменении размера
    });


    function updateCarousel() {
        const offset = -currentIndex * skillWidth;
        $skillsList.css('transform', `translateX(${offset}px)`);

        // Деактивация кнопок
        $('#prevSkill').prop('disabled', currentIndex === 0);
        $('#nextSkill').prop('disabled', currentIndex >= $skills.length - 1);
    }

    // Кнопка "СЛЕДУЮЩИЙ"
    $('#nextSkill').on('click', function() {
        if (currentIndex < $skills.length - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    // Кнопка "ПРЕДЫДУЩИЙ"
    $('#prevSkill').on('click', function() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    // Автопрокрутка
    let autoScrollInterval = setInterval(function() {
        if (currentIndex < $skills.length - 1) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateCarousel();
    }, 4000); // Автопрокрутка каждые 4 секунды

    // Остановить автопрокрутку при наведении
    $carousel.on('mouseenter', function() {
        clearInterval(autoScrollInterval);
    }).on('mouseleave', function() {
        autoScrollInterval = setInterval(function() {
            if (currentIndex < $skills.length - 1) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            updateCarousel();
        }, 4000);
    });

    // Инициализация карусели
    updateCarousel();

});