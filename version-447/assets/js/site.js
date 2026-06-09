(function() {
    const body = document.body;
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function() {
            body.classList.toggle('menu-open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        function setActive(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            timer = window.setInterval(function() {
                setActive(current + 1);
            }, 5000);
        }

        function resetTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            startTimer();
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                setActive(Number(dot.getAttribute('data-hero-dot')) || 0);
                resetTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function() {
                setActive(current - 1);
                resetTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                setActive(current + 1);
                resetTimer();
            });
        }

        startTimer();
    }

    const panel = document.getElementById('search-panel');
    const input = document.getElementById('global-search-input');
    const results = document.getElementById('global-search-results');
    const searchIndex = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];

    function renderSearch(query) {
        if (!results) {
            return;
        }
        const term = String(query || '').trim().toLowerCase();
        const matches = term
            ? searchIndex.filter(function(item) {
                return item.search.toLowerCase().indexOf(term) !== -1;
            }).slice(0, 18)
            : searchIndex.slice(0, 8);

        if (!matches.length) {
            results.innerHTML = '<p class="movie-meta">没有找到匹配影片</p>';
            return;
        }

        results.innerHTML = matches.map(function(item) {
            return '<a class="search-result" href="' + item.url + '">' +
                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
                '<span><strong>' + escapeHtml(item.title) + '</strong>' +
                '<em>' + escapeHtml(item.meta) + '</em>' +
                '<em>' + escapeHtml(item.line) + '</em></span>' +
                '</a>';
        }).join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function openSearch() {
        if (!panel) {
            return;
        }
        panel.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
        body.classList.add('search-open');
        renderSearch('');
        window.setTimeout(function() {
            if (input) {
                input.focus();
            }
        }, 60);
    }

    function closeSearch() {
        if (!panel) {
            return;
        }
        panel.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
        body.classList.remove('search-open');
    }

    document.querySelectorAll('[data-search-open]').forEach(function(button) {
        button.addEventListener('click', openSearch);
    });

    document.querySelectorAll('[data-search-close]').forEach(function(button) {
        button.addEventListener('click', closeSearch);
    });

    if (input) {
        input.addEventListener('input', function() {
            renderSearch(input.value);
        });
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeSearch();
        }
    });

    document.querySelectorAll('.category-page').forEach(function(page) {
        const localInput = page.querySelector('.category-search');
        const chips = Array.from(page.querySelectorAll('.filter-chip'));
        const cards = Array.from(page.querySelectorAll('.movie-card'));
        let activeFilter = 'all';

        function applyFilters() {
            const term = localInput ? localInput.value.trim().toLowerCase() : '';
            cards.forEach(function(card) {
                const title = card.getAttribute('data-title') || '';
                const region = card.getAttribute('data-region') || '';
                const year = card.getAttribute('data-year') || '';
                const genre = card.getAttribute('data-genre') || '';
                const tags = card.getAttribute('data-tags') || '';
                const haystack = (title + ' ' + region + ' ' + year + ' ' + genre + ' ' + tags).toLowerCase();
                const matchTerm = !term || haystack.indexOf(term) !== -1;
                const matchFilter = activeFilter === 'all' || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
                card.style.display = matchTerm && matchFilter ? '' : 'none';
            });
        }

        if (localInput) {
            localInput.addEventListener('input', applyFilters);
        }

        chips.forEach(function(chip) {
            chip.addEventListener('click', function() {
                chips.forEach(function(item) {
                    item.classList.remove('is-active');
                });
                chip.classList.add('is-active');
                activeFilter = chip.getAttribute('data-filter') || 'all';
                applyFilters();
            });
        });
    });
}());
