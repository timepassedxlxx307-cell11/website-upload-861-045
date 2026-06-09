(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function toggleMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var open = panel.classList.toggle('open');
            document.body.classList.toggle('menu-open', open);
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle('is-active', i % slides.length === current);
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
        thumbs.forEach(function (thumb, index) {
            var target = index % slides.length;
            thumb.addEventListener('mouseenter', function () {
                show(target);
                stop();
            });
            thumb.addEventListener('focus', function () {
                show(target);
                stop();
            });
            thumb.addEventListener('mouseleave', start);
            thumb.addEventListener('blur', start);
            thumb.addEventListener('click', function () {
                show(target);
            });
        });
        show(0);
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var input = panel.querySelector('[data-search-input]');
            var typeSelect = panel.querySelector('[data-type-filter]');
            var yearSelect = panel.querySelector('[data-year-filter]');
            var scope = document.querySelector(panel.getAttribute('data-filter-panel')) || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
            var empty = scope.querySelector('[data-empty-result]');
            function normalize(value) {
                return (value || '').toString().toLowerCase().trim();
            }
            function apply() {
                var query = normalize(input ? input.value : '');
                var type = normalize(typeSelect ? typeSelect.value : '');
                var year = normalize(yearSelect ? yearSelect.value : '');
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-genre'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var match = (!query || haystack.indexOf(query) !== -1) && (!type || cardType === type) && (!year || cardYear === year);
                    card.classList.toggle('hide', !match);
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('show', visible === 0);
                }
            }
            [input, typeSelect, yearSelect].forEach(function (node) {
                if (node) {
                    node.addEventListener('input', apply);
                    node.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var existing = document.querySelector('script[src="' + src + '"]');
            if (existing) {
                existing.addEventListener('load', resolve);
                existing.addEventListener('error', reject);
                if (window.Hls) {
                    resolve();
                }
                return;
            }
            var script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    window.setupMoviePlayer = function (videoId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !streamUrl) {
            return;
        }
        var initialized = false;
        var hlsInstance = null;
        function attachWithHls() {
            if (window.Hls && window.Hls.isSupported()) {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return Promise.resolve();
            }
            return Promise.reject();
        }
        function attachStream() {
            if (initialized) {
                return Promise.resolve();
            }
            initialized = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                return attachWithHls();
            }
            return loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js').then(attachWithHls);
        }
        function play() {
            attachStream().then(function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }).catch(function () {
                video.src = streamUrl;
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            });
        }
        if (overlay) {
            overlay.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    };

    ready(function () {
        toggleMenu();
        setupHero();
        setupFilters();
    });
})();
