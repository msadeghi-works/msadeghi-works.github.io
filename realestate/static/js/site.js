(function () {
  var FA = "۰۱۲۳۴۵۶۷۸۹";
  function fa(n) { return String(n).replace(/\d/g, function (d) { return FA[d]; }); }

  var t = document.querySelector(".nav-toggle"), nav = document.getElementById("nav");
  if (t && nav) t.addEventListener("click", function () { t.setAttribute("aria-expanded", nav.classList.toggle("open")); });

  // collapse filter panel on small screens
  var fw = document.querySelector(".filters-wrap");
  if (fw && window.matchMedia("(max-width:900px)").matches && !location.search) fw.removeAttribute("open");

  // district options follow the selected city
  var city = document.querySelector("#f-city"), dist = document.querySelector("[data-district-select]");
  function syncDistricts() {
    if (!city || !dist) return;
    var c = city.value;
    Array.prototype.forEach.call(dist.options, function (o) {
      if (!o.value) return;
      var show = !c || o.dataset.city === c;
      o.hidden = !show; o.disabled = !show;
      if (!show && o.selected) dist.value = "";
    });
  }
  if (city) { city.addEventListener("change", syncDistricts); syncDistricts(); }

  // gallery
  var main = document.querySelector("[data-g-main]"), cap = document.querySelector("[data-g-cap]");
  document.querySelectorAll(".g-th").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".g-th").forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active");
      main.style.opacity = 0;
      setTimeout(function () { main.src = b.dataset.src; cap.textContent = b.dataset.cap || ""; main.style.opacity = 1; }, 150);
    });
  });

  // favorites without page reload (form POST still works without JS)
  document.querySelectorAll(".fav-form").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      fetch(f.action, { method: "POST", body: new FormData(f), headers: { "x-requested-with": "fetch" }, credentials: "same-origin" })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          var b = f.querySelector("button"), use = b.querySelector("use");
          b.classList.toggle("on", d.added);
          b.setAttribute("aria-pressed", d.added);
          use.setAttribute("href", d.added ? "#i-heart-f" : "#i-heart");
          var l = b.querySelector("[data-fav-label]"); if (l) l.textContent = d.added ? "نشان شده" : "نشان کردن";
          document.querySelectorAll("[data-fav-count]").forEach(function (c) { c.textContent = fa(d.count); });
        })
        .catch(function () { f.submit(); });
    });
  });
})();
