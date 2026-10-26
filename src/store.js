import config from '../shop.config.json';
import data from '../products.json';
import { applyStatic, getLang, setLang, t } from './i18n.js';

export { config, data };
export { t, applyStatic, getLang, setLang };

/* ---- theming from config ---- */
export function applyTheme() {
  const b = config.brand || {};
  const map = { base: '--base', ink: '--ink', primary: '--primary', gold: '--gold', accent: '--accent' };
  for (const [k, v] of Object.entries(map)) {
    if (b[k]) document.documentElement.style.setProperty(v, b[k]);
  }
  const shopName = config.shop?.name;
  document.querySelectorAll('[data-shop-name]').forEach((el) => { el.textContent = shopName; });
}

/* ---- helpers ---- */
export const money = (n) => '₹' + n.toLocaleString('en-IN');

export const offPct = (p) => Math.round(((p.mrp - p.price) / p.mrp) * 100);

export const imgUrl = (name) => (import.meta.env.BASE_URL || '/') + 'images/' + name;

export function waLink(text) {
  return 'https://wa.me/' + config.shop.whatsapp + '?text=' + encodeURIComponent(text);
}

export function telLink() {
  return 'tel:+' + String(config.shop.phone).replace(/\D/g, '');
}

export function mapLink() {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(config.shop.mapQuery);
}

export function productLink(p) {
  return new URL('product.html?id=' + p.id, location.href).href;
}

/* ---- wishlist / enquiry list (localStorage) ---- */
const WL_KEY = 'wishlist';

export function getWishlist() {
  try { return JSON.parse(localStorage.getItem(WL_KEY)) || []; } catch { return []; }
}

export function saveWishlist(list) {
  localStorage.setItem(WL_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('wishlistchange'));
}

export function inWishlist(id) {
  return getWishlist().some((x) => x.id === id);
}

export function toggleWishlist(id) {
  const list = getWishlist();
  const idx = list.findIndex((x) => x.id === id);
  if (idx >= 0) {
    list.splice(idx, 1);
    saveWishlist(list);
    return false;
  }
  list.push({ id });
  saveWishlist(list);
  return true;
}

/* ---- shared render helpers ---- */

export function heartSvg() {
  return '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.9-10-9.2C.5 8.6 2.2 5 5.7 5c2 0 3.4 1.1 4.3 2.6h4c.9-1.5 2.3-2.6 4.3-2.6 3.5 0 5.2 3.6 3.7 6.8C19.5 16.1 12 21 12 21z" transform="scale(0.92) translate(1,0)"/></svg>';
}

export function productCard(p) {
  const saved = inWishlist(p.id);
  return `
  <article class="pcard">
    <a class="pcard__imgwrap" href="product.html?id=${p.id}" aria-label="${p.name}">
      <img src="${imgUrl(p.images[0])}" alt="${p.alt || p.name}" width="600" height="800" loading="lazy" decoding="async">
      ${p.new ? '<span class="pcard__tag pcard__tag--new">New</span>' : p.bestseller ? '<span class="pcard__tag">Best seller</span>' : ''}
    </a>
    <button class="heart-btn" type="button" aria-pressed="${saved}" aria-label="${saved ? t('pd.saved') : t('pd.save')}: ${p.name}" data-wish="${p.id}">${heartSvg()}</button>
    <a class="pcard__body" href="product.html?id=${p.id}" style="text-decoration:none;color:inherit;display:block">
      <span class="pcard__name">${p.name}</span>
      <span class="pcard__meta">${t('cat.' + p.cat)} — ${p.fabric}</span>
      <span class="price-row"><span class="price">${money(p.price)}</span><span class="mrp">${money(p.mrp)}</span><span class="off">${offPct(p)}% off</span></span>
    </a>
  </article>`;
}

/* global click delegation for wishlist hearts */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-wish]');
  if (!btn) return;
  e.preventDefault();
  const id = btn.getAttribute('data-wish');
  const added = toggleWishlist(id);
  btn.setAttribute('aria-pressed', String(added));
  const label = added ? t('pd.saved') : t('pd.save');
  btn.setAttribute('aria-label', label + ': ' + id);
  showToast(added ? t('wl.added') : t('wl.removed'));
});

let toastTimer;
export function showToast(msg) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.setAttribute('data-open', 'true');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.setAttribute('data-open', 'false'), 2200);
}

