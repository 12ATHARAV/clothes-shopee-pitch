import { config, data, initPage, t, imgUrl, waLink, telLink, mapLink } from './store.js';
import { applyStatic } from './i18n.js';

function getStoreStatus() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours() + now.getMinutes() / 60;
  const isSunday = day === 0;
  const openTime = isSunday ? 11 : 10.5;
  const closeTime = isSunday ? 20 : 21;
  const isOpen = hour >= openTime && hour < closeTime;
  return {
    isOpen,
    nextOpen: isSunday ? '11:00 am' : '10:30 am',
  };
}

function render() {
  const main = document.getElementById('main');
  const { shop } = config;
  const mapSrc = 'https://www.google.com/maps?q=' + encodeURIComponent(shop.mapQuery) + '&output=embed';
  const status = getStoreStatus();

  document.title = `${t('about.title')} — ${shop.name}, ${shop.city}`;

  main.innerHTML = `
  <div class="wrap page-head">
    <h1 data-i18n="about.title">${t('about.title')}</h1>
    <p class="lead">${shop.name}, ${shop.city} — since ${shop.since}</p>
  </div>

  <div class="wrap story" style="padding-bottom:2rem">
    <p>In ${shop.since}, our grandfather opened a single counter of cotton sarees at ${shop.mapQuery.split(',')[0]}. Three generations later the shop has eight counters — but the habit hasn't changed: show you everything, tell you the honest price, and keep your pick aside until you decide.</p>
    <p>Most of our customers find us the way their mothers did — by word of mouth across Pune, from Kothrud to Pimpri-Chinchwad. These days the same conversation happens on WhatsApp: send us what you're looking for, we send photos and prices, and your pieces are ready to try when you reach.</p>
    <p><strong style="color:var(--primary)">Free alterations and fitting</strong> for everything we sell. <strong style="color:var(--primary)">Fixed prices</strong> — the tag is the price, festival or not.</p>
  </div>

  <div class="zari zari--thin" role="presentation"></div>

  <section class="section" aria-label="${t('about.contactTitle')}">
    <div class="wrap">
      <div class="section__head" style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap">
        <h2 data-i18n="about.contactTitle" style="margin:0">${t('about.contactTitle')}</h2>
        ${status.isOpen
          ? `<span class="badge-open"><span class="badge-dot"></span> Open now</span>`
          : `<span class="badge-closed">Closed now · Opens ${status.nextOpen}</span>`}
      </div>
      <div class="contact-grid">
        <div class="store">
          <div class="store__body">
            <h3 style="margin-bottom:0.2rem">${shop.name}</h3>
            <p style="color:var(--muted)">${shop.address}</p>
            <dl class="store__rows">
              <div class="store__row"><dt data-i18n="home.monSat">${t('home.monSat')}</dt><dd>${shop.hours.monSat}</dd></div>
              <div class="store__row"><dt data-i18n="home.sun">${t('home.sun')}</dt><dd>${shop.hours.sun}</dd></div>
              <div class="store__row"><dt data-i18n="home.phone">${t('home.phone')}</dt><dd>${shop.phone.replace(/^(\+91)(\d{5})(\d{5})$/, '$1 $2 $3')}</dd></div>
            </dl>
            <div class="store__ctas">
              <a class="btn btn--ghost btn--sm" href="${telLink()}" data-i18n="about.callBtn">${t('about.callBtn')}</a>
              <a class="btn btn--wa btn--sm" href="${waLink('Hi! I have a question about your stock.')}" target="_blank" rel="noopener" data-i18n="about.waBtn">${t('about.waBtn')}</a>
              <a class="btn btn--paper btn--sm" href="${mapLink()}" target="_blank" rel="noopener" data-i18n="home.directions">${t('home.directions')}</a>
            </div>
            <p style="color:var(--muted);font-size:0.9rem;margin:1.1rem 0 0">${shop.note}</p>
          </div>
        </div>
        <iframe class="map-embed" src="${mapSrc}" title="Map — ${shop.name}, ${shop.address}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
      </div>
    </div>
  </section>`;
}

initPage();
render();

window.addEventListener('langchange', () => {
  render();
  applyStatic();
});
