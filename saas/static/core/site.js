(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // mobile nav (marketing header + app sidebar)
  $$(".nav-btn").forEach(function (btn) {
    var target = document.getElementById(btn.getAttribute("aria-controls"));
    btn.addEventListener("click", function () {
      var open = target.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  // pricing: monthly / yearly toggle
  $$(".billing-toggle").forEach(function (group) {
    var scope = group.parentElement;
    $$(".bt", group).forEach(function (b) {
      b.addEventListener("click", function () {
        var period = b.dataset.period;
        $$(".bt", group).forEach(function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
        $$(".price b", scope).forEach(function (el) { el.textContent = el.dataset[period]; });
        $$("[data-yearly-note]", scope).forEach(function (el) { el.hidden = period !== "yearly"; });
      });
    });
  });

  // login page: fill demo credentials
  var demoBtn = $("[data-demo-email]");
  if (demoBtn) demoBtn.addEventListener("click", function () {
    $("#id_username").value = demoBtn.dataset.demoEmail;
    $("#id_password").value = demoBtn.dataset.demoPass;
    $("form.form button[type=submit]").focus();
  });

  $$("[data-print]").forEach(function (b) { b.addEventListener("click", function () { window.print(); }); });
  $$("[data-confirm]").forEach(function (b) {
    b.addEventListener("click", function (e) { if (!confirm(b.dataset.confirm)) e.preventDefault(); });
  });

  // invoice form: add lines + live totals (the server recalculates on save)
  var form = $(".inv-form");
  if (!form) return;
  var sym = form.dataset.symbol || "$";
  var fmt = function (n) { return sym + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var items = $("#items"), total = $("#id_items-TOTAL_FORMS"), tpl = $("#item-tpl");
  function num(el) { var v = parseFloat(el && el.value); return isNaN(v) ? 0 : v; }
  function recalc() {
    var sub = 0;
    $$(".item:not(.item-h)", items).forEach(function (row) {
      var del = $("input[name$=DELETE]", row), q = $("input[name$=quantity]", row), p = $("input[name$=unit_price]", row);
      var amt = num(q) * num(p);
      row.classList.toggle("removed", !!(del && del.checked));
      if (!(del && del.checked)) sub += amt;
      $(".amt", row).textContent = amt ? fmt(amt) : "–";
    });
    var tax = sub * num($("#id_tax_rate")) / 100;
    $("#t-sub").textContent = fmt(sub); $("#t-tax").textContent = fmt(tax); $("#t-total").textContent = fmt(sub + tax);
  }
  $("#add-item").addEventListener("click", function () {
    var i = parseInt(total.value, 10);
    var html = tpl.innerHTML.replace(/__prefix__/g, i);
    items.insertAdjacentHTML("beforeend", html);
    total.value = i + 1;
    $$(".item", items).pop().querySelector("input").focus();
  });
  form.addEventListener("input", recalc);
  form.addEventListener("change", recalc);
  recalc();
})();
