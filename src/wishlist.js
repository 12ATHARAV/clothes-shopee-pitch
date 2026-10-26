import { config, data, initPage, t, money, imgUrl, waLink, showToast } from './store.js';
import { applyStatic, getLang } from './i18n.js';
import { getWishlist, saveWishlist } from './store.js';

function resolveItems() {
  const wl = getWishlist();
  return wl.map((x) => data.products.find((p) => p.id === x.id)).filter(Boolean);
}

function enquiryMessage(items) {
  const lines = [t('wl.msgIntro')];
  items.forEach((p, i) => {
    lines.push(`${i + 1}. ${p.name} — ${money(p.price)}`);
  });
  lines.push(`${t('wl.total')}: ${money(items.reduce((s, p) => s + p.price, 0))}`);
  lines.push(t('wl.msgOutro'));
  return lines.join('\n');
}

function render() {
  const main = document.getElementById('main');
  const items = resolveItems();
  document.title = `${t('wl.title')} (${items.length}) — ${config.shop.name}, ${config.shop.city}`;

  if (!items.length) {
    main.innerHTML = `
    <div class="wrap page-head">
      <h1 data-i18n="wl.title">${t('wl.title')}</h1>
      <p class="lead" data-i18n="wl.sub">${t('wl.sub')}</p>
    </div>
    <div class="wrap" style="padding-bottom:4rem">
      <div class="empty-state">
        <strong data-i18n="wl.emptyTitle">${t('wl.emptyTitle')}</strong>
        <p data-i18n="wl.emptyBody">${t('wl.emptyBody')}</p>
        <a class="btn btn--primary" href="/#categories" data-i18n="wl.browse">${t('wl.browse')}</a>
      </div>
    </div>`;
    return;
  }

  const total = items.reduce((s, p) => s + p.price, 0);
  const waUrl = waLink(enquiryMessage(items));

  main.innerHTML = `
  <div class="wrap page-head" style="display:flex;justify-content:space-between;align-items:flex-end;gap:1rem;flex-wrap:wrap">
    <div>
      <h1 data-i18n="wl.title">${t('wl.title')}</h1>
      <p class="lead" data-i18n="wl.sub">${t('wl.sub')}</p>
    </div>
    <button class="btn btn--ghost btn--sm" id="wl-clear-btn" type="button" data-i18n="wl.clear">${t('wl.clear')}</button>
  </div>
  <div class="wrap" style="max-width:720px;padding-bottom:4rem">
    <div>
      ${items.map((p) => `
      <div class="wl-item">
        <a href="product.html?id=${p.id}"><img src="${imgUrl(p.images[0])}" alt="${p.alt || p.name}" width="168" height="224" loading="lazy" decoding="async"></a>
        <div>
          <a class="wl-item__name" href="product.html?id=${p.id}">${p.name}</a>
          <span class="wl-item__meta">${t('cat.' + p.cat)} — ${p.fabric}</span>
          <div class="price-row"><span class="price">${money(p.price)}</span><span class="mrp">${money(p.mrp)}</span></div>
        </div>
        <button class="wl-item__remove" type="button" data-remove="${p.id}" data-i18n="wl.remove">${t('wl.remove')}</button>
      </div>`).join('')}
    </div>
    <div class="wl-total">
      <span data-i18n="wl.total">${t('wl.total')}</span>
      <span>${money(total)}</span>
    </div>
    <div class="wl-ctas">
      <a class="btn btn--wa btn--lg" href="${waUrl}" target="_blank" rel="noopener">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5 13.9c-.2.6-1.2 1.1-1.7 1.2-.4 0-.9.2-3.1-.7-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.7s.6-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l.9-1c.2-.3.4-.2.7-.1l1.9.9c.3.2.5.3.6.4 0 .2 0 .7-.2 1.2z"/></svg>
        ${t('wl.send')}
      </a>
      <p style="color:var(--muted);font-size:0.92rem;margin:0" data-i18n="wl.note">${t('wl.note')}</p>
    </div>
  </div>`;

  // Update sticky CTA if present on mobile
  document.querySelectorAll('.sticky-cta a[href*="wa.me"]').forEach((el) => {
    el.href = waUrl;
  });

  main.querySelectorAll('[data-remove]').forEach((b) => {
    b.addEventListener('click', () => {
      saveWishlist(getWishlist().filter((x) => x.id !== b.dataset.remove));
      showToast(t('wl.removed'));
      render();
      applyStatic();
    });
  });

  const clearBtn = document.getElementById('wl-clear-btn');
  clearBtn?.addEventListener('click', () => {
    saveWishlist([]);
    showToast(t('wl.removed'));
    render();
    applyStatic();
  });
}

initPage();
render();

window.addEventListener('langchange', () => {
  render();
  applyStatic();
});
