// Заголовки секций: строки тяжело поднимаются из-под маски. Один приём на все h2 — как система,
// а содержимое каждой секции анимируется по-своему.
export function initHeadings() {
  const { gsap, SplitText } = window;

  gsap.utils.toArray('[data-heading]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 105,
          duration: 1.3,
          ease: 'power4.out',
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
  });

  return null;
}
