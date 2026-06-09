(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-box]'));

    players.forEach(function (box) {
        var video = box.querySelector('video');
        var playButton = box.querySelector('[data-play]');
        var stream = box.getAttribute('data-stream');
        var started = false;
        var hlsInstance = null;

        var attachStream = function () {
            if (!video || !stream || started) {
                return;
            }
            started = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }

            video.setAttribute('controls', 'controls');
            box.classList.add('is-playing');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        };

        if (playButton) {
            playButton.addEventListener('click', attachStream);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!started) {
                    attachStream();
                    return;
                }
                if (video.paused) {
                    video.play().catch(function () {});
                } else {
                    video.pause();
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    });
})();
