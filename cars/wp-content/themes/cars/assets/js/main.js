/* Asa Motors — vanilla JS: nav, gallery, compare (localStorage), compare table, loan calculator, small form helpers. */
(function () {
  'use strict';
  var fa = function (s) { return String(s).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); };
  var toEn = function (s) { return String(s).replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); }).replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }); };
  var money = function (n) { return fa(Math.round(n).toLocaleString('en-US').replace(/,/g, '٬')); };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Mobile nav */
  var toggle = $('.nav-toggle');
  if (toggle) toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
  });

  /* Inventory: collapsible filters on mobile, auto-submit sort */
  var ft = $('[data-filter-toggle]');
  if (ft) ft.addEventListener('click', function () {
    var open = ft.getAttribute('aria-expanded') !== 'true';
    ft.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('filters-open', open);
  });
  $$('[data-autosubmit]').forEach(function (s) { s.addEventListener('change', function () { s.form.submit(); }); });

  /* Car gallery: thumbnails swap the main image */
  var gal = $('[data-gal]');
  if (gal) {
    var main = $('[data-gal-main]', gal);
    $$('.car__thumb', gal).forEach(function (b) {
      b.addEventListener('click', function () {
        main.removeAttribute('srcset'); main.src = b.dataset.src;
        $$('.car__thumb', gal).forEach(function (x) { x.classList.toggle('is-on', x === b); });
      });
    });
  }

  /* Request buttons preselect the request type */
  $$('[data-req]').forEach(function (a) {
    a.addEventListener('click', function () {
      var r = $('[data-lead] input[name=type][value=' + a.dataset.req + ']'); if (r) r.checked = true;
      setTimeout(function () { var n = $('#l-name'); if (n) n.focus({ preventScroll: true }); }, 400);
    });
  });

  /* ---------- Compare (localStorage, max 3) ---------- */
  var KEY = 'asa_compare', MAX = 3;
  var read = function () { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  var write = function (l) { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) {} sync(); };
  var bar = $('[data-cmp-bar]');
  var toast = function (msg) {
    var t = $('.toast') || document.body.appendChild(Object.assign(document.createElement('div'), { className: 'toast', role: 'status' }));
    t.textContent = msg; t.classList.add('is-on'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('is-on'); }, 2600);
  };
  function sync() {
    var list = read(), ids = list.map(function (x) { return String(x.id); });
    $$('[data-cmp]').forEach(function (b) {
      var on = ids.indexOf(b.dataset.cmp) > -1;
      b.setAttribute('aria-pressed', String(on)); b.classList.toggle('is-on', on);
      var s = $('span', b); if (s) s.textContent = on ? 'در مقایسه' : (b.classList.contains('cmp-btn--lg') ? 'افزودن به مقایسه' : 'مقایسه');
    });
    if (!bar) return;
    var onComparePage = !!$('[data-compare]');
    bar.hidden = !list.length || onComparePage;
    document.body.classList.toggle('has-cmp-bar', !bar.hidden);
    $('[data-cmp-count]', bar).textContent = fa(list.length) + ' از ' + fa(MAX) + ' خودرو';
    $('[data-cmp-list]', bar).innerHTML = list.map(function (x) {
      return '<li><img src="' + x.thumb + '" alt="" width="64" height="43"><span>' + x.title.replace(/</g, '&lt;') + '</span></li>';
    }).join('');
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cmp]'); if (!b) return;
    var list = read(), id = b.dataset.cmp, i = list.findIndex(function (x) { return String(x.id) === id; });
    if (i > -1) list.splice(i, 1);
    else if (list.length >= MAX) { toast('حداکثر ' + fa(MAX) + ' خودرو را می‌توانید مقایسه کنید.'); return; }
    else list.push({ id: +id, title: b.dataset.title, thumb: b.dataset.thumb });
    write(list);
  });
  var clr = $('[data-cmp-clear]'); if (clr) clr.addEventListener('click', function () { write([]); });
  window.addEventListener('storage', function (e) { if (e.key === KEY) { sync(); renderTable(); } });

  /* Compare page table */
  var cmp = $('[data-compare]'), cars = {};
  if (cmp) {
    JSON.parse($('#cars-json').textContent).forEach(function (c) { cars[c.id] = c; });
    $('[data-cmp-add]').addEventListener('change', function (e) {
      var c = cars[e.target.value]; e.target.value = ''; if (!c) return;
      var list = read();
      if (list.some(function (x) { return x.id === c.id; })) return;
      if (list.length >= MAX) { toast('حداکثر ' + fa(MAX) + ' خودرو؛ ابتدا یکی را حذف کنید.'); return; }
      list.push({ id: c.id, title: c.title, thumb: c.thumb }); write(list); renderTable();
    });
    cmp.addEventListener('click', function (e) {
      var r = e.target.closest('[data-rm]'); if (!r) return;
      write(read().filter(function (x) { return String(x.id) !== r.dataset.rm; })); renderTable();
    });
  }
  function renderTable() {
    if (!cmp) return;
    var sel = read().map(function (x) { return cars[x.id]; }).filter(Boolean), box = $('[data-cmp-table]');
    if (!sel.length) { box.innerHTML = '<div class="empty"><p>هنوز خودرویی انتخاب نکرده‌اید. از فهرست بالا یا با دکمه «مقایسه» روی کارت خودروها انتخاب کنید.</p></div>'; return; }
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var best = function (key, dir) { var v = sel.map(function (c) { return c[key]; }); return dir > 0 ? Math.max.apply(null, v) : Math.min.apply(null, v); };
    var rows = [
      ['قیمت', function (c) { return money(c.price) + ' تومان'; }, 'price', -1],
      ['سال ساخت', function (c) { return fa(c.year); }, 'year', 1],
      ['کارکرد', function (c) { return c.km ? money(c.km) + ' کیلومتر' : 'صفر کیلومتر'; }, 'km', -1],
      ['برند', function (c) { return esc(c.brand); }], ['مدل / تیپ', function (c) { return esc(c.model); }],
      ['نوع بدنه', function (c) { return esc(c.body); }], ['موتور', function (c) { return fa(esc(c.engine)); }],
      ['گیربکس', function (c) { return esc(c.gearbox); }], ['سوخت', function (c) { return esc(c.fuel); }],
      ['رنگ', function (c) { return esc(c.color); }]
    ];
    var h = '<div class="tscroll" tabindex="0"><table class="ctable"><thead><tr><th scope="col"><span class="screen-reader-text">ویژگی</span></th>';
    sel.forEach(function (c) {
      h += '<th scope="col"><a href="' + esc(c.url) + '"><img src="' + esc(c.thumb) + '" alt="" loading="lazy"><span>' + esc(c.title) + '</span></a><button type="button" class="ctable__rm" data-rm="' + c.id + '" aria-label="حذف ' + esc(c.title) + ' از مقایسه">حذف</button></th>';
    });
    h += '</tr></thead><tbody>';
    rows.forEach(function (r) {
      var b = r[2] && sel.length > 1 ? best(r[2], r[3]) : null;
      h += '<tr><th scope="row">' + r[0] + '</th>';
      sel.forEach(function (c) { var win = b !== null && c[r[2]] === b; h += '<td' + (win ? ' class="is-best"' : '') + '>' + r[1](c) + (win ? ' <span class="best-tag">بهترین</span>' : '') + '</td>'; });
      h += '</tr>';
    });
    h += '</tbody></table></div>';
    if (sel.length < 2) h += '<p class="hint">برای مقایسه دست‌کم یک خودروی دیگر اضافه کنید.</p>';
    box.innerHTML = h;
  }
  sync(); renderTable();

  /* ---------- Loan calculator (equal monthly installments) ---------- */
  $$('[data-loan]').forEach(function (box) {
    var price = $('[data-ln-price]', box), down = $('[data-ln-down]', box), rate = $('[data-ln-rate]', box);
    var out = function (s, v) { $(s, box).textContent = v; };
    var calc = function () {
      var P0 = parseInt(toEn(price.value).replace(/[^\d]/g, ''), 10) || 0;
      var dp = P0 * (+down.value) / 100, P = P0 - dp;
      var n = +($('input[name=ln-months]:checked', box) || { value: 24 }).value, r = (+rate.value) / 1200;
      var m = r ? P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : P / n;
      out('[data-ln-down-out]', fa(down.value) + '٪'); out('[data-ln-rate-out]', fa(rate.value) + '٪');
      out('[data-ln-monthly]', P0 ? money(m) : '—'); out('[data-ln-downpay]', money(dp) + ' تومان');
      out('[data-ln-principal]', money(P) + ' تومان'); out('[data-ln-interest]', money(m * n - P) + ' تومان');
      out('[data-ln-total]', money(m * n + dp) + ' تومان');
    };
    price.addEventListener('input', function () {
      var raw = toEn(price.value).replace(/[^\d]/g, '');
      price.value = raw ? money(+raw) : ''; calc();
    });
    box.addEventListener('input', calc); box.addEventListener('change', calc); calc();
  });
})();
