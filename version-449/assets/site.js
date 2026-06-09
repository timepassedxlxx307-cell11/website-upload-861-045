(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var navButton = document.querySelector("[data-nav-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (navButton && mobileNav) {
      navButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var show = function (index) {
        current = index;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });
      if (slides.length > 1) {
        setInterval(function () {
          show((current + 1) % slides.length);
        }, 5000);
      }
    }

    var filterAreas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
    filterAreas.forEach(function (area) {
      var input = area.querySelector("[data-search-input]");
      var buttons = Array.prototype.slice.call(area.querySelectorAll("[data-filter]"));
      var cards = Array.prototype.slice.call(area.querySelectorAll("[data-movie-card]"));
      var empty = area.querySelector("[data-empty]");
      var activeFilter = "all";
      var apply = function () {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [card.dataset.title, card.dataset.tags, card.dataset.region, card.dataset.year].join(" ").toLowerCase();
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchFilter = activeFilter === "all" || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
          var showCard = matchQuery && matchFilter;
          card.classList.toggle("hidden-card", !showCard);
          if (showCard) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      };
      if (input) {
        input.addEventListener("input", apply);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = button.dataset.filter || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          apply();
        });
      });
      apply();
    });

    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector("[data-player-overlay]");
      var stream = shell.dataset.stream;
      var started = false;
      var hlsInstance = null;
      var start = function () {
        if (!video || !stream) {
          return;
        }
        shell.classList.add("is-playing");
        if (!started) {
          started = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls();
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
          } else {
            video.src = stream;
          }
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      };
      if (overlay) {
        overlay.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!started || video.paused) {
            start();
          }
        });
        video.addEventListener("play", function () {
          shell.classList.add("is-playing");
        });
        video.addEventListener("ended", function () {
          if (hlsInstance && typeof hlsInstance.stopLoad === "function") {
            hlsInstance.stopLoad();
          }
        });
      }
    });
  });
})();
