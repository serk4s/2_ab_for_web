$(document).ready(function() {
    /* ===== Выпадающее меню ===== */
    $(".menu-toggle").click(function() {
        $("nav ul").slideToggle();
    });
    $(window).resize(function() {
        if ($(window).width() > 767) {
            $("nav ul").removeAttr("style");
        }
    });

    /* ===== Модальное окно ===== */
    $("#openModal").click(function() {
        $(".overlay, .modal").fadeIn();
    });
    $(".close, .overlay").click(function() {
        $(".overlay, .modal").fadeOut();
    });
    $(document).on("keydown", function(e) {
        if (e.key === "Escape") $(".overlay, .modal").fadeOut();
    });

    /* ===== Форма обратной связи ===== */
    // ==== Модальное окно ====
    $(document).ready(function () {
        // Открытие модалки
        $("#openModal").on("click", function () {
            $(".overlay, .contact-modal").fadeIn(300);
        });

        // Закрытие по крестику
        $(".contact-modal .close").on("click", function () {
            $(".overlay, .contact-modal").fadeOut(300);
        });

        // Закрытие по клику на overlay
        $(".overlay").on("click", function () {
            $(".overlay, .contact-modal").fadeOut(300);
        });

        // ==== Валидация и "отправка" формы ====
        $("#contactForm").on("submit", function (e) {
            e.preventDefault();

            let name = $("input[name='name']").val().trim();
            let email = $("input[name='email']").val().trim();
            let message = $("textarea[name='message']").val().trim();

            // Простая валидация
            if (!name || !email || !message) {
                $(".form-response").text("⚠ Пожалуйста, заполните все поля.")
                    .css("color", "red");
                return;
            }
            // Проверка email через regexp
            let emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
            if (!email.match(emailPattern)) {
                $(".form-response").text("⚠ Введите корректный email.")
                    .css("color", "red");
                return;
            }

            // Симуляция отправки через AJAX
            $.ajax({
                url: "https://httpbin.org/post", // тестовый сервер
                type: "POST",
                data: { name, email, message },
                success: function () {
                    $(".form-response").text("✅ Сообщение успешно отправлено!")
                        .css("color", "green");
                    $("#contactForm")[0].reset();
                },
                error: function () {
                    $(".form-response").text("❌ Ошибка при отправке.")
                        .css("color", "red");
                }
            });
        });
    });

    /* ===== Загрузка портфолио из JSON ===== */
    let currentIndex = 0;
    let itemsCount = 0;

    $.getJSON("data/portfolio.json", function(data) {
        const wrapper = $(".portfolio-wrapper");
        data.forEach(item => {
            const card = `
        <div class="portfolio-item">
          <img src="${item.img}" alt="${item.title}" style="max-width:100%;">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          <a href="${item.link}" target="_blank">Подробнее</a>
        </div>`;
            wrapper.append(card);
        });
        itemsCount = data.length;
    });

    /* ===== Карусель для портфолио ===== */
    function showSlide(index) {
        const offset = -index * 100 + "%";
        $(".portfolio-wrapper").css("transform", "translateX(" + offset + ")");
    }
    $(".next").click(function() {
        currentIndex = (currentIndex + 1) % itemsCount;
        showSlide(currentIndex);
    });
    $(".prev").click(function() {
        currentIndex = (currentIndex - 1 + itemsCount) % itemsCount;
        showSlide(currentIndex);
    });
    setInterval(function() {
        if (itemsCount > 0) {
            currentIndex = (currentIndex + 1) % itemsCount;
            showSlide(currentIndex);
        }
    }, 5000);

    /* ===== Плавный скролл ===== */
    $("nav a, .back-to-top").click(function(e) {
        e.preventDefault();
        const target = $(this).attr("href");
        $("html, body").animate({ scrollTop: $(target).offset().top }, 600);
    });

    /* ===== Подсветка активного пункта меню ===== */
    const sections = $("section");
    const navLinks = $("nav a");

    $(window).on("scroll", function() {
        const scrollPos = $(this).scrollTop();
        sections.each(function() {
            const top = $(this).offset().top - 100;
            const bottom = top + $(this).outerHeight();
            if (scrollPos >= top && scrollPos <= bottom) {
                navLinks.removeClass("active");
                navLinks.filter("[href='#" + $(this).attr("id") + "']").addClass("active");
            }
        });

        if (scrollPos > 300) {
            $(".back-to-top").fadeIn();
        } else {
            $(".back-to-top").fadeOut();
        }
    });

    /* ===== Анимация появления секций ===== */
    $(window).on("scroll", function() {
        $(".section, section").each(function() {
            if ($(this).offset().top < $(window).scrollTop() + $(window).height() - 50) {
                $(this).animate({ opacity: 1, marginTop: "0px" }, 600);
            }
        });
    });
});
