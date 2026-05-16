/* ==============================================================
   QUINTIN DE JONGH — CONTENTFUL HELPERS
   Thin wrapper around the Contentful Delivery REST API
   (no SDK needed — works on any static host).
   ============================================================== */
(function () {
  const cfg = (window.QDJ_CONFIG || {}).contentful || {};
  const CDN  = "https://cdn.contentful.com";
  const MGMT = "https://api.contentful.com";

  /* ── Delivery (public read) ──────────────────────────────── */
  async function getEntries(contentType, params = {}) {
    if (!cfg.spaceId || !cfg.deliveryToken) {
      return { items: [], includes: {} };
    }
    const url = new URL(`${CDN}/spaces/${cfg.spaceId}/environments/${cfg.environment || "master"}/entries`);
    url.searchParams.set("access_token", cfg.deliveryToken);
    url.searchParams.set("content_type", contentType);
    url.searchParams.set("include", "2");
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    if (!res.ok) { console.error("Contentful error", res.status, await res.text()); return { items: [], includes: {} }; }
    return res.json();
  }

  /* ── Management (admin write) ────────────────────────────── */
  async function createEntry(contentType, fields, token) {
    const t = token || cfg.managementToken;
    if (!t) throw new Error("No management token configured");
    const url = `${MGMT}/spaces/${cfg.spaceId}/environments/${cfg.environment || "master"}/entries`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${t}`,
        "Content-Type": "application/vnd.contentful.management.v1+json",
        "X-Contentful-Content-Type": contentType,
      },
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) throw new Error(`Contentful create error ${res.status}: ${await res.text()}`);
    return res.json();
  }

  async function updateEntry(entryId, version, fields, token) {
    const t = token || cfg.managementToken;
    const url = `${MGMT}/spaces/${cfg.spaceId}/environments/${cfg.environment || "master"}/entries/${entryId}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${t}`,
        "Content-Type": "application/vnd.contentful.management.v1+json",
        "X-Contentful-Version": version,
      },
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) throw new Error(`Contentful update error ${res.status}: ${await res.text()}`);
    return res.json();
  }

  async function publishEntry(entryId, version, token) {
    const t = token || cfg.managementToken;
    const url = `${MGMT}/spaces/${cfg.spaceId}/environments/${cfg.environment || "master"}/entries/${entryId}/published`;
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${t}`, "X-Contentful-Version": version },
    });
    if (!res.ok) throw new Error(`Publish error ${res.status}`);
    return res.json();
  }

  async function deleteEntry(entryId, token) {
    const t = token || cfg.managementToken;
    // Unpublish first
    await fetch(`${MGMT}/spaces/${cfg.spaceId}/environments/${cfg.environment || "master"}/entries/${entryId}/published`, {
      method: "DELETE", headers: { "Authorization": `Bearer ${t}` },
    }).catch(() => {});
    const res = await fetch(`${MGMT}/spaces/${cfg.spaceId}/environments/${cfg.environment || "master"}/entries/${entryId}`, {
      method: "DELETE", headers: { "Authorization": `Bearer ${t}` },
    });
    if (!res.ok && res.status !== 404) throw new Error(`Delete error ${res.status}`);
  }

  /* ── Upload asset to Contentful ──────────────────────────── */
  async function uploadAsset(file, token) {
    const t = token || cfg.managementToken;
    const base = `${MGMT}/spaces/${cfg.spaceId}/environments/${cfg.environment || "master"}`;
    // 1. Create upload
    const up = await fetch(`${MGMT}/spaces/${cfg.spaceId}/uploads`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${t}`, "Content-Type": "application/octet-stream" },
      body: file,
    });
    if (!up.ok) throw new Error(`Upload error ${up.status}`);
    const upData = await up.json();
    // 2. Create asset entry
    const asset = await fetch(`${base}/assets`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${t}`, "Content-Type": "application/vnd.contentful.management.v1+json" },
      body: JSON.stringify({
        fields: {
          title: { "en-US": file.name || "Uploaded image" },
          file:  { "en-US": { contentType: file.type, fileName: file.name, uploadFrom: { sys: { type: "Link", linkType: "Upload", id: upData.sys.id } } } },
        },
      }),
    });
    if (!asset.ok) throw new Error(`Asset create error ${asset.status}`);
    const assetData = await asset.json();
    // 3. Process
    await fetch(`${base}/assets/${assetData.sys.id}/files/en-US/process`, {
      method: "PUT", headers: { "Authorization": `Bearer ${t}`, "X-Contentful-Version": assetData.sys.version },
    });
    // 4. Publish
    await new Promise(r => setTimeout(r, 1500));
    const pubRes = await fetch(`${base}/assets/${assetData.sys.id}/published`, {
      method: "PUT", headers: { "Authorization": `Bearer ${t}`, "X-Contentful-Version": String(assetData.sys.version + 1) },
    });
    const pubData = await pubRes.json();
    return "https:" + pubData.fields?.file?.["en-US"]?.url;
  }

  /* ── Helpers ─────────────────────────────────────────────── */
  function assetUrl(field, includes) {
    if (!field) return "";
    if (field.fields?.file?.url) return "https:" + field.fields.file.url;
    const id = field.sys?.id;
    if (id && includes?.Asset) {
      const a = includes.Asset.find(x => x.sys.id === id);
      if (a?.fields?.file?.url) return "https:" + a.fields.file.url;
    }
    return "";
  }

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  }

  function isConfigured() {
    return !!(cfg.spaceId && cfg.deliveryToken);
  }

  window.QDJ_cf = { getEntries, createEntry, updateEntry, publishEntry, deleteEntry, uploadAsset, assetUrl, escapeHtml, isConfigured };
})();
