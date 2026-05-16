function getCompanyPageLang() {
  return window.currentLang || localStorage.getItem('lang') || 'az';
}

function pickLangField(obj, lang) {
  if (!obj || typeof obj !== 'object') return '';
  return obj[lang] || obj.az || obj.en || obj.ru || '';
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
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

function pageCompanyKeyFromFilename() {
  const name = window.location.pathname.split('/').pop().replace('.html', '');
  return ['medsun', 'medlab', 'medical'].includes(name) ? name : null;
}

let companyState = null;
let branchesState = [];
let branchesById = new Map();
let activeBranchId = null;

function renderBranchesGrid() {
  const grid = document.getElementById('branchesGrid');
  if (!grid) return;

  const lang = getCompanyPageLang();

  grid.innerHTML = (branchesState || [])
    .map((b) => {
      const name = pickLangField(b.name, lang);
      const branchImage = b.images && b.images.length > 0 ? getImageUrl(b.images[0]) : null;

      return `
        <div class="branch-card" onclick="openBranch('${b._id}')">
          <div class="branch-card-img">
            ${
              branchImage
                ? `<img src="${branchImage}" alt="${name}" style="width:100%; height:100%; object-fit:cover; border-radius:12px" />`
                : `<svg width="40" height="40" viewBox="0 0 24 24" fill="#1E88E5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`
            }
          </div>
          <div class="branch-card-body"><h3>${name || '-'}</h3></div>
        </div>
      `;
    })
    .join('');
}

function setServicesTabVisibility(visible) {
  const servicesBtn = document.querySelector('.tabs .tab-btn[data-tab="bt-services"]');
  const servicesContent = document.getElementById('bt-services');
  if (servicesBtn) servicesBtn.style.display = visible ? '' : 'none';
  if (servicesContent) servicesContent.style.display = visible ? '' : 'none';
}

async function openBranch(branchId) {
  const branch = branchesById.get(branchId);
  if (!branch) return;
  activeBranchId = branchId;

  const lang = getCompanyPageLang();
  const t = typeof translations !== 'undefined' ? translations[lang] || translations.az : {};

  const nameEl = document.getElementById('branchDetailName');
  if (nameEl) nameEl.textContent = pickLangField(branch.name, lang);

  const address = pickLangField(branch.address, lang);
  const phones = Array.isArray(branch.phones) && branch.phones.length > 0
    ? branch.phones
    : branch.phone ? [{ number: branch.phone, type: 'mobile' }] : [];
  const email = branch.email || '';
  const hours = branch.workingHours || '';
  const mapLink = branch.mapLink || '';

  const mapQuery = address || pickLangField(branch.name, lang);
  const iframeSrc =
    mapLink && mapLink.includes('output=embed')
      ? mapLink
      : `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;

  const addressEl = document.getElementById('branchAddress');
  if (addressEl) {
    // Build images gallery HTML
    const imagesGalleryHtml =
      branch.images && branch.images.length > 0
        ? `
        <div style="margin-bottom: 24px;">
          <h3>${t.tab_gallery || 'Qalereya'}</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px;">
            ${branch.images
              .map(
                (img, idx) => `
              <div style="border-radius: 10px; overflow: hidden; background: #f0f0f0; aspect-ratio: 1;">
                <img src="${getImageUrl(img)}" alt="Branch image ${idx + 1}" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" onclick="window.open('${getImageUrl(img)}', '_blank')" />
              </div>
            `,
              )
              .join('')}
          </div>
        </div>
      `
        : '';

    const s = branch.social || {};
    const socialLinks = [
      s.whatsapp  && { href: `https://wa.me/${s.whatsapp.replace(/\D/g, '')}`,  icon: 'fab fa-whatsapp',   cls: 'whatsapp'  },
      s.instagram && { href: s.instagram, icon: 'fab fa-instagram', cls: 'instagram' },
      s.facebook  && { href: s.facebook,  icon: 'fab fa-facebook-f', cls: 'facebook'  },
      s.youtube   && { href: s.youtube,   icon: 'fab fa-youtube',    cls: 'youtube'   },
    ].filter(Boolean);

    const socialHtml = socialLinks.length
      ? `<div class="social-links">
          ${socialLinks.map(s => `
            <a href="${s.href}" target="_blank" rel="noopener noreferrer" class="social ${s.cls}">
              <i class="${s.icon}"></i>
            </a>`).join('')}
        </div>`
      : '';

    addressEl.innerHTML = `
      ${imagesGalleryHtml}
      <div class="address-container">
        <div class="address-left">
          <h3>${t.tab_address || 'Ünvan'}</h3>
          <div class="contact-card">
            <i class="fas fa-location-dot"></i>
            ${mapLink
              ? `<a href="${mapLink}" target="_blank" rel="noopener noreferrer">${address || '-'}</a>`
              : `<span>${address || '-'}</span>`}
          </div>
          ${phones.map((p) => {
            let brandSet = 'fas', icon, href, typeLabel, numberText;
            if (p.type === 'mobile') {
              icon       = 'fa-mobile-screen-button';
              href       = `tel:${p.number}`;
              typeLabel  = t.phone_type_mobile  || 'Mobil';
              numberText = p.number;
            } else if (p.type === 'city') {
              icon       = 'fa-phone';
              href       = `tel:${p.number}`;
              typeLabel  = t.phone_type_city    || 'Şəhər xətti';
              numberText = p.number;
            } else if (p.type === 'whatsapp') {
              brandSet   = 'fab';
              icon       = 'fa-whatsapp';
              href       = `https://wa.me/${p.number.replace(/\D/g, '')}`;
              typeLabel  = t.phone_type_whatsapp || 'WhatsApp';
              numberText = p.number;
            } else if (p.type === 'online') {
              icon       = 'fa-calendar-check';
              href       = `tel:${p.number}`;
              typeLabel  = t.phone_type_online  || 'Online qeydiyyat';
              numberText = p.number;
            } else {
              icon       = 'fa-phone';
              href       = `tel:${p.number}`;
              typeLabel  = '';
              numberText = p.number;
            }
            const external = p.type === 'whatsapp';
            return `
            <div class="contact-card">
              <i class="${brandSet} ${icon}"></i>
              <div class="contact-card-body">
                ${typeLabel ? `<span class="phone-type-label">${typeLabel}</span>` : ''}
                <a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${numberText}</a>
              </div>
            </div>`;
          }).join('')}
          ${email ? `
          <div class="contact-card">
            <i class="fas fa-envelope"></i>
            <a href="mailto:${email}">${email}</a>
          </div>` : ''}
          ${hours ? `
          <div class="contact-card">
            <i class="fas fa-clock"></i>
            <span>${hours}</span>
          </div>` : ''}
          ${socialHtml}
        </div>
        <div class="address-right">
          <iframe
            src="${iframeSrc}"
            width="100%"
            height="250"
            style="border:0;"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </div>
    `;
  }

  // Load services from API
  try {
    const servicesRes = await fetchJson(`/api/branch-services/branch/${branch._id}`);
    const services = servicesRes?.success ? servicesRes.data || [] : [];

    console.log('[Frontend Services] Response:', servicesRes);
    console.log('[Frontend Services] Parsed:', services);

    const servicesEl = document.getElementById('branchServices');
    if (servicesEl) {
      if (services.length > 0) {
        setServicesTabVisibility(true);
        servicesEl.innerHTML = services
          .map((s) => {
            const serviceName = pickLangField(s.name, lang);
            const serviceImage = s.image ? getImageUrl(s.image) : null;
            console.log(
              '[Frontend Service Item] Name:',
              serviceName,
              'Image path:',
              s.image,
              'Full URL:',
              serviceImage,
            );
            return `
              <div class="service-card">
                ${serviceImage ? `<div class="service-img"><img src="${serviceImage}" alt="${serviceName}" style="width:100%;height:100%;object-fit:contain;border-radius:12px" /></div>` : ''}
                <h4>${serviceName || '-'}</h4>
              </div>
            `;
          })
          .join('');
      } else {
        setServicesTabVisibility(false);
        servicesEl.innerHTML = '';
      }
    }
  } catch (err) {
    // If services fail to load, hide the tab
    setServicesTabVisibility(false);
    const servicesEl = document.getElementById('branchServices');
    if (servicesEl) servicesEl.innerHTML = '';
    console.warn('Failed to load services:', err);
  }

  const doctorsEl = document.getElementById('branchDoctors');
  if (doctorsEl) {
    try {
      const doctorsRes = await fetchJson(`/api/doctors?branchId=${branch._id}`);
      const doctors = doctorsRes?.success ? doctorsRes.data || [] : [];
      doctorsEl.innerHTML =
        doctors.length > 0
          ? doctors
              .map((d) => {
                const imgUrl = d.image ? getImageUrl(d.image) : null;
                const fullName = [d.name, d.surname].filter(Boolean).join(' ');
                const position = pickLangField(d.position, lang);
                const bio = pickLangField(d.bio, lang);
                return `
              <div class="doctor-card${bio ? ' has-bio' : ''}">
                <div class="doctor-img">
                  ${
                    imgUrl
                      ? `<img src="${imgUrl}" alt="${fullName}" style="width:100%; height:100%; object-fit:cover; border-radius:50%" />`
                      : `<svg width="28" height="28" viewBox="0 0 24 24" fill="#1E88E5"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`
                  }
                </div>
                <h4>${fullName}</h4>
                <p>${position}</p>
                ${bio ? `
                <button class="doctor-bio-toggle" aria-expanded="false">
                  <span class="toggle-label">${t.read_more || 'Ətraflı'}</span>
                  <i class="fa-solid fa-chevron-down"></i>
                </button>
                <div class="doctor-bio">${bio}</div>` : ''}
              </div>
            `;
              })
              .join('')
          : `<div style="padding:10px;color:var(--text-medium);text-align:center">${t.no_doctors || 'Həkim məlumatı yoxdur'}</div>`;

      if (!doctorsEl.dataset.clickBound) {
        doctorsEl.dataset.clickBound = '1';
        doctorsEl.addEventListener('click', (e) => {
          const btn = e.target.closest('.doctor-bio-toggle');
          if (!btn) return;
          const card = btn.closest('.doctor-card');
          const isOpen = card.classList.toggle('bio-open');
          btn.setAttribute('aria-expanded', String(isOpen));
          btn.querySelector('.toggle-label').textContent = isOpen
            ? (t.close || 'Bağla')
            : (t.read_more || 'Ətraflı');
        });
      }
    } catch {
      doctorsEl.innerHTML = `<div style="padding:10px;color:var(--text-medium);text-align:center">${t.no_doctors || 'Həkim məlumatı yoxdur'}</div>`;
    }
  }

  const details = document.getElementById('branchDetails');
  if (details) {
    details.querySelectorAll('.tab-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
    details
      .querySelectorAll('.tab-content')
      .forEach((c, i) => c.classList.toggle('active', i === 0));
    details.classList.add('active');
  }

  const grid = document.getElementById('branchesGrid');
  if (grid) grid.style.display = 'none';
  const title = document.querySelector('.branches-section-title');
  if (title) title.style.display = 'none';

  if (details) details.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeBranch() {
  activeBranchId = null;
  const grid = document.getElementById('branchesGrid');
  if (grid) grid.style.display = '';

  const title = document.querySelector('.branches-section-title');
  if (title) title.style.display = '';

  const details = document.getElementById('branchDetails');
  if (details) details.classList.remove('active');
}

function initTabs() {
  document.querySelectorAll('.tabs .tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.tabs');
      if (!parent) return;
      const container = parent.parentElement || parent.parentNode;
      parent.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.dataset.tab;
      const target = document.getElementById(targetId);
      if (target) {
        container.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
        target.classList.add('active');
      }
    });
  });
}

function initTopTabs() {
  const buttons = Array.from(document.querySelectorAll('.company-tabs .tab-btn'));
  if (!buttons.length) return;

  const activateTopTab = (tabId, { scroll } = { scroll: false }) => {
    if (!tabId) return;

    buttons.forEach((b) => b.classList.toggle('active', b.dataset.topTab === tabId));
    document.querySelectorAll('.top-tab-content').forEach((c) => c.classList.remove('active'));
    const target = document.getElementById('tab-' + tabId);
    if (target) {
      target.classList.add('active');
      if (scroll) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    closeBranch();
  };

  buttons.forEach((btn) =>
    btn.addEventListener('click', () => activateTopTab(btn.dataset.topTab, { scroll: true })),
  );

  const urlTab = new URLSearchParams(window.location.search).get('tab');
  const initiallyActive =
    (urlTab && buttons.find((b) => b.dataset.topTab === urlTab)) ||
    buttons.find((b) => b.classList.contains('active')) ||
    buttons[0];
  activateTopTab(initiallyActive?.dataset.topTab, { scroll: false });
}

function renderLeadership(leaders) {
  const grid = document.getElementById('leadershipGrid');
  if (!grid) return;
  const lang = getCompanyPageLang();

  grid.innerHTML = (leaders || [])
    .map((l) => {
      const role = pickLangField(l.position, lang);
      const photoUrl = getImageUrl(l.photo);
      return `
        <div class="leadership-card">
          <div class="leadership-img">
            ${
              photoUrl
                ? `<img src="${photoUrl}" alt="${l.name || ''}" style="width:100%;height:100%;object-fit:cover;border-radius:999px" />`
                : `
              <svg width="48" height="48" viewBox="0 0 24 24" fill="#1E88E5"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            `
            }
          </div>
          <div class="leadership-info">
            <h3>${l.name || ''}</h3>
            <p>${role || ''}</p>
          </div>
        </div>
      `;
    })
    .join('');
}

function applyCompanyHeader(company) {
  if (!company) return;
  const lang = getCompanyPageLang();
  const name = pickLangField(company.name, lang);
  const desc = pickLangField(company.description, lang);

  const titleEl = document.querySelector('.company-right h1');
  if (titleEl) titleEl.textContent = name || titleEl.textContent;

  const logoEl = document.querySelector('.company-logo');
  if (logoEl && company.logo) logoEl.src = getImageUrl(company.logo);

  const aboutIntro = document.querySelector('#tab-about .about-intro');
  if (aboutIntro) aboutIntro.textContent = desc || aboutIntro.textContent;
}

async function resolveCompany() {
  const params = new URLSearchParams(window.location.search);
  const companyId = params.get('company');

  const companiesRes = await fetchJson('/api/companies');
  const companies = companiesRes?.success ? companiesRes.data || [] : [];

  if (companyId) {
    const found = companies.find((c) => c._id === companyId);
    return { company: found || null, companyId };
  }

  const key = pageCompanyKeyFromFilename();
  if (!key) return { company: companies[0] || null, companyId: companies[0]?._id || null };

  const found =
    companies.find((c) => (c.website || '').toLowerCase().includes(key)) ||
    companies.find((c) => (c.logo || '').toLowerCase().includes(key)) ||
    companies.find((c) => pickLangField(c.name, 'en').toLowerCase().includes(key)) ||
    companies.find((c) => pickLangField(c.name, 'az').toLowerCase().includes(key));

  return {
    company: found || companies[0] || null,
    companyId: found?._id || companies[0]?._id || null,
  };
}

async function loadCompanyPageData() {
  if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
    if (typeof showToast === 'function') {
      showToast('Saytı server üzərindən açın: http://localhost:5000');
    }
    return;
  }

  const resolved = await resolveCompany();
  companyState = resolved.company;
  applyCompanyHeader(companyState);

  if (resolved.companyId) {
    const branchesRes = await fetchJson(
      `/api/branches?company=${encodeURIComponent(resolved.companyId)}`,
    );
    branchesState = branchesRes?.success ? branchesRes.data || [] : [];
    branchesById = new Map(branchesState.map((b) => [b._id, b]));
    renderBranchesGrid();
  }

  if (resolved.companyId) {
    try {
      const leadershipRes = await fetchJson(
        `/api/leadership/company/${resolved.companyId}`,
      );
      if (leadershipRes?.success) renderLeadership(leadershipRes.data || []);
    } catch {
      // ignore
    }
  }
}

const _origSetLangCompany = typeof window.setLang === 'function' ? window.setLang : null;
if (_origSetLangCompany) {
  window.setLang = function (lang) {
    _origSetLangCompany(lang);
    applyCompanyHeader(companyState);
    renderBranchesGrid();
    if (activeBranchId) openBranch(activeBranchId);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initTopTabs();
  loadCompanyPageData().catch((e) => console.warn('Company page load failed:', e));
});
