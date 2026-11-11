// Форма брони. Бэкенда нет: данные никуда не отправляются и не сохраняются,
// после проверки показываем сообщение «Ми передзвонимо».

function todayIso() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function setError(input, errorEl, on) {
  if (!errorEl) return;
  errorEl.hidden = !on;
  if (on) {
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errorEl.id);
  } else {
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }
}

export function initForm() {
  const form = document.getElementById('booking-form');
  const done = document.getElementById('booking-done');
  if (!form || !done) return;

  const name = form.elements.name;
  const phone = form.elements.phone;
  const date = form.elements.date;
  const time = form.elements.time;
  const errors = {
    name: document.getElementById('e-name'),
    phone: document.getElementById('e-phone'),
    date: document.getElementById('e-date'),
  };

  const today = todayIso();
  date.min = today;
  if (!date.value) date.value = today;

  const checks = {
    name: () => name.value.trim().length >= 2,
    phone: () => phone.value.replace(/\D/g, '').length >= 10,
    date: () => Boolean(date.value) && date.value >= today,
  };
  const fields = { name, phone, date };

  // Ошибка исчезает, как только поле исправили
  Object.keys(fields).forEach((key) => {
    fields[key].addEventListener('input', () => {
      if (!errors[key].hidden && checks[key]()) setError(fields[key], errors[key], false);
    });
  });

  const refresh = () => {
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let firstBad = null;
    Object.keys(fields).forEach((key) => {
      const ok = checks[key]();
      setError(fields[key], errors[key], !ok);
      if (!ok && !firstBad) firstBad = fields[key];
    });
    if (firstBad) {
      firstBad.focus();
      return;
    }

    const when = new Date(`${date.value}T00:00`).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
    document.getElementById('done-name').textContent = `, ${name.value.trim()}`;
    document.getElementById('done-details').textContent = ` на ${when} о ${time.value}`;

    form.hidden = true;
    done.hidden = false;
    done.focus({ preventScroll: true });
    refresh();
  });

  document.getElementById('booking-again').addEventListener('click', () => {
    done.hidden = true;
    form.hidden = false;
    name.focus({ preventScroll: true });
    refresh();
  });
}
