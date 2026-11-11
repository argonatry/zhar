// Контакты: строки выезжают сбоку по очереди, карта раскрывается шторкой слева направо.
// Футер: большое слово «ЖАР» поднимается к концу страницы (десктоп).
export function initContacts(env) {
  const { gsap } = window;
  const section = document.querySelector('.contacts');
  if (!section) return null;

  gsap.from(section.querySelectorAll('.contacts__row'), {
    autoAlpha: 0,
    x: -32,
    duration: 1,
    ease: 'power3.out',
    stagger: 0.12,
    scrollTrigger: { trigger: '.contacts__list', start: 'top 85%', once: true },
  });

  const frame = section.querySelector('.contacts__map iframe');
  gsap.fromTo(frame, { clipPath: 'inset(0% 100% 0% 0%)' }, {
    clipPath: 'inset(0% 0% 0% 0%)',
    duration: 1.5,
    ease: 'power4.inOut',
    clearProps: 'clipPath',
    scrollTrigger: { trigger: frame, start: 'top 85%', once: true },
  });

  if (env.desktop) {
    gsap.from('.footer__word', {
      yPercent: 35,
      ease: 'none',
      scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
  }

  return null;
}
