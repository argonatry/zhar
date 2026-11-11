// Скриншоты для самопроверки: node scripts/shots.mjs [url]
// Перед запуском поднять сервер: python -m http.server 8000
// Плавно прокручивает страницу (чтобы сработали все ScrollTrigger) и по пути снимает кадры
// на ширине 375, 768 и 1440 px. Плюс: полная страница в reduced motion и без JS,
// проверка кнопки брони на первом экране, проверка формы и список ошибок консоли.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const url = process.argv[2] || 'http://localhost:8000/';
const outDir = 'shots';
const sizes = [
  { name: '375', width: 375, height: 740 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const problems = [];

async function loadLazy(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
}

for (const size of sizes) {
  // --- С анимациями: кадры по ходу скролла ---
  const ctx = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    hasTouch: size.width < 900,
    isMobile: size.width < 900,
  });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`[${size.name}] console: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`[${size.name}] pageerror: ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`[${size.name}] failed: ${r.url()}`));
  page.on('response', (r) => { if (r.status() >= 400) problems.push(`[${size.name}] ${r.status()}: ${r.url()}`); });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3200); // интро первого экрана
  await page.screenshot({ path: `${outDir}/${size.name}-00.png` });

  // Кнопка брони должна быть целиком видна на первом экране
  const btn = await page.evaluate(() => {
    const r = document.querySelector('.hero .btn').getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, vh: window.innerHeight };
  });
  if (btn.top < 0 || btn.bottom > btn.vh) problems.push(`[${size.name}] кнопка брони не на первом экране: ${JSON.stringify(btn)}`);

  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.round(size.height * 0.85);
  let n = 1;
  for (let y = step; y < total; y += step) {
    // Крутим небольшими порциями, как человек
    for (let k = 0; k < 5; k++) {
      await page.evaluate((dy) => window.scrollBy(0, dy), step / 5);
      await page.waitForTimeout(90);
    }
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${outDir}/${size.name}-${String(n).padStart(2, '0')}.png` });
    n += 1;
    if (n > 40) break;
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 1) problems.push(`[${size.name}] горизонтальный скролл: +${overflow}px`);

  // Форма: пустая отправка показывает ошибки, заполненная — сообщение «Ми передзвонимо»
  await page.evaluate(() => document.getElementById('bron').scrollIntoView());
  await page.waitForTimeout(1800);
  await page.click('#booking-form button[type="submit"]');
  await page.waitForTimeout(300);
  const errorsShown = await page.evaluate(() => !document.getElementById('e-name').hidden && !document.getElementById('e-phone').hidden);
  if (!errorsShown) problems.push(`[${size.name}] форма: пустая отправка не показала ошибки`);
  await page.screenshot({ path: `${outDir}/${size.name}-form-errors.png` });
  // Свои выпадающие списки: открыть время, снять кадр, выбрать 20:30
  await page.click('#f-time-btn');
  await page.waitForTimeout(1200);
  const cut = await page.evaluate(() => document.getElementById('f-time-list').getBoundingClientRect().bottom - window.innerHeight);
  if (cut > 1) problems.push(`[${size.name}] список времени уходит за экран на ${Math.round(cut)}px`);
  await page.screenshot({ path: `${outDir}/${size.name}-select-time.png` });
  await page.click('#f-time-list .select__option:text-is("20:30")');
  await page.click('#f-guests-btn');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${outDir}/${size.name}-select-guests.png` });
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  const picked = await page.evaluate(() => `${document.getElementById('f-time').value} / ${document.getElementById('f-guests').value}`);
  if (picked !== '20:30 / 3') problems.push(`[${size.name}] списки: выбрано «${picked}», ожидалось «20:30 / 3»`);
  await page.fill('#f-name', 'Оксана');
  await page.fill('#f-phone', '+380 44 000 00 00');
  await page.click('#booking-form button[type="submit"]');
  await page.waitForTimeout(400);
  const doneShown = await page.evaluate(() => !document.getElementById('booking-done').hidden && document.getElementById('booking-form').hidden);
  if (!doneShown) problems.push(`[${size.name}] форма: после отправки нет сообщения`);
  await page.screenshot({ path: `${outDir}/${size.name}-form-done.png` });
  await ctx.close();

  // --- Reduced motion: всё должно быть видно сразу, одной полной страницей ---
  const ctxR = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    reducedMotion: 'reduce',
  });
  const pageR = await ctxR.newPage();
  await pageR.goto(url, { waitUntil: 'networkidle' });
  await loadLazy(pageR);
  await pageR.screenshot({ path: `${outDir}/${size.name}-reduced-full.png`, fullPage: true });
  await ctxR.close();

  // --- Без JS: текст и фото должны быть видны ---
  const ctxN = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    javaScriptEnabled: false,
  });
  const pageN = await ctxN.newPage();
  await pageN.goto(url, { waitUntil: 'networkidle' });
  const broken = await pageN.evaluate(() => [...document.images].filter((i) => !i.complete || !i.naturalWidth).map((i) => i.getAttribute('src')));
  if (broken.length) problems.push(`[${size.name}] без JS не загрузились фото: ${broken.join(', ')}`);
  await pageN.screenshot({ path: `${outDir}/${size.name}-nojs-full.png`, fullPage: true });
  await ctxN.close();
}

await browser.close();

if (problems.length) {
  console.log('Проблемы:');
  for (const p of [...new Set(problems)]) console.log('  ' + p);
  process.exitCode = 1;
} else {
  console.log('Ошибок в консоли и 404 нет, горизонтального скролла нет, кнопка брони на первом экране, форма работает.');
}
console.log(`Скриншоты: ${outDir}/`);
