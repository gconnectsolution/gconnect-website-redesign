/* G Connect Solutions — main interaction layer
   Re-initializable so it survives Barba.js page swaps without leaking
   ticker callbacks, rAF loops or listeners between navigations. */

window.GC = (function () {

  let lenis = null;
  let tickerFns = [];      // gsap.ticker callbacks registered this "session"
  let rafIds = [];         // requestAnimationFrame ids to cancel on teardown
  let winListeners = [];   // [target, type, fn, opts] added this session

  function addTicker(fn) { gsap.ticker.add(fn); tickerFns.push(fn); }
  function addWinListener(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    winListeners.push([target, type, fn, opts]);
  }

  function initLenis() {
    if (window.innerWidth < 900) return null; // let mobile use native scroll (better perf/feel)
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
    addTicker((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    return lenis;
  }

  function initCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring || window.matchMedia('(hover: none)').matches) return;
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    };
    addWinListener(window, 'mousemove', onMove);

    function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      rafIds.push(requestAnimationFrame(loop));
    }
    rafIds.push(requestAnimationFrame(loop));

    document.querySelectorAll('a, button, .cursor-hover').forEach(el => {
      const enter = () => ring.classList.add('hover');
      const leave = () => ring.classList.remove('hover');
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
      winListeners.push([el, 'mouseenter', enter]);
      winListeners.push([el, 'mouseleave', leave]);
    });
  }

  function initNavScrollState() {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;
    ScrollTrigger.create({
      start: 'top -60',
      end: 99999,
      onUpdate: (self) => {
        nav.classList.toggle('scrolled', self.scroll() > 60);
      }
    });
  }

  function initMobileMenu() {
    const burger = document.querySelector('.burger');
    if (!burger) return;
    const toggle = () => document.body.classList.toggle('nav-open');
    burger.addEventListener('click', toggle);
    winListeners.push([burger, 'click', toggle]);
    document.querySelectorAll('.mobile-menu a').forEach(a => {
      const close = () => document.body.classList.remove('nav-open');
      a.addEventListener('click', close);
      winListeners.push([a, 'click', close]);
    });
  }

  function initCounters() {
    document.querySelectorAll('.counter').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const numEl = el.querySelector('.number');
      const obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target, duration: 1.8, ease: 'power2.out',
            onUpdate: () => { numEl.textContent = Math.floor(obj.val); }
          });
        }
      });
    });
  }

  function initMarquees() {
    document.querySelectorAll('[data-marquee]').forEach(track => {
      if (!track.dataset.doubled) {
        track.innerHTML += track.innerHTML;
        track.dataset.doubled = '1';
      }
      const speed = parseFloat(track.dataset.speed || '40');
      let x = 0;
      const fn = () => {
        x -= speed / 60;
        const half = track.scrollWidth / 2;
        if (Math.abs(x) >= half) x = 0;
        track.style.transform = `translateX(${x}px)`;
      };
      addTicker(fn);
    });
  }

  function initDragScroll() {
    document.querySelectorAll('[data-drag-scroll]').forEach(wrap => {
      let isDown = false, startX, scrollLeft;
      const down = (e) => {
        isDown = true; wrap.style.cursor = 'grabbing';
        startX = e.pageX - wrap.offsetLeft; scrollLeft = wrap.scrollLeft;
      };
      const up = () => { isDown = false; wrap.style.cursor = 'grab'; };
      const move = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - wrap.offsetLeft;
        wrap.scrollLeft = scrollLeft - (x - startX) * 1.4;
      };
      wrap.addEventListener('mousedown', down);
      wrap.addEventListener('mouseleave', up);
      wrap.addEventListener('mouseup', up);
      wrap.addEventListener('mousemove', move);
      winListeners.push([wrap,'mousedown',down],[wrap,'mouseleave',up],[wrap,'mouseup',up],[wrap,'mousemove',move]);
    });
  }

  function splitHeadline(el) {
    if (el.dataset.split) return;
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span class="line"><span>${w}</span></span>`).join(' ');
    el.dataset.split = '1';
  }

  function initReveals() {
    document.querySelectorAll('[data-reveal-text]').forEach(el => {
      splitHeadline(el);
      gsap.set(el.querySelectorAll('.line > span'), { yPercent: 110 });
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => gsap.to(el.querySelectorAll('.line > span'), {
          yPercent: 0, duration: 1, stagger: 0.05, ease: 'power3.out'
        })
      });
    });

    document.querySelectorAll('[data-reveal="rise"]').forEach(el => {
      gsap.set(el, { y: 40, opacity: 0 });
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: () => gsap.to(el, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' })
      });
    });

    document.querySelectorAll('[data-reveal="clip"]').forEach(el => {
      gsap.set(el, { clipPath: 'inset(0 0 100% 0)' });
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: () => gsap.to(el, { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power4.out' })
      });
    });

    document.querySelectorAll('[data-reveal="rows"]').forEach(group => {
      const rows = group.querySelectorAll(':scope > *');
      gsap.set(rows, { opacity: 0, y: 24 });
      ScrollTrigger.create({
        trigger: group, start: 'top 82%', once: true,
        onEnter: () => gsap.to(rows, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power2.out' })
      });
    });

    document.querySelectorAll('[data-reveal="scale"]').forEach(el => {
      gsap.set(el, { scale: 0.92, opacity: 0 });
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: () => gsap.to(el, { scale: 1, opacity: 1, duration: 1, ease: 'power3.out' })
      });
    });
  }

  function initServiceRowThumbs() {
    document.querySelectorAll('.service-row').forEach(row => {
      const thumb = row.querySelector('.service-thumb');
      if (!thumb) return;
      const move = (e) => {
        const rect = row.getBoundingClientRect();
        gsap.to(thumb, { top: e.clientY - rect.top, duration: 0.5, ease: 'power2.out' });
      };
      row.addEventListener('mousemove', move);
      winListeners.push([row, 'mousemove', move]);
    });
  }

  function killAll() {
    ScrollTrigger.getAll().forEach(t => t.kill());
    tickerFns.forEach(fn => gsap.ticker.remove(fn));
    tickerFns = [];
    rafIds.forEach(id => cancelAnimationFrame(id));
    rafIds = [];
    winListeners.forEach(([target, type, fn, opts]) => target.removeEventListener(type, fn, opts));
    winListeners = [];
    if (lenis) { lenis.destroy(); lenis = null; }
  }

  function init() {
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }
    initLenis();
    initCursor();
    initNavScrollState();
    initMobileMenu();
    initCounters();
    initMarquees();
    initDragScroll();
    initReveals();
    initServiceRowThumbs();
    ScrollTrigger.refresh();
  }

  return { init, killAll, getLenis: () => lenis };
})();

document.addEventListener('DOMContentLoaded', () => {
  GC.init();
  if (document.getElementById('hero-canvas') && window.GCHero) {
    GCHero.mount('hero-canvas');
  }
});
