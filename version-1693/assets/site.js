(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    if (slides.length > 1) {
      var current = 0;
      var showSlide = function (index) {
        current = index;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          showSlide(i);
        });
      });
      window.setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5200);
    }

    var filterForm = document.querySelector(".filter-bar");
    if (filterForm) {
      var keyword = filterForm.querySelector("[data-filter-keyword]");
      var year = filterForm.querySelector("[data-filter-year]");
      var type = filterForm.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
      var apply = function () {
        var q = keyword ? keyword.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var t = type ? type.value : "";
        cards.forEach(function (card) {
          var text = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.tags, card.dataset.year].join(" ").toLowerCase();
          var ok = true;
          if (q && text.indexOf(q) === -1) ok = false;
          if (y && card.dataset.year !== y) ok = false;
          if (t && card.dataset.type !== t) ok = false;
          card.classList.toggle("is-hidden", !ok);
        });
      };
      [keyword, year, type].forEach(function (item) {
        if (item) item.addEventListener("input", apply);
        if (item) item.addEventListener("change", apply);
      });
      filterForm.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
    }

    var video = document.querySelector("video[data-stream]");
    if (video) {
      var button = document.querySelector(".play-overlay");
      var attach = function () {
        if (video.dataset.ready === "1") return;
        var streamUrl = video.getAttribute("data-stream");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        video.dataset.ready = "1";
      };
      var start = function () {
        attach();
        if (button) button.classList.add("is-hidden");
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            if (button) button.classList.remove("is-hidden");
          });
        }
      };
      if (button) button.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (video.paused) start();
      });
      video.addEventListener("play", function () {
        if (button) button.classList.add("is-hidden");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 && button) button.classList.remove("is-hidden");
      });
    }

    var searchRoot = document.querySelector("[data-search-results]");
    if (searchRoot && Array.isArray(window.SEARCH_MOVIES)) {
      var params = new URLSearchParams(window.location.search);
      var query = (params.get("q") || "").trim().toLowerCase();
      var title = document.querySelector("[data-search-title]");
      if (title) {
        title.textContent = query ? "搜索：“" + params.get("q").trim() + "”" : "影片搜索";
      }
      var data = window.SEARCH_MOVIES.filter(function (item) {
        if (!query) return true;
        return [item.title, item.region, item.type, item.year, item.genre, item.tags].join(" ").toLowerCase().indexOf(query) !== -1;
      }).slice(0, 240);
      if (!data.length) {
        searchRoot.innerHTML = '<div class="search-empty">没有找到匹配内容。</div>';
      } else {
        searchRoot.innerHTML = data.map(function (item) {
          return '<article class="movie-card">' +
            '<a class="poster-link" href="./' + item.file + '" aria-label="观看' + item.title.replace(/"/g, '&quot;') + '">' +
              '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">' +
              '<span class="poster-badge">' + item.year + '</span>' +
            '</a>' +
            '<div class="card-body">' +
              '<div class="card-meta"><span>' + item.region + '</span><span>' + item.type + '</span></div>' +
              '<h3><a href="./' + item.file + '">' + item.title + '</a></h3>' +
              '<p>' + item.oneLine + '</p>' +
              '<div class="tag-row"><span>' + item.genre + '</span></div>' +
            '</div>' +
          '</article>';
        }).join("");
      }
    }
  });
})();
