/* Radmanesh Photography — vanilla JS: nav, reveal, hero slideshow, lightbox (keyboard + swipe), tabs, booking form helpers. */
(function () {
  'use strict';
  var fa = function (s) { return String(s).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); };
  var pad = function (n) { return fa(n < 10 ? '0' + n : n); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header: solid after scrolling past the hero */
  var setScrolled = function () { document.body.classList.toggle('is-scrolled', window.scrollY > 40); };
  window.addEventListener('scroll', setScrolled, { passive: true }); setScrolled();

  /* Mobile nav */
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-open', open);
    });
  }

  /* Reveal on scroll */
  var rev = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    rev.forEach(function (el) { io.observe(el); });
  } else { rev.forEach(function (el) { el.classList.add('is-in'); }); }

  /* Hero crossfade slideshow */
  var hero = document.querySelector('[data-slides]');
  if (hero) {
    var slides = hero.querySelectorAll('.hero__slide'), cur = 0, num = hero.querySelector('[data-slide-n]');
    if (slides.length > 1 && !reduce) {
      setInterval(function () {
        if (document.hidden) return;
        slides[cur].classList.remove('is-on');
        cur = (cur + 1) % slides.length;
        var img = slides[cur].querySelector('img'); if (img) img.loading = 'eager';
        slides[cur].classList.add('is-on');
        if (num) num.textContent = pad(cur + 1);
      }, 5500);
    }
  }

  /* Lightbox */
  var gal = document.querySelector('[data-gallery]'), lb = document.querySelector('[data-lightbox]');
  if (gal && lb) {
    var items = Array.prototype.slice.call(gal.querySelectorAll('.gallery__item'));
    var img = lb.querySelector('.lb__img'), cap = lb.querySelector('.lb__cap'), count = lb.querySelector('.lb__count');
    var idx = 0, opener = null;
    var preload = function (i) { var a = items[(i + items.length) % items.length]; if (a) { var p = new Image(); p.src = a.href; } };
    var show = function (i) {
      idx = (i + items.length) % items.length;
      var a = items[idx];
      img.classList.remove('is-on');
      img.onload = function () { img.classList.add('is-on'); };
      img.src = a.href; img.alt = a.dataset.caption || '';
      cap.textContent = a.dataset.caption || '';
      count.textContent = fa(idx + 1) + ' / ' + fa(items.length);
      preload(idx + 1); preload(idx - 1);
    };
    var open = function (i) {
      opener = document.activeElement;
      lb.hidden = false; document.body.classList.add('lb-open');
      show(i); lb.querySelector('.lb__close').focus();
    };
    var close = function () {
      lb.hidden = true; document.body.classList.remove('lb-open'); img.src = '';
      if (opener) opener.focus();
    };
    items.forEach(function (a, i) { a.addEventListener('click', function (e) { e.preventDefault(); open(i); }); });
    lb.querySelector('.lb__close').addEventListener('click', close);
    lb.querySelector('.lb__next').addEventListener('click', function () { show(idx + 1); });
    lb.querySelector('.lb__prev').addEventListener('click', function () { show(idx - 1); });
    lb.addEventListener('click', function (e) { if (swiped) { swiped = false; return; } if (e.target === lb || e.target.classList.contains('lb__stage')) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      // RTL reading order: the left arrow moves forward.
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx + 1);
      else if (e.key === 'ArrowRight') show(idx - 1);
      else if (e.key === 'Home') show(0);
      else if (e.key === 'End') show(items.length - 1);
      else if (e.key === 'Tab') { // keep focus inside the dialog
        var f = lb.querySelectorAll('button'), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    /* Swipe: pointer events cover touch, pen and mouse drag */
    var sx = null, sy = null, swiped = false;
    img.draggable = false;
    lb.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; sx = e.clientX; sy = e.clientY; swiped = false; });
    lb.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) swiped = true;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(dx > 0 ? idx + 1 : idx - 1); // swipe right = next in RTL
      else if (dy > 90) close(); // swipe down to close
    });
  }

  /* Accessible tabs (pricing page). Without JS all panels stay visible. */
  document.querySelectorAll('[data-tabs]').forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role=tab]'));
    var select = function (t, focus) {
      tabs.forEach(function (x) {
        var on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) t.focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowLeft' ? 1 : e.key === 'ArrowRight' ? -1 : 0;
        if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
      });
    });
    var start = tabs.filter(function (t) { return location.hash === '#' + t.getAttribute('aria-controls'); })[0] || tabs[0];
    if (start) select(start);
  });

  /* Booking form: valid day count per Jalali month, past-date warning, packages filtered by genre */
  var bf = document.querySelector('[data-booking]');
  if (bf) {
    var jd = bf.querySelector('[data-jd]'), jm = bf.querySelector('[data-jm]'), jy = bf.querySelector('[data-jy]');
    var hint = bf.querySelector('[data-date-hint]'), base = hint.textContent, today = hint.dataset.today;
    var leap = function (y) { return [1, 5, 9, 13, 17, 22, 26, 30].indexOf(y % 33) > -1; };
    var dim = function (y, m) { return m <= 6 ? 31 : m <= 11 ? 30 : (leap(y) ? 30 : 29); };
    var fixDays = function () {
      var max = dim(+jy.value, +jm.value);
      Array.prototype.forEach.call(jd.options, function (o) { o.disabled = +o.value > max; o.hidden = +o.value > max; });
      if (+jd.value > max) jd.value = max;
      var key = jy.value + ('0' + jm.value).slice(-2) + ('0' + jd.value).slice(-2);
      var past = key <= today;
      hint.textContent = past ? 'این تاریخ گذشته است؛ لطفاً یک روز آینده انتخاب کنید.' : base;
      hint.classList.toggle('is-err', past);
      bf.querySelector('[type=submit]').disabled = past;
    };
    [jd, jm, jy].forEach(function (s) { s.addEventListener('change', fixDays); }); fixDays();

    var pkg = bf.querySelector('#b-pkg');
    var filterPkg = function () {
      var g = (bf.querySelector('input[name=genre]:checked') || {}).value;
      Array.prototype.forEach.call(pkg.options, function (o) {
        var hide = o.dataset.genre && o.dataset.genre !== g; o.hidden = hide; o.disabled = hide;
        if (hide && o.selected) pkg.value = '0';
      });
    };
    bf.querySelectorAll('input[name=genre]').forEach(function (r) { r.addEventListener('change', filterPkg); }); filterPkg();
  }
})();
