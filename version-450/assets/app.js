(function () {
    function select(selector, root) {
        return (root || document).querySelector(selector);
    }

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var toggle = select('.mobile-toggle');
        var menu = select('.mobile-menu');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!open));
            menu.hidden = open;
        });
    }

    function setupHeroSlider() {
        var slides = selectAll('.hero-slide');
        if (slides.length <= 1) {
            return;
        }
        var dots = selectAll('.hero-dot');
        var prev = select('.hero-prev');
        var next = select('.hero-next');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide') || 0));
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        start();
    }

    function setupFilters() {
        var bars = selectAll('.filter-bar');
        bars.forEach(function (bar) {
            var buttons = selectAll('.filter-button', bar);
            var section = bar.parentElement;
            var cards = selectAll('.movie-card', section);
            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    var filter = button.getAttribute('data-filter');
                    buttons.forEach(function (item) {
                        item.classList.toggle('active', item === button);
                    });
                    cards.forEach(function (card) {
                        var type = card.getAttribute('data-type') || '';
                        var genre = card.getAttribute('data-genre') || '';
                        var year = Number(card.getAttribute('data-year') || 0);
                        var visible = true;
                        if (filter === 'movie') {
                            visible = type.indexOf('电影') !== -1;
                        } else if (filter === 'series') {
                            visible = type.indexOf('电视剧') !== -1 || type.indexOf('剧') !== -1;
                        } else if (filter === 'recent') {
                            visible = year >= 2023;
                        } else if (filter === 'suspense') {
                            visible = genre.indexOf('悬疑') !== -1 || genre.indexOf('犯罪') !== -1 || genre.indexOf('推理') !== -1;
                        } else if (filter === 'romance') {
                            visible = genre.indexOf('爱情') !== -1 || genre.indexOf('都市') !== -1 || genre.indexOf('情感') !== -1;
                        }
                        card.hidden = !visible;
                    });
                });
            });
        });
    }

    function setupPlayers() {
        selectAll('.player-shell').forEach(function (shell) {
            var video = select('video', shell);
            var button = select('.play-overlay', shell);
            var source = shell.getAttribute('data-video-src');
            var attached = false;

            function attach() {
                if (attached || !video || !source) {
                    return;
                }
                attached = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    video._hls = hls;
                } else {
                    video.src = source;
                }
            }

            function play() {
                attach();
                if (button) {
                    button.classList.add('hidden');
                }
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        if (button) {
                            button.classList.remove('hidden');
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }
            if (video) {
                video.addEventListener('play', function () {
                    if (button) {
                        button.classList.add('hidden');
                    }
                });
                video.addEventListener('error', function () {
                    if (button) {
                        button.classList.remove('hidden');
                    }
                });
            }
        });
    }

    function cardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">'
            + '<a class="poster-link" href="' + escapeAttribute(movie.link) + '">'
            + '<img src="' + escapeAttribute(movie.cover) + '" alt="' + escapeAttribute(movie.title) + '" loading="lazy">'
            + '<span class="poster-badge">' + escapeHtml(movie.category || movie.type || '') + '</span>'
            + '<span class="poster-play">▶</span>'
            + '</a>'
            + '<div class="movie-info">'
            + '<h3><a href="' + escapeAttribute(movie.link) + '">' + escapeHtml(movie.title) + '</a></h3>'
            + '<p class="movie-meta">' + escapeHtml([movie.year, movie.region, movie.type].filter(Boolean).join(' · ')) + '</p>'
            + '<p class="movie-desc">' + escapeHtml(movie.description || '') + '</p>'
            + '<div class="tag-row">' + tags + '</div>'
            + '</div>'
            + '</article>';
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeAttribute(value) {
        return escapeHtml(value).replace(/`/g, '&#96;');
    }

    function setupSearchPage() {
        var results = select('.search-results');
        var input = select('.search-page-input');
        if (!results || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        if (input) {
            input.value = initialQuery;
        }
        render(initialQuery);

        function render(query) {
            var normalized = String(query || '').trim().toLowerCase();
            var items = window.SEARCH_MOVIES;
            if (normalized) {
                items = items.filter(function (movie) {
                    var haystack = [
                        movie.title,
                        movie.year,
                        movie.region,
                        movie.type,
                        movie.genre,
                        movie.category,
                        (movie.tags || []).join(' '),
                        movie.description
                    ].join(' ').toLowerCase();
                    return haystack.indexOf(normalized) !== -1;
                });
            } else {
                items = items.slice(0, 72);
            }
            results.innerHTML = items.slice(0, 180).map(cardTemplate).join('');
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHeroSlider();
        setupFilters();
        setupPlayers();
        setupSearchPage();
    });
}());
