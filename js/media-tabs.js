document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.media-tabs .tab-btn');
  const contents = document.querySelectorAll('.media-content .tab-content');
  let activeTab = 'news';

  if (!tabs.length || !contents.length) return;

  // Enforce initial state explicitly
  tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === activeTab));
  contents.forEach((c) => c.classList.toggle('active', c.id === activeTab));

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      contents.forEach((c) => c.classList.remove('active'));

      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      document.getElementById(activeTab)?.classList.add('active');
    });
  });
});

