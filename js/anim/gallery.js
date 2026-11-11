// Галерея. Десктоп: секция закрепляется, вертикальный скролл двигает ленту горизонтально,
// фото внутри рамок слегка смещаются. Телефон: обычная лента со свайпом, кадры раскрываются один раз.
export function initGallery(env) {
  const { gsap } = window;
  const section = document.querySelector('.gallery');
  if (!section) return null;

  const track = section.querySelector('.gallery__track');
  const frames = gsap.utils.toArray('.shot__frame', section);

  if (!env.desktop) {
    gsap.from(frames.slice(0, 3), {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 1.3,
      ease: 'power4.inOut',
      stagger: 0.12,
      clearProps: 'clipPath',
      scrollTrigger: { trigger: track, start: 'top 85%', once: true },
    });
    return null;
  }

  section.classList.add('is-horizontal');
  track.scrollLeft = 0;

  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

  const scroll = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      pin: true,
      start: 'top top',
      end: () => '+=' + distance(),
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });

  frames.forEach((frame) => {
    gsap.fromTo(frame.querySelector('img'), { xPercent: -6, scale: 1.14 }, {
      xPercent: 6,
      scale: 1.14,
      ease: 'none',
      scrollTrigger: {
        trigger: frame,
        containerAnimation: scroll,
        start: 'left right',
        end: 'right left',
        scrub: true,
      },
    });
  });

  return () => section.classList.remove('is-horizontal');
}
