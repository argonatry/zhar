// О ресторане: текст проступает построчно, фото раскрываются шторкой.
// Параллакс внутри рамок — только на десктопе.
export function initAbout(env) {
  const { gsap, SplitText } = window;
  const section = document.querySelector('.about');
  if (!section) return null;

  // 1. Абзацы: строки мягко проявляются одна за другой
  gsap.utils.toArray('[data-lines]', section).forEach((p) => {
    SplitText.create(p, {
      type: 'lines',
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          autoAlpha: 0,
          y: 18,
          duration: 1.1,
          ease: 'power3.out',
          stagger: 0.07,
          scrollTrigger: { trigger: p, start: 'top 88%', once: true },
        });
      },
    });
  });

  // 2. Фото: шторка clip-path, картинка внутри «оседает» из увеличения
  const restScale = env.desktop ? 1.14 : 1;
  gsap.utils.toArray('[data-reveal]', section).forEach((frame, i) => {
    const img = frame.querySelector('img');
    const from = i % 2 ? 'inset(0% 100% 0% 0%)' : 'inset(100% 0% 0% 0%)';

    gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 85%', once: true } })
      .fromTo(frame, { clipPath: from }, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.5,
        ease: 'power4.inOut',
        clearProps: 'clipPath',
      })
      .fromTo(img, { scale: 1.4 }, { scale: restScale, duration: 1.8, ease: 'power3.out' }, 0);

    if (env.desktop) {
      gsap.fromTo(img, { yPercent: -5 }, {
        yPercent: 5,
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }
  });

  return null;
}
