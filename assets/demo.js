/* Static-demo guard: this copy has no server, so forms, logins and admin links show a notice instead of failing. */
(function () {
  var en = document.documentElement.lang === 'en';
  var MSG = en
    ? 'This is a static demo copy. Orders, bookings, logins and the admin panel work in the full version, available on request.'
    : 'این نسخه نمایشی (ثابت) است. ثبت سفارش، رزرو، ورود و پنل مدیریت در نسخه کامل فعال است و در صورت درخواست ارائه می‌شود.';
  var BLOCK = /(\/(admin|wp-admin|wp-login\.php|cart|checkout|my-account|login|logout|signup|register|account|app|dashboard|api)(\/|$|\?))|add-to-cart|2\.188\.205\.151/;
  var t;
  function toast() {
    var el = document.getElementById('demo-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'demo-toast';
      el.setAttribute('role', 'status');
      el.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;max-width:min(92vw,560px);' +
        'background:#16171b;color:#fff;padding:14px 18px;border-radius:14px;box-shadow:0 12px 32px rgba(0,0,0,.35);' +
        'font:500 14px/1.8 Vazirmatn,Tahoma,sans-serif;text-align:center;direction:' + (en ? 'ltr' : 'rtl') + ';transition:opacity .25s;opacity:0';
      document.body.appendChild(el);
    }
    el.textContent = MSG;
    requestAnimationFrame(function () { el.style.opacity = '1'; });
    clearTimeout(t);
    t = setTimeout(function () { el.style.opacity = '0'; }, 4200);
  }
  document.addEventListener('submit', function (e) { e.preventDefault(); e.stopImmediatePropagation(); toast(); }, true);
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (BLOCK.test(h)) { e.preventDefault(); e.stopImmediatePropagation(); toast(); }
  }, true);
})();
