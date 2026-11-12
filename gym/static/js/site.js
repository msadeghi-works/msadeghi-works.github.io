(function () {
  var FA = "۰۱۲۳۴۵۶۷۸۹";
  function fa(n) { return String(n).replace(/\d/g, function (d) { return FA[d]; }); }
  function en(s) { return String(s).replace(/[۰-۹]/g, function (d) { return FA.indexOf(d); }).replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }).replace(/[٫,]/g, "."); }
  function sep(n) { return fa(Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "٬")); }

  // mobile nav
  var t = document.querySelector(".nav-toggle"), nav = document.getElementById("nav");
  if (t && nav) t.addEventListener("click", function () { t.setAttribute("aria-expanded", nav.classList.toggle("open")); });

  // schedule filter: hide/show slots in place (server-side GET is the no-JS fallback)
  var sf = document.getElementById("sched-filter");
  if (sf) {
    var apply = function () {
      var type = (sf.querySelector("input[name=type]:checked") || {}).value || "";
      var coach = sf.querySelector("#coach").value;
      var shown = 0;
      document.querySelectorAll(".sched .slot").forEach(function (s) {
        var ok = (!type || s.dataset.type === type) && (!coach || s.dataset.coach === coach);
        s.classList.toggle("hide", !ok); if (ok) shown++;
      });
      document.querySelectorAll(".sched-mobile .day").forEach(function (d) {
        var any = false;
        d.querySelectorAll(".slot").forEach(function (s) {
          var ok = (!type || s.dataset.type === type) && (!coach || s.dataset.coach === coach);
          s.classList.toggle("hide", !ok); any = any || ok;
        });
        d.classList.toggle("is-empty", !any);
      });
      var c = document.querySelector("[data-count]"); if (c) c.textContent = fa(shown);
      var q = new URLSearchParams(); if (type) q.set("type", type); if (coach) q.set("coach", coach);
      history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : ""));
    };
    sf.addEventListener("change", apply);
    apply();
  }

  // BMI + calorie calculator (Mifflin-St Jeor)
  var cf = document.getElementById("calc");
  if (cf) {
    var out = function (sel, v) { var el = document.querySelector(sel); if (el) el.textContent = v; };
    var calc = function (e) {
      if (e) e.preventDefault();
      var age = parseFloat(en(cf.age.value)), h = parseFloat(en(cf.height.value)), w = parseFloat(en(cf.weight.value));
      var err = document.querySelector("[data-err]");
      if (!(age >= 12 && age <= 90 && h >= 120 && h <= 230 && w >= 30 && w <= 250)) {
        err.hidden = false; err.textContent = "سن (۱۲ تا ۹۰)، قد (۱۲۰ تا ۲۳۰ سانتی‌متر) و وزن (۳۰ تا ۲۵۰ کیلوگرم) را درست وارد کن."; return;
      }
      err.hidden = true;
      var sex = cf.querySelector("input[name=sex]:checked").value;
      var goal = parseFloat(cf.querySelector("input[name=goal]:checked").value);
      var bmi = w / Math.pow(h / 100, 2);
      var cat = bmi < 18.5 ? "کمبود وزن" : bmi < 25 ? "وزن نرمال" : bmi < 30 ? "اضافه وزن" : "چاقی";
      out("[data-bmi]", fa(bmi.toFixed(1)).replace(".", "٫"));
      out("[data-cat]", cat);
      var pos = Math.min(Math.max((bmi - 0) / 40, 0), 1) * 100;
      document.querySelector("[data-needle]").style.left = "calc(" + pos + "% - 2px)";
      var lo = 18.5 * Math.pow(h / 100, 2), hi = 24.9 * Math.pow(h / 100, 2);
      out("[data-ideal]", "محدودهٔ وزن سالم برای قد تو: " + fa(Math.round(lo)) + " تا " + fa(Math.round(hi)) + " کیلوگرم");
      var bmr = 10 * w + 6.25 * h - 5 * age + (sex === "m" ? 5 : -161);
      var tdee = bmr * parseFloat(cf.activity.value) + goal;
      out("[data-bmr]", sep(bmr) + " کالری");
      out("[data-tdee]", sep(tdee) + " کالری");
      var p = w * (goal > 0 ? 2 : 1.8), f = tdee * 0.27 / 9, c = (tdee - p * 4 - f * 9) / 4;
      out("[data-p]", sep(p)); out("[data-f]", sep(f)); out("[data-c]", sep(Math.max(c, 0)));
    };
    cf.addEventListener("submit", calc);
    cf.addEventListener("change", calc);
    calc();
  }

  // copy tracking code
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var txt = document.querySelector(b.dataset.copy).textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { b.textContent = "کپی شد"; });
    });
  });
})();
