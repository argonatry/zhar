// Точка входа: плагины, Lenis, запуск анимаций секций.
// Всё, что должно работать без GSAP (форма, закреплённая кнопка, карта), стартует первым.
import { initUi } from './ui.js';
import { initForm } from './form.js';
import { initHero } from './anim/hero.js';
import { initSparks } from './anim/sparks.js';
import { initHeadings } from './anim/headings.js';
import { initAbout } from './anim/about.js';
import { initMenu } from './anim/menu.js';
import { initGallery } from './anim/gallery.js';
import { initBooking } from './anim/booking.js';
import { initContacts } from './anim/contacts.js';

const html = document.documentElement;

function showEverything() {
  html.classList.add('reduced', 'is-ready');
}

// Полоска «температуры» сверху: заполняется по мере скролла.
function initHeat() {
  const { gsap } = window;
  gsap.fromTo('.heat__fill', { scaleX: 0 }, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
  });
  return null;
}

async function boot() {
  initUi();
  initForm();

  const { gsap, ScrollTrigger, SplitText, Lenis } = window;
  if (!gsap || !ScrollTrigger || !SplitText) {
    // CDN не загрузился — оставляем статичную страницу.
    showEverything();
    return;
  }
  clearTimeout(window.__zharFailsafe);
  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const osReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Плавный скролл — только когда анимации включены. На тач-экранах Lenis оставляет родной скролл.
  let lenis = null;
  if (!osReduce.matches && Lenis) {
    lenis = new Lenis({ autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.4 });
      history.replaceState(null, '', a.getAttribute('href'));
    });
  }

  // SplitText меряет строки — ждём шрифты, но не дольше 800 мс.
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 800))]);

  let introPlayed = false;
  const mm = gsap.matchMedia();

  mm.add(
    {
      desktop: '(min-width: 900px)',
      mobile: '(max-width: 899px)',
      reduce: '(prefers-reduced-motion: reduce)',
      fine: '(hover: hover) and (pointer: fine)',
    },
    (ctx) => {
      const c = ctx.conditions;

      if (c.reduce) {
        // Ветка reduced motion: движения нет, весь контент сразу виден.
        showEverything();
        return undefined;
      }

      html.classList.remove('reduced');
      const env = { desktop: c.desktop, mobile: c.mobile, fine: c.fine, lenis };
      const first = !introPlayed;
      introPlayed = true;

      const cleanups = [
        initHero(env, first),
        c.desktop ? initSparks() : null,   // искры — только на десктопе
        initHeat(),
        initHeadings(env),
        initAbout(env),
        initMenu(env),
        initGallery(env),
        initBooking(env),
        initContacts(env),
      ];

      return () => cleanups.forEach((fn) => fn && fn());
    },
  );

  // Картинки ленивые: после загрузки высоты меняются — пересчитываем триггеры.
  let refreshTimer;
  const queueRefresh = () => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  };
  document.querySelectorAll('img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', queueRefresh, { once: true });
  });
  window.addEventListener('load', queueRefresh, { once: true });
}

boot().catch((err) => {
  console.error(err);
  showEverything();
});
