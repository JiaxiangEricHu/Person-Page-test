/* Lightweight keyword filtering for the static project index. */
(() => {
  const form = document.querySelector('.project-search');
  if (!form) return;

  const input = form.querySelector('input');
  const clear = form.querySelector('button[type="reset"]');
  const status = form.querySelector('[role="status"]');
  const empty = document.querySelector('.project-search-empty');
  const normalize = text => text.normalize('NFKC').toLowerCase();
  const projects = [...document.querySelectorAll('#project-list > a')].map(card => ({
    card,
    text: normalize(card.dataset.search),
  }));

  function filter() {
    const terms = normalize(input.value).trim().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const {card, text} of projects) {
      const matches = terms.every(term => text.includes(term));
      card.hidden = !matches;
      if (matches) count++;
    }
    status.textContent = status.dataset.template
      .replaceAll('{count}', String(count))
      .replaceAll('{total}', String(projects.length));
    empty.hidden = count !== 0;
    clear.disabled = input.value.length === 0;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    filter();
  });
  form.addEventListener('reset', event => {
    event.preventDefault();
    input.value = '';
    filter();
    input.focus();
  });
  input.addEventListener('input', filter);
  input.addEventListener('search', filter);
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      form.reset();
    }
  });
  window.addEventListener('pageshow', filter);
  filter();
  form.hidden = false;
})();
