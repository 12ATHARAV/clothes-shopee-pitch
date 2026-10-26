import { config, data, initPage, t, money, offPct, imgUrl, waLink, telLink, productLink, inWishlist, toggleWishlist, productCard, showToast, heartSvg } from './store.js';
import { applyStatic } from './i18n.js';

const params = new URLSearchParams(location.search);
const productId = params.get('id');
const product = data.products.find((p) => p.id === productId) || data.products[0];
const cat = data.categories.find((c) => c.id === product.cat);

const sel = {
  size: product.sizes.length === 1 ? product.sizes[0] : null,
  colour: product.colors.length === 1 ? product.colors[0].n : null,
  img: 0,
};

function orderMessage() {
  const link = productLink(product);
  const lines = [
    `${t('pd.msgIntro')}`,
    `${product.name} — ₹${product.price.toLocaleString('en-IN')}`,
    `${t('pd.size')}: ${sel.size || '—'}`,
    `${t('pd.colour')}: ${sel.colour || '—'}`,
    link,
  ];
  return lines.join('\n');
}

function render() {
  const main = document.getElementById('main');
  const { shop } = config;
  const saved = inWishlist(product.id);
  document.title = `${product.name} — ${shop.name}, ${shop.city}`;
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', product.name);
  document.querySelector('meta[property="og:image"]')?.setAttribute('content', new URL(imgUrl(product.images[0]), location.href).href);

  const similar = data.products.filter((p) => p.id !== product.id && (p.cat === product.cat || p.occasions.some((o) => product.occasions.includes(o)))).slice(0, 6);

  main.innerHTML = `
  <div class="wrap pd">
    <p class="pd__crumbs"><a href="/" style="text-decoration:none" data-i18n="nav.home">${t('nav.home')}</a> / <a href="/category.html?cat=${product.cat}" style="text-decoration:none" data-i18n="cat.${product.cat}">${t('cat.' + product.cat)}</a> / <span>${product.name}</span></p>
    <div class="pd__grid">
      <div class="pd-gallery">
        <div class="pd-gallery__scroll-track" id="pd-gallery-track">
          ${product.images.map((im, i) => `
            <div class="pd-gallery__slide" data-slide="${i}">
              <img src="${imgUrl(im)}" alt="${product.alt ? product.alt + ' — view ' + (i + 1) : product.name + ' — view ' + (i + 1)}" width="900" height="1125" loading="eager" decoding="async">
              <span class="pd-gallery__hint" data-i18n="pd.zoom">${t('pd.zoom')}</span>
            </div>
          `).join('')}
        </div>
        ${product.images.length > 1 ? `
        <div class="pd-gallery__thumbs" role="group" aria-label="Photos">
          ${product.images.map((im, i) => `
          <button type="button" aria-current="${i === 0}" data-thumb="${i}" aria-label="Photo ${i + 1}">
            <img src="${imgUrl(im)}" alt="" width="160" height="200" loading="eager" decoding="async">
          </button>`).join('')}
        </div>` : ''}
      </div>
      <div class="pd__info">
        ${product.new ? '<span class="pd__badge" style="background:var(--gold);color:var(--ink)">New</span>' : ''}
        ${product.bestseller ? '<span class="pd__badge">Best seller</span>' : ''}
        <h1 class="pd__name">${product.name}</h1>
        <div class="price-row pd__price-row">
          <span class="price">${money(product.price)}</span>
          <span class="mrp">${money(product.mrp)}</span>
          <span class="off">${offPct(product)}% off</span>
        </div>
        <p class="pd__taxnote" data-i18n="pd.incTax">${t('pd.incTax')}</p>

        <div class="opt">
          <div class="opt__label"><span data-i18n="pd.selectSize">${t('pd.selectSize')}</span>: <strong id="lbl-size" class="opt__val">${sel.size || '—'}</strong></div>
          <div class="opt__sizes" role="group" aria-label="${t('pd.size')}">
            ${product.sizes.map((s) => `<button type="button" class="size-chip" aria-pressed="${sel.size === s}" data-size="${s}">${s}</button>`).join('')}
          </div>
        </div>

        <div class="opt">
          <div class="opt__label"><span>${t('pd.colour')}</span>: <strong id="lbl-colour" class="opt__val">${sel.colour || '—'}</strong></div>
          <div class="opt__colors" role="group" aria-label="${t('pd.colour')}">
            ${product.colors.map((c) => `
            <button type="button" class="color-chip" aria-pressed="${sel.colour === c.n}" data-colour="${c.n}">
              <span class="swatch" style="background:${c.h}"></span>${c.n}
            </button>`).join('')}
          </div>
        </div>

        <div class="pd__ctas">
          <a class="btn btn--wa btn--lg" href="${waLink(orderMessage())}" target="_blank" rel="noopener">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5 13.9c-.2.6-1.2 1.1-1.7 1.2-.4 0-.9.2-3.1-.7-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.7s.6-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l.9-1c.2-.3.4-.2.7-.1l1.9.9c.3.2.5.3.6.4 0 .2 0 .7-.2 1.2z"/></svg>
            ${t('pd.order')}
          </a>
          <a class="btn btn--ghost" href="${telLink()}" data-i18n="pd.call">${t('pd.call')}</a>
          <button class="btn btn--paper" type="button" data-wish="${product.id}" aria-pressed="${saved}" id="pd-wish">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7.5-4.9-10-9.2C.5 8.6 2.2 5 5.7 5c2 0 3.4 1.1 4.3 2.6h4c.9-1.5 2.3-2.6 4.3-2.6 3.5 0 5.2 3.6 3.7 6.8C19.5 16.1 12 21 12 21z"/></svg>
            <span>${saved ? t('pd.saved') : t('pd.save')}</span>
          </button>
        </div>

        <div class="pd__note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
          <span data-i18n="pd.inStore">${t('pd.inStore')}</span>
        </div>

        <dl class="details-list">
          <dt data-i18n="pd.fabric">${t('pd.fabric')}</dt><dd>${product.fabric}</dd>
          <dt data-i18n="pd.occasion">${t('pd.occasion')}</dt><dd>${product.occasions.join(', ')}</dd>
          <dt data-i18n="pd.care">${t('pd.care')}</dt><dd data-i18n="pd.careText">${t('pd.careText')}</dd>
          <dt data-i18n="pd.stock">${t('pd.stock')}</dt><dd>${product.desc}</dd>
        </dl>
      </div>
    </div>

    ${similar.length ? `
    <section class="section" style="padding-bottom:0" aria-label="${t('pd.similar')}">
      <div class="section__head"><h2 data-i18n="pd.similar">${t('pd.similar')}</h2></div>
      <div class="strip">${similar.map(productCard).join('')}</div>
    </section>` : ''}
  </div>

  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((im) => new URL(imgUrl(im), location.href).href),
    description: product.desc,
    brand: { '@type': 'Brand', name: shop.name },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price,
      availability: 'https://schema.org/InStock',
    },
  })}
  </script>`;

  wire();
  refreshWa();
}

