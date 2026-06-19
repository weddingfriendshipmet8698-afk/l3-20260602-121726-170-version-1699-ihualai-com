(function () {
    var toggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;
        var timer = null;
        var show = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        };
        var next = function () {
            show(current + 1);
        };
        var start = function () {
            timer = window.setInterval(next, 5200);
        };
        var restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        };
        var prevButton = hero.querySelector('.hero-prev');
        var nextButton = hero.querySelector('.hero-next');
        if (prevButton) {
            prevButton.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (nextButton) {
            nextButton.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });
        start();
    }

    var input = document.querySelector('.page-filter-input');
    var year = document.querySelector('.page-year-filter');
    var scope = document.querySelector('[data-filter-scope]');
    var empty = document.querySelector('.empty-state');
    if (input && scope) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            input.value = query;
        }
        var apply = function () {
            var keyword = input.value.trim().toLowerCase();
            var y = year ? year.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-title') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var ok = (!keyword || haystack.indexOf(keyword) !== -1) && (!y || cardYear === y);
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        };
        input.addEventListener('input', apply);
        if (year) {
            year.addEventListener('change', apply);
        }
        apply();
    }
})();
