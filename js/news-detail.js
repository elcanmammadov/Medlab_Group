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

function getParam(name) {
  return new URL(window.location.href).searchParams.get(name);
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function initNewsSlider(images) {
  const sliderEl = document.getElementById('newsSlider');
  if (!sliderEl || images.length === 0) return;

  let current = 0;

  const track = sliderEl.querySelector('.ns-track');
  const dotsEl = sliderEl.querySelector('.ns-dots');
  const prevBtn = sliderEl.querySelector('.ns-prev');
  const nextBtn = sliderEl.querySelector('.ns-next');

  images.forEach((src, i) => {
    const slide = document.createElement('div');
    slide.className = 'ns-slide';
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Medlab Medical Group xəbər şəkli ${i + 1}`;
    img.loading = 'lazy';
    img.addEventListener('click', () => openLightbox(images, i));
    slide.appendChild(img);
    track.appendChild(slide);

    const dot = document.createElement('button');
    dot.className = 'ns-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function goTo(idx) {
    current = (idx + images.length) % images.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsEl.querySelectorAll('.ns-dot').forEach((d, i) =>
      d.classList.toggle('active', i === current)
    );
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  if (images.length < 2) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    dotsEl.style.display = 'none';
  }
}

function openLightbox(images, startIndex) {
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbPrev = document.getElementById('lightboxPrev');
  const lbNext = document.getElementById('lightboxNext');
  if (!lb || !lbImg) return;

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

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  const lbImg = document.getElementById('lightboxImg');
  if (lbImg) lbImg.src = '';
}

async function render() {
  const id = getParam('id');
  const root = document.getElementById('newsDetail');
  const titleEl = document.getElementById('newsTitle');
  const dateEl = document.getElementById('newsDate');

  if (!id) {
    if (root) root.innerHTML = `<div style="color:var(--text-medium)">Xəbər tapılmadı.</div>`;
    return;
  }

  const lang = localStorage.getItem('lang') || 'az';
  const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const needsBackendOrigin = isLocalhost && location.port && location.port !== '5000';
  const apiBase = location.protocol === 'file:' || needsBackendOrigin ? 'http://localhost:5000' : '';

  const data = await fetchJson(`${apiBase}/api/news/${encodeURIComponent(id)}`);
  const n = data?.data;
  if (!n) throw new Error('News not found');

  const title = escapeHtml(pickLang(n.title, lang));
  const content = escapeHtml(pickLang(n.content, lang)).replace(/\r?\n/g, '<br />');
  const date = n.date ? new Date(n.date).toLocaleDateString() : '';
  const images = (Array.isArray(n.images) ? n.images : []).map((src) =>
    src.startsWith('http') ? src : apiBase + src
  );

  if (titleEl) titleEl.textContent = pickLang(n.title, lang) || 'Xəbər';
  if (dateEl) dateEl.textContent = date;
  document.title = `${pickLang(n.title, lang) || 'Xəbər'} | Medlab Medical Group`;

  // Dynamic SEO update
  if (typeof SEO !== 'undefined') {
    const articleTitle = pickLang(n.title, lang) || 'Xəbər';
    const articleDesc  = pickLang(n.content, lang)?.replace(/<[^>]+>/g, '').slice(0, 160) || '';
    SEO.updateArticle({
      title:       articleTitle,
      description: articleDesc,
      imageUrl:    images[0] || null,
      publishDate: n.date || null,
      url:         `https://medlabgroup.org/news-detail.html?id=${id}`,
    });
  }

  const sliderHtml = images.length > 0
    ? `<div class="news-slider" id="newsSlider">
        <div class="ns-viewport">
          <div class="ns-track"></div>
        </div>
        <button class="ns-arrow ns-prev" type="button" aria-label="Əvvəlki">&#8249;</button>
        <button class="ns-arrow ns-next" type="button" aria-label="Növbəti">&#8250;</button>
        <div class="ns-dots"></div>
      </div>`
    : '';

  if (root) {
    root.innerHTML = `
      <div class="news-detail-content">
        ${sliderHtml}
        <div class="news-detail-text">${content}</div>
      </div>
    `;
  }

  if (images.length > 0) initNewsSlider(images);
}

document.addEventListener('DOMContentLoaded', () => {
  render().catch((err) => {
    console.error('[News detail] failed:', err);
    const root = document.getElementById('newsDetail');
    if (root) root.innerHTML = `<div style="color:var(--text-medium)">Xəbər yüklənmədi.</div>`;
  });

  const lb = document.getElementById('lightbox');
  if (lb) {
    lb.addEventListener('click', (e) => {
      if (e.target.dataset.close || e.target === lb) closeLightbox();
    });
    document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
  }

  document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('lightbox');
    if (!lb?.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') document.getElementById('lightboxPrev')?.click();
    if (e.key === 'ArrowRight') document.getElementById('lightboxNext')?.click();
  });
});
