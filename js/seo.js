/**
 * Dynamic SEO helper — updates meta tags, OG tags, Twitter cards, canonical URL,
 * and JSON-LD structured data after dynamic content loads (news articles, company pages).
 *
 * Usage:
 *   SEO.updateArticle({ title, description, imageUrl, publishDate, url })
 *   SEO.updatePage({ title, description, imageUrl, url })
 */

const SEO = (() => {
  const SITE_NAME = 'Medlab Medical Group';
  const BASE_URL  = 'https://medlabgroup.org';
  const LOGO_URL  = BASE_URL + '/image/medlab-logo.png';

  function setMeta(selector, attr, value) {
    const el = document.querySelector(selector);
    if (el && value) el.setAttribute(attr, value);
  }

  function updatePage({ title, description, imageUrl, url }) {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const img  = imageUrl || LOGO_URL;
    const href = url ? (url.startsWith('http') ? url : BASE_URL + '/' + url) : window.location.href;

    // Document title
    document.title = fullTitle;

    // Primary meta
    setMeta('meta[name="description"]',  'content', description);

    // OG
    setMeta('meta[property="og:title"]',       'content', fullTitle);
    setMeta('meta[property="og:description"]',  'content', description);
    setMeta('meta[property="og:image"]',        'content', img);
    setMeta('meta[property="og:image:alt"]',    'content', title || SITE_NAME);
    setMeta('meta[property="og:url"]',          'content', href);

    // Twitter
    setMeta('meta[name="twitter:title"]',       'content', fullTitle);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:image"]',       'content', img);

    // Canonical
    const canonical = document.getElementById('canonicalLink') || document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', href);
  }

  function updateArticle({ title, description, imageUrl, publishDate, url, author }) {
    updatePage({ title, description, imageUrl, url });

    // Upgrade OG type to article
    setMeta('meta[property="og:type"]', 'content', 'article');
    if (publishDate) {
      let pubMeta = document.querySelector('meta[property="article:published_time"]');
      if (!pubMeta) {
        pubMeta = document.createElement('meta');
        pubMeta.setAttribute('property', 'article:published_time');
        document.head.appendChild(pubMeta);
      }
      pubMeta.setAttribute('content', publishDate);
    }

    // Update JSON-LD NewsArticle schema
    const schemaEl = document.getElementById('newsArticleSchema');
    if (schemaEl) {
      const img = imageUrl || LOGO_URL;
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        'headline': title || '',
        'description': description || '',
        'image': img,
        'datePublished': publishDate || new Date().toISOString(),
        'author': {
          '@type': 'Organization',
          'name': author || SITE_NAME,
        },
        'publisher': {
          '@type': 'MedicalOrganization',
          'name': SITE_NAME,
          'url': BASE_URL,
          'logo': {
            '@type': 'ImageObject',
            'url': LOGO_URL,
          },
        },
        'url': url || window.location.href,
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': url || window.location.href,
        },
      };
      schemaEl.textContent = JSON.stringify(schema, null, 2);
    }
  }

  function updateCompany({ name, description, imageUrl, url, companyType }) {
    updatePage({ title: name, description, imageUrl, url });

    const schemaEl = document.getElementById('canonicalLink');
    const typeMap = {
      clinic:     'MedicalClinic',
      lab:        'MedicalLaboratory',
      medical:    'MedicalOrganization',
    };
    const type = typeMap[companyType] || 'MedicalOrganization';

    const schema = {
      '@context': 'https://schema.org',
      '@type': type,
      'name': name,
      'description': description || '',
      'url': url || window.location.href,
      'logo': imageUrl || LOGO_URL,
      'parentOrganization': {
        '@type': 'MedicalOrganization',
        'name': SITE_NAME,
        'url': BASE_URL,
      },
    };

    let schemaScript = document.getElementById('dynamicCompanySchema');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.id = 'dynamicCompanySchema';
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(schema, null, 2);
  }

  return { updatePage, updateArticle, updateCompany };
})();
