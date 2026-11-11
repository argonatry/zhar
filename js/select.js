// Свои выпадающие списки вместо системных (время и число гостей).
// Родной <select data-custom> остаётся в разметке и хранит значение: без JS работает он.
// Клавиатура: Enter / пробел / стрелки открывают, стрелки двигают, Enter выбирает, Esc закрывает.

let openOne = null;

function enhance(select) {
  const field = select.closest('.field');
  const label = field.querySelector('label');
  const id = select.id;
  const options = [...select.options];

  const wrap = document.createElement('div');
  wrap.className = 'select';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'select__btn';
  btn.id = `${id}-btn`;
  btn.setAttribute('role', 'combobox');
  btn.setAttribute('aria-haspopup', 'listbox');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', `${id}-list`);
  label.id = label.id || `${id}-label`;
  btn.setAttribute('aria-labelledby', `${label.id} ${id}-value`);

  const value = document.createElement('span');
  value.className = 'select__value';
  value.id = `${id}-value`;
  btn.appendChild(value);

  const list = document.createElement('ul');
  list.className = 'select__panel';
  list.id = `${id}-list`;
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-labelledby', label.id);

  const items = options.map((opt, i) => {
    const li = document.createElement('li');
    li.className = 'select__option';
    li.id = `${id}-opt-${i}`;
    li.setAttribute('role', 'option');
    li.textContent = opt.textContent;
    li.dataset.index = String(i);
    list.appendChild(li);
    return li;
  });

  let active = select.selectedIndex;

  const render = () => {
    value.textContent = options[select.selectedIndex].textContent;
    items.forEach((li, i) => li.setAttribute('aria-selected', String(i === select.selectedIndex)));
  };
  const setActive = (i) => {
    active = Math.max(0, Math.min(items.length - 1, i));
    items.forEach((li, k) => li.classList.toggle('is-active', k === active));
    btn.setAttribute('aria-activedescendant', items[active].id);
  };
  const isOpen = () => wrap.classList.contains('is-open');
  const close = () => {
    wrap.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.removeAttribute('aria-activedescendant');
    if (openOne === close) openOne = null;
  };
  const open = () => {
    if (openOne) openOne();
    openOne = close;
    wrap.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    setActive(select.selectedIndex);
    // Панель не должна уходить за край экрана (поле часто у нижней кромки на телефоне)
    const overflow = list.getBoundingClientRect().bottom + 16 - window.innerHeight;
    if (overflow > 0) {
      const smooth = !document.documentElement.classList.contains('reduced');
      window.scrollBy({ top: overflow, behavior: smooth ? 'smooth' : 'auto' });
    }
  };
  const choose = (i) => {
    select.selectedIndex = i;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    render();
    close();
  };

  btn.addEventListener('click', () => (isOpen() ? close() : open()));
  btn.addEventListener('keydown', (e) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (step) {
      e.preventDefault();
      if (!isOpen()) open(); else setActive(active + step);
    } else if (e.key === 'Home' && isOpen()) {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End' && isOpen()) {
      e.preventDefault();
      setActive(items.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen()) choose(active); else open();
    } else if (e.key === 'Escape' && isOpen()) {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      close();
    }
  });

  // mousedown не должен забирать фокус у кнопки
  list.addEventListener('mousedown', (e) => e.preventDefault());
  list.addEventListener('click', (e) => {
    const li = e.target.closest('.select__option');
    if (li) choose(Number(li.dataset.index));
  });
  list.addEventListener('pointermove', (e) => {
    const li = e.target.closest('.select__option');
    if (li) setActive(Number(li.dataset.index));
  });
  document.addEventListener('pointerdown', (e) => {
    if (isOpen() && !wrap.contains(e.target)) close();
  });

  // Клик по подписи ведёт к нашей кнопке, а не к спрятанному select
  label.removeAttribute('for');
  label.addEventListener('click', () => btn.focus());

  select.classList.add('visually-hidden');
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');

  wrap.append(btn, list);
  select.after(wrap);
  field.classList.add('field--select');
  render();
}

export function initSelects() {
  document.querySelectorAll('select[data-custom]').forEach(enhance);
}
