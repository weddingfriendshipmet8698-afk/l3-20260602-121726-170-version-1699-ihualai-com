(function () {
  'use strict';

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileNav() {
    var button = $('[data-menu-toggle]');
    var nav = $('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
      button.textContent = nav.classList.contains('open') ? '×' : '☰';
    });
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $$('.hero-slide', hero);
    var dots = $$('.hero-dot', hero);
    if (slides.length === 0) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initCategoryFilter() {
    var grid = $('[data-filter-grid]');
    if (!grid) {
      return;
    }
    var cards = $$('[data-movie-card]', grid);
    var searchInput = $('[data-filter-search]');
    var yearSelect = $('[data-filter-year]');
    var typeSelect = $('[data-filter-type]');
    var countNode = $('[data-filter-count]');

    function applyFilter() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var cardTitle = card.getAttribute('data-title') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matchKeyword = !keyword || cardTitle.indexOf(keyword) !== -1;
        var matchYear = !year || cardYear === year;
        var matchType = !type || cardType === type;
        var show = matchKeyword && matchYear && matchType;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = '当前显示 ' + visible + ' 部';
      }
    }

    [searchInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card">' +
        '<a href="' + movie.url + '" class="card-cover" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="card-category">' + escapeHtml(movie.category) + '</span>' +
          '<span class="card-duration">' + movie.duration + '分钟</span>' +
        '</a>' +
        '<div class="card-body">' +
          '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="card-tags">' + tags + '</div>' +
          '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + movie.viewsText + ' 次观看</span></div>' +
        '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function initSearchPage() {
    var root = $('[data-search-page]');
    if (!root) {
      return;
    }
    var form = $('[data-search-form]', root);
    var input = $('[data-search-input]', root);
    var results = $('[data-search-results]', root);
    var status = $('[data-search-status]', root);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var allMovies = [];

    if (input) {
      input.value = query;
    }

    function render(value) {
      var term = String(value || '').trim().toLowerCase();
      var matched = allMovies.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.oneLine,
          movie.category,
          movie.region,
          movie.type,
          movie.year,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();
        return !term || haystack.indexOf(term) !== -1;
      });

      if (status) {
        status.textContent = term ? '搜索“' + value + '”共找到 ' + matched.length + ' 部影片' : '输入关键词后可筛选全站影片';
      }

      if (results) {
        results.innerHTML = matched.slice(0, 240).map(createSearchCard).join('');
        if (matched.length === 0) {
          results.innerHTML = '<div class="empty-state">未找到相关影片，请尝试其他关键词。</div>';
        }
      }
    }

    fetch('assets/data/search-index.json')
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        allMovies = data;
        render(query);
      })
      .catch(function () {
        if (status) {
          status.textContent = '搜索数据加载失败，请稍后刷新页面。';
        }
      });

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = input ? input.value.trim() : '';
        var url = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
        window.history.replaceState({}, '', url);
        render(value);
      });
    }

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
  }

  function initPlayers() {
    $$('.video-player').forEach(function (player) {
      var video = $('video', player);
      var overlay = $('.player-overlay', player);
      var errorText = $('.player-error-text', player);
      if (!video || !overlay) {
        return;
      }

      var hls = null;
      var loaded = false;

      function setError(message) {
        player.classList.remove('is-loading');
        player.classList.add('has-error');
        if (errorText) {
          errorText.textContent = message;
        }
      }

      function loadSource() {
        if (loaded) {
          return;
        }
        var source = video.getAttribute('data-src');
        if (!source) {
          setError('播放源不存在');
          return;
        }
        loaded = true;
        player.classList.add('is-loading');

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            player.classList.remove('is-loading');
            playVideo();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setError('网络错误，请检查网络连接后重试');
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setError('媒体错误，正在尝试恢复');
              hls.recoverMediaError();
            } else {
              setError('无法播放视频');
              hls.destroy();
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            player.classList.remove('is-loading');
            playVideo();
          }, { once: true });
        } else {
          setError('当前浏览器不支持 m3u8 播放');
        }
      }

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      overlay.addEventListener('click', function () {
        loadSource();
        if (loaded) {
          playVideo();
        }
      });

      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHero();
    initCategoryFilter();
    initSearchPage();
    initPlayers();
  });
}());
