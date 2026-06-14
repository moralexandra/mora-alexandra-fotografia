/* =====================================================================
   Szandi's Little Miracles (Móra Alexandra) — interakciók
   ===================================================================== */

/* === ÁRAJÁNLAT cél e-mail ============================================
   Az árajánlatkérő űrlap erre a címre nyitja meg a kész levelet.    */
const QUOTE_EMAIL = "szandi.littlemiracles@gmail.com";
/* ==================================================================== */

/* JS aktív → engedélyezzük a reveal-animációkat (JS nélkül a tartalom alapból látszik) */
document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {

  /* ---- fejléc háttér scrollra ---- */
  const header = document.querySelector(".site-header");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- mobil menü ---- */
  const burger = document.querySelector(".nav-burger");
  const links  = document.querySelector(".nav-links");
  if (burger && links) {
    const toggle = (open) => {
      burger.classList.toggle("open", open);
      links.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", () => toggle(!links.classList.contains("open")));
    links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => toggle(false)));
  }

  /* ---- scroll reveal ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  /* ---- aktuális év a footerben ---- */
  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

  /* ---- LIGHTBOX galéria ---- */
  const items = Array.from(document.querySelectorAll(".gallery .g-item"));
  if (items.length) {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = `
      <button class="lb-btn lb-close" aria-label="Bezárás">&times;</button>
      <button class="lb-btn lb-prev" aria-label="Előző">&#8249;</button>
      <button class="lb-btn lb-next" aria-label="Következő">&#8250;</button>
      <img alt="">
      <div class="lb-count"></div>`;
    document.body.appendChild(lb);
    const lbImg   = lb.querySelector("img");
    const lbCount = lb.querySelector(".lb-count");
    const sources = items.map(it => it.querySelector("img"));
    let idx = 0;

    const show = (i) => {
      idx = (i + sources.length) % sources.length;
      const src = sources[idx];
      const full = src.dataset.full || src.src;
      lbImg.src = full;
      lbImg.alt = src.alt || "";
      lbCount.textContent = `${idx + 1} / ${sources.length}`;
    };
    const open = (i) => { show(i); lb.classList.add("open"); document.body.style.overflow = "hidden"; };
    const close = () => { lb.classList.remove("open"); document.body.style.overflow = ""; };

    items.forEach((it, i) => it.addEventListener("click", () => open(i)));
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-next").addEventListener("click", () => show(idx + 1));
    lb.querySelector(".lb-prev").addEventListener("click", () => show(idx - 1));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "ArrowLeft") show(idx - 1);
    });
  }

  /* ---- ÁRAJÁNLAT űrlap → e-mail ---- */
  const form = document.querySelector("#quote-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const nev   = (d.get("nev")   || "").toString().trim();
      const email = (d.get("email") || "").toString().trim();
      const tel   = (d.get("tel")   || "").toString().trim();
      const tipus = (d.get("tipus") || "").toString().trim();
      const datum = (d.get("datum") || "").toString().trim();
      const uzenet= (d.get("uzenet")|| "").toString().trim();

      const subject = `Árajánlatkérés — ${tipus || "fotózás"}${nev ? " · " + nev : ""}`;
      const body =
`Szia Szandi!

Szeretnék árajánlatot kérni az alábbiakhoz:

• Név: ${nev}
• E-mail: ${email}
• Telefon: ${tel}
• Fotózás típusa: ${tipus}
• Tervezett időpont: ${datum || "rugalmas"}

Üzenet:
${uzenet}

Köszönettel,
${nev}`;

      const mailto = `mailto:${QUOTE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;

      const note = form.querySelector(".form-note");
      if (note) note.innerHTML = "Megnyílik a leveleződ a kész üzenettel — már csak el kell küldened. ✦";
    });
  }
});
