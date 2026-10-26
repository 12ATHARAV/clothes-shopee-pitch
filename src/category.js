import { config, data, initPage, t, money } from './store.js';
import { applyStatic, getLang } from './i18n.js';
import { productCard } from './store.js';

const params = new URLSearchParams(location.search);
const catId = params.get('cat') || 'sarees';
const searchQuery = (params.get('q') || '').trim();
const cat = data.categories.find((c) => c.id === catId);

function poolFor(id) {
  let list = data.products;
  if (id === 'wedding') list = list.filter((p) => p.occasions.includes('Wedding'));
  else if (id && id !== 'all') list = list.filter((p) => p.cat === id);

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      p.fabric.toLowerCase().includes(q) ||
      p.occasions.some((o) => o.toLowerCase().includes(q))
    );
  }
  return list;
}

const PRICE_BANDS = [
  { id: 'u1500', label: { en: 'Under ₹1,500', hi: '₹1,500 से कम', mr: '₹1,500 पेक्षा कमी' }, test: (p) => p.price < 1500 },
  { id: '1500-3500', label: { en: '₹1,500 – ₹3,500', hi: '₹1,500 – ₹3,500', mr: '₹1,500 – ₹3,500' }, test: (p) => p.price >= 1500 && p.price <= 3500 },
  { id: '3500-8000', label: { en: '₹3,500 – ₹8,000', hi: '₹3,500 – ₹8,000', mr: '₹3,500 – ₹8,000' }, test: (p) => p.price > 3500 && p.price <= 8000 },
  { id: 'o8000', label: { en: 'Above ₹8,000', hi: '₹8,000 से ज़्यादा', mr: '₹8,000 पेक्षा जास्त' }, test: (p) => p.price > 8000 },
];

const state = {
  price: new Set(),
  fabric: new Set(),
  colour: new Set(),
  occasion: new Set(),
  sort: 'featured',
};

function label(id) {
  return (PRICE_BANDS.find((b) => b.id === id)?.label[getLang()]) || id;
}

function applyFilters() {
  let list = poolFor(catId);
  if (state.price.size) list = list.filter((p) => [...state.price].some((b) => PRICE_BANDS.find((x) => x.id === b).test(p)));
  if (state.fabric.size) list = list.filter((p) => state.fabric.has(p.fabric));
  if (state.colour.size) list = list.filter((p) => p.colors.some((c) => state.colour.has(c.n)));
  if (state.occasion.size) list = list.filter((p) => p.occasions.some((o) => state.occasion.has(o)));
  if (state.sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
  if (state.sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
  if (state.sort === 'new') list = [...list].sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0));
  return list;
}

function facets(list) {
  const fabrics = [...new Set(list.map((p) => p.fabric))];
  const colours = [];
  const seen = new Set();
  list.forEach((p) => p.colors.forEach((c) => { if (!seen.has(c.n)) { seen.add(c.n); colours.push(c); } }));
  const occasions = [...new Set(list.flatMap((p) => p.occasions))];
  return { fabrics, colours, occasions };
}

function chips(group, items, pressed) {
  return items.map((it) => {
    const [val, display] = Array.isArray(it) ? it : [it, it];
    return `<button type="button" class="chip" aria-pressed="${pressed.has(val)}" data-group="${group}" data-val="${val}">${display}</button>`;
  }).join('');
}

function renderFilters() {
  const f = facets(poolFor(catId));
  const panel = document.getElementById('filters-panel');
  if (!panel) return;
  panel.innerHTML = `
    <div class="filters__group">
      <h3 data-i18n="cat.price">${t('cat.price')}</h3>
      <div class="filters__options">${chips('price', PRICE_BANDS.map((b) => [b.id, label(b.id)]), state.price)}</div>
    </div>
    <div class="filters__group">
      <h3 data-i18n="cat.fabric">${t('cat.fabric')}</h3>
      <div class="filters__options">${chips('fabric', f.fabrics.sort(), state.fabric)}</div>
    </div>
    <div class="filters__group">
      <h3 data-i18n="cat.colour">${t('cat.colour')}</h3>
      <div class="filters__options">${chips('colour', f.colours.map((c) => [c.n, `<span class="swatch" style="background:${c.h}"></span>${c.n}`]), state.colour)}</div>
    </div>
    <div class="filters__group">
      <h3 data-i18n="cat.occasion">${t('cat.occasion')}</h3>
      <div class="filters__options">${chips('occasion', f.occasions.sort(), state.occasion)}</div>
    </div>
    <button type="button" class="filters__clear desktop-filters-clear" data-i18n="cat.clear">${t('cat.clear')}</button>`;
}

