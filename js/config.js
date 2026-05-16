/* ==============================================================
   QUINTIN DE JONGH — SITE CONFIG
   --------------------------------------------------------------
   Fill in your Contentful credentials after creating a space.
   See /admin.html → "Setup" panel for step-by-step instructions.
   ============================================================== */

window.QDJ_CONFIG = {

  /* ────────────────────────────────────────────────────────────
     CONTENTFUL — CMS for projects
     1. Go to https://app.contentful.com and create a free space
     2. Create content types: engineeringProject, personalProject
        (see /admin.html for field schemas)
     3. Paste your Space ID + Delivery Token below
     4. Paste your Management Token in the admin portal only
   ──────────────────────────────────────────────────────────── */
  contentful: {
    spaceId:         "keha9rwx26kz",          // e.g. "a1b2c3d4e5f6"
    environment:     "master",
    deliveryToken:   "d0ZJmLC7THUYKqp40o70deY23e8ucKhVRnSjjijOenI",          // Content Delivery API (public read)
    managementToken: "",          // Content Management API (admin only — never commit this publicly)
  },

  /* ────────────────────────────────────────────────────────────
     SITE METADATA
   ──────────────────────────────────────────────────────────── */
  site: {
    name:     "Quintin de Jongh",
    tagline:  "Mechanical Project Engineer · CAE Specialist · Product Developer",
    email:    "quintindejongh@gmail.com",
    phone:    "+27 69 416 3441",
    location: "Cape Town, South Africa",
    linkedin: "https://www.linkedin.com/in/quintin-de-jongh",
    github:   "https://github.com/Quino97",
    year:     new Date().getFullYear(),
  },
};

/* Warn if Contentful not yet configured */
(function () {
  const cf = (window.QDJ_CONFIG || {}).contentful || {};
  if (!cf.spaceId || !cf.deliveryToken) {
    console.info(
      "%c[QDJ] Contentful not configured yet — project pages will show static fallback data.\n" +
      "→ Go to /admin.html and follow the Setup instructions to connect your Contentful space.",
      "color:#2563EB; font-weight:600;"
    );
  }
})();
