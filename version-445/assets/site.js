(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, pos) {
                slide.classList.toggle("is-active", pos === index);
            });
            dots.forEach(function (dot, pos) {
                dot.classList.toggle("is-active", pos === index);
            });
        }
        dots.forEach(function (dot, pos) {
            dot.addEventListener("click", function () {
                show(pos);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function setupCards() {
        var input = document.querySelector("[data-card-search]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        var activeFilter = "all";
        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre")
                ].join(" ").toLowerCase();
                var type = card.getAttribute("data-type") || "";
                var matchText = !query || text.indexOf(query) !== -1;
                var matchFilter = activeFilter === "all" || type === activeFilter;
                card.classList.toggle("is-hidden", !(matchText && matchFilter));
            });
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-filter") || "all";
                filterButtons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                apply();
            });
        });
    }

    window.setupHlsPlayer = function (videoId, coverId, source) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        if (!video || !source) {
            return;
        }
        var loaded = false;
        var hls = null;
        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function play() {
            load();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }
        load();
        if (cover) {
            cover.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupCards();
    });
})();
