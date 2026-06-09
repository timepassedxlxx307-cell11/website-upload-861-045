const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const backTop = document.querySelector("[data-back-top]");

function updateHeader() {
  if (!header) {
    return;
  }

  if (window.scrollY > 44) {
    header.classList.add("is-scrolled");
  } else {
    header.classList.remove("is-scrolled");
  }
}

function updateBackTop() {
  if (!backTop) {
    return;
  }

  if (window.scrollY > 420) {
    backTop.classList.add("is-visible");
  } else {
    backTop.classList.remove("is-visible");
  }
}

window.addEventListener("scroll", function () {
  updateHeader();
  updateBackTop();
});

updateHeader();
updateBackTop();

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", function () {
    mobileNav.classList.toggle("is-open");
  });
}

if (backTop) {
  backTop.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

const heroSlides = Array.from(document.querySelectorAll("[data-hero-slide]"));
const heroDots = Array.from(document.querySelectorAll("[data-hero-dot]"));
const heroPrev = document.querySelector("[data-hero-prev]");
const heroNext = document.querySelector("[data-hero-next]");
let heroIndex = 0;
let heroTimer = null;

function showHeroSlide(index) {
  if (!heroSlides.length) {
    return;
  }

  heroIndex = (index + heroSlides.length) % heroSlides.length;

  heroSlides.forEach(function (slide, slideIndex) {
    slide.classList.toggle("is-active", slideIndex === heroIndex);
  });

  heroDots.forEach(function (dot, dotIndex) {
    dot.classList.toggle("is-active", dotIndex === heroIndex);
  });
}

function restartHeroTimer() {
  if (!heroSlides.length) {
    return;
  }

  if (heroTimer) {
    window.clearInterval(heroTimer);
  }

  heroTimer = window.setInterval(function () {
    showHeroSlide(heroIndex + 1);
  }, 5200);
}

if (heroSlides.length) {
  showHeroSlide(0);
  restartHeroTimer();
}

if (heroPrev) {
  heroPrev.addEventListener("click", function () {
    showHeroSlide(heroIndex - 1);
    restartHeroTimer();
  });
}

if (heroNext) {
  heroNext.addEventListener("click", function () {
    showHeroSlide(heroIndex + 1);
    restartHeroTimer();
  });
}

heroDots.forEach(function (dot) {
  dot.addEventListener("click", function () {
    const index = Number(dot.getAttribute("data-hero-dot"));
    showHeroSlide(index);
    restartHeroTimer();
  });
});

const searchInputs = Array.from(document.querySelectorAll("[data-search-input]"));
const filterChips = Array.from(document.querySelectorAll("[data-filter-chip]"));

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function runSearch(scopeRoot) {
  const root = scopeRoot || document;
  const items = Array.from(root.querySelectorAll("[data-search-item]"));
  const input = document.querySelector("[data-search-input]");
  const activeChip = document.querySelector("[data-filter-chip].is-active");
  const keyword = normalizeText(input ? input.value : "");
  const filter = activeChip ? activeChip.getAttribute("data-filter-chip") : "全部";

  items.forEach(function (item) {
    const text = normalizeText(item.getAttribute("data-text"));
    const itemFilter = item.getAttribute("data-filter") || "";
    const keywordMatched = !keyword || text.includes(keyword);
    const filterMatched = !filter || filter === "全部" || itemFilter === filter;
    item.classList.toggle("is-hidden", !(keywordMatched && filterMatched));
  });
}

searchInputs.forEach(function (input) {
  input.addEventListener("input", function () {
    runSearch(document.querySelector("[data-search-scope]") || document);
  });
});

filterChips.forEach(function (chip) {
  chip.addEventListener("click", function () {
    filterChips.forEach(function (item) {
      item.classList.remove("is-active");
    });
    chip.classList.add("is-active");
    runSearch(document.querySelector("[data-search-scope]") || document);
  });
});
