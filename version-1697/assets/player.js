(function () {
    function startPlayer(root) {
        var video = root.querySelector('video');
        var overlay = root.querySelector('.player-overlay');
        var stream = root.getAttribute('data-stream');
        var ready = false;
        var hls = null;

        if (!video || !stream) {
            return;
        }

        function begin() {
            if (ready) {
                if (video.paused) {
                    video.play().catch(function () {});
                }
                return;
            }

            ready = true;
            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && hls) {
                        hls.destroy();
                        hls = null;
                        video.src = stream;
                        video.play().catch(function () {});
                    }
                });
                return;
            }

            video.src = stream;
            video.play().catch(function () {});
        }

        if (overlay) {
            overlay.addEventListener('click', begin);
        }

        video.addEventListener('click', function () {
            if (!ready) {
                begin();
                return;
            }
            if (video.paused) {
                video.play().catch(function () {});
            } else {
                video.pause();
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(startPlayer);
})();