/* mount everything a page needs */
export function initPage() {
  applyTheme();
  renderChrome();
  applyStatic();
  updateWishlistCount();
}

function renderChrome() {
  const shop = config.shop;
  const curLang = getLang();
  const headerHtml = `
  <a class="skip-link" href="#main" data-i18n="a11y.skip">${t('a11y.skip')}</a>
  ${config.sale?.enabled ? `
  <div class="topbar">
    <div class="wrap">
      <span class="topbar__msg">${config.sale.barText}</span>
      <span class="topbar__count" id="sale-count" aria-live="off"></span>
    </div>
  </div>` : ''}
  <header class="header">
    <div class="wrap header__inner">
      <a class="brand" href="/">
        ${shop.logoImage ? `<img src="${imgUrl(shop.logoImage)}" alt="${shop.name}" width="40" height="40">`
          : `<span class="brand__mark" aria-hidden="true"><span>${shop.monogram}</span></span>`}
        <span>
          <span class="brand__name" data-shop-name>${shop.name}</span>
          <span class="brand__sub">${shop.city}, since ${shop.since}</span>
        </span>
      </a>
      <nav class="nav" aria-label="Main">
        <a href="/" data-i18n="nav.home">${t('nav.home')}</a>
        <a href="/index.html#categories" data-i18n="nav.shop">${t('nav.shop')}</a>
        <a href="/category.html?cat=wedding" data-i18n="nav.wedding">${t('nav.wedding')}</a>
        <a href="/about.html" data-i18n="nav.about">${t('nav.about')}</a>
      </nav>
      <div class="header__actions">
        <!-- Search icon button -->
        <button class="header-icon-btn" type="button" aria-label="Search" id="search-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </button>
        <!-- Desktop language switcher -->
        <div class="lang desktop-lang" role="group" aria-label="Language">
          <button type="button" data-lang="en" aria-pressed="${curLang === 'en'}">EN</button>
          <button type="button" data-lang="hi" aria-pressed="${curLang === 'hi'}">हिं</button>
          <button type="button" data-lang="mr" aria-pressed="${curLang === 'mr'}">मर</button>
        </div>
        <!-- Wishlist link -->
        <a class="heart-link" href="/wishlist.html" aria-label="${t('nav.wishlist')}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7.5-4.9-10-9.2C.5 8.6 2.2 5 5.7 5c2 0 3.4 1.1 4.3 2.6h4c.9-1.5 2.3-2.6 4.3-2.6 3.5 0 5.2 3.6 3.7 6.8C19.5 16.1 12 21 12 21z"/></svg>
          <span class="heart-link__count" data-wl-count hidden>0</span>
        </a>
        <!-- Hamburger button -->
        <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="${t('nav.menu')}">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        </button>
      </div>
    </div>
    <!-- Search Dropdown / Bar -->
    <div class="search-bar" id="search-bar" data-open="false">
      <div class="wrap search-bar__inner">
        <form action="/category.html" method="get">
          <input type="search" name="q" id="search-input" placeholder="Search sarees, lehengas, kurtis, fabrics..." aria-label="Search clothing" autocomplete="off">
          <button type="submit" class="btn btn--primary btn--sm">Search</button>
          <button type="button" class="search-close" id="search-close-btn" aria-label="Close search">✕</button>
        </form>
      </div>
    </div>
    <!-- Mobile Slide-In Navigation Panel & Backdrop -->
    <div class="mobile-nav-backdrop" id="mobile-nav-backdrop"></div>
    <nav class="mobile-nav" id="mobile-nav" data-open="false" aria-label="Mobile Navigation">
      <div class="mobile-nav__header">
        <span class="mobile-nav__title">${shop.name}</span>
        <button class="mobile-nav__close" id="mobile-nav-close" type="button" aria-label="Close menu">✕</button>
      </div>
      <div class="mobile-nav__lang-wrap">
        <span class="mobile-nav__lang-label">Language / भाषा:</span>
        <div class="lang" role="group" aria-label="Language selection">
          <button type="button" data-lang="en" aria-pressed="${curLang === 'en'}">EN</button>
          <button type="button" data-lang="hi" aria-pressed="${curLang === 'hi'}">हिंदी</button>
          <button type="button" data-lang="mr" aria-pressed="${curLang === 'mr'}">मराठी</button>
        </div>
      </div>
      <div class="mobile-nav__links">
        <a href="/" data-i18n="nav.home">${t('nav.home')}</a>
        <div class="mobile-nav__heading">Counters / विभाग</div>
        ${data.categories.map((c) => `<a href="/category.html?cat=${c.id}" data-i18n="cat.${c.id}">${t('cat.' + c.id)}</a>`).join('')}
        <div class="mobile-nav__heading">More</div>
        <a href="/wishlist.html" data-i18n="nav.wishlist">${t('nav.wishlist')}</a>
        <a href="/about.html" data-i18n="nav.about">${t('nav.about')}</a>
      </div>
      <div class="mobile-nav__footer">
        <a class="btn btn--wa btn--sm" href="${waLink('Hi! I want to shop with you.')}" target="_blank" rel="noopener">WhatsApp</a>
        <a class="btn btn--ghost btn--sm" href="${telLink()}">Call Shop</a>
      </div>
    </nav>
  </header>`;

  const footerHtml = `
  <div class="zari zari--thin" aria-hidden="true"></div>
  <footer class="footer">
    <div class="wrap">
      <div class="footer__brand">${shop.name}</div>
      <p style="margin:0;color:rgba(252,247,234,.65);max-width:44ch">${shop.tagline}</p>
      <div class="footer__cols">
        <div class="footer__col">
          <h3>${t('footer.contact')}</h3>
          <ul>
            <li>${shop.address}</li>
            <li><a href="tel:+${String(shop.phone).replace(/\D/g, '')}">${shop.phone.replace(/^(\+91)(\d{5})(\d{5})$/, '$1 $2 $3')}</a></li>
            <li><a href="${waLink('Hi! I have a question.')}" target="_blank" rel="noopener">WhatsApp</a></li>
          </ul>
        </div>
        <div class="footer__col">
          <h3>${t('footer.shop')}</h3>
          <ul>
            ${data.categories.map((c) => `<li><a href="/category.html?cat=${c.id}" data-i18n="cat.${c.id}">${t('cat.' + c.id)}</a></li>`).join('')}
          </ul>
        </div>
        <div class="footer__col">
          <h3>${t('footer.info')}</h3>
          <ul>
            <li><a href="/about.html">${t('nav.about')}</a></li>
            <li><a href="/wishlist.html">${t('nav.wishlist')}</a></li>
            <li><a href="${shop.social.instagram}" target="_blank" rel="noopener">Instagram</a></li>
            <li><a href="${shop.social.facebook}" target="_blank" rel="noopener">Facebook</a></li>
          </ul>
        </div>
        <div class="footer__col">
          <h3>${t('home.hours')}</h3>
          <ul>
            <li>${t('home.monSat')}: ${shop.hours.monSat}</li>
            <li>${t('home.sun')}: ${shop.hours.sun}</li>
            <li style="margin-top:.5rem;color:rgba(252,247,234,.65)">${shop.note}</li>
          </ul>
        </div>
      </div>
      <div class="footer__fine">
        <span>© ${new Date().getFullYear()} ${shop.name}. ${t('footer.rights')}</span>
        <span>${t('footer.demoNote')}</span>
      </div>
    </div>
  </footer>
  <div class="sticky-cta">
    <a class="btn btn--ghost" href="${telLink()}">${t('pd.call')}</a>
    <a class="btn btn--wa" href="${waLink('Hi! I want to shop with you.')}" target="_blank" rel="noopener">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5 13.9c-.2.6-1.2 1.1-1.7 1.2-.4 0-.9.2-3.1-.7-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.7s.6-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l.9-1c.2-.3.4-.2.7-.1l1.9.9c.3.2.5.3.6.4 0 .2 0 .7-.2 1.2z"/></svg>
      ${t('pd.order')}
    </a>
  </div>
  <a class="float-wa" href="${waLink('Hi! I want to shop with you.')}" target="_blank" rel="noopener" aria-label="WhatsApp">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5 13.9c-.2.6-1.2 1.1-1.7 1.2-.4 0-.9.2-3.1-.7-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.7s.6-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l.9-1c.2-.3.4-.2.7-.1l1.9.9c.3.2.5.3.6.4 0 .2 0 .7-.2 1.2z"/></svg>
  </a>
  ${config.sale?.enabled ? `<button class="sale-pill" type="button" id="sale-pill-btn" aria-label="Festive sale offer">Sale live</button>` : ''}`;

  document.getElementById('site-header').innerHTML = headerHtml;
  document.getElementById('site-footer').innerHTML = footerHtml;

  // language buttons (in header and mobile drawer)
  const langBtns = document.querySelectorAll('[data-lang]');
  langBtns.forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

  // search bar toggle
  const searchBtn = document.getElementById('search-btn');
  const searchBar = document.getElementById('search-bar');
  const searchClose = document.getElementById('search-close-btn');
  const searchInput = document.getElementById('search-input');
  searchBtn?.addEventListener('click', () => {
    const open = searchBar.dataset.open === 'true';
    searchBar.dataset.open = String(!open);
    if (!open) searchInput?.focus();
  });
  searchClose?.addEventListener('click', () => {
    searchBar.dataset.open = 'false';
  });

  // mobile drawer navigation
  const menuBtn = document.querySelector('.menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileBackdrop = document.getElementById('mobile-nav-backdrop');
  const mobileClose = document.getElementById('mobile-nav-close');

  const closeMenu = () => {
    mobileNav.dataset.open = 'false';
    mobileBackdrop.dataset.open = 'false';
    menuBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  const openMenu = () => {
    mobileNav.dataset.open = 'true';
    mobileBackdrop.dataset.open = 'true';
    menuBtn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  menuBtn?.addEventListener('click', () => {
    const isOpen = mobileNav.dataset.open === 'true';
    if (isOpen) closeMenu(); else openMenu();
  });
  mobileClose?.addEventListener('click', closeMenu);
  mobileBackdrop?.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.dataset.open === 'true') closeMenu();
  });

  // sale pill click
  const salePill = document.getElementById('sale-pill-btn');
  salePill?.addEventListener('click', () => openSaleModal());

  // countdown
  startCountdown();

  // sale card (once per session)
  showSaleCard();
}

