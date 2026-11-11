// Меню: строки блюд появляются по очереди. На десктопе слева закреплено фото,
// которое меняется шторкой, когда доскролливаешь до следующей категории.
export function initMenu(env) {
  const { gsap, ScrollTrigger } = window;
  const section = document.querySelector('.menu');
  if (!section) return null;

  const cats = gsap.utils.toArray('.cat', section);

  cats.forEach((cat) => {
    gsap.timeline({ scrollTrigger: { trigger: cat, start: 'top 84%', once: true } })
      .from(cat.querySelector('.cat__title'), { autoAlpha: 0, x: -28, duration: 1, ease: 'power3.out' })
      .from(cat.querySelectorAll('.dish'), {
        autoAlpha: 0,
        y: 26,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.07,
        clearProps: 'all',   // иначе inline-transform перебьёт hover из CSS
      }, 0.1);
  });

  if (!env.desktop) return null;

  const imgs = gsap.utils.toArray('.menu__frame img', section);
  let current = Math.max(0, imgs.findIndex((img) => img.classList.contains('is-active')));

  const setActive = (i) => {
    if (i === current || !imgs[i]) return;
    imgs.forEach((img) => img.classList.remove('is-prev'));
    imgs[current].classList.remove('is-active');
    imgs[current].classList.add('is-prev');
    imgs[i].classList.remove('is-active');
    void imgs[i].offsetWidth;   // сброс, чтобы шторка проиграла заново
    imgs[i].classList.add('is-active');
    current = i;
  };

  cats.forEach((cat, i) => {
    ScrollTrigger.create({
      trigger: cat,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => { if (self.isActive) setActive(i); },
    });
  });

  return () => {
    imgs.forEach((img, i) => {
      img.classList.remove('is-prev');
      img.classList.toggle('is-active', i === 0);
    });
  };
}
