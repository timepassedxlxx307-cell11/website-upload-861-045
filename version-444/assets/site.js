(function () {
    var mobileButton = document.querySelector('.js-menu-toggle');
    var mobileNav = document.querySelector('.js-mobile-nav');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    function closePanels(exceptPanel) {
        document.querySelectorAll('.js-search-panel.active').forEach(function (panel) {
            if (panel !== exceptPanel) {
                panel.classList.remove('active');
            }
        });
    }

    function buildSearchResult(movie) {
        var link = document.createElement('a');
        link.className = 'search-result';
        link.href = movie.url;

        var img = document.createElement('img');
        img.src = movie.cover;
        img.alt = movie.title;
        img.loading = 'lazy';

        var info = document.createElement('div');
        var title = document.createElement('strong');
        title.textContent = movie.title;
        var meta = document.createElement('span');
        meta.textContent = [movie.year, movie.region, movie.genre].filter(Boolean).join(' · ');
        var desc = document.createElement('span');
        desc.textContent = movie.oneLine || '';

        info.appendChild(title);
        info.appendChild(meta);
        info.appendChild(desc);
        link.appendChild(img);
        link.appendChild(info);
        return link;
    }

    document.querySelectorAll('.js-site-search').forEach(function (input) {
        var panel = input.parentElement.querySelector('.js-search-panel');
        if (!panel || !Array.isArray(window.MOVIE_INDEX)) {
            return;
        }

        input.addEventListener('input', function () {
            var q = input.value.trim().toLowerCase();
            panel.innerHTML = '';
            if (!q) {
                panel.classList.remove('active');
                return;
            }

            var results = window.MOVIE_INDEX.filter(function (movie) {
                return movie.searchText.indexOf(q) !== -1;
            }).slice(0, 12);

            results.forEach(function (movie) {
                panel.appendChild(buildSearchResult(movie));
            });

            if (!results.length) {
                var empty = document.createElement('div');
                empty.className = 'search-result';
                empty.textContent = '没有匹配影片';
                panel.appendChild(empty);
            }

            panel.classList.add('active');
            closePanels(panel);
        });

        input.addEventListener('focus', function () {
            if (input.value.trim()) {
                panel.classList.add('active');
            }
        });
    });

    document.addEventListener('click', function (event) {
        if (!event.target.closest('.site-search')) {
            closePanels(null);
        }
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeSlide = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === activeSlide);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === activeSlide);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        heroTimer = window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            showSlide(i);
            if (heroTimer) {
                window.clearInterval(heroTimer);
                startHero();
            }
        });
    });

    showSlide(0);
    startHero();

    var localSearch = document.querySelector('.js-local-search');
    var yearFilter = document.querySelector('.js-filter-year');
    var typeFilter = document.querySelector('.js-filter-type');
    var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-title][data-genre][data-year][data-type]'));
    var emptyState = document.querySelector('.js-empty-state');

    function applyLocalFilters() {
        if (!filterCards.length) {
            return;
        }
        var q = localSearch ? localSearch.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';
        var type = typeFilter ? typeFilter.value : '';
        var visible = 0;

        filterCards.forEach(function (card) {
            var text = [card.dataset.title, card.dataset.genre, card.dataset.year, card.dataset.type].join(' ').toLowerCase();
            var ok = true;
            if (q && text.indexOf(q) === -1) {
                ok = false;
            }
            if (year && card.dataset.year !== year) {
                ok = false;
            }
            if (type && card.dataset.type.indexOf(type) === -1) {
                ok = false;
            }
            card.style.display = ok ? '' : 'none';
            if (ok) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('active', visible === 0);
        }
    }

    [localSearch, yearFilter, typeFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyLocalFilters);
            control.addEventListener('change', applyLocalFilters);
        }
    });

    function bindPlayer(shell) {
        var video = shell.querySelector('video[data-src]');
        var button = shell.querySelector('[data-player-button]');
        if (!video || !button) {
            return;
        }

        function attachSource() {
            if (video.dataset.ready === 'true') {
                return;
            }
            var src = video.dataset.src;
            if (!src) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(src);
                hls.attachMedia(video);
                shell._hls = hls;
            } else {
                video.src = src;
            }
            video.dataset.ready = 'true';
        }

        function playVideo() {
            attachSource();
            button.classList.add('hidden');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    button.classList.remove('hidden');
                });
            }
        }

        button.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                button.classList.remove('hidden');
            }
        });
    }

    document.querySelectorAll('.player-shell').forEach(bindPlayer);
})();
