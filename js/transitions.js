/* G Connect Solutions — Barba.js page transitions
   "Signal wipe": a marigold disc expands from the clicked link to cover
   the viewport (the "on-air" moment), the next page fades up beneath it,
   then the disc contracts away — literalising the brand's connect motif. */

(function () {
  if (typeof barba === 'undefined') return;

  const overlay = document.getElementById('signal-transition');
  const disc = overlay ? overlay.querySelector('.disc') : null;

  function coverScreen(fromX, fromY) {
    return new Promise((resolve) => {
      if (!overlay) return resolve();
      overlay.style.display = 'flex';
      gsap.set(disc, { xPercent: -50, yPercent: -50, left: fromX, top: fromY, scale: 0 });
      gsap.to(disc, {
        scale: 60, duration: 0.65, ease: 'power3.inOut',
        onComplete: resolve
      });
    });
  }

  function revealScreen() {
    return new Promise((resolve) => {
      if (!overlay) return resolve();
      gsap.to(disc, {
        scale: 0, duration: 0.55, delay: 0.15, ease: 'power3.inOut',
        onComplete: () => { overlay.style.display = 'none'; resolve(); }
      });
    });
  }

  let clickX = window.innerWidth / 2, clickY = 60;
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (link && link.href && link.hostname === window.location.hostname) {
      clickX = e.clientX; clickY = e.clientY;
    }
  });

  barba.init({
    transitions: [{
      name: 'signal-wipe',
      async leave(data) {
        if (window.GC) GC.killAll();
        if (window.GCHero) GCHero.unmount();
        await coverScreen(clickX, clickY);
        data.current.container.remove();
      },
      enter(data) {
        const hash = window.location.hash;
        if (hash) {
          const target = document.querySelector(hash);
          if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });
          else window.scrollTo(0, 0);
        } else {
          window.scrollTo(0, 0);
        }
        gsap.set(data.next.container, { opacity: 1 });
        revealScreen();
      },
      after() {
        document.body.classList.remove('nav-open');
        if (window.GC) GC.init();
        const canvas = document.getElementById('hero-canvas');
        if (canvas && window.GCHero) GCHero.mount('hero-canvas');
      }
    }]
  });

  barba.hooks.beforeEnter(() => {
    // update active nav state
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === window.location.pathname.split('/').pop());
    });
  });
})();
