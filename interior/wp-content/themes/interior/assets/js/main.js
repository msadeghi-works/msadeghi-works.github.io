/* Naqshkhaneh theme — vanilla JS: nav, reveal, project filter, before/after slider, estimate calculator. */
(function () {
  'use strict';
  var fa = function (s) { return String(s).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile nav
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      document.body.classList.toggle('nav-open', !open);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { toggle.click(); toggle.focus(); }
    });
  }

  // Scroll reveal
  var rev = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rev.forEach(function (el) { io.observe(el); });
  } else { rev.forEach(function (el) { el.classList.add('is-in'); }); }

  // Project filter: chips are links; with JS we filter in place and keep the URL in sync.
  var bar = document.querySelector('[data-filters]');
  var grid = document.querySelector('[data-masonry]');
  if (bar && grid) {
    var status = document.querySelector('[data-filter-status]');
    var apply = function (slug, chip, push) {
      var n = 0;
      grid.querySelectorAll('.pcard').forEach(function (c) {
        var show = slug === '*' || c.dataset.type === slug;
        c.hidden = !show; if (show) { n++; c.classList.add('is-in'); }
      });
      bar.querySelectorAll('.chip').forEach(function (x) { x.classList.toggle('is-active', x === chip); x.removeAttribute('aria-current'); });
      chip.setAttribute('aria-current', 'true');
      if (status) status.textContent = fa(n) + ' پروژه نمایش داده شد';
      if (push && history.pushState) history.pushState({ f: slug }, '', chip.href);
    };
    bar.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip'); if (!chip) return;
      e.preventDefault(); apply(chip.dataset.filter, chip, true);
    });
    window.addEventListener('popstate', function () {
      var chip = Array.prototype.find.call(bar.querySelectorAll('.chip'), function (c) { return c.href === location.href; }) || bar.querySelector('.chip');
      apply(chip.dataset.filter, chip, false);
    });
    var init = grid.dataset.initial;
    if (init) { var c0 = bar.querySelector('[data-filter="' + init + '"]'); if (c0) apply(init, c0, false); }
  }

  // Before / after slider (range input drives a CSS variable; keyboard works natively)
  document.querySelectorAll('[data-ba]').forEach(function (ba) {
    var r = ba.querySelector('.ba__range');
    var set = function () { ba.style.setProperty('--pos', r.value + '%'); };
    r.addEventListener('input', set); set();
  });

  // Estimate calculator
  var form = document.querySelector('[data-estimate]');
  if (form && window.NK) {
    var area = form.querySelector('#f-area'), rng = document.querySelector('#f-area-range'), out = document.querySelector('[data-calc-out]');
    var fmt = function (n) { return fa(Math.round(n / 1e6).toLocaleString('en-US').replace(/,/g, '٬')); };
    var calc = function () {
      var t = form.querySelector('input[name=space_type]:checked');
      var a = parseInt(area.value, 10) || 0, rate = t ? (NK.rates[t.value] || 0) : 0;
      if (!a || !rate) { out.textContent = '—'; return; }
      out.innerHTML = fmt(a * rate * 0.85) + ' تا ' + fmt(a * rate * 1.2) + ' <small>میلیون تومان</small>';
    };
    rng.addEventListener('input', function () { area.value = rng.value; calc(); });
    area.addEventListener('input', function () { rng.value = area.value; calc(); });
    form.addEventListener('change', calc); calc();
  }
})();
