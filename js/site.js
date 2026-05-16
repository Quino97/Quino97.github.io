/* ==============================================================
   QUINTIN DE JONGH — SITE INITIALISER
   Loads partials, handles nav scroll/active, scroll reveal
   ============================================================== */

(function () {
  /* ── Load navbar + footer partials ────────────────────────── */
  function loadPartial(id, path, cb) {
    const el = document.getElementById(id);
    if (!el) return;
    fetch(path)
      .then(r => r.text())
      .then(html => {
        el.innerHTML = html;
        if (cb) cb();
      })
      .catch(e => console.warn("Partial load failed:", path, e));
  }

  function initNav() {
    const nav = document.querySelector(".site-nav");
    if (!nav) return;

    /* Scrolled shadow */
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* Active link */
    const path = window.location.pathname.replace(/\/$/, "") || "/index.html";
    nav.querySelectorAll(".nav-links a").forEach(a => {
      const href = a.getAttribute("href") || "";
      const match = href === path || (href !== "/" && path.startsWith(href.replace(/\.html$/, "")));
      if (match) a.classList.add("active");
    });

    /* Mobile toggle */
    const toggle  = nav.querySelector("#nav-toggle")        || document.getElementById("nav-toggle");
    const panel   = document.getElementById("nav-mobile-panel");
    const backdrop = document.getElementById("nav-backdrop");
    const closeBtn = document.getElementById("nav-mobile-close");

    function openMenu()  { panel?.classList.add("open"); backdrop?.classList.add("open"); document.body.style.overflow = "hidden"; }
    function closeMenu() { panel?.classList.remove("open"); backdrop?.classList.remove("open"); document.body.style.overflow = ""; }

    toggle?.addEventListener("click", openMenu);
    closeBtn?.addEventListener("click", closeMenu);
    backdrop?.addEventListener("click", closeMenu);
    panel?.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
  }

  /* ── Scroll reveal ─────────────────────────────────────────── */
  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if ("IntersectionObserver" in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } });
      }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
      els.forEach(el => obs.observe(el));
    } else {
      els.forEach(el => el.classList.add("in"));
    }
  }

  /* ── Typed.js hero subtitle ───────────────────────────────── */
  function initTyped() {
    const el = document.querySelector(".typed-text");
    if (!el || !window.Typed) return;
    const items = el.dataset.items ? el.dataset.items.split(",") : [];
    if (!items.length) return;
    new Typed(el, {
      strings: items,
      typeSpeed: 60,
      backSpeed: 30,
      backDelay: 2200,
      loop: true,
    });
  }

  /* ── Footer year ──────────────────────────────────────────── */
  function initFooter() {
    const el = document.getElementById("footer-year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ── Bootstrap: on DOM ready ──────────────────────────────── */
  document.addEventListener("DOMContentLoaded", () => {
    loadPartial("qdj-navbar", "/partials/navbar.html", initNav);
    loadPartial("qdj-footer", "/partials/footer.html", initFooter);
    initReveal();
    // Typed is loaded separately when needed
    window.addEventListener("typed-ready", initTyped);
  });

  // Also re-run initTyped in case Typed loads after DOMContentLoaded
  window.addEventListener("load", () => {
    initTyped();
    initReveal(); // catch any late-rendered elements
  });
})();
