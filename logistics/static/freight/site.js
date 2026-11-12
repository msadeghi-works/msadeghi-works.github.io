(function () {
  "use strict";
  var FA = "۰۱۲۳۴۵۶۷۸۹";
  function fa(s) { return String(s).replace(/[0-9]/g, function (d) { return FA[d]; }); }
  function toLatin(s) {
    return String(s).replace(/[۰-۹]/g, function (d) { return FA.indexOf(d); })
                    .replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); });
  }
  function money(n) { return fa(Math.round(n).toLocaleString("en-US").replace(/,/g, "٬")); }

  // mobile nav
  var btn = document.querySelector(".nav-btn"), nav = document.getElementById("nav");
  if (btn && nav) btn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // "sample code" hint fills the tracking input
  document.querySelectorAll("[data-fill]").forEach(function (b) {
    b.addEventListener("click", function () {
      var input = document.getElementById(b.dataset.fill);
      input.value = b.dataset.code; input.focus();
    });
  });

  // price calculator: posts JSON to the server, renders the breakdown
  var form = document.getElementById("calc");
  if (!form) return;
  var receipt = document.getElementById("receipt");
  var body = receipt.querySelector(".receipt-body"), empty = receipt.querySelector(".receipt-empty"),
      err = receipt.querySelector(".receipt-err");
  var params = new URLSearchParams(location.search);
  if (params.get("service")) {
    var r = form.querySelector('input[name=service][value="' + params.get("service") + '"]');
    if (r) r.checked = true;
  }

  function payload() {
    var fd = new FormData(form), o = {};
    ["service", "origin", "destination", "weight", "length", "width", "height"].forEach(function (k) {
      o[k] = toLatin(fd.get(k) || "").replace("/", ".");
    });
    return o;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = payload(), submit = form.querySelector("[type=submit]");
    submit.disabled = true;
    fetch(form.dataset.api, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRFToken": form.querySelector("[name=csrfmiddlewaretoken]").value },
      body: JSON.stringify(data),
      credentials: "same-origin"
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        empty.hidden = true;
        if (!res.ok) { body.hidden = true; err.hidden = false; err.textContent = res.j.error || "خطا در محاسبه"; return; }
        err.hidden = true; body.hidden = false;
        var q = res.j, sel = function (n) { return form.querySelector("[name=" + n + "] option:checked").textContent; };
        var set = function (k, v) { var el = body.querySelector('[data-k="' + k + '"]'); if (el) el.textContent = v; };
        set("from", sel("origin")); set("to", sel("destination"));
        set("total", money(q.total)); set("service", q.service);
        set("eta", q.eta_min === q.eta_max ? fa(q.eta_min) + " روز کاری" : fa(q.eta_min) + " تا " + fa(q.eta_max) + " روز کاری");
        set("distance_km", money(q.distance_km)); set("volumetric_weight", fa(q.volumetric_weight));
        set("chargeable_weight", fa(q.chargeable_weight));
        ["base_fee", "weight_cost", "distance_cost"].forEach(function (k) { set(k, money(q[k]) + " تومان"); });
        document.getElementById("go-ship").href = form.dataset.ship + "?" + new URLSearchParams(data).toString();
        if (!firstRun && window.matchMedia("(max-width: 900px)").matches) receipt.scrollIntoView({ behavior: "smooth", block: "start" });
      })
      .catch(function () { err.hidden = false; err.textContent = "ارتباط با سرور برقرار نشد. دوباره تلاش کنید."; })
      .finally(function () { submit.disabled = false; firstRun = false; });
  });
  // show a first quote immediately with the default values
  var firstRun = true;
  form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", { cancelable: true }));
})();
