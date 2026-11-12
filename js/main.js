/* Tsakos Medical Group — interactions (vanilla, no dependencies)
   Header state · mega-menus · mobile drawer · accordion · reveal · KPI counters · mobile contact bar · video lightbox */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: hairline on scroll ---------- */
  const header = $('.site-header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mega-menus (click + hover with intent delay, Esc, outside click) ---------- */
  const triggers = $$('.nav__trigger[aria-controls]');
  let closeTimer;
  const closeAll = (except) => triggers.forEach((t) => {
    if (t === except) return;
    t.setAttribute('aria-expanded', 'false');
    $('#' + t.getAttribute('aria-controls'))?.classList.remove('is-open');
  });
  const open = (t) => {
    clearTimeout(closeTimer);
    closeAll(t);
    t.setAttribute('aria-expanded', 'true');
    $('#' + t.getAttribute('aria-controls'))?.classList.add('is-open');
  };
  const scheduleClose = () => { clearTimeout(closeTimer); closeTimer = setTimeout(() => closeAll(), 180); };
  triggers.forEach((t) => {
    const panel = $('#' + t.getAttribute('aria-controls'));
    t.addEventListener('click', () => (t.getAttribute('aria-expanded') === 'true' ? closeAll() : open(t)));
    t.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover)').matches) open(t); });
    t.addEventListener('mouseleave', scheduleClose);
    panel?.addEventListener('mouseenter', () => clearTimeout(closeTimer));
    panel?.addEventListener('mouseleave', scheduleClose);
  });
  $$('.nav__trigger:not([aria-controls])').forEach((a) => a.addEventListener('mouseenter', () => closeAll()));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openT = triggers.find((t) => t.getAttribute('aria-expanded') === 'true');
    if (openT) { closeAll(); openT.focus(); }
    if (drawer?.classList.contains('is-open')) toggleDrawer(false);
    if (lightbox?.open) lightbox.close();
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.nav, .mega')) closeAll(); });

  /* ---------- Mobile drawer ---------- */
  const burger = $('.masthead__burger');
  const drawer = $('#drawer');
  const toggleDrawer = (force) => {
    const isOpen = force ?? burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Κλείσιμο μενού' : 'Άνοιγμα μενού');
    burger.querySelector('use')?.setAttribute('href', isOpen ? '#i-close' : '#i-menu');
    drawer.classList.toggle('is-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };
  burger?.addEventListener('click', () => toggleDrawer());
  drawer?.addEventListener('click', (e) => { if (e.target.closest('a[href^="#"]')) toggleDrawer(false); });

  /* ---------- Disclosure groups: drawer + accordion ---------- */
  $$('.drawer__toggle[aria-controls], .accordion__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const exp = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!exp));
      const panel = $('#' + btn.getAttribute('aria-controls'));
      if (panel) panel.hidden = exp;
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add('is-in'));

  /* ---------- KPI count-up (once) ---------- */
  const fmt = (n) => n.toLocaleString('el-GR');
  const counters = $$('[data-count]');
  const run = (el) => {
    const end = Number(el.dataset.count), suffix = el.dataset.suffix || '';
    if (reduce || document.documentElement.classList.contains('is-static')) { el.textContent = fmt(end) + suffix; return; }
    const t0 = performance.now(), dur = 1400;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(end * e)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { run(en.target); co.unobserve(en.target); }
    }), { threshold: 0.6 });
    counters.forEach((el) => co.observe(el));
  }

  /* ---------- Mobile contact bar: shows once the hero CTAs leave the screen ---------- */
  const bar = $('.mobile-bar');
  const heroCtas = $('#hero-ctas');
  if (bar) {
    if (heroCtas && 'IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => bar.classList.toggle('is-visible', !en.isIntersecting && en.boundingClientRect.top < 0))
        .observe(heroCtas);
    } else bar.classList.add('is-visible');
  }

  /* ---------- Horizontal scrollers: let the brand row be dragged with a mouse too ---------- */

  /* ---------- Video lightbox (Tsakos Clinic) ---------- */
  const lightbox = $('#video-lightbox');
  $$('[data-video-open]').forEach((b) => b.addEventListener('click', () => {
    if (!lightbox) return;
    lightbox.showModal();
    const v = lightbox.querySelector('video');
    if (v) { v.currentTime = 0; v.muted = false; v.play().catch(() => {}); }
  }));
  lightbox?.addEventListener('close', () => lightbox.querySelector('video')?.pause());
  lightbox?.querySelector('[data-video-close]')?.addEventListener('click', () => lightbox.close());
})();
