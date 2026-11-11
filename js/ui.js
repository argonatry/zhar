// Мелочи, которые работают без GSAP: закреплённая кнопка брони на телефоне и «включение» карты по клику.

// Кнопка видна после первого экрана и прячется, когда секция брони уже на экране или пройдена.
function initStickyCta() {
  const cta = document.getElementById('sticky-cta');
  const hero = document.querySelector('.hero');
  const booking = document.getElementById('bron');
  if (!cta || !hero || !booking) return;

  let queued = false;
  const update = () => {
    queued = false;
    const pastHero = window.scrollY > hero.offsetHeight - 24;
    const beforeBooking = booking.getBoundingClientRect().top > window.innerHeight * 0.85;
    cta.classList.toggle('is-visible', pastHero && beforeBooking);
  };
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

// Карта включается по клику, чтобы не перехватывать колесо мыши и свайпы.
function initMapGuard() {
  const map = document.querySelector('.contacts__map');
  if (!map) return;
  map.addEventListener('click', () => map.classList.add('is-active'));
  map.addEventListener('mouseleave', () => map.classList.remove('is-active'));
}

export function initUi() {
  initStickyCta();
  initMapGuard();
}
