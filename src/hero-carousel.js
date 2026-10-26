import { config, waLink, imgUrl, t } from './store.js';

export function renderHeroCarousel(slides) {
  const firstSlide = (slides && slides.length) ? slides[0] : {
    headline: 'Dress the whole family for the festive season',
    subtext: 'Sarees, lehengas, kurta-sets and more — try them in our Laxmi Road shop, or order on WhatsApp and we keep your pick aside.',
    offer: config.hero.offer || 'Festive Sale: up to 40% off',
    image: config.hero.image || 'hero/hero-1-red-saree.webp',
    alt: 'Red designer bridal tissue silk saree with rich silver and gold zari embroidery',
    primaryCta: { text: 'Browse collections', link: '#categories' },
    secondaryCta: { text: 'Order on WhatsApp', msg: 'Hi! I want to shop with you.' }
  };

  const headline = t('home.heroTitle') || firstSlide.headline;
  const subtext = t('home.heroSub') || firstSlide.subtext;
  const offer = config.hero.offer || firstSlide.offer;
  const primaryCtaText = t('hero.cta') || firstSlide.primaryCta?.text || 'Browse collections';
  const primaryCtaLink = firstSlide.primaryCta?.link || '#categories';
  const secondaryCtaText = t('pd.order') || firstSlide.secondaryCta?.text || 'Order on WhatsApp';
  const secondaryCtaMsg = firstSlide.secondaryCta?.msg || 'Hi! I want to shop with you.';

  const initialImage = firstSlide.image || config.hero.image;
  const initialAlt = firstSlide.alt || 'Red designer bridal tissue silk saree';

  return `
  <section class="hero" id="hero-showcase" aria-label="Welcome">
    <div class="hero__grid wrap">
      <!-- Static text column -->
      <div class="hero__text">
        ${offer ? `
        <span class="hero__offer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.4 6.9L21 11l-6.6 2.1L12 20l-2.4-6.9L3 11l6.6-2.1z"/></svg>
          ${offer}
        </span>` : ''}
        <h1 class="hero__h1" data-i18n="home.heroTitle">${headline}</h1>
        <p class="lead hero__sub" data-i18n="home.heroSub">${subtext}</p>
        <div class="hero__ctas">
          <a class="btn btn--primary btn--lg" href="${primaryCtaLink}" data-i18n="hero.cta">${primaryCtaText}</a>
          ${firstSlide.secondaryCta ? `
            <a class="btn btn--wa btn--lg" href="${waLink(secondaryCtaMsg)}" target="_blank" rel="noopener" data-i18n="pd.order">${secondaryCtaText}</a>
          ` : ''}
        </div>
      </div>

      <!-- Image showcase: kept small so the full uncropped image is visible -->
      <div class="hero__imgwrap">
        <div class="hero__img-frame">
          <a id="hero-img-link" href="${primaryCtaLink}" class="hero__img-link" aria-label="${initialAlt}">
            <img id="hero-main-img" src="${imgUrl(initialImage)}" alt="${initialAlt}" width="800" height="1200" fetchpriority="high" decoding="async">
          </a>
        </div>

        ${(slides && slides.length > 1) ? `
        <div class="hero__thumbs" role="tablist" aria-label="Festive collection previews">
          ${slides.map((s, idx) => `
            <button type="button" 
                    class="hero__thumb ${idx === 0 ? 'hero__thumb--active' : ''}" 
                    role="tab" 
                    aria-selected="${idx === 0}" 
                    aria-label="${s.headline || s.alt}" 
                    data-img="${imgUrl(s.image)}" 
                    data-alt="${s.alt}" 
                    data-link="${s.primaryCta?.link || '#categories'}">
              <img src="${imgUrl(s.image)}" alt="${s.alt}" width="60" height="90" loading="lazy">
            </button>
          `).join('')}
        </div>
        ` : ''}
      </div>
    </div>
  </section>`;
}

export function initHeroCarousel() {
  const mainImg = document.getElementById('hero-main-img');
  const imgLink = document.getElementById('hero-img-link');
  const thumbs = document.querySelectorAll('.hero__thumb');
  if (!mainImg || !thumbs.length) return;

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSrc = thumb.dataset.img;
      const targetAlt = thumb.dataset.alt;
      const targetLink = thumb.dataset.link;

      thumbs.forEach((t) => {
        t.classList.remove('hero__thumb--active');
        t.setAttribute('aria-selected', 'false');
      });
      thumb.classList.add('hero__thumb--active');
      thumb.setAttribute('aria-selected', 'true');

      if (targetSrc && mainImg.src !== targetSrc) {
        mainImg.style.opacity = '0.7';
        mainImg.src = targetSrc;
        mainImg.onload = () => {
          mainImg.style.opacity = '1';
        };
      }
      if (targetAlt) {
        mainImg.alt = targetAlt;
      }
      if (targetLink && imgLink) {
        imgLink.href = targetLink;
        imgLink.setAttribute('aria-label', targetAlt);
      }
    });
  });
}
