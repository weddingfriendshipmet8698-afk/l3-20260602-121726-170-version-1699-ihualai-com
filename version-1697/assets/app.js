(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (navToggle && mobilePanel) {
        navToggle.addEventListener('click', function () {
            var open = mobilePanel.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            document.body.classList.toggle('nav-open', open);
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input) {
                return;
            }
            var value = input.value.trim();
            if (value) {
                event.preventDefault();
                window.location.href = 'search.html?q=' + encodeURIComponent(value);
            }
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === active);
            });
        }

        function run() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                run();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                run();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                run();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', run);
        show(0);
        run();
    }

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
        var queryInput = root.querySelector('[data-query-input]');
        var regionInput = root.querySelector('[data-region-filter]');
        var typeInput = root.querySelector('[data-type-filter]');
        var yearInput = root.querySelector('[data-year-filter]');
        var resetButton = root.querySelector('[data-filter-reset]');
        var empty = root.querySelector('.result-empty');
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var incoming = params.get('q') || '';

        if (queryInput && incoming && !queryInput.value) {
            queryInput.value = incoming;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function matches(card) {
            var q = normalize(queryInput && queryInput.value);
            var region = normalize(regionInput && regionInput.value);
            var type = normalize(typeInput && typeInput.value);
            var year = normalize(yearInput && yearInput.value);
            var search = normalize(card.getAttribute('data-search'));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var cardType = normalize(card.getAttribute('data-type'));
            var cardYear = normalize(card.getAttribute('data-year'));

            if (q && search.indexOf(q) === -1) {
                return false;
            }
            if (region && cardRegion !== region) {
                return false;
            }
            if (type && cardType !== type) {
                return false;
            }
            if (year && cardYear !== year) {
                return false;
            }
            return true;
        }

        function apply() {
            var visible = 0;
            cards.forEach(function (card) {
                var ok = matches(card);
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('visible', visible === 0);
            }
        }

        [queryInput, regionInput, typeInput, yearInput].forEach(function (input) {
            if (input) {
                input.addEventListener('input', apply);
                input.addEventListener('change', apply);
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (queryInput) {
                    queryInput.value = '';
                }
                if (regionInput) {
                    regionInput.value = '';
                }
                if (typeInput) {
                    typeInput.value = '';
                }
                if (yearInput) {
                    yearInput.value = '';
                }
                apply();
            });
        }

        apply();
    });
})();
