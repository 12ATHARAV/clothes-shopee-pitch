import { config, data, imgUrl, waLink, telLink, mapLink, productCard, initPage, t, money, offPct } from './store.js';
import { applyStatic } from './i18n.js';

const byId = Object.fromEntries(data.products.map((p) => [p.id, p]));

function catCount(id) {
  if (id === 'wedding') return data.products.filter((p) => p.occasions.includes('Wedding')).length;
  return data.products.filter((p) => p.cat === id).length;
}

function render() {
  const main = document.getElementById('main');
  const { shop } = config;
  document.title = `${shop.name} — ${shop.tagline} | ${shop.city}`;
  const newArrivals = data.products.filter((p) => p.new).slice(0, 8);
  const bestSellers = data.products.filter((p) => p.bestseller).slice(0, 8);
  const wedding = data.products.filter((p) => p.occasions.includes('Wedding')).slice(0, 6);

  const lookbook = [
    byId['banarasi-bridal-red-saree'],
    byId['bridal-lehenga-deep-red'],
    byId['chanderi-kurta-set-blush'],
    byId['mens-contemporary-cream-sherwani'],
    byId['festive-lehenga-green'],
    byId['kids-modern-kurta-purple'],
    byId['denim-fit-flare-dress'],
    byId['gold-plated-bangle-set'],
  ].filter(Boolean);

  main.innerHTML = `
  <!-- hero -->
  <section class="hero" aria-label="Welcome">
    <div class="hero__grid">
      <div class="hero__text wrap" style="padding-left:clamp(1rem,4vw,2rem)">
        <span class="hero__offer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.4 6.9L21 11l-6.6 2.1L12 20l-2.4-6.9L3 11l6.6-2.1z"/></svg>
          ${config.hero.offer}
        </span>
        <h1 class="hero__h1" data-i18n="home.heroTitle">${t('home.heroTitle')}</h1>
        <p class="lead hero__sub" data-i18n="home.heroSub">${t('home.heroSub')}</p>
        <div class="hero__ctas">
          <a class="btn btn--primary btn--lg" href="#categories" data-i18n="hero.cta">${t('hero.cta')}</a>
          <a class="btn btn--wa btn--lg" href="${waLink('Hi! I want to shop with you.')}" target="_blank" rel="noopener" data-i18n="pd.order">${t('pd.order')}</a>
        </div>
      </div>
      <div class="hero__imgwrap">
        <img src="${imgUrl(config.hero.image)}" alt="Red designer bridal tissue silk saree with rich silver and gold zari embroidery" width="900" height="1200" fetchpriority="high" decoding="async">
        <div class="hero__fade" aria-hidden="true"></div>
      </div>
    </div>
  </section>

  <div class="zari" role="presentation"></div>

  <!-- categories -->
  <section class="section" id="categories">
    <div class="wrap">
      <div class="section__head">
        <h2 data-i18n="home.catsTitle">${t('home.catsTitle')}</h2>
        <p data-i18n="home.catsSub">${t('home.catsSub')}</p>
      </div>
      <div class="cats">
        ${data.categories.map((c) => `
        <a class="cat-tile" href="/category.html?cat=${c.id}">
          <img src="${imgUrl(c.image)}" alt="${c.name} at ${shop.name}" width="600" height="800" loading="lazy" decoding="async">
          <span class="cat-tile__shade" aria-hidden="true"></span>
          <span class="cat-tile__label">
            <span class="cat-tile__name" data-i18n="cat.${c.id}">${t('cat.' + c.id)}</span>
            <span class="cat-tile__count">${catCount(c.id)} ${t('cat.items')}</span>
          </span>
        </a>`).join('')}
      </div>
    </div>
  </section>

  <div class="zari zari--thin" role="presentation"></div>

  <!-- new arrivals -->
  <section class="section">
    <div class="wrap">
      <div class="section__head" style="display:flex;justify-content:space-between;align-items:end;gap:1rem;flex-wrap:wrap">
        <div>
          <h2 data-i18n="home.newTitle">${t('home.newTitle')}</h2>
          <p data-i18n="home.newSub">${t('home.newSub')}</p>
        </div>
        <a class="section__link" href="/category.html?cat=sarees" style="color:var(--primary)" data-i18n="hero.cta">${t('hero.cta')}</a>
      </div>
      <div class="strip">${newArrivals.map(productCard).join('')}</div>
    </div>
  </section>

  <!-- best sellers -->
  <section class="section" style="padding-top:0">
    <div class="wrap">
      <div class="section__head">
        <h2 data-i18n="home.bestTitle">${t('home.bestTitle')}</h2>
        <p data-i18n="home.bestSub">${t('home.bestSub')}</p>
      </div>
      <div class="strip">${bestSellers.map(productCard).join('')}</div>
    </div>
  </section>

  <div class="zari" role="presentation"></div>

  <!-- wedding band -->
  <section class="band section">
    <div class="wrap">
      <div class="section__head" style="display:flex;justify-content:space-between;align-items:end;gap:1rem;flex-wrap:wrap">
        <div>
          <h2 data-i18n="home.weddingTitle">${t('home.weddingTitle')}</h2>
          <p class="lead" data-i18n="home.weddingSub">${t('home.weddingSub')}</p>
        </div>
        <a class="section__link" href="/category.html?cat=wedding" style="color:#f3d489" data-i18n="home.weddingCta">${t('home.weddingCta')}</a>
      </div>
      <div class="strip">${wedding.map(productCard).join('')}</div>
    </div>
  </section>

  <div class="zari" role="presentation"></div>

  <!-- testimonials -->
  <section class="section">
    <div class="wrap">
      <div class="section__head">
        <h2 data-i18n="home.quotesTitle">${t('home.quotesTitle')}</h2>
      </div>
      <div class="quotes">
        <figure class="quote">
          <blockquote>“I bought my daughter's wedding lehenga here, then my son's sherwani too. Fitting was done in two days — no stress at all.”</blockquote>
          <figcaption><strong>Sunita Deshmukh</strong> — Amravati</figcaption>
        </figure>
        <figure class="quote">
          <blockquote>“Sent photos of three sarees on WhatsApp at 9 pm, kept my favourite aside, picked it up next morning. This is how shopping should be.”</blockquote>
          <figcaption><strong>Priya Wankhede</strong> — Nagpur</figcaption>
        </figure>
        <figure class="quote">
          <blockquote>“Same shop my mother bought from. Now I buy kurtis for college and gifts for every Raksha Bandhan.”</blockquote>
          <figcaption><strong>Anjali Kale</strong> — Yavatmal</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <!-- Shop the Look section -->
  <section class="section" style="padding-top:0">
    <div class="wrap">
      <div class="section__head">
        <h2 data-i18n="home.galleryTitle">${t('home.galleryTitle')}</h2>
        <p data-i18n="home.gallerySub">${t('home.gallerySub')}</p>
      </div>
      <div class="lookbook-grid">
        ${lookbook.map((p) => `
        <a class="lookbook-tile" href="product.html?id=${p.id}" aria-label="${p.name} — ${money(p.price)}">
          <img src="${imgUrl(p.images[0])}" alt="${p.name}" width="500" height="500" loading="lazy" decoding="async">
          <span class="lookbook-tile__overlay">
            <span class="lookbook-tile__name">${p.name}</span>
            <span class="lookbook-tile__price">${money(p.price)} <span class="lookbook-tile__off">${offPct(p)}% off</span></span>
          </span>
        </a>`).join('')}
      </div>
      <div class="lookbook-cta">
        <a class="btn btn--paper" href="${config.shop.social.instagram}" target="_blank" rel="noopener">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          <span data-i18n="home.instaBtn">${t('home.instaBtn')}</span>
        </a>
      </div>
    </div>
  </section>

  <div class="zari zari--thin" role="presentation"></div>

  <!-- visit us -->
  <section class="section">
    <div class="wrap">
      <div class="section__head">
        <h2 data-i18n="home.visitTitle">${t('home.visitTitle')}</h2>
      </div>
      <div class="store store__grid">
        <img class="store__img" src="${imgUrl('store-rack.jpg')}" alt="Inside the shop — racks of dresses and folded cottons" width="900" height="600" loading="lazy" decoding="async">
        <div class="store__body">
          <h3 style="margin-bottom:0.2rem">${shop.name}</h3>
          <p style="color:var(--muted);margin-bottom:1rem">${shop.tagline}</p>
          <dl class="store__rows">
            <div class="store__row"><dt data-i18n="home.address">${t('home.address')}</dt><dd>${shop.address}</dd></div>
            <div class="store__row"><dt data-i18n="home.monSat">${t('home.monSat')}</dt><dd>${shop.hours.monSat}</dd></div>
            <div class="store__row"><dt data-i18n="home.sun">${t('home.sun')}</dt><dd>${shop.hours.sun}</dd></div>
            <div class="store__row"><dt data-i18n="home.phone">${t('home.phone')}</dt><dd>${shop.phone.replace(/^(\+91)(\d{5})(\d{5})$/, '$1 $2 $3')}</dd></div>
          </dl>
          <div class="store__ctas">
            <a class="btn btn--ghost btn--sm" href="${mapLink()}" target="_blank" rel="noopener" data-i18n="home.directions">${t('home.directions')}</a>
            <a class="btn btn--ghost btn--sm" href="${telLink()}" data-i18n="home.call">${t('home.call')}</a>
            <a class="btn btn--wa btn--sm" href="${waLink('Hi! Are you open today?')}" target="_blank" rel="noopener" data-i18n="about.waBtn">${t('about.waBtn')}</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- structured data -->
  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: shop.name,
    address: { '@type': 'PostalAddress', streetAddress: shop.address, addressLocality: shop.city, addressCountry: 'IN' },
    telephone: shop.phone,
    openingHours: ['Mo-Sa 10:30-21:00', 'Su 11:00-20:00'],
    image: new URL(imgUrl(config.hero.image), location.href).href,
    priceRange: '₹₹',
  })}
  </script>`;
}

initPage();
render();

window.addEventListener('langchange', () => {
  render();
  applyStatic();
});
