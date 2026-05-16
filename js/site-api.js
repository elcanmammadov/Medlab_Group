function getSiteLang() {
  return window.currentLang || localStorage.getItem('lang') || 'az';
}

function isServedOverHttp() {
  return window.location.protocol === 'http:' || window.location.protocol === 'https:';
}

function getImageUrl(imagePath) {
  if (!imagePath) return '';
  const baseUrl = window.location.origin; // e.g., http://localhost:5000
  // If imagePath already has the full URL, return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // If it starts with /, append to base URL
  if (imagePath.startsWith('/')) {
    return baseUrl + imagePath;
  }
  // Otherwise treat as relative and prepend /
  return baseUrl + '/' + imagePath;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function pickLangField(obj, lang) {
  if (!obj || typeof obj !== 'object') return '';
  return obj[lang] || obj.az || obj.en || obj.ru || '';
}

function renderCompanies(companies) {
  const grid = document.getElementById('companiesGrid');
  if (!grid) return;

  const lang = getSiteLang();
  const t = typeof translations !== 'undefined' ? translations : null;

  grid.innerHTML = (companies || [])
    .map((c) => {
      const name = pickLangField(c.name, lang);
      const logoUrl = getImageUrl(c.logo);
      const href = `company.html?company=${encodeURIComponent(c._id)}&tab=about`;

      return `
        <div class="company-card fade-in">
          <div class="company-logo-wrap">
            ${logoUrl ? `<img src="${logoUrl}" alt="${name}" />` : `<span style="font-weight:800;color:var(--primary);font-size:1.1rem">${(name || 'C').slice(0, 1)}</span>`}
          </div>
          <div class="company-name">${name || '-'}</div>
          <a href="${href}" class="explore-btn">
            <span>${t?.[lang]?.btn_more || t?.az?.btn_more || 'Ətraflı Bax'}</span>
            <span class="arrow" aria-hidden="true">&rarr;</span>
          </a>
        </div>
      `;
    })
    .join('');

  if (typeof window.initFade === 'function') window.initFade();
}

function renderLeadership(leaders) {
  const lang = getSiteLang();
  const grids = [
    document.getElementById('leadersGridHome'),
    document.getElementById('leadersGridPage'),
  ].filter(Boolean);
  if (!grids.length) return;

  if (!leaders || leaders.length === 0) {
    const empty = '<p style="text-align:center;color:#718096;grid-column:1/-1">Rəhbərlik məlumatı mövcud deyil</p>';
    grids.forEach((g) => (g.innerHTML = empty));
    return;
  }

  const html = (leaders || [])
    .map((l) => {
      const role = pickLangField(l.position, lang);
      const bio = pickLangField(l.bio, lang);
      const photoUrl = getImageUrl(l.photo);
      const fullName = [l.name, l.surname].filter(Boolean).join(' ');
      return `
        <div class="leader-card fade-in">
          <div class="leader-img">
            ${photoUrl
              ? `<img src="${photoUrl}" alt="${fullName}" style="width:100%;height:100%;object-fit:cover;border-radius:999px" />`
              : `<svg width="64" height="64" viewBox="0 0 24 24" fill="#1E88E5"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`}
          </div>
          <div class="leader-info">
            <div class="leader-name">${fullName}</div>
            <div class="leader-role">${role}</div>
            ${bio ? `<p class="leader-bio">${bio}</p>` : ''}
          </div>
        </div>
      `;
    })
    .join('');

  grids.forEach((g) => (g.innerHTML = html));
  if (typeof window.initFade === 'function') window.initFade();
}

async function loadPublicContent() {
  if (!isServedOverHttp()) {
    if (typeof window.showToast === 'function') {
      window.showToast(
        'Saytı server üzərindən açın: http://localhost:5000 (admin məlumatları yalnız API ilə gəlir)',
      );
    }
    return;
  }

  try {
    const [companiesRes, leadersRes] = await Promise.all([
      fetchJson('/api/companies'),
      fetchJson('/api/leadership?type=global'),
    ]);

    if (companiesRes?.success) renderCompanies(companiesRes.data || []);
    if (leadersRes?.success) renderLeadership(leadersRes.data || []);
  } catch (err) {
    // Silent fail: keep static fallback content
    console.warn('Public content load failed:', err);
  }
}

// Re-render on language changes
const _origSetLangSite = typeof window.setLang === 'function' ? window.setLang : null;
if (_origSetLangSite) {
  window.setLang = function (lang) {
    _origSetLangSite(lang);
    loadPublicContent();
  };
}

document.addEventListener('DOMContentLoaded', () => {
  loadPublicContent();
});