function wire() {
  const track = document.getElementById('pd-gallery-track');
  const slides = document.querySelectorAll('.pd-gallery__slide');

  document.querySelectorAll('[data-thumb]').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      const i = Number(b.dataset.thumb);
      if (isNaN(i)) return;
      sel.img = i;

      // Reset any active zoom on slides
      slides.forEach((s) => {
        s.dataset.zoom = 'false';
      });

      if (track) {
        const targetSlide = slides[i];
        const targetLeft = targetSlide ? targetSlide.offsetLeft : (i * track.clientWidth);

        // Temporarily disable scroll-snap during programmatic smooth scroll
        // to prevent Android Chrome snapping engine from fighting the scroll animation
        track.style.scrollSnapType = 'none';
        track.scrollTo({
          left: targetLeft,
          top: 0,
          behavior: 'smooth'
        });

        setTimeout(() => {
          track.style.scrollSnapType = 'x mandatory';
        }, 350);
      }

      document.querySelectorAll('[data-thumb]').forEach((x) =>
        x.setAttribute('aria-current', String(Number(x.dataset.thumb) === i))
      );
    });
  });

  track?.addEventListener('scroll', () => {
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== sel.img && i >= 0 && i < product.images.length) {
      sel.img = i;
      document.querySelectorAll('[data-thumb]').forEach((x) => x.setAttribute('aria-current', String(Number(x.dataset.thumb) === i)));
    }
  }, { passive: true });

  slides.forEach((slide) => {
    slide.addEventListener('click', (e) => {
      const on = slide.dataset.zoom === 'true';
      slide.dataset.zoom = String(!on);
      const img = slide.querySelector('img');
      if (!on && img) {
        const r = slide.getBoundingClientRect();
        img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
      }
    });
  });

  document.querySelectorAll('[data-size]').forEach((b) => {
    b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') === 'true';
      document.querySelectorAll('[data-size]').forEach((x) => x.setAttribute('aria-pressed', 'false'));
      sel.size = on ? null : b.dataset.size;
      if (!on) b.setAttribute('aria-pressed', 'true');
      const lbl = document.getElementById('lbl-size');
      if (lbl) lbl.textContent = sel.size || '—';
      refreshWa();
    });
  });

  document.querySelectorAll('[data-colour]').forEach((b) => {
    b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') === 'true';
      document.querySelectorAll('[data-colour]').forEach((x) => x.setAttribute('aria-pressed', 'false'));
      sel.colour = on ? null : b.dataset.colour;
      if (!on) b.setAttribute('aria-pressed', 'true');
      const lbl = document.getElementById('lbl-colour');
      if (lbl) lbl.textContent = sel.colour || '—';
      refreshWa();
    });
  });

  const wishBtn = document.getElementById('pd-wish');
  wishBtn?.addEventListener('click', () => {
    const added = toggleWishlist(product.id);
    wishBtn.setAttribute('aria-pressed', String(added));
    wishBtn.querySelector('svg')?.setAttribute('fill', added ? 'currentColor' : 'none');
    const labelSpan = wishBtn.querySelector('span');
    if (labelSpan) labelSpan.textContent = added ? t('pd.saved') : t('pd.save');
    showToast(added ? t('wl.added') : t('wl.removed'));
  });
}

function refreshWa() {
  const msg = orderMessage();
  const url = waLink(msg);
  document.querySelectorAll('.pd__ctas a[href*="wa.me"], .sticky-cta a[href*="wa.me"]').forEach((el) => {
    el.href = url;
  });
}

initPage();
render();

window.addEventListener('langchange', () => {
  render();
  applyStatic();
});
