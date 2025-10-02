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
    $("#contactForm").submit(function(e) {
        e.preventDefault();
        const name = $("input[name='name']").val().trim();
        const email = $("input[name='email']").val().trim();
        const message = $("textarea[name='message']").val().trim();
        const response = $(".form-response");

        if (name.length < 2) {
            response.text("Имя слишком короткое").css("color", "red");
            return;
        }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            response.text("Введите корректный email").css("color", "red");
            return;
        }
        if (message.length < 10) {
            response.text("Сообщение должно быть не менее 10 символов").css("color", "red");
            return;
        }

        response.text("Отправка...").css("color", "black");

        $.ajax({
            url: "/fake-endpoint",
            method: "POST",
            data: { name, email, message },
            success: function() {
                setTimeout(() => {
                    response.text("Сообщение успешно отправлено!").css("color", "green");
                    $("#contactForm")[0].reset();
                }, 1000);
            },
            error: function() {
                setTimeout(() => {
                    response.text("Сообщение успешно отправлено!").css("color", "green");
                    $("#contactForm")[0].reset();
                }, 1000);
            }
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
