// Первый экран: слово «ЖАР» поднимается холодным углём и «разгорается» снизу вверх,
// следом проступает свечение и текст. На десктопе при скролле слово уплывает вверх.
export function initHero(env, first) {
  const { gsap } = window;
  const hero = document.querySelector('.hero');
  if (!hero) return null;

  const center = hero.querySelector('.hero__center');
  const word = hero.querySelector('.hero__word');
  const hot = hero.querySelector('.hero__hot');
  const glow = hero.querySelector('.hero__glow');
  const bar = hero.querySelector('.hero__bar');
  const foot = hero.querySelector('.hero__foot');
  const rest = [bar, ...foot.children];

  // Стартовые состояния ставим до снятия CSS-заглушки, чтобы ничего не мигнуло
  if (first) {
    gsap.set(word, { yPercent: 16, autoAlpha: 0 });
    gsap.set(hot, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(glow, { opacity: 0 });
    gsap.set(rest, { autoAlpha: 0, y: 18 });
  }
  document.documentElement.classList.add('is-ready');

  if (first) {
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .to(word, { yPercent: 0, autoAlpha: 1, duration: 1.2 }, 0.1)
      .to(hot, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7, ease: 'power3.inOut', clearProps: 'clipPath' }, 0.35)
      .to(glow, { opacity: 1, duration: 2.2, ease: 'power2.out' }, 0.8)
      .to(rest, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.09, clearProps: 'transform' }, 0.7);
  }

  // Параллакс при скролле — только десктоп: на телефоне первый экран просто уезжает
  if (env.desktop) {
    gsap.to(center, {
      yPercent: -18,
      scale: 1.06,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to(foot, {
      autoAlpha: 0,
      y: -50,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: '55% top', scrub: true },
    });
  }

  return null;
}
