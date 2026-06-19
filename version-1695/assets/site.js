(function () {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (navToggle && mobilePanel) {
    navToggle.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  const prev = document.querySelector("[data-hero-prev]");
  const next = document.querySelector("[data-hero-next]");
  let current = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function restartHeroTimer() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  if (slides.length) {
    showSlide(0);
    restartHeroTimer();

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        restartHeroTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        restartHeroTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        restartHeroTimer();
      });
    }
  }

  const searchPageInput = document.querySelector("[data-search-input]");
  const searchPageButton = document.querySelector("[data-search-button]");
  const cards = Array.from(document.querySelectorAll("[data-title]"));
  const resultCount = document.querySelector("[data-result-count]");

  function getQueryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function filterCards(query) {
    const value = query.trim().toLowerCase();
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-tags") || "",
        card.getAttribute("data-year") || "",
        card.getAttribute("data-category") || ""
      ].join(" ").toLowerCase();

      const matched = !value || haystack.indexOf(value) !== -1;
      card.style.display = matched ? "" : "none";

      if (matched) {
        visible += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = value ? "匹配影片：" + visible + " 部" : "当前展示全部影片";
    }
  }

  if (searchPageInput) {
    const initialQuery = getQueryFromUrl();
    searchPageInput.value = initialQuery;
    filterCards(initialQuery);

    searchPageInput.addEventListener("input", function () {
      filterCards(searchPageInput.value);
    });

    if (searchPageButton) {
      searchPageButton.addEventListener("click", function () {
        filterCards(searchPageInput.value);
      });
    }
  }

  const video = document.querySelector("[data-player]");
  const playButton = document.querySelector("[data-play-button]");

  if (video) {
    const source = video.getAttribute("data-src");

    function attachSource() {
      if (!source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      }
    }

    function playVideo() {
      attachSource();

      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (playButton) {
      playButton.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      if (playButton) {
        playButton.classList.add("hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (playButton) {
        playButton.classList.remove("hidden");
      }
    });

    attachSource();
  }
})();
