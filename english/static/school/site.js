(function () {
  "use strict";
  // mobile navigation
  var btn = document.querySelector(".nav-btn"), nav = document.getElementById("nav");
  if (btn && nav) btn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // timetable filters submit as soon as a choice changes
  var filters = document.querySelector(".filters");
  if (filters) filters.addEventListener("change", function () { filters.submit(); });

  // placement test: progress bar + highlight answered questions
  var test = document.getElementById("test");
  if (test) {
    var qs = test.querySelectorAll(".q"), bar = document.getElementById("bar"), count = document.getElementById("pcount");
    var update = function () {
      var done = 0;
      qs.forEach(function (q) {
        var answered = !!q.querySelector("input[type=radio]:checked");
        q.classList.toggle("answered", answered);
        if (answered) { done++; q.classList.remove("missing"); }
      });
      bar.style.width = (done / qs.length * 100) + "%";
      count.textContent = done + " / " + qs.length;
    };
    test.addEventListener("change", update);
    update();
  }
})();
