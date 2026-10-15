/* Prijzenpagina: samensteller, verstuurknop, mobiele balk en menu. */
(() => {
  const WHATSAPP_NUMBER = "31647054098";
  const waUrl = t => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t)}`;
  document.querySelectorAll(".js-wa").forEach(a => a.href = waUrl(a.dataset.msg));
  const eur = n => "€" + n.toLocaleString("nl-NL");

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


  /* ---------- Diensten en prijzen ---------- */
  const GROUPS = [
    { id: "web", title: "Website", note: "Eenmalig, kies er één", kind: "radio", items: [
      { id: "web-ai", name: "AI- of statische website", once: 650 },
      { id: "web-maat", name: "Maatwerk website (ook WordPress)", full: "Maatwerk website (ook WordPress)", once: 1000, range: "€1.000 tot €3.000" },
      { id: "web-shop", name: "Webshop", quote: true, label: "Prijs op aanvraag" } ] },
    { id: "ads", title: "Advertenties beheren", note: "Per maand, per kanaal", kind: "check", items: [
      { id: "ad-google", name: "Google Ads", month: 650, setup: 495 },
      { id: "ad-meta", name: "Meta Ads", month: 650, setup: 495 },
      { id: "ad-youtube", name: "YouTube Ads", month: 650, setup: 495 },
      { id: "ad-snap", name: "Snapchat Ads", month: 450, setup: 350, pair: true },
      { id: "ad-tiktok", name: "TikTok Ads", month: 450, setup: 350, pair: true } ] },
    { id: "cr", title: "Creatives", note: "Kies er één", desc: "Volledig op maat: we kijken welke creatives bij je bedrijf passen en op welke socials je al actief post.", kind: "radio", items: [
      { id: "cr-video", name: "Losse video's", once: 225, label: "€225 per video", qty: true },
      { id: "cr-serie", name: "Serie van 6 video's", full: "Creatives: serie van 6 video's", once: 895 },
      { id: "cr-abo1", name: "Abonnement", full: "Creatives abonnement (vanaf €895)", month: 895 },
      { id: "cr-abo2", name: "Abonnement uitgebreid", full: "Creatives abonnement uitgebreid (vanaf €1.495)", month: 1495 } ] },
    { id: "seo", title: "SEO", note: "", kind: "check", items: [
      { id: "seo-m", name: "SEO", full: "SEO (doorlopend)", month: 495 },
      { id: "seo-tech", name: "Technische basis", full: "SEO technische basis", once: 595 } ] },
    { id: "gbp", title: "Google Bedrijfsprofiel", note: "", kind: "check", items: [
      { id: "gbp-set", name: "Inrichten", full: "Google Bedrijfsprofiel inrichten", once: 195 },
      { id: "gbp-m", name: "Beheer", full: "Google Bedrijfsprofiel beheer", month: 150 } ] },
    { id: "care", title: "Website-onderhoud", note: "", kind: "check", items: [
      { id: "care-m", name: "Onderhoud", full: "Website-onderhoud", month: 75 } ] }
  ];
  const ITEMS = Object.fromEntries(GROUPS.flatMap(g => g.items.map(i => [i.id, { ...i, group: g.id, kind: g.kind }])));
  const state = { sel: new Set(), videos: 1, setup: false, via: "wa" };
  const MAIL = "info@groeispeurt.nl";
  const mailUrl = (subject, body) => `mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  document.querySelectorAll(".via button").forEach(b => b.addEventListener("click", () => {
    state.via = b.dataset.via;
    document.querySelectorAll(".via button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    document.querySelector("#sendIco use").setAttribute("href", state.via === "mail" ? "#mail" : "#wa");
    render();
  }));

  /* ---------- Opbouwen ---------- */
  const groupsEl = document.getElementById("groups");
  const priceText = i => i.range ? `<b>${i.range}</b> eenmalig` : i.quote ? i.label : i.label ? "vanaf " + i.label.replace(/^€/, "€").replace(" tot €3.000", "") : i.month ? `vanaf <b>${eur(i.month)}</b> p/mnd` : `vanaf <b>${eur(i.once)}</b> eenmalig`;
  groupsEl.innerHTML = GROUPS.map(g => `
    <div class="group" role="group" aria-labelledby="g-${g.id}">
      <div class="group__head"><h3 id="g-${g.id}">${g.title}</h3>${g.note ? `<small>${g.note}</small>` : ""}</div>
      ${g.desc ? `<p class="group__desc">${g.desc}</p>` : ""}
      <div class="opts">${g.items.map(i => `<button type="button" class="opt" data-id="${i.id}" data-kind="${g.kind}" aria-pressed="false"><strong>${i.name}</strong><span>${priceText(i)}</span></button>`).join("")}</div>
      ${g.id === "ads" ? `<div class="extra" id="exAds" hidden><label class="toggle"><input type="checkbox" id="setup">Kanalen ook voor mij opzetten</label><span style="color:var(--muted)">€495 per kanaal, Snapchat en TikTok €350. Een tweede kanaal van Snapchat of TikTok kost +€350 per maand.</span></div>` : ""}
      ${g.id === "cr" ? `<div class="extra" id="exVideo" hidden><span>Aantal video's</span><span class="stepper"><button type="button" id="vMin" aria-label="Minder video's">−</button><output id="vNum">1</output><button type="button" id="vPlus" aria-label="Meer video's">+</button></span></div>` : ""}
    </div>`).join("");

  groupsEl.addEventListener("click", e => {
    const b = e.target.closest(".opt"); if (!b) return;
    const it = ITEMS[b.dataset.id];
    if (state.sel.has(it.id)) state.sel.delete(it.id);
    else {
      if (it.kind === "radio") GROUPS.find(g => g.id === it.group).items.forEach(x => state.sel.delete(x.id));
      state.sel.add(it.id);
    }
    render();
  });
  document.getElementById("setup").addEventListener("change", e => { state.setup = e.target.checked; render(); });
  document.getElementById("vMin").addEventListener("click", () => { state.videos = Math.max(1, state.videos - 1); render(); });
  document.getElementById("vPlus").addEventListener("click", () => { state.videos = Math.min(20, state.videos + 1); render(); });
  document.getElementById("clearAll").addEventListener("click", () => { state.sel.clear(); state.setup = false; state.videos = 1; document.getElementById("setup").checked = false; render(); });

  /* ---------- Berekenen ---------- */
  function lines() {
    const out = [];
    let pairSeen = false;
    for (const g of GROUPS) for (const i of g.items) {
      if (!state.sel.has(i.id)) continue;
      if (i.quote) { out.push({ label: i.name, text: "op aanvraag", quote: true }); continue; }
      if (g.id === "ads") {
        const m = i.pair && pairSeen ? 350 : i.month;
        out.push({ label: `${i.name} beheer${i.pair && pairSeen ? " (tweede kanaal)" : ""}`, month: m });
        if (i.pair) pairSeen = true;
        continue;
      }
      if (i.qty) { out.push({ label: `Creatives: ${state.videos} video${state.videos > 1 ? "'s" : ""}`, once: i.once * state.videos }); continue; }
      out.push({ label: i.full || i.name, month: i.month, once: i.once, range: i.range });
    }
    if (state.setup) GROUPS.find(g => g.id === "ads").items.filter(i => state.sel.has(i.id)).forEach(i => out.push({ label: `${i.name} opzetten`, once: i.setup }));
    return out;
  }

  const els = { list: document.getElementById("sumList"), empty: document.getElementById("sumEmpty"), m: document.getElementById("tMonth"), o: document.getElementById("tOnce"), combo: document.getElementById("sumCombo"), send: document.getElementById("sendWa"), mbar: document.getElementById("mbar"), mTotal: document.getElementById("mTotal") };
  function render() {
    document.querySelectorAll(".opt").forEach(b => b.setAttribute("aria-pressed", String(state.sel.has(b.dataset.id))));
    const anyAds = GROUPS.find(g => g.id === "ads").items.some(i => state.sel.has(i.id));
    document.getElementById("exAds").hidden = !anyAds;
    if (!anyAds) { state.setup = false; document.getElementById("setup").checked = false; }
    document.getElementById("exVideo").hidden = !state.sel.has("cr-video");
    document.getElementById("vNum").textContent = state.videos;

    const L = lines();
    const month = L.reduce((s, l) => s + (l.month || 0), 0), once = L.reduce((s, l) => s + (l.once || 0), 0);
    const monthly = L.filter(l => l.month).length;
    els.list.innerHTML = L.map(l => `<li><span>${l.label}</span><span>${l.quote ? l.text : l.range ? l.range : [l.month ? "va. " + eur(l.month) + " p/mnd" : "", l.once ? "va. " + eur(l.once) : ""].filter(Boolean).join(" + ")}</span></li>`).join("");
    els.empty.hidden = L.length > 0;
    els.m.textContent = eur(month); els.o.textContent = eur(once);
    const chosen = state.sel.size; /* gekozen diensten; opzetten en het aantal video's tellen niet apart */
    const combi = chosen >= 2;
    els.combo.classList.toggle("is-on", combi);
    els.combo.innerHTML = combi ? `<b>Je combineert ${chosen} diensten.</b> Daarmee krijg je korting. Verstuur je keuze en ontdek hoeveel.` : "Combineer meerdere diensten voor korting.";
    els.mTotal.textContent = `${eur(month)} p/mnd`;
    void monthly;
    els.mbar.classList.toggle("is-hidden", L.length === 0);

    if (!L.length) { els.send.setAttribute("aria-disabled", "true"); els.send.removeAttribute("href"); return; }
    const msg = ["Hoi Groeispeurt, ik heb interesse in:", ...L.map(l => `- ${l.label}`), "", `Indicatie: vanaf ${eur(month)} per maand en vanaf ${eur(once)} eenmalig.`, "Welke korting krijg ik voor deze combinatie?", "", "Mijn website is: "].join("\n");
    els.send.href = state.via === "mail" ? mailUrl("Interesse in een eigen pakket", msg) : waUrl(msg);
    els.send.target = state.via === "mail" ? "_self" : "_blank";
    els.send.removeAttribute("aria-disabled");
  }
  els.send.addEventListener("click", e => { if (els.send.getAttribute("aria-disabled") === "true") e.preventDefault(); });

  /* Mobiele balk verbergen zolang de samenvatting zelf in beeld is */
  new IntersectionObserver(([en]) => { els.mbar.dataset.inview = en.isIntersecting; els.mbar.style.visibility = en.isIntersecting ? "hidden" : ""; }).observe(document.querySelector(".sum"));
  render();
})();
