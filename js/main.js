/* =====================================================================
   Szandi's Little Miracles (Móra Alexandra) — interakciók
   ===================================================================== */

/* === ÁRAJÁNLAT cél e-mail ============================================
   Az árajánlatkérő űrlap a FormSubmit szolgáltatáson át KÖZVETLENÜL
   erre a címre küldi az üzenetet (nem kell levelezőkliens a gépen).
   Ha a küldés nem sikerül, tartalékként a régi mailto-t nyitja meg. */
const QUOTE_EMAIL = "szandi.littlemiracles@gmail.com";
const QUOTE_ENDPOINT = "https://formsubmit.co/ajax/" + QUOTE_EMAIL;
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

  /* ---- ÁRAJÁNLAT űrlap → közvetlen e-mail küldés (FormSubmit) ---- */
  const form = document.querySelector("#quote-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const nev   = (d.get("nev")   || "").toString().trim();
      const email = (d.get("email") || "").toString().trim();
      const tel   = (d.get("tel")   || "").toString().trim();
      const tipus = (d.get("tipus") || "").toString().trim();
      const datum = (d.get("datum") || "").toString().trim();
      const uzenet= (d.get("uzenet")|| "").toString().trim();
      const aszf  = d.get("aszf_elfogad") ? "Igen" : "Nem";

      const subject = `Árajánlatkérés — ${tipus || "fotózás"}${nev ? " · " + nev : ""}`;
      const note = form.querySelector(".form-note");
      const btn  = form.querySelector('button[type="submit"]');
      const btnHtml = btn ? btn.innerHTML : "";
      if (btn) { btn.disabled = true; btn.textContent = "Küldés…"; }

      try {
        const res = await fetch(QUOTE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            "Név": nev,
            "E-mail": email,
            "Telefon": tel || "—",
            "Fotózás típusa": tipus,
            "Tervezett időpont": datum || "rugalmas",
            "Üzenet": uzenet || "—",
            "ÁSZF elfogadva": aszf,
            _subject: subject,
            _replyto: email,
            _template: "table",
            _captcha: "false",
          }),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        if (note) note.innerHTML = "Köszönöm, az üzeneted megérkezett! Hamarosan jelentkezem. ✦";
      } catch (err) {
        /* Tartalék: a régi mailto-s út, ha a küldő szolgáltatás nem elérhető */
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
        window.location.href = `mailto:${QUOTE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        if (note) note.innerHTML = `Ha nem nyílt meg a leveleződ, írj közvetlenül ide: <a href="mailto:${QUOTE_EMAIL}">${QUOTE_EMAIL}</a>`;
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = btnHtml; }
      }
    });
  }
});
