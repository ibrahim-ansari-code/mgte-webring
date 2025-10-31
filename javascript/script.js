import { fuzzyMatch, formatUrl } from "./helpers.js";

const logConsoleMessage = () => {
  console.log(
    "%cMGTE Webring" +
      "\n\n%cAdd your site: PRs welcome" +
      "\n\n%c→ webring repo (Vercel)",
    "font-size: 18px; font-weight: bold; color: #6B21A8;",
    "font-size: 14px; color: #7C3AED;",
    "font-size: 14px; color: #9333EA; text-decoration: underline;"
  );
};

const createWebringList = (matchedSiteIndices) => {
  const webringList = document.getElementById("webring-list");
  if (!webringList) return;
  const existingHeader = webringList.querySelector('.list-header');
  webringList.innerHTML = "";
  if (existingHeader) webringList.appendChild(existingHeader);
  const indices = (matchedSiteIndices && matchedSiteIndices.length !== webringData.sites.length)
    ? matchedSiteIndices
    : webringData.sites.map((_, i) => i);

  indices.forEach((index) => {
    const site = webringData.sites[index];
    const displayUrl = formatUrl(site.website);

    const row = document.createElement('div');
    row.className = 'list-row';

    const name = document.createElement('span');
    name.textContent = site.name;

    const year = document.createElement('span');
    year.textContent = site.year;

    const url = document.createElement('a');
    url.href = site.website;
    url.target = '_blank';
    url.rel = 'noopener noreferrer';
    url.textContent = displayUrl;

    row.appendChild(name);
    row.appendChild(year);
    row.appendChild(url);
    webringList.appendChild(row);
  });
};

function handleUrlFragment(inputEl) {
  if (!inputEl) return;
  const fragment = window.location.hash.slice(1);
  if (fragment) {
    inputEl.value = decodeURIComponent(fragment);
    filterWebring(fragment);
    inputEl.dispatchEvent(new Event("input"));
  }
}

function filterWebring(searchTerm) {
  const searchLower = (searchTerm || "").toLowerCase();
  const matchedSiteIndices = [];
  webringData.sites.forEach((site, index) => {
    if (
      site.name.toLowerCase().includes(searchLower) ||
      fuzzyMatch(site.website.toLowerCase(), searchLower) ||
      site.year.toString().includes(searchLower)
    ) {
      matchedSiteIndices.push(index);
    }
  });
  createWebringList(matchedSiteIndices);
}

const navigateWebring = () => {
  const fragment = window.location.hash.slice(1);
  if (!fragment.includes("?")) return;

  const [currentSite, query] = fragment.split("?");
  const params = new URLSearchParams(query);
  const nav = (params.get("nav") || "").replace(/\/+$/, "").trim();
  if (!["next", "prev"].includes(nav)) return;

  const match = webringData.sites.filter((site) => fuzzyMatch(currentSite, site.website));
  if (match.length === 0) return;
  if (match.length > 1) throw new Error(`Multiple URLs matched ${currentSite}`);

  const currIndex = webringData.sites.findIndex((site) => fuzzyMatch(currentSite, site.website));
  const increment = nav === "next" ? 1 : -1;
  let newIndex = (currIndex + increment) % webringData.sites.length;
  if (newIndex < 0) newIndex = webringData.sites.length - 1;
  if (!webringData.sites[newIndex]) return;

  document.body.innerHTML = `
  <main class="p-6 min-h-[100vh] w-[100vw]">
    <p class="text-purple-800">redirecting...</p>
  </main>`;
  window.location.href = webringData.sites[newIndex].website;
};

function setupBottomNavigation() {
  const mgtNav = document.getElementById("mgt-nav");
  const navPrev = document.getElementById("nav-prev");
  const navNext = document.getElementById("nav-next");
  const navHome = document.getElementById("nav-home");

  function checkIfMemberSite() {
    const currentUrl = window.location.href;
    const currentSite = webringData.sites.find(site => 
      fuzzyMatch(currentUrl, site.website)
    );
    
    if (currentSite) {
      const currentIndex = webringData.sites.findIndex(site => site === currentSite);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : webringData.sites.length - 1;
      const nextIndex = currentIndex < webringData.sites.length - 1 ? currentIndex + 1 : 0;
      
      const prevSite = webringData.sites[prevIndex];
      const nextSite = webringData.sites[nextIndex];
      
      navPrev.href = `${prevSite.website}#${encodeURIComponent(prevSite.website)}?nav=prev`;
      navNext.href = `${nextSite.website}#${encodeURIComponent(nextSite.website)}?nav=next`;
      navHome.href = window.location.origin;
      
      mgtNav.style.display = "block";
    } else {
      mgtNav.style.display = "none";
    }
  }

  checkIfMemberSite();
  window.addEventListener("popstate", checkIfMemberSite);
  window.addEventListener("hashchange", checkIfMemberSite);
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.hash.includes("?nav=")) navigateWebring();

  const searchInput = document.getElementById("search");
  const searchClear = document.getElementById("search-clear");

  logConsoleMessage();
  createWebringList(webringData.sites.map((_, i) => i));
  handleUrlFragment(searchInput);
  setupBottomNavigation();

  if (searchInput) {
    searchInput.addEventListener("input", (e) => filterWebring(e.target.value));
  }
  
  if (searchClear) {
    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      filterWebring("");
    });
  }

  window.addEventListener("hashchange", () => {
    handleUrlFragment(searchInput);
  });
  window.addEventListener("hashchange", navigateWebring);
});


