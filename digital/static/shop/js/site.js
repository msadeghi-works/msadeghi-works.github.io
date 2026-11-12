// Gallery thumbnails, copy-to-clipboard, collapsed filters on small screens.
(function () {
  var main = document.getElementById("gmain");
  document.querySelectorAll(".thumb").forEach(function (t) {
    t.addEventListener("click", function () {
      main.src = t.dataset.src;
      document.querySelectorAll(".thumb").forEach(function (x) { x.classList.remove("is-on"); });
      t.classList.add("is-on");
    });
  });
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var text = document.querySelector(b.dataset.copy).textContent.trim();
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
        b.textContent = "کپی شد";
      }).catch(function () { b.textContent = text; });
    });
  });
  var f = document.getElementById("filters");
  if (f && window.matchMedia("(max-width: 899px)").matches) f.removeAttribute("open");
  // Accept Persian digits in money inputs before submit.
  document.querySelectorAll("[data-money]").forEach(function (i) {
    i.form.addEventListener("submit", function () {
      i.value = i.value.replace(/[۰-۹]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(d); }).replace(/[^\d]/g, "");
      if (!i.value) i.disabled = true;
    });
  });
})();