function renderResults() {
  const list = applyFilters();
  const grid = document.getElementById('results');
  const count = document.getElementById('result-count');
  const applyBtn = document.getElementById('apply-filters-btn');
  count.textContent = `${list.length} ${list.length === 1 ? t('cat.item') : t('cat.items')}`;
  if (applyBtn) applyBtn.textContent = `Apply (${list.length})`;

  if (!list.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <strong data-i18n="cat.emptyTitle">${t('cat.emptyTitle')}</strong>
      <p data-i18n="cat.emptyBody">${t('cat.emptyBody')}</p>
    </div>`;
    return;
  }
  grid.innerHTML = list.map(productCard).join('');
}

function updateFilterBadges() {
  const activeCount = state.price.size + state.fabric.size + state.colour.size + state.occasion.size;
  document.querySelectorAll('.filter-count-slot').forEach((el) => {
    el.innerHTML = activeCount > 0 ? `<span class="filters__count-badge">${activeCount}</span>` : '';
  });
}

function render() {
  const main = document.getElementById('main');
  const name = t('cat.' + catId);
  document.title = `${name} — ${config.shop.name}, ${config.shop.city}`;
  if (!cat) {
    main.innerHTML = `<div class="wrap page-head"><h1>Collection not found</h1><p class="lead">Pick a counter from the menu above.</p></div>`;
    return;
  }
  const activeCount = state.price.size + state.fabric.size + state.colour.size + state.occasion.size;

  main.innerHTML = `
  <div class="wrap page-head">
    <p class="pd__crumbs"><a href="/" style="text-decoration:none" data-i18n="nav.home">${t('nav.home')}</a> / <span>${name}</span></p>
    <h1>${name}</h1>
    <p class="lead">${cat.desc} — ${config.shop.city}. ${config.shop.note}</p>
    ${searchQuery ? `<div style="margin-top:0.6rem;font-size:0.95rem;color:var(--muted)">Search results for "<strong>${searchQuery}</strong>" — <a href="/category.html?cat=${catId}">Clear search</a></div>` : ''}
  </div>
  <nav class="cat-tabs" aria-label="Shop counters">
    <div class="wrap cat-tabs__inner">
      ${data.categories.map((c) => `
        <a class="cat-tab ${c.id === catId ? 'cat-tab--active' : ''}" href="/category.html?cat=${c.id}" ${c.id === catId ? 'aria-current="page"' : ''} data-i18n="cat.${c.id}">
          ${t('cat.' + c.id)}
        </a>
      `).join('')}
    </div>
  </nav>
  <div class="filters-drawer-backdrop" id="filters-backdrop"></div>
  <div class="wrap cat-layout">
    <aside class="filters-sidebar" id="filters-sidebar" role="dialog" aria-label="${t('cat.filters')}">
      <div class="filters-drawer-header">
        <h3><span data-i18n="cat.filters">${t('cat.filters')}</span> <span class="filter-count-slot">${activeCount > 0 ? `<span class="filters__count-badge">${activeCount}</span>` : ''}</span></h3>
        <button type="button" class="drawer-close" id="close-filters-btn" aria-label="Close filters">✕</button>
      </div>
      <div class="filters-drawer-body" id="filters-panel"></div>
      <div class="filters-drawer-footer">
        <button type="button" class="btn btn--ghost btn--sm filters__clear" data-i18n="cat.clear">${t('cat.clear')}</button>
        <button type="button" class="btn btn--primary btn--sm" id="apply-filters-btn">Apply</button>
      </div>
    </aside>
    <section aria-label="Products">
      <div class="cat-toolbar">
        <div class="cat-toolbar__controls">
          <button type="button" class="btn-filter-trigger" id="open-filters-btn" aria-haspopup="dialog" aria-expanded="false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M6 12h12M8 18h8"/></svg>
            <span data-i18n="cat.filters">${t('cat.filters')}</span>
            <span class="filter-count-slot">${activeCount > 0 ? `<span class="filters__count-badge">${activeCount}</span>` : ''}</span>
          </button>
          <label class="sort-label">
            <span data-i18n="cat.sort">${t('cat.sort')}</span>
            <select class="sort" id="sort">
              <option value="featured" data-i18n="cat.sortFeatured">${t('cat.sortFeatured')}</option>
              <option value="price-asc" data-i18n="cat.sortPriceLow">${t('cat.sortPriceLow')}</option>
              <option value="price-desc" data-i18n="cat.sortPriceHigh">${t('cat.sortPriceHigh')}</option>
              <option value="new" data-i18n="cat.sortNew">${t('cat.sortNew')}</option>
            </select>
          </label>
        </div>
        <span class="cat-toolbar__count"><span id="result-count"></span></span>
      </div>
      <div class="grid-products" id="results"></div>
    </section>
  </div>`;

  const sortSelect = document.getElementById('sort');
  if (sortSelect) sortSelect.value = state.sort;
  renderFilters();
  renderResults();
  wire();
}

function wire() {
  const panel = document.getElementById('filters-panel');
  const openBtn = document.getElementById('open-filters-btn');
  const closeBtn = document.getElementById('close-filters-btn');
  const applyBtn = document.getElementById('apply-filters-btn');
  const sidebar = document.getElementById('filters-sidebar');
  const backdrop = document.getElementById('filters-backdrop');

  const closeDrawer = () => {
    sidebar?.setAttribute('data-open', 'false');
    backdrop?.setAttribute('data-open', 'false');
    openBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  const openDrawer = () => {
    sidebar?.setAttribute('data-open', 'true');
    backdrop?.setAttribute('data-open', 'true');
    openBtn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  openBtn?.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  applyBtn?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar?.dataset.open === 'true') closeDrawer();
  });

  panel?.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-group]');
    if (!chip) return;
    const { group, val } = chip.dataset;
    if (state[group].has(val)) state[group].delete(val); else state[group].add(val);
    chip.setAttribute('aria-pressed', String(state[group].has(val)));
    updateFilterBadges();
    renderResults();
  });

  document.querySelectorAll('.filters__clear').forEach((b) => {
    b.addEventListener('click', () => {
      state.price.clear(); state.fabric.clear(); state.colour.clear(); state.occasion.clear();
      renderFilters();
      updateFilterBadges();
      renderResults();
    });
  });

  document.getElementById('sort')?.addEventListener('change', (e) => {
    state.sort = e.target.value;
    renderResults();
  });
}

initPage();
render();

window.addEventListener('langchange', () => {
  render();
  applyStatic();
});
