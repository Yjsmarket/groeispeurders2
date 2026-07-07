/* ===================================================================
   Groeispeurt — main.js
   Sticky header · mobiel menu · scroll reveal · carousel · accordion
   =================================================================== */
(function () {
  "use strict";

  /* ---------- Sticky header scroll-state ---------- */
  const header = document.getElementById("header");
  const onScroll = () => {
    if (window.scrollY > 20) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobiel menu ---------- */
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("overlay");

  const setMenu = (open) => {
    hamburger.classList.toggle("active", open);
    mobileMenu.classList.toggle("open", open);
    overlay.classList.toggle("show", open);
    hamburger.setAttribute("aria-expanded", String(open));
    mobileMenu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  };

  hamburger.addEventListener("click", () => setMenu(!mobileMenu.classList.contains("open")));
  overlay.addEventListener("click", () => setMenu(false));
  mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Scroll reveal (Intersection Observer) ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // lichte stagger binnen dezelfde viewport-batch
            setTimeout(() => entry.target.classList.add("visible"), i * 70);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- Reviews carousel ---------- */
  const track = document.getElementById("carouselTrack");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const dotsWrap = document.getElementById("carouselDots");

  if (track) {
    const cards = Array.from(track.children);
    let index = 0;
    let autoTimer = null;

    const perView = () => {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    };

    const maxIndex = () => Math.max(0, cards.length - perView());

    const buildDots = () => {
      dotsWrap.innerHTML = "";
      const pages = maxIndex() + 1;
      for (let i = 0; i < pages; i++) {
        const dot = document.createElement("button");
        dot.className = "carousel__dot" + (i === index ? " active" : "");
        dot.setAttribute("aria-label", "Ga naar review " + (i + 1));
        dot.addEventListener("click", () => { index = i; update(); });
        dotsWrap.appendChild(dot);
      }
    };

    const update = () => {
      index = Math.min(index, maxIndex());
      const card = cards[0];
      const gap = parseFloat(getComputedStyle(track).gap) || 24;
      const step = card.getBoundingClientRect().width + gap;
      track.style.transform = `translateX(${-index * step}px)`;
      dotsWrap.querySelectorAll(".carousel__dot").forEach((d, i) =>
        d.classList.toggle("active", i === index)
      );
    };

    const next = () => { index = index >= maxIndex() ? 0 : index + 1; update(); };
    const prev = () => { index = index <= 0 ? maxIndex() : index - 1; update(); };

    nextBtn.addEventListener("click", () => { next(); resetAuto(); });
    prevBtn.addEventListener("click", () => { prev(); resetAuto(); });

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startAuto = () => { if (!reduceMotion) autoTimer = setInterval(next, 5000); };
    const resetAuto = () => { clearInterval(autoTimer); startAuto(); };

    const carousel = document.getElementById("carousel");
    carousel.addEventListener("mouseenter", () => clearInterval(autoTimer));
    carousel.addEventListener("mouseleave", startAuto);

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { buildDots(); update(); }, 150);
    });

    buildDots();
    update();
    startAuto();
  }

  /* ---------- FAQ accordion ---------- */
  const items = document.querySelectorAll(".accordion__item");
  items.forEach((item) => {
    const trigger = item.querySelector(".accordion__trigger");
    const panel = item.querySelector(".accordion__panel");

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      // sluit overige items
      items.forEach((other) => {
        if (other !== item) {
          other.classList.remove("open");
          other.querySelector(".accordion__panel").style.maxHeight = null;
          other.querySelector(".accordion__trigger").setAttribute("aria-expanded", "false");
        }
      });

      if (isOpen) {
        item.classList.remove("open");
        panel.style.maxHeight = null;
        trigger.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("open");
        panel.style.maxHeight = panel.scrollHeight + "px";
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Hero-proof teller (0 → 50) ---------- */
  const reduceMotionPref = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const countUp = (duration, onFrame) => {
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      onFrame(eased, p);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const proofNum = document.querySelector(".hero__proof-num[data-count]");
  if (proofNum) {
    const target = parseInt(proofNum.getAttribute("data-count"), 10) || 0;
    if (reduceMotionPref) {
      proofNum.textContent = String(target);
    } else {
      countUp(1500, (e) => { proofNum.textContent = String(Math.round(target * e)); });
    }
  }

  /* ---------- Cursor-lens (speuren) op donkere secties ---------- */
  document.querySelectorAll(".spotlight").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      el.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  });

  /* ---------- Footer jaartal ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
