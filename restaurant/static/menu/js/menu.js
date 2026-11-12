// Digital menu: AJAX add/remove (falls back to normal form POST) and sticky tab highlighting.
(function () {
  var FA = "۰۱۲۳۴۵۶۷۸۹";
  function fa(n) { return String(n).replace(/\d/g, function (d) { return FA[d]; }); }

  document.querySelectorAll("form[data-add]").forEach(function (form) {
    form.addEventListener("click", function (e) {
      var btn = e.target.closest("button[name=d]");
      if (!btn || !window.fetch) return;
      e.preventDefault();
      var data = new FormData(form);
      data.append("d", btn.value);
      fetch(form.action, { method: "POST", body: data, headers: { "X-Requested-With": "fetch" }, credentials: "same-origin" })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j.ok) { alert(j.msg); return; }
          var on = j.qty > 0;
          form.querySelector(".q-n").textContent = fa(j.qty);
          form.querySelector(".q-n").hidden = !on;
          form.querySelector(".q-minus").hidden = !on;
          form.classList.toggle("on", on);
          document.querySelectorAll("[data-cart-count]").forEach(function (el) { el.textContent = fa(j.count); });
          document.querySelectorAll("[data-cart-total]").forEach(function (el) { el.textContent = j.total; });
          var bar = document.querySelector("[data-cartbar]");
          if (bar) bar.classList.toggle("is-empty", j.count === 0);
        })
        .catch(function () { form.submit(); });
    });
  });
  document.querySelectorAll("form[data-add]").forEach(function (f) {
    if (!f.querySelector(".q-n").hidden) f.classList.add("on");
  });

  // Highlight the tab of the section in view and keep it visible in the horizontal tab bar.
  var tabs = {}, row = document.querySelector(".tabs-row");
  document.querySelectorAll("[data-tab]").forEach(function (a) { tabs[a.dataset.tab] = a; });
  if (!("IntersectionObserver" in window) || !row) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      Object.values(tabs).forEach(function (a) { a.removeAttribute("aria-current"); });
      var a = tabs[en.target.id];
      if (!a) return;
      a.setAttribute("aria-current", "true");
      var target = a.offsetLeft - (row.clientWidth - a.offsetWidth) / 2;
      row.scrollTo({ left: target, behavior: "smooth" });
    });
  }, { rootMargin: "-130px 0px -60% 0px" });
  document.querySelectorAll(".mcat").forEach(function (s) { io.observe(s); });
})();
