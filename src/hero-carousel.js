import { config, waLink, imgUrl, t } from './store.js';

export function renderHeroCarousel(slides) {
  const { shop } = config;
  const total = slides.length;
  // Clones for seamless infinite looping
  const firstClone = { ...slides[0], isClone: true };
  const lastClone = { ...slides[total - 1], isClone: true };
  const allSlides = [lastClone, ...slides, firstClone];

  const renderSlideItem = (s, trackIndex) => {
    const isFirstRealSlide = trackIndex === 1;
    // For slide 1, preserve dynamic i18n if keys exist
    const headline = isFirstRealSlide ? (t('home.heroTitle') || s.headline) : s.headline;
    const subtext = isFirstRealSlide ? (t('home.heroSub') || s.subtext) : s.subtext;
    const offer = isFirstRealSlide ? (config.hero.offer || s.offer) : s.offer;
    const primaryCtaText = isFirstRealSlide ? (t('hero.cta') || s.primaryCta.text) : s.primaryCta.text;
    const secondaryCtaText = isFirstRealSlide ? (t('pd.order') || s.secondaryCta?.text) : s.secondaryCta?.text;

    return `
    <div class="hero__slide" role="group" aria-roledescription="slide" aria-label="${s.headline}" data-track-index="${trackIndex}">
      <div class="hero__grid">
        <div class="hero__text wrap" style="padding-left:clamp(1rem,4vw,2rem)">
          ${offer ? `
          <span class="hero__offer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.4 6.9L21 11l-6.6 2.1L12 20l-2.4-6.9L3 11l6.6-2.1z"/></svg>
            ${offer}
          </span>` : ''}
          <h1 class="hero__h1">${headline}</h1>
          <p class="lead hero__sub">${subtext}</p>
          <div class="hero__ctas">
            <a class="btn btn--primary btn--lg" href="${s.primaryCta.link}">${primaryCtaText}</a>
            ${s.secondaryCta ? `
              <a class="btn btn--wa btn--lg" href="${waLink(s.secondaryCta.msg || 'Hi! I want to shop with you.')}" target="_blank" rel="noopener">${secondaryCtaText}</a>
            ` : ''}
          </div>
        </div>
        <div class="hero__imgwrap">
          <img src="${imgUrl(s.image)}" alt="${s.alt}" width="900" height="1200" ${isFirstRealSlide ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
          <div class="hero__fade" aria-hidden="true"></div>
        </div>
      </div>
    </div>`;
  };

  return `
  <section class="hero hero--carousel" id="hero-carousel" aria-roledescription="carousel" aria-label="Featured Collections" tabindex="0">
    <div class="hero__viewport" id="hero-viewport">
      <div class="hero__track" id="hero-track">
        ${allSlides.map((s, idx) => renderSlideItem(s, idx)).join('')}
      </div>
    </div>

    <!-- Desktop previous and next arrows -->
    <button type="button" class="hero__arrow hero__arrow--prev" id="hero-prev-btn" aria-label="Previous slide">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
    <button type="button" class="hero__arrow hero__arrow--next" id="hero-next-btn" aria-label="Next slide">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>

    <!-- Bottom indicators & pause/play controls -->
    <div class="hero__controls-wrap">
      <div class="hero__controls" role="group" aria-label="Carousel controls">
        <div class="hero__dots" role="tablist" aria-label="Slide indicators">
          ${slides.map((s, idx) => `
            <button type="button" class="hero__dot ${idx === 0 ? 'hero__dot--active' : ''}" role="tab" aria-selected="${idx === 0}" aria-label="Slide ${idx + 1}: ${s.headline}" data-dot="${idx}">
              <span class="hero__dot-pill"></span>
            </button>
          `).join('')}
        </div>
        <button type="button" class="hero__toggle-btn" id="hero-toggle-btn" aria-label="Pause slide rotation">
          <svg class="hero__pause-icon" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="4" width="4" height="16" rx="1"/><rect x="15" y="4" width="4" height="16" rx="1"/></svg>
          <svg class="hero__play-icon" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="display:none"><polygon points="6 4 20 12 6 20 6 4"/></svg>
        </button>
      </div>
    </div>
  </section>`;
}

