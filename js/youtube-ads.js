/* YouTube Ads-pagina. */
/* YouTube Ads-pagina: radar zonder labels, animatie pauzeren, menu, zwevende WhatsApp, tijdlijn. (voorstel: js/youtube-ads.js) */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function radar(canvas, opts) {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, cx = 0, cy = 0, R = 0, dpr = 1, blips = [];
    const SIG = "61,245,161";

    function layout() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const narrow = w < 760;
      const c = opts.center(w, h, narrow);
      cx = c.x; cy = c.y; R = c.r;
      const list = narrow ? (opts.mobileBlips ? opts.mobileBlips(w, h) : []) : opts.blips;
      blips = list.map(b => {
        const x = b.px != null ? b.px : b.x * w, y = b.py != null ? b.py : b.y * h;
        let a = Math.atan2(y - cy, x - cx); if (a < 0) a += Math.PI * 2;
        return { x, y, a, label: b.label, life: reduce ? 0.85 : 0 };
      });
    }

    function frame(angle, dt) {
      ctx.clearRect(0, 0, w, h);
      // ringen
      for (let i = 1; i <= 6; i++) {
        ctx.beginPath(); ctx.arc(cx, cy, (R / 6) * i, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${SIG},${i % 2 ? 0.16 : 0.09})`; ctx.lineWidth = 1; ctx.stroke();
      }
      // vizier
      ctx.strokeStyle = `rgba(${SIG},0.08)`;
      ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
      // sweep
      const wedge = 1.1;
      if (ctx.createConicGradient) {
        const g = ctx.createConicGradient(angle - wedge, cx, cy);
        const f = wedge / (Math.PI * 2);
        g.addColorStop(0, `rgba(${SIG},0)`); g.addColorStop(f * 0.98, `rgba(${SIG},0.26)`); g.addColorStop(f, `rgba(${SIG},0)`); g.addColorStop(1, `rgba(${SIG},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      }
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(angle) * R, cy + Math.sin(angle) * R);
      ctx.strokeStyle = `rgba(${SIG},0.55)`; ctx.lineWidth = 1.5; ctx.stroke();
      // middelpunt
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fillStyle = `rgba(${SIG},0.9)`; ctx.fill();

      // signalen
      ctx.font = '500 12.5px "JetBrains Mono", ui-monospace, monospace';
      ctx.textBaseline = "middle";
      for (const b of blips) {
        if (!reduce) {
          let d = angle - b.a; d = ((d % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          if (d < 0.06) b.life = 1;
          b.life = Math.max(0, b.life - dt / 4200);
        }
        if (b.life <= 0) continue;
        const L = b.life;
        const pr = 6 + (1 - L) * 26;
        ctx.beginPath(); ctx.arc(b.x, b.y, pr, 0, Math.PI * 2); ctx.strokeStyle = `rgba(${SIG},${0.5 * L})`; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.beginPath(); ctx.arc(b.x, b.y, 4.5, 0, Math.PI * 2); ctx.fillStyle = `rgba(${SIG},${L})`;
        ctx.shadowColor = `rgba(${SIG},${L})`; ctx.shadowBlur = 16; ctx.fill(); ctx.shadowBlur = 0;
        if (b.label) {
          const tw = ctx.measureText(b.label).width, padX = 10, bh = 26;
          const left = b.x + tw + 40 > w;
          const bx = left ? b.x - 16 - tw - padX * 2 : b.x + 16;
          const by = b.y - bh / 2;
          ctx.globalAlpha = Math.min(1, L * 1.4);
          ctx.fillStyle = "rgba(11,18,32,0.82)"; ctx.strokeStyle = `rgba(${SIG},0.4)`;
          ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, tw + padX * 2, bh, 13) : ctx.rect(bx, by, tw + padX * 2, bh); ctx.fill(); ctx.stroke();
          ctx.fillStyle = "#E9EEF2"; ctx.fillText(b.label, bx + padX, b.y + 0.5);
          ctx.globalAlpha = 1;
        }
      }
    }

    layout();
    let angle = -Math.PI / 2, last = performance.now(), visible = true;
    new ResizeObserver(() => { layout(); if (reduce) frame(angle, 0); }).observe(canvas);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
    if (reduce) { frame(angle, 0); return; }
    (function loop(now) {
      const dt = Math.min(now - last, 60); last = now;
      if (visible) { angle = (angle + dt * 0.00095) % (Math.PI * 2); frame(angle, dt); }
      requestAnimationFrame(loop);
    })(last);

  }

  radar(document.getElementById("radar"), {
    center: (w, h, narrow) => narrow ? { x: w * 0.5, y: h * 0.72, r: w * 0.9 } : { x: w * 0.74, y: h * 0.5, r: Math.max(w * 0.36, 460) },
    blips: []
  });
  radar(document.getElementById("radar2"), {
    center: (w, h) => ({ x: w * 0.5, y: h * 0.5, r: Math.max(w, h) * 0.6 }),
    blips: []
  });

  /* ---------- Banneranimatie ---------- */
  const vis = document.querySelector(".vis");
  const visBtn = vis.querySelector(".anim-toggle");
  visBtn.addEventListener("click", () => {
    const paused = visBtn.getAttribute("aria-pressed") !== "true";
    visBtn.setAttribute("aria-pressed", String(paused));
    visBtn.querySelector("span").textContent = paused ? "Speel beweging af" : "Pauzeer beweging";
    vis.classList.toggle("is-paused", paused);
  });

  const pl = vis.querySelector("#player"), tag = vis.querySelector("#adTag"), skip = vis.querySelector("#adSkip"), bar = vis.querySelector("#adBar");
  function show(t) {
    const left = Math.max(0, 5 - Math.floor(t));
    tag.textContent = "Advertentie · 0:0" + left;
    bar.style.width = Math.min(100, t / 5 * 100) + "%";
    const done = t >= 5; pl.classList.toggle("is-skip", done);
    skip.textContent = done ? "Advertentie overslaan ▸" : "Overslaan over " + left;
  }
  if (reduce) { show(5); }
  else {
    let t = 0, last = performance.now();
    (function loop(now) {
      const dt = (now - last) / 1000; last = now;
      if (!vis.classList.contains("is-paused")) { t += dt; if (t > 8) t = 0; show(t); }
      requestAnimationFrame(loop);
    })(last);
  }


  /* ---------- FAQ-vraag openen via een link (#faq-...) ---------- */
  function openFaq() { const el = location.hash && document.getElementById(location.hash.slice(1)); if (el && el.tagName === "DETAILS") el.open = true; }
  addEventListener("hashchange", openFaq); openFaq();

  /* ---------- Mobiel menu ---------- */
  const burger = document.querySelector(".nav__burger");
  const menu = document.getElementById("navMenu");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Menu sluiten" : "Menu openen");
    menu.hidden = !open;
  }
  burger.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) { setMenu(false); burger.focus(); } });

  /* ---------- Zwevende WhatsApp-knop wijkt voor zichtbare scanknoppen ---------- */
  const fab = document.querySelector(".wa-float");
  const inView = new Set();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? inView.add(e.target) : inView.delete(e.target));
    fab.classList.toggle("is-hidden", inView.size > 0);
  });
  document.querySelectorAll(".btn--signal").forEach(b => { if (!b.closest(".nav__menu")) io.observe(b); });

  /* ---------- Traject: lijn en punten lichten op terwijl je scrolt ---------- */
  const tl = document.getElementById("timeline");
  const steps = tl.querySelectorAll(".step");
  function onScroll() {
    const r = tl.getBoundingClientRect();
    const vh = innerHeight;
    const p = Math.max(0, Math.min(1, (vh * 0.62 - r.top) / r.height));
    tl.style.setProperty("--p", p.toFixed(3));
    steps.forEach(s => s.classList.toggle("is-on", s.getBoundingClientRect().top + 30 < vh * 0.62));
  }
  if (reduce) { tl.style.setProperty("--p", 1); steps.forEach(s => s.classList.add("is-on")); }
  else { addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll(); }
})();
