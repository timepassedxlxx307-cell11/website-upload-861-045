(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var dots = hero.querySelector("[data-hero-dots]");
        var current = 0;
        var timer = null;

        function render(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            if (dots) {
                Array.prototype.slice.call(dots.children).forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                render(current + 1);
            }, 5200);
        }

        if (dots) {
            slides.forEach(function (_, index) {
                var dot = document.createElement("button");
                dot.type = "button";
                dot.setAttribute("aria-label", "切换推荐" + (index + 1));
                dot.addEventListener("click", function () {
                    render(index);
                    start();
                });
                dots.appendChild(dot);
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                render(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                render(current + 1);
                start();
            });
        }

        render(0);
        start();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-card-search]")).forEach(function (input) {
        var section = input.closest("section") || document;
        var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));

        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
                card.classList.toggle("is-filtered-out", query !== "" && haystack.indexOf(query) === -1);
            });
        });
    });
})();
