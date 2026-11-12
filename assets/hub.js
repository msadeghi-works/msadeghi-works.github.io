document.querySelectorAll('.filters button').forEach(btn => {
  btn.addEventListener('click', () => {
    const f = btn.dataset.f;
    document.querySelectorAll('.filters button').forEach(b => {
      b.classList.toggle('on', b === btn);
      b.setAttribute('aria-pressed', b === btn);
    });
    document.querySelectorAll('.card').forEach(c => {
      const show = f === 'all' || (f === 'en' ? c.dataset.en === '1' : c.dataset.kind === f);
      c.hidden = !show;
    });
  });
});
