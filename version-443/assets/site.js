(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        var start = function () {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        start();
    }

    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

    scopes.forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var yearSelect = scope.querySelector('[data-year-filter]');
        var reset = scope.querySelector('[data-filter-reset]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

        var filterCards = function () {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchYear = !year || card.getAttribute('data-year') === year;
                card.classList.toggle('is-hidden', !(matchKeyword && matchYear));
            });
        };

        if (input) {
            input.addEventListener('input', filterCards);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', filterCards);
        }
        if (reset) {
            reset.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                filterCards();
            });
        }
    });

    var siteSearch = document.querySelector('[data-site-search]');
    var clearSearch = document.querySelector('[data-search-clear]');
    var allSearchCards = Array.prototype.slice.call(document.querySelectorAll('.search-results-grid .movie-card'));

    var applySiteSearch = function () {
        if (!siteSearch) {
            return;
        }
        var keyword = siteSearch.value.trim().toLowerCase();
        allSearchCards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year')
            ].join(' ').toLowerCase();
            card.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1);
        });
    };

    if (siteSearch) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            siteSearch.value = q;
        }
        siteSearch.addEventListener('input', applySiteSearch);
        applySiteSearch();
    }

    if (clearSearch) {
        clearSearch.addEventListener('click', function () {
            if (siteSearch) {
                siteSearch.value = '';
                applySiteSearch();
                siteSearch.focus();
            }
        });
    }
})();
