/* ============================================================
   Lady Boss Aesthetics — Main JS
   ============================================================ */

'use strict';

/* ── Sticky header on scroll ── */
(function initHeader() {
  const header = document.getElementById('header');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Mobile burger menu ── */
(function initBurger() {
  const burger = document.getElementById('burger');
  const nav    = document.getElementById('nav');

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on nav link click
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Mobile dropdown toggle
  nav.querySelectorAll('.nav__dropdown').forEach(dd => {
    dd.querySelector('.nav__link').addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        dd.classList.toggle('open');
      }
    });
  });
})();

/* ── Active nav link on scroll ── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav__link');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          const active = document.querySelector(`.nav__link[href="#${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach(s => observer.observe(s));
})();

/* ── Services tab switcher ── */
(function initTabs() {
  const tabs   = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;

      tabs.forEach(t   => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });

  // Support anchor links to tab sections
  const tabAnchors = ['services-face', 'services-body', 'services-injectables', 'services-wellness'];
  tabAnchors.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', () => {
      // Already handled by tab btn — just scroll to services section
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();

/* ── Before / After slider ── */
(function initBASliders() {
  document.querySelectorAll('[data-slider]').forEach(slider => {
    const after  = slider.querySelector('.ba-after');
    const handle = slider.querySelector('.ba-handle');
    let dragging = false;

    const setPosition = (x) => {
      const rect = slider.getBoundingClientRect();
      let pct = ((x - rect.left) / rect.width) * 100;
      pct = Math.max(2, Math.min(98, pct));
      after.style.clipPath  = `inset(0 ${100 - pct}% 0 0)`;
      handle.style.left     = `${pct}%`;
    };

    // Mouse
    handle.addEventListener('mousedown', (e) => { dragging = true; e.preventDefault(); });
    window.addEventListener('mousemove', (e) => { if (dragging) setPosition(e.clientX); });
    window.addEventListener('mouseup',   ()  => { dragging = false; });

    // Touch
    handle.addEventListener('touchstart', (e) => { dragging = true; e.preventDefault(); }, { passive: false });
    window.addEventListener('touchmove',  (e) => {
      if (dragging) setPosition(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchend',   ()  => { dragging = false; });
  });
})();

/* ── Testimonial carousel ── */
(function initTestimonials() {
  const track   = document.getElementById('testimonialTrack');
  const cards   = track ? Array.from(track.querySelectorAll('.testimonial-card')) : [];
  const dotsEl  = document.getElementById('testimonialDots');
  const prevBtn = document.getElementById('prevTestimonial');
  const nextBtn = document.getElementById('nextTestimonial');

  if (!cards.length) return;

  let current = 0;
  let perView = getPerView();
  let maxIdx  = Math.max(0, cards.length - perView);
  let autoTimer;

  function getPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  // Build dots
  const totalDots = () => Math.ceil(cards.length / perView);

  function buildDots() {
    dotsEl.innerHTML = '';
    for (let i = 0; i < totalDots(); i++) {
      const btn = document.createElement('button');
      btn.className = `dot-btn${i === 0 ? ' active' : ''}`;
      btn.setAttribute('aria-label', `Slide ${i + 1}`);
      btn.addEventListener('click', () => goTo(i * perView));
      dotsEl.appendChild(btn);
    }
  }

  function updateDots() {
    const dots = dotsEl.querySelectorAll('.dot-btn');
    const activeIdx = Math.round(current / perView);
    dots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxIdx));
    const cardW = cards[0].offsetWidth + 24; // gap 1.5rem ≈ 24px
    track.style.transform = `translateX(-${current * cardW}px)`;
    track.style.transition = 'transform 0.45s cubic-bezier(.4,0,.2,1)';
    updateDots();
  }

  function next() { goTo(current + 1 > maxIdx ? 0 : current + 1); }
  function prev() { goTo(current - 1 < 0 ? maxIdx : current - 1); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, 5000);
  }
  function stopAuto() { clearInterval(autoTimer); }

  prevBtn?.addEventListener('click', () => { prev(); startAuto(); });
  nextBtn?.addEventListener('click', () => { next(); startAuto(); });

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) { delta > 0 ? next() : prev(); startAuto(); }
  }, { passive: true });

  window.addEventListener('resize', () => {
    perView = getPerView();
    maxIdx  = Math.max(0, cards.length - perView);
    current = Math.min(current, maxIdx);
    buildDots();
    goTo(current);
  });

  buildDots();
  goTo(0);
  startAuto();
})();

/* ── Scroll reveal ── */
(function initScrollReveal() {
  const els = document.querySelectorAll(
    '.service-card, .team-card, .process__step, .plan-card, .testimonial-card, .result-card, .about__copy, .about__visual, .booking__copy, .booking__form-wrap'
  );

  els.forEach(el => el.setAttribute('data-reveal', ''));

  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  els.forEach(el => observer.observe(el));
})();

/* ── Booking form ── */
(function initForm() {
  const form    = document.getElementById('bookingForm');
  const success = document.getElementById('formSuccess');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#E07070';
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });

    if (!valid) return;

    // Simulate submission (replace with real endpoint)
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      form.hidden = true;
      if (success) success.hidden = false;
    }, 1200);
  });
})();

/* ── Smooth scroll for all anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
