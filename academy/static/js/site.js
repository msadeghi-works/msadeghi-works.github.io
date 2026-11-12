(function () {
  // mobile nav
  var t = document.querySelector(".nav-toggle"), nav = document.getElementById("nav");
  if (t && nav) t.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    t.setAttribute("aria-expanded", open);
  });
  // catalog filters: submit on change, debounce search
  var f = document.getElementById("filters");
  if (f) {
    f.addEventListener("change", function () { f.submit(); });
    var q = f.querySelector("#q"), timer;
    if (q) q.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(function () { f.submit(); }, 700); });
  }
  // demo login autofill
  var d = document.querySelector("[data-fill-demo]");
  if (d) d.addEventListener("click", function () {
    document.getElementById("id_username").value = "demo";
    document.getElementById("id_password").value = "demo1234";
    document.getElementById("id_password").focus();
  });
  // fake player
  var p = document.querySelector("[data-demo-play]");
  if (p) p.addEventListener("click", function () {
    var note = document.querySelector(".player-note"), bar = document.querySelector(".pb-track span");
    note.hidden = false;
    if (bar) bar.style.width = "8%";
  });
  // card number grouping (accepts Persian digits)
  var c = document.querySelector("[data-card]");
  if (c) c.addEventListener("input", function () {
    var v = c.value.replace(/[۰-۹]/g, function (x) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(x); }).replace(/\D/g, "").slice(0, 16);
    c.value = v.replace(/(\d{4})(?=\d)/g, "$1 ");
  });
})();
