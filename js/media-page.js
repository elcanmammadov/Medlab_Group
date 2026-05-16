/* media-page.js — News + Gallery loader */

function escapeHtml(str) {
  const s = String(str || '');
  return s
    .split('&').join('&amp;')
    .split('<').join('&lt;')
    .split('>').join('&gt;')
    .split('"').join('&quot;')
    .split("'").join('&#039;');
}

function pickLang(obj, lang) {
  if (!obj || typeof obj !== 'object') return '';
  return obj[lang] || obj.az || obj.en || obj.ru || '';
}

function resolveUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return window.location.origin + (path.startsWith('/') ? path : '/' + path);
}

function getApiBase() {
  if (location.protocol === 'file:') return 'http://localhost:5000';
  const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (isLocalhost && location.port && location.port !== '5000') return 'http://localhost:5000';
  return '';
}

async function apiFetch(path) {
  const base = getApiBase();
  const res = await fetch(base + path, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function getYoutubeThumbnail(url) {
  const match = String(url || '').match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

function openGalleryLightbox(images, startIndex) {
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  if (!lb || !lbImg) return;

  const lbPrev = document.getElementById('lightboxPrev');
  const lbNext = document.getElementById('lightboxNext');
  let idx = startIndex;

  function show(i) {
    idx = (i + images.length) % images.length;
    lbImg.src = images[idx];
    if (lbPrev) lbPrev.style.display = images.length > 1 ? '' : 'none';
    if (lbNext) lbNext.style.display = images.length > 1 ? '' : 'none';
  }

  show(idx);
  lb.classList.add('open');
  lb.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
  if (lbPrev) lbPrev.onclick = () => show(idx - 1);
  if (lbNext) lbNext.onclick = () => show(idx + 1);
}

/* ── News ─────────────────────────────────────────── */
async function loadNews(root) {
  const lang = localStorage.getItem('lang') || 'az';
  const apiBase = getApiBase();
  try {
    const res = await apiFetch('/api/news?limit=50');
    const items = res?.data || [];
    if (!items.length) {
      root.innerHTML = `<div style="color:var(--text-medium)">Xəbər tapılmadı.</div>`;
      return;
    }
    root.innerHTML = items.map((n) => {
      const title = escapeHtml(pickLang(n.title, lang));
      const date = n.date ? new Date(n.date).toLocaleDateString() : '';
      const images = Array.isArray(n.images) ? n.images : [];
      const thumb = images.length ? resolveUrl(images[0]) : '';
      const href = `${apiBase}/news-detail.html?id=${encodeURIComponent(n._id || '')}`;
      const thumbHtml = thumb
        ? `<img class="news-thumb" src="${escapeHtml(thumb)}" alt="${title}" loading="lazy" />`
        : `<div class="news-thumb news-thumb--empty"></div>`;
      return `
        <a class="news-card news-card-link fade-in visible" href="${href}">
          ${thumbHtml}
          <div class="news-body">
            <div class="news-title">${title}</div>
            ${date ? `<div class="news-date">${escapeHtml(date)}</div>` : ''}
          </div>
        </a>`;
    }).join('');
  } catch (err) {
    console.error('[News] load failed:', err);
    root.innerHTML = `<div style="color:var(--text-medium)">Xəbərlər yüklənmədi.</div>`;
  }
}

/* ── Gallery ───────────────────────────────────────── */
async function loadGallery(photosRoot, videosRoot) {
  const origin = (location.protocol === 'file:' ||
    (location.hostname === 'localhost' && location.port && location.port !== '5000'))
    ? 'http://localhost:5000'
    : window.location.origin;

  function imgUrl(p) {
    if (!p) return '';
    if (p.startsWith('http://') || p.startsWith('https://')) return p;
    return origin + (p.startsWith('/') ? p : '/' + p);
  }

  try {
    const r = await fetch(origin + '/api/gallery?limit=100', { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const json = await r.json();
    const items = json.data || [];

    const photos = items.filter((g) => g.type !== 'video');
    const videos = items.filter((g) => g.type === 'video');

    /* ── photos ── */
    if (photosRoot) {
      if (!photos.length) {
        photosRoot.innerHTML = '<p style="color:#888;padding:12px 0">Şəkil tapılmadı.</p>';
      } else {
        const imgArrays = photos.map((g) => {
          const arr = Array.isArray(g.images) && g.images.length ? g.images : (g.image ? [g.image] : []);
          return arr.map(imgUrl).filter(Boolean);
        });

        photosRoot.innerHTML = photos.map((g, i) => {
          const title = (g.title || '').replace(/"/g, '&quot;');
          const thumb = imgArrays[i][0] || '';
          const count = imgArrays[i].length;
          return `<div class="gallery-photo-card fade-in visible" data-idx="${i}" tabindex="0" role="button" aria-label="${title || 'Şəkil'}">
            ${thumb ? `<img src="${thumb}" alt="${title}" loading="lazy" />` : ''}
            ${count > 1 ? `<div class="gallery-photo-count">&#128247; ${count}</div>` : ''}
            ${title ? `<div class="gallery-photo-title">${title}</div>` : ''}
          </div>`;
        }).join('');

        photosRoot.querySelectorAll('.gallery-photo-card').forEach((card) => {
          const i = +card.dataset.idx;
          card.addEventListener('click', () => openGalleryLightbox(imgArrays[i], 0));
          card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openGalleryLightbox(imgArrays[i], 0); });
        });
      }
    }

    /* ── videos ── */
    if (videosRoot) {
      if (!videos.length) {
        videosRoot.innerHTML = '<p style="color:#888;padding:12px 0">Video tapılmadı.</p>';
      } else {
        videosRoot.innerHTML = videos.map((g) => {
          const title = g.title || '';
          const href  = g.videoUrl || '#';
          const thumb = getYoutubeThumbnail(g.videoUrl);
          return `<a class="gallery-video-card fade-in visible" href="${href}" target="_blank" rel="noopener noreferrer">
            <div class="gallery-video-thumb${thumb ? '' : ' gallery-video-thumb--empty'}">
              ${thumb ? `<img src="${thumb}" alt="${title}" loading="lazy" />` : ''}
              <div class="gallery-video-play">&#9654;</div>
            </div>
            ${title ? `<div class="gallery-video-title">${title}</div>` : ''}
          </a>`;
        }).join('');
      }
    }
  } catch (err) {
    console.error('[Gallery] load failed:', err);
    const msg = `<p style="color:#e53e3e;padding:12px 0">Qalereya yüklənmədi: ${err.message}</p>`;
    if (photosRoot) photosRoot.innerHTML = msg;
    if (videosRoot) videosRoot.innerHTML = msg;
  }
}

/* ── Gallery Filter ────────────────────────────────── */
function initGalleryFilter() {
  const btns = document.querySelectorAll('.gallery-filter-btn');
  const photoSection = document.getElementById('galleryPhotoSection');
  const videoSection = document.getElementById('galleryVideoSection');
  if (!btns.length || !photoSection || !videoSection) return;

  function applyFilter(filter) {
    btns.forEach((b) => b.classList.toggle('active', b.dataset.filter === filter));
    if (filter === 'all') {
      photoSection.style.display = '';
      videoSection.style.display = '';
    } else if (filter === 'photo') {
      photoSection.style.display = '';
      videoSection.style.display = 'none';
    } else {
      photoSection.style.display = 'none';
      videoSection.style.display = '';
    }
  }

  btns.forEach((btn) => btn.addEventListener('click', () => applyFilter(btn.dataset.filter)));
}

/* ── Init ──────────────────────────────────────────── */
function initMediaPage() {
  const newsRoot   = document.getElementById('newsList');
  const photosRoot = document.getElementById('galleryPhotos');
  const videosRoot = document.getElementById('galleryVideos');

  if (newsRoot) loadNews(newsRoot);
  if (photosRoot || videosRoot) {
    loadGallery(photosRoot, videosRoot).then(() => initGalleryFilter());
  }
}

window.initMediaPage = initMediaPage;

/* ── Lightbox close / keyboard ─────────────────────── */
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  const img = document.getElementById('lightboxImg');
  if (img) img.src = '';
}

function initLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.addEventListener('click', (e) => {
    if (e.target.dataset.close || e.target === lb) closeLightbox();
  });
  document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') document.getElementById('lightboxPrev')?.click();
    if (e.key === 'ArrowRight') document.getElementById('lightboxNext')?.click();
  });
}

// Standalone media.html (non-SPA) — run on load
document.addEventListener('DOMContentLoaded', () => {
  initLightbox();
  if (document.getElementById('page-media')) return; // SPA handles its own init
  initMediaPage();
});
