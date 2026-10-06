/* ============================================================
   Floracion Curated · The Kitchen Edit
   Static site JavaScript
   - GSAP + ScrollTrigger (CDN)
   - Smooth scroll (Lenis)
   - Premium micro-interactions
   ============================================================ */

(function () {
  'use strict';

  // ============================================================
  // Config
  // ============================================================
  var WHATSAPP_NUMBER = '27735991166';
  var WHATSAPP_MSG = encodeURIComponent(
    "Hi Floracion! I'd love to enquire about a piece from The Kitchen Edit — could you let me know availability for collection in Douglasdale?"
  );
  var WHATSAPP_LINK = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + WHATSAPP_MSG;

  // ============================================================
  // Helpers
  // ============================================================
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function isReduced() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function isCoarse() { return window.matchMedia && (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, n) { return (1 - n) * a + n * b; }

  // ============================================================
  // Wire up WhatsApp links + footer year (runs immediately)
  // ============================================================
  var links = [
    document.getElementById('whatsapp-link-nav'),
    document.getElementById('whatsapp-link-hero'),
    document.getElementById('whatsapp-link-contact')
  ];
  links.forEach(function (a) { if (a) a.href = WHATSAPP_LINK; });
  $$('.whatsapp-cta').forEach(function (a) { a.href = WHATSAPP_LINK; });

  // Show / hide the nav WhatsApp button responsively (it's wrapped in a span
  // for the magnetic effect, so we toggle the wrapper, not the link).
  var navWrap = document.getElementById('whatsapp-link-nav-wrap');
  if (navWrap) {
    var mq = window.matchMedia('(min-width: 768px)');
    function syncNav() { navWrap.style.display = mq.matches ? 'inline-block' : 'none'; }
    syncNav();
    if (mq.addEventListener) mq.addEventListener('change', syncNav);
    else if (mq.addListener) mq.addListener(syncNav);
  }

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ============================================================
  // Smooth scroll via Lenis (CDN)
  // Falls back gracefully if it fails to load.
  // ============================================================
  var lenis = null;
  function initLenis() {
    if (typeof Lenis === 'undefined') return null;
    var lenisInstance = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, // expoOut
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });

    // Hook into GSAP ticker so ScrollTrigger stays in sync
    if (typeof gsap !== 'undefined') {
      lenisInstance.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenisInstance.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) { lenisInstance.raf(time); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
    }

    // Mark root for CSS hooks
    document.documentElement.classList.add('lenis', 'lenis-smooth');

    // Re-route in-page anchor links through Lenis so they glide
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id === '#') return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenisInstance.scrollTo(target, { offset: -80, duration: 1.4 });
      });
    });

    return lenisInstance;
  }

  // ============================================================
  // Hero: split text into reveal-lines
  // ============================================================
  $$('[data-split-line]').forEach(function (line) {
    var text = line.getAttribute('data-split-line') || line.textContent;
    line.textContent = '';
    line.classList.add('reveal-line');
    text.split(' ').forEach(function (word) {
      var wrap = document.createElement('span');
      wrap.style.display = 'inline-block';
      wrap.style.overflow = 'hidden';
      wrap.style.verticalAlign = 'bottom';
      wrap.style.marginRight = '0.25em';
      var inner = document.createElement('span');
      inner.style.display = 'inline-block';
      inner.textContent = word + '\u00A0';
      wrap.appendChild(inner);
      line.appendChild(wrap);
    });
  });

  // ============================================================
  // Marquee
  // ============================================================
  var marqueeItems = [
    'Hand-picked by Floracion',
    'Oven-to-table',
    'Slow Sundays',
    'Cream White Stoneware',
    'Design-led essentials',
    'Douglasdale collection'
  ];
  var track = document.getElementById('marquee-track');
  if (track) {
    var html = '';
    marqueeItems.concat(marqueeItems, marqueeItems).forEach(function (item) {
      html +=
        '<div class="marquee-item">' +
          '<span class="text">' + item + '</span>' +
          '<span class="dot">✦</span>' +
        '</div>';
    });
    track.innerHTML = html;
  }

  // ============================================================
  // GSAP animations
  // ============================================================
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // ----------------------------------------------------------
    // Hero timeline
    // ----------------------------------------------------------
    var hero = $('#top');
    if (hero) {
      var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.from('.eyebrow', { y: 24, opacity: 0, duration: 1 }, 0)
        .from('.hero h1 .reveal-line > span', { yPercent: 110, duration: 1.4, stagger: 0.12 }, '-=0.7')
        .from('.hero-sub', { y: 20, opacity: 0, duration: 1 }, '-=0.9')
        .from('.hero-cta-row > *', { y: 20, opacity: 0, duration: 0.9, stagger: 0.1 }, '-=0.7')
        .from('.hero-image-wrap', { scale: 1.08, opacity: 0, duration: 1.8, ease: 'power3.out' }, '-=1.6')
        .from('.hero-meta > *', { y: 18, opacity: 0, duration: 0.9, stagger: 0.08 }, '-=1.2');

      gsap.to('.hero-image-wrap img', {
        yPercent: 12, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
      });
      gsap.to('.hero-floating-card', {
        yPercent: -25, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    // ----------------------------------------------------------
    // Brand showcase (SMEG mark)
    // ----------------------------------------------------------
    var brandMark = $('#brand-mark');
    if (brandMark) {
      gsap.from(brandMark, {
        scale: 0.6, opacity: 0, duration: 1.2, ease: 'expo.out',
        scrollTrigger: { trigger: '#brand', start: 'top 78%' }
      });
      gsap.to(brandMark, {
        scale: 1.04, duration: 2.6, ease: 'sine.inOut',
        yoyo: true, repeat: -1, delay: 1.6
      });
      gsap.from('#brand .eyebrow, #brand .primary, #brand .secondary, #brand .brand-word', {
        y: 24, opacity: 0, duration: 1, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: '#brand', start: 'top 75%' }
      });

      // Parallax halo behind the mark
      var halo = brandMark.parentElement;
      if (halo) {
        gsap.to(halo, {
          yPercent: -15, ease: 'none',
          scrollTrigger: { trigger: '#brand', start: 'top bottom', end: 'bottom top', scrub: true }
        });
      }
    }

    // ----------------------------------------------------------
    // Collection section header
    // ----------------------------------------------------------
    var colHead = $('#collection-head');
    if (colHead) {
      gsap.from(colHead, {
        y: 40, opacity: 0, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: colHead, start: 'top 80%' }
      });
    }

    // ----------------------------------------------------------
    // Each product card
    // ----------------------------------------------------------
    $$('[data-product]').forEach(function (card) {
      var fadeEls = $$('.eyebrow, h3, .desc, ul li, .product-foot', card);
      gsap.from(fadeEls, {
        y: 40, opacity: 0, duration: 1.1, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 78%' }
      });
      var imgWrap = card.querySelector('[data-img-wrap]');
      if (imgWrap) {
        gsap.fromTo(
          imgWrap,
          { clipPath: 'inset(100% 0 0 0)' },
          {
            clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'expo.out',
            scrollTrigger: { trigger: card, start: 'top 75%' }
          }
        );
      }
    });

    // ----------------------------------------------------------
    // Story section (with letter-by-letter headline reveal)
    // ----------------------------------------------------------
    var story = $('#story');
    if (story) {
      gsap.from($$('#story .eyebrow, #story p, #story .story-stats .stat'), {
        y: 50, opacity: 0, duration: 1.2, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: story, start: 'top 75%' }
      });

      var storyImg = $('.story-img-wrap');
      if (storyImg) {
        gsap.to(storyImg, {
          yPercent: -10, ease: 'none',
          scrollTrigger: { trigger: story, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      }
    }

    // ----------------------------------------------------------
    // Details spec rows
    // ----------------------------------------------------------
    var specTable = $('#spec-table');
    if (specTable) {
      gsap.from($$('.spec-row', specTable), {
        y: 30, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: specTable, start: 'top 80%' }
      });
    }

    // ----------------------------------------------------------
    // Contact section
    // ----------------------------------------------------------
    var contact = $('#contact');
    if (contact) {
      gsap.from($$('.contact-inner > *'), {
        y: 40, opacity: 0, duration: 1.1, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: contact, start: 'top 80%' }
      });
    }

    // ----------------------------------------------------------
    // Section pin bg fade — adds subtle motion as you scroll
    // ----------------------------------------------------------
    $$('section').forEach(function (sec) {
      gsap.fromTo(sec, { backgroundPositionY: '0%' }, {
        backgroundPositionY: '20%',
        ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    ScrollTrigger.refresh();
  }

  // ============================================================
  // Letter-by-letter reveal (used by script for editorial feel)
  // ============================================================
  function letterReveal(el) {
    if (!el || isReduced()) return;
    var text = el.textContent;
    el.textContent = '';
    el.classList.add('letter-reveal');
    var chars = text.split('');
    chars.forEach(function (ch, i) {
      var span = document.createElement('span');
      span.className = 'ltr';
      span.style.transitionDelay = (i * 22) + 'ms';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      el.appendChild(span);
    });
    // Trigger on scroll into view
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          el.classList.add('is-revealed');
          observer.disconnect();
        }
      });
    }, { threshold: 0.4 });
    observer.observe(el);
    // Make letters animate in via class transition
    setTimeout(function () {
      var css = document.createElement('style');
      css.textContent =
        '.letter-reveal.is-revealed .ltr { transform: translateY(0); opacity: 1; ' +
        'transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.9s ease; }';
      document.head.appendChild(css);
    }, 50);
  }

  // Apply letter reveal to the Story headline
  letterReveal(document.querySelector('#story h2'));

  // ============================================================
  // Magnetic CTAs (cursor pull effect)
  // ============================================================
  function initMagnetic() {
    if (isCoarse() || isReduced()) return;

    $$('[data-magnetic]').forEach(function (el) {
      var strength = parseFloat(el.getAttribute('data-magnetic')) || 0.35;
      var rect, raf, targetX = 0, targetY = 0, currentX = 0, currentY = 0;

      function update() {
        currentX = lerp(currentX, targetX, 0.18);
        currentY = lerp(currentY, targetY, 0.18);
        el.style.transform = 'translate3d(' + currentX.toFixed(2) + 'px,' + currentY.toFixed(2) + 'px, 0)';
        if (Math.abs(currentX - targetX) > 0.05 || Math.abs(currentY - targetY) > 0.05) {
          raf = requestAnimationFrame(update);
        } else {
          raf = null;
        }
      }

      el.addEventListener('mouseenter', function () {
        rect = el.getBoundingClientRect();
      });
      el.addEventListener('mousemove', function (e) {
        if (!rect) rect = el.getBoundingClientRect();
        targetX = (e.clientX - (rect.left + rect.width / 2)) * strength;
        targetY = (e.clientY - (rect.top + rect.height / 2)) * strength;
        if (!raf) raf = requestAnimationFrame(update);
      });
      el.addEventListener('mouseleave', function () {
        targetX = 0; targetY = 0;
        if (!raf) raf = requestAnimationFrame(update);
        rect = null;
      });
    });
  }

  // Apply magnetic to hero + contact CTAs and nav links
  initMagnetic();

  // ============================================================
  // 3D Tilt on product & hero images
  // ============================================================
  function initTilt() {
    if (isCoarse() || isReduced()) return;

    $$('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt-max')) || 6; // degrees
      var targetX = 0, targetY = 0, currentX = 0, currentY = 0, raf;
      var rect;

      // Inject glare overlay
      var glare = document.createElement('div');
      glare.className = 'tilt-glare';
      el.appendChild(glare);

      function update() {
        currentX = lerp(currentX, targetX, 0.12);
        currentY = lerp(currentY, targetY, 0.12);
        el.style.transform =
          'perspective(900px) rotateX(' + currentY.toFixed(2) +
          'deg) rotateY(' + currentX.toFixed(2) + 'deg)';
        if (Math.abs(currentX - targetX) > 0.02 || Math.abs(currentY - targetY) > 0.02) {
          raf = requestAnimationFrame(update);
        } else {
          raf = null;
        }
      }

      el.addEventListener('mouseenter', function () {
        rect = el.getBoundingClientRect();
        el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        if (cursor) cursor.classList.add('is-hover');
      });
      el.addEventListener('mousemove', function (e) {
        if (!rect) rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;   // 0..1
        var py = (e.clientY - rect.top) / rect.height;
        targetX = (px - 0.5) * max * 2;
        targetY = -(py - 0.5) * max * 2;
        // Move the glare highlight
        glare.style.setProperty('--mx', (px * 100) + '%');
        glare.style.setProperty('--my', (py * 100) + '%');
        if (!raf) raf = requestAnimationFrame(update);
      });
      el.addEventListener('mouseleave', function () {
        targetX = 0; targetY = 0;
        if (!raf) raf = requestAnimationFrame(update);
        if (cursor) cursor.classList.remove('is-hover');
        setTimeout(function () { rect = null; }, 400);
      });
    });
  }

  // ============================================================
  // Cursor follower (desktop only)
  // ============================================================
  var cursor = null;
  function initCursor() {
    if (isCoarse()) return;
    cursor = document.createElement('div');
    cursor.className = 'cursor-follower';
    document.body.appendChild(cursor);

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var curX = mouseX, curY = mouseY, raf;

    function loop() {
      curX = lerp(curX, mouseX, 0.18);
      curY = lerp(curY, mouseY, 0.18);
      cursor.style.transform = 'translate3d(' + curX + 'px,' + curY + 'px, 0) translate(-50%, -50%)';
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX; mouseY = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

    // Hover state for interactive elements
    $$('a, button, [data-tilt], [data-magnetic]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { if (cursor) cursor.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { if (cursor) cursor.classList.remove('is-hover'); });
    });

    // Hide cursor when leaving the window
    document.addEventListener('mouseleave', function () { if (cursor) cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', function () { if (cursor) cursor.style.opacity = '1'; });
  }

  initCursor();
  initTilt();

  // ============================================================
  // Button press ripple (tactile feedback)
  // ============================================================
  function initRipple() {
    $$('.btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        if (isReduced()) return;
        var rect = btn.getBoundingClientRect();
        var ripple = document.createElement('span');
        ripple.className = 'ripple';
        var size = Math.max(rect.width, rect.height);
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top = (e.clientY - rect.top) + 'px';
        btn.appendChild(ripple);
        setTimeout(function () { ripple.remove(); }, 700);
      });
    });
  }
  initRipple();

  // ============================================================
  // IntersectionObserver-based reveal for any element with .will-reveal
  // (additional safety net so non-GSAP environments still get fade-ins)
  // ============================================================
  function initRevealFallback() {
    if (typeof IntersectionObserver === 'undefined') return;
    var els = $$('.will-reveal');
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach(function (el) { io.observe(el); });
  }
  initRevealFallback();

  // ============================================================
  // Boot order: wait for GSAP & Lenis
  // ============================================================
  var tries = 0;
  var bootInterval = setInterval(function () {
    tries++;
    var gsapReady = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    var lenisReady = typeof Lenis !== 'undefined';
    if (gsapReady && lenisReady) {
      clearInterval(bootInterval);
      lenis = initLenis();
      initGSAP();
    } else if (gsapReady) {
      // Lenis not loaded — use native smooth scroll fallback
      clearInterval(bootInterval);
      initGSAP();
    } else if (tries > 40) {
      clearInterval(bootInterval);
    }
  }, 120);

})();
