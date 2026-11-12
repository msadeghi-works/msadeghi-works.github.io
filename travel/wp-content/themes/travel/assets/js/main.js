/* Rahnavard — nav toggle, booking total preview, gallery lightbox. No dependencies. */
(function () {
	var fa = function (n) { return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); };
	var money = function (n) { return fa(Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '٬')); };

	// Mobile navigation
	var toggle = document.querySelector('.nav-toggle');
	if (toggle) {
		toggle.addEventListener('click', function () {
			var open = toggle.getAttribute('aria-expanded') === 'true';
			toggle.setAttribute('aria-expanded', String(!open));
			document.body.classList.toggle('nav-open', !open);
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { toggle.click(); toggle.focus(); }
		});
	}

	// Booking form: steppers + live total (server recomputes the real total).
	var form = document.querySelector('.book__form');
	if (form) {
		var price = +form.dataset.price, childPct = +form.dataset.child, seats = +form.dataset.seats;
		var adults = form.querySelector('[name=adults]'), kids = form.querySelector('[name=children]');
		var out = form.querySelector('[data-total]'), warn = form.querySelector('[data-warn]');
		var latin = function (s) { return String(s).replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); }); };
		var num = function (el) { return parseInt(latin(el.value), 10) || 0; };
		var clamp = function (el) { var v = Math.max(+el.dataset.min, Math.min(+el.dataset.max, num(el))); el.value = fa(v); return v; };
		var update = function () {
			var a = clamp(adults), k = clamp(kids);
			out.textContent = money(a * price + Math.round(k * price * childPct / 100)) + ' تومان';
			var over = seats > 0 && a + k > seats;
			warn.hidden = !over;
			form.querySelector('[type=submit]').disabled = over;
		};
		form.querySelectorAll('.stepper button').forEach(function (b) {
			b.addEventListener('click', function () {
				var input = b.parentNode.querySelector('input');
				input.value = num(input) + (+b.dataset.step);
				update();
			});
		});
		[adults, kids].forEach(function (el) { el.addEventListener('change', update); });
		update();
	}

	// Lightbox using the native <dialog> element.
	var dlg = document.querySelector('.lightbox');
	if (dlg && dlg.showModal) {
		var img = dlg.querySelector('img');
		document.querySelectorAll('[data-lightbox]').forEach(function (a) {
			a.addEventListener('click', function (e) {
				e.preventDefault();
				img.src = a.href;
				img.alt = (a.querySelector('img') || {}).alt || '';
				dlg.showModal();
			});
		});
		dlg.querySelector('.lightbox__close').addEventListener('click', function () { dlg.close(); });
		dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
	}
})();
