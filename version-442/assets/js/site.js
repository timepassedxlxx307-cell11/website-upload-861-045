(function() {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-site-nav]");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function() {
      nav.classList.toggle("open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function() {
        showSlide(current + 1);
      }, 5800);
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.dataset.heroDot));
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        showSlide(current + 1);
        startTimer();
      });
    }

    startTimer();
  }

  document.querySelectorAll("[data-search-scope]").forEach(function(scope) {
    const input = scope.querySelector("[data-search-input]");
    const cards = Array.from(scope.querySelectorAll("[data-movie-card]"));
    const empty = scope.querySelector("[data-empty-state]");
    const selects = Array.from(scope.querySelectorAll("[data-filter-select]"));

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function cardText(card) {
      return normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(" "));
    }

    function applyFilter() {
      const keyword = normalize(input ? input.value : "");
      const activeFilters = {};

      selects.forEach(function(select) {
        activeFilters[select.dataset.filterSelect] = normalize(select.value);
      });

      let visible = 0;

      cards.forEach(function(card) {
        const text = cardText(card);
        let matched = !keyword || text.includes(keyword);

        Object.keys(activeFilters).forEach(function(key) {
          if (activeFilters[key] && normalize(card.dataset[key]) !== activeFilters[key]) {
            matched = false;
          }
        });

        card.classList.toggle("hidden", !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    selects.forEach(function(select) {
      select.addEventListener("change", applyFilter);
    });
  });
}());
