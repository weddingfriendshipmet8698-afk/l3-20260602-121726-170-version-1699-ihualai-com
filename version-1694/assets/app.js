(function() {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', mobileMenu.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function(form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const keyword = input ? input.value.trim() : '';
      if (keyword) {
        window.location.href = './search.html?q=' + encodeURIComponent(keyword);
      }
    });
  });

  const hero = document.querySelector('[data-hero-carousel]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      timer = window.setInterval(function() {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener('click', function() {
        if (timer) {
          window.clearInterval(timer);
        }
        showSlide(dotIndex);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  document.querySelectorAll('[data-filter-input]').forEach(function(input) {
    const scope = document.querySelector(input.getAttribute('data-filter-input')) || document;
    const select = document.querySelector('[data-year-filter]');
    const cards = Array.from(scope.querySelectorAll('.js-movie-card'));
    const empty = document.querySelector('[data-empty-state]');

    function applyFilter() {
      const keyword = input.value.trim().toLowerCase();
      const year = select ? select.value : '';
      let visible = 0;

      cards.forEach(function(card) {
        const text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-region') || ''
        ].join(' ').toLowerCase();
        const cardYear = card.getAttribute('data-year') || '';
        const matched = (!keyword || text.indexOf(keyword) !== -1) && (!year || cardYear === year);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    input.addEventListener('input', applyFilter);
    if (select) {
      select.addEventListener('change', applyFilter);
    }
    applyFilter();
  });

  const searchResults = document.querySelector('[data-search-results]');
  if (searchResults && window.MOVIES) {
    const params = new URLSearchParams(window.location.search);
    const keyword = (params.get('q') || '').trim();
    const input = document.querySelector('[data-search-page-input]');
    const title = document.querySelector('[data-search-title]');
    if (input) {
      input.value = keyword;
    }
    if (title) {
      title.textContent = keyword ? '搜索：' + keyword : '影片搜索';
    }

    function render(keywordValue) {
      const key = keywordValue.trim().toLowerCase();
      const list = window.MOVIES.filter(function(movie) {
        const text = [movie.title, movie.genre, movie.region, movie.type, movie.oneLine, movie.tags.join(' ')].join(' ').toLowerCase();
        return !key || text.indexOf(key) !== -1;
      }).slice(0, 120);

      searchResults.innerHTML = list.map(function(movie) {
        return '<a class="movie-card js-movie-card" href="./' + movie.file + '" data-title="' + escapeHtml(movie.title) + '" data-tags="' + escapeHtml(movie.tags.join(' ')) + '" data-genre="' + escapeHtml(movie.genre) + '" data-region="' + escapeHtml(movie.region) + '" data-year="' + escapeHtml(movie.year) + '">' +
          '<div class="poster-wrap"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="badge">' + escapeHtml(movie.type) + '</span><span class="year-badge">' + escapeHtml(movie.year) + '</span><span class="poster-shade"><span class="play-mini">▶</span></span></div>' +
          '<div class="movie-body"><div class="movie-type">' + escapeHtml(movie.categoryName) + '</div><h3 class="movie-title">' + escapeHtml(movie.title) + '</h3><p class="movie-line">' + escapeHtml(movie.oneLine) + '</p><div class="movie-tags">' + movie.tags.slice(0, 3).map(function(tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div></div>' +
        '</a>';
      }).join('');

      const empty = document.querySelector('[data-empty-state]');
      if (empty) {
        empty.classList.toggle('is-visible', list.length === 0);
      }
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function(ch) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        }[ch];
      });
    }

    render(keyword);
  }
})();
