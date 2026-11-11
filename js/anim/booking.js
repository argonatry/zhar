// Бронь: секция «разгорается». Поверх раскалённого фона лежит угольная шторка,
// которая сгорает снизу вверх. Шторку создаёт JS — без него секция сразу видна.
export function initBooking(env) {
  const { gsap } = window;
  const section = document.querySelector('.booking');
  if (!section) return null;

  const curtain = document.createElement('div');
  curtain.className = 'booking__curtain';
  curtain.setAttribute('aria-hidden', 'true');
  section.appendChild(curtain);

  const to = { clipPath: 'inset(0% 0% 100% 0%)' };
  const from = { clipPath: 'inset(0% 0% 0% 0%)' };

  if (env.desktop) {
    // Десктоп: привязано к скроллу
    gsap.fromTo(curtain, from, {
      ...to,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top 80%', end: 'top 20%', scrub: 0.5 },
    });
  } else {
    // Телефон: один раз, без привязки к скроллу — дешевле и не дёргается
    gsap.fromTo(curtain, from, {
      ...to,
      duration: 1.2,
      ease: 'power3.inOut',
      scrollTrigger: { trigger: section, start: 'top 72%', once: true },
      onComplete: () => curtain.remove(),
    });
  }

  return () => curtain.remove();
}