export function initHeroCarousel() {
  const container = document.getElementById('hero-carousel');
  const viewport = document.getElementById('hero-viewport');
  const track = document.getElementById('hero-track');
  if (!container || !viewport || !track) return;

  const slides = Array.from(track.children);
  const totalRealSlides = slides.length - 2;
  if (totalRealSlides <= 1) return;

  let currentIdx = 1; // start at actual first slide (index 1)
  let isTransitioning = false;
  let autoplayTimer = null;
  let isPausedByUser = false;
  let isHovered = false;
  let isTouching = false;
  const slideDelay = config.hero.autoplayDelay !== undefined
    ? config.hero.autoplayDelay
    : (config.hero.autoplayInterval !== undefined ? config.hero.autoplayInterval : 500);
  const transitionMs = config.hero.transitionDuration || 400;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Set initial position
  track.style.transition = 'none';
  track.style.transform = `translate3d(-${currentIdx * 100}%, 0, 0)`;

  function updateDots(activeRealIndex) {
    document.querySelectorAll('.hero__dot').forEach((dot, idx) => {
      const isActive = idx === activeRealIndex;
      dot.classList.toggle('hero__dot--active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });
  }

  function goTo(targetIdx, animate = true) {
    if (isTransitioning && animate) return;
    if (animate && !prefersReduced) {
      isTransitioning = true;
      track.style.transition = `transform ${transitionMs}ms cubic-bezier(0.25, 1, 0.5, 1)`;
    } else {
      track.style.transition = 'none';
    }
    currentIdx = targetIdx;
    track.style.transform = `translate3d(-${currentIdx * 100}%, 0, 0)`;

    // Calculate real slide index (0 to totalRealSlides - 1)
    let realIdx = currentIdx - 1;
    if (realIdx < 0) realIdx = totalRealSlides - 1;
    if (realIdx >= totalRealSlides) realIdx = 0;
    updateDots(realIdx);

    if (!animate || prefersReduced) {
      isTransitioning = false;
      scheduleNext();
    }
  }

  function next() {
    goTo(currentIdx + 1, true);
  }

  function prev() {
    goTo(currentIdx - 1, true);
  }

  // Handle seamless infinite loop on transitionend
  track.addEventListener('transitionend', () => {
    isTransitioning = false;
    if (currentIdx === totalRealSlides + 1) {
      // Reached the clone of slide 1 at the end -> jump instantly back to slide 1
      track.style.transition = 'none';
      currentIdx = 1;
      track.style.transform = `translate3d(-${currentIdx * 100}%, 0, 0)`;
      track.offsetHeight; // force reflow
    } else if (currentIdx === 0) {
      // Reached the clone of last slide at the start -> jump instantly to last slide
      track.style.transition = 'none';
      currentIdx = totalRealSlides;
      track.style.transform = `translate3d(-${currentIdx * 100}%, 0, 0)`;
      track.offsetHeight; // force reflow
    }
    scheduleNext();
  });

  // Autoplay management
  function scheduleNext() {
    stopAutoplay();
    if (prefersReduced || isPausedByUser || isHovered || isTouching || document.hidden) return;
    autoplayTimer = setTimeout(() => {
      next();
    }, slideDelay);
  }

  function startAutoplay() {
    scheduleNext();
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }
  }

  // Hover pause on desktop
  container.addEventListener('mouseenter', () => {
    isHovered = true;
    stopAutoplay();
  });
  container.addEventListener('mouseleave', () => {
    isHovered = false;
    startAutoplay();
  });

  // Pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  // Touch swipe support on mobile
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let isSwiping = null;

  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    isTouching = true;
    stopAutoplay();
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    currentX = startX;
    isSwiping = null;
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (!isTouching || e.touches.length !== 1) return;
    currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;
    const deltaY = e.touches[0].clientY - startY;

    if (isSwiping === null) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        isSwiping = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isSwiping) {
      if (e.cancelable) e.preventDefault();
      track.style.transition = 'none';
      track.style.transform = `translate3d(calc(-${currentIdx * 100}% + ${deltaX}px), 0, 0)`;
    }
  }, { passive: false });

  viewport.addEventListener('touchend', () => {
    if (!isTouching) return;
    isTouching = false;
    const deltaX = currentX - startX;

    if (isSwiping) {
      if (deltaX < -45) {
        next();
      } else if (deltaX > 45) {
        prev();
      } else {
        goTo(currentIdx, true); // snap back
      }
    }
    startAutoplay();
  });

  viewport.addEventListener('touchcancel', () => {
    isTouching = false;
    goTo(currentIdx, true);
    startAutoplay();
  });

  // Desktop buttons
  document.getElementById('hero-prev-btn')?.addEventListener('click', () => {
    prev();
    startAutoplay();
  });
  document.getElementById('hero-next-btn')?.addEventListener('click', () => {
    next();
    startAutoplay();
  });

  // Dots navigation
  document.querySelectorAll('.hero__dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      const dotIdx = parseInt(dot.dataset.dot, 10);
      goTo(dotIdx + 1, true);
      startAutoplay();
    });
  });

  // Toggle Pause/Play
  const toggleBtn = document.getElementById('hero-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isPausedByUser = !isPausedByUser;
      toggleBtn.setAttribute('aria-label', isPausedByUser ? 'Play slide rotation' : 'Pause slide rotation');
      toggleBtn.classList.toggle('hero__toggle-btn--paused', isPausedByUser);
      const pauseIcon = toggleBtn.querySelector('.hero__pause-icon');
      const playIcon = toggleBtn.querySelector('.hero__play-icon');
      if (pauseIcon && playIcon) {
        pauseIcon.style.display = isPausedByUser ? 'none' : 'block';
        playIcon.style.display = isPausedByUser ? 'block' : 'none';
      }
      if (isPausedByUser) stopAutoplay();
      else startAutoplay();
    });
  }

  // Keyboard accessibility
  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
      startAutoplay();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
      startAutoplay();
    }
  });

  // Start autoplay
  startAutoplay();
}
