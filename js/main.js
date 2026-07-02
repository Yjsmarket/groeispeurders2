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

  /* ---------- Diensten: geanimeerde widgets ---------- */
  const reduceMotionPref = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Notificatie-stroom (Card 5)
  const notifStack = document.getElementById("notifStack");
  if (notifStack) {
    const ROW = 58;
    const placeAll = () => {
      Array.from(notifStack.children).forEach((c, i) => {
        c.style.transition = "top .45s ease, opacity .45s ease, transform .45s ease";
        c.style.top = i * ROW + "px";
        c.style.opacity = "1";
        c.style.transform = "";
        c.style.zIndex = String(10 - i);
      });
    };
    // initiële plaatsing zonder animatie
    Array.from(notifStack.children).forEach((c, i) => {
      c.style.top = i * ROW + "px";
      c.style.zIndex = String(10 - i);
    });

    if (!reduceMotionPref) {
      setInterval(() => {
        const top = notifStack.firstElementChild;
        if (!top) return;
        // bovenste kaartje omhoog + vervagen
        top.style.transition = "transform .4s ease, opacity .4s ease";
        top.style.transform = "translateY(-32px)";
        top.style.opacity = "0";
        setTimeout(() => {
          // naar onderkant van de stapel, verborgen, zonder animatie
          notifStack.appendChild(top);
          const last = notifStack.children.length - 1;
          top.style.transition = "none";
          top.style.transform = "";
          top.style.top = last * ROW + "px";
          top.style.opacity = "0";
          // reflow forceren, daarna alles naar de eindpositie animeren
          void notifStack.offsetWidth;
          placeAll();
        }, 420);
      }, 2500);
    }
  }

  // Bars (Card 1), donut (Card 1) en gauge (Card 6) via IntersectionObserver
  const setDonut = (el, num, val) => {
    el.style.background =
      "conic-gradient(#0A6E4F 0% " + val + "%, #e8e8e8 " + val + "% 100%)";
    num.textContent = Math.round(val) + "%";
  };

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

  const runWidget = (el) => {
    const type = el.getAttribute("data-anim");
    if (type === "bars") {
      el.classList.add("in");
    } else if (type === "donut") {
      const target = parseFloat(el.getAttribute("data-target")) || 0;
      const num = el.querySelector(".donut__num");
      if (reduceMotionPref) return setDonut(el, num, target);
      countUp(1100, (e) => setDonut(el, num, target * e));
    } else if (type === "gauge") {
      const target = parseFloat(el.getAttribute("data-target")) || 0;
      const num = el.closest(".gauge").querySelector("[data-gauge-num]");
      if (reduceMotionPref) {
        el.style.strokeDashoffset = String(100 - target);
        if (num) num.textContent = String(target);
        return;
      }
      countUp(1400, (e) => {
        const val = target * e;
        el.style.strokeDashoffset = String(100 - val);
        if (num) num.textContent = String(Math.round(val));
      });
    }
  };

  // Hero-proof teller (0 → 50)
  const proofNum = document.querySelector(".hero__proof-num[data-count]");
  if (proofNum) {
    const target = parseInt(proofNum.getAttribute("data-count"), 10) || 0;
    if (reduceMotionPref) {
      proofNum.textContent = String(target);
    } else {
      countUp(1500, (e) => { proofNum.textContent = String(Math.round(target * e)); });
    }
  }

  const widgets = document.querySelectorAll("[data-anim]");
  if (widgets.length) {
    if ("IntersectionObserver" in window) {
      const wObs = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            runWidget(entry.target);
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.4 }
      );
      widgets.forEach((el) => wObs.observe(el));
    } else {
      widgets.forEach(runWidget);
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
