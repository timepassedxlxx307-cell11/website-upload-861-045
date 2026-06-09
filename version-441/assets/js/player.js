var JapanMoviePlayer = (function () {
    function mount(source) {
        var video = document.querySelector("[data-player]");
        var primaryButtons = Array.prototype.slice.call(document.querySelectorAll("[data-play-button], [data-play-button-secondary]"));
        var cover = document.querySelector(".player-cover");
        var hlsInstance = null;
        var attached = false;

        if (!video || !source) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    maxBufferLength: 30
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                video.src = source;
            }

            attached = true;
        }

        function hideCover() {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        }

        function showCover() {
            if (cover && video.paused) {
                cover.classList.remove("is-hidden");
            }
        }

        function play() {
            attach();
            hideCover();
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    showCover();
                });
            }
        }

        attach();

        primaryButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                play();
            });
        });

        video.addEventListener("play", hideCover);
        video.addEventListener("pause", showCover);
        video.addEventListener("ended", showCover);

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    return {
        mount: mount
    };
})();
