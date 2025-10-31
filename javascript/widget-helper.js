(function () {
  const DEPLOY_URL = window.MGTE_WEBRING_URL || window.location.origin;

  function buildWidget(siteUrl) {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.gap = "12px";
    container.style.padding = "8px 12px";
    container.style.backgroundColor = "rgba(255,255,255,0.9)";
    container.style.borderRadius = "8px";
    container.style.border = "1px solid #e5e7eb";
    container.style.fontSize = "14px";

    const prev = document.createElement("a");
    prev.href = `${DEPLOY_URL}/#${encodeURIComponent(siteUrl)}?nav=prev`;
    prev.setAttribute("aria-label", "Previous site");
    prev.style.color = "#8b5cf6";
    prev.style.textDecoration = "none";
    prev.style.fontWeight = "500";
    prev.innerHTML = "← Previous";

    const logoLink = document.createElement("a");
    logoLink.href = `${DEPLOY_URL}/#${encodeURIComponent(siteUrl)}`;
    logoLink.target = "_blank";
    logoLink.setAttribute("aria-label", "MGTE Webring");
    logoLink.style.display = "flex";
    logoLink.style.alignItems = "center";
    logoLink.style.gap = "6px";
    logoLink.style.color = "#8b5cf6";
    logoLink.style.textDecoration = "none";
    logoLink.style.fontWeight = "600";

    const img = document.createElement("img");
    img.src = `${DEPLOY_URL}/University_of_Waterloo_seal.svg`;
    img.alt = "UW Seal";
    img.style.width = "20px";
    img.style.height = "20px";
    logoLink.appendChild(img);
    
    const text = document.createElement("span");
    text.textContent = "MGTE Webring";
    logoLink.appendChild(text);

    const next = document.createElement("a");
    next.href = `${DEPLOY_URL}/#${encodeURIComponent(siteUrl)}?nav=next`;
    next.setAttribute("aria-label", "Next site");
    next.style.color = "#8b5cf6";
    next.style.textDecoration = "none";
    next.style.fontWeight = "500";
    next.innerHTML = "Next →";

    container.appendChild(prev);
    container.appendChild(logoLink);
    container.appendChild(next);
    return container;
  }

  async function generateWithLLM(siteHtml, siteUrl) {
    try {
      const res = await fetch("/api/generate-widget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: siteHtml, url: siteUrl, deployUrl: DEPLOY_URL })
      });
      if (!res.ok) throw new Error("fallback");
      const data = await res.json();
      if (data && data.html) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = data.html;
        return wrapper.firstElementChild || buildWidget(siteUrl);
      }
    } catch (_) {
    }
    return buildWidget(siteUrl);
  }

  async function autoInsert() {
    const siteUrl = (window.MGTE_SITE_URL || window.location.origin).replace(/\/$/, "");
    const hostEl = document.querySelector("[data-mgte-webring=auto]") || document.querySelector("footer") || document.body;
    const html = document.documentElement.outerHTML.slice(0, 200000);
    const widget = await generateWithLLM(html, siteUrl);
    hostEl.appendChild(widget);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInsert);
  } else {
    autoInsert();
  }
})();


