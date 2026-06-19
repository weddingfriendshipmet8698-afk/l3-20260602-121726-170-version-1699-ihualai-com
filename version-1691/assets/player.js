(function () {
    window.startMoviePlayer = function (src, videoId, layerId) {
        var video = document.getElementById(videoId);
        var layer = document.getElementById(layerId);
        var attached = false;
        var hls = null;
        if (!video) {
            return;
        }
        var requestPlay = function () {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        };
        var attach = function () {
            if (attached) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                attached = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, requestPlay);
                attached = true;
                return;
            }
            video.src = src;
            attached = true;
        };
        var start = function () {
            attach();
            video.controls = true;
            if (layer) {
                layer.classList.add('is-hidden');
            }
            requestPlay();
        };
        if (layer) {
            layer.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (!attached || video.paused) {
                start();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
