document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function activateSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      activateSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      activateSlide(current + 1);
    }, 5200);
  }

  var quickSearch = document.querySelector('[data-quick-search]');
  var quickButton = document.querySelector('[data-quick-button]');

  if (quickSearch && quickButton) {
    quickButton.addEventListener('click', function () {
      var keyword = quickSearch.value.trim();
      if (keyword) {
        window.location.href = 'search.html?q=' + encodeURIComponent(keyword);
      } else {
        window.location.href = 'search.html';
      }
    });

    quickSearch.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        quickButton.click();
      }
    });
  }

  var searchInput = document.querySelector('[data-filter-input]');
  var categorySelect = document.querySelector('[data-filter-category]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var resultCount = document.querySelector('[data-result-count]');

  function applyFilter() {
    if (!cards.length) {
      return;
    }

    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var category = categorySelect ? categorySelect.value : '';
    var year = yearSelect ? yearSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = [card.dataset.title, card.dataset.tags, card.dataset.category, card.dataset.year].join(' ').toLowerCase();
      var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
      var categoryMatched = !category || card.dataset.category === category;
      var yearMatched = !year || card.dataset.year === year;
      var matched = keywordMatched && categoryMatched && yearMatched;

      card.classList.toggle('hidden-by-filter', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = String(visible);
    }
  }

  if (searchInput || categorySelect || yearSelect) {
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('q');
    if (initialKeyword && searchInput) {
      searchInput.value = initialKeyword;
    }

    [searchInput, categorySelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }
});
