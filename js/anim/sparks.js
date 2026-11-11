// Искры над словом «ЖАР» (canvas 2D, только десктоп).
// Останавливаются, когда первый экран не виден или вкладка в фоне.
export function initSparks() {
  const canvas = document.querySelector('.hero__sparks');
  if (!canvas) return null;
  const hero = canvas.parentElement;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const COUNT = 64;
  const parts = [];
  let w = 0;
  let h = 0;
  let raf = 0;
  let last = 0;
  let inView = true;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = hero.clientWidth;
    h = hero.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn(p, initial) {
    p.x = w * (0.1 + Math.random() * 0.8);
    p.y = initial ? h * (0.2 + Math.random() * 0.6) : h * (0.5 + Math.random() * 0.3);
    p.vx = (Math.random() - 0.5) * 12;
    p.vy = -(16 + Math.random() * 44);
    p.r = 0.6 + Math.random() * 1.5;
    p.life = initial ? Math.random() * 3 : 0;
    p.max = 3 + Math.random() * 4.5;
    p.phase = Math.random() * Math.PI * 2;
    p.color = Math.random() > 0.55 ? '255, 178, 62' : '255, 75, 31';
    return p;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (const p of parts) {
      p.life += dt;
      if (p.life > p.max || p.y < -10) spawn(p, false);
      p.x += (p.vx + Math.sin(p.phase + p.life * 1.8) * 14) * dt;
      p.y += p.vy * dt;
      const a = Math.sin((Math.PI * p.life) / p.max);
      ctx.fillStyle = `rgba(${p.color}, ${(a * 0.16).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${p.color}, ${(a * 0.95).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function play() {
    if (raf || !inView || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function pause() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  resize();
  for (let i = 0; i < COUNT; i += 1) parts.push(spawn({}, true));
  canvas.classList.add('is-on');

  const io = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) play(); else pause();
  });
  io.observe(hero);
  const onVisibility = () => (document.hidden ? pause() : play());
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('resize', resize);
  play();

  return () => {
    pause();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('resize', resize);
    canvas.classList.remove('is-on');
  };
}