function startCountdown() {
  const el = document.getElementById('sale-count');
  if (!el || !config.sale?.endDate) return;
  const end = new Date(config.sale.endDate).getTime();
  const tick = () => {
    const diff = end - Date.now();
    if (diff <= 0) {
      el.closest('.topbar')?.remove();
      document.querySelector('.sale-pill')?.remove();
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    el.textContent = t('topbar.ends') + ' ' + (d > 0 ? d + 'd ' : '') + h + 'h ' + m + 'm';
  };
  tick();
  setInterval(tick, 30000);
}

export function openSaleModal() {
  const sale = config.sale;
  if (!sale?.enabled || !sale.modal?.enabled) return;
  let card = document.querySelector('.sale-card');
  if (!card) {
    card = document.createElement('div');
    card.className = 'sale-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', sale.modal.title);
    card.innerHTML = `
      <button class="sale-card__close" type="button" aria-label="Close">✕</button>
      <h3>${sale.modal.title}</h3>
      <p>${sale.modal.text}</p>
      ${sale.modal.code ? `<span class="sale-card__code">${sale.modal.code}</span>` : ''}
      <a class="btn btn--paper btn--sm" href="${sale.modal.ctaLink || '/category.html'}">${sale.modal.cta || t('hero.cta')}</a>`;
    document.body.appendChild(card);
    card.querySelector('.sale-card__close').addEventListener('click', () => {
      card.setAttribute('data-open', 'false');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && card.isConnected && card.dataset.open === 'true') {
        card.setAttribute('data-open', 'false');
      }
    });
  }
  card.setAttribute('data-open', 'true');
  card.querySelector('.sale-card__close')?.focus();
}

function showSaleCard() {
  const sale = config.sale;
  if (!sale?.enabled || !sale.modal?.enabled) return;
  if (sessionStorage.getItem('sale-shown')) return;
  setTimeout(() => {
    openSaleModal();
    sessionStorage.setItem('sale-shown', '1');
  }, 3200);
}

export function updateWishlistCount() {
  const el = document.querySelector('[data-wl-count]');
  if (!el) return;
  const n = getWishlist().length;
  el.textContent = n;
  el.hidden = n === 0;
}

window.addEventListener('wishlistchange', updateWishlistCount);
window.addEventListener('langchange', () => {
  renderChrome();
  applyStatic();
  updateWishlistCount();
});
