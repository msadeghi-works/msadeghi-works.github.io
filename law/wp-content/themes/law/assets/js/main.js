/* Dadayin — tiny progressive enhancements (no dependencies). */
(function () {
	var toggle = document.querySelector('.nav-toggle');
	var nav = document.getElementById('site-nav');
	if (toggle && nav) {
		toggle.addEventListener('click', function () {
			var open = toggle.getAttribute('aria-expanded') === 'true';
			toggle.setAttribute('aria-expanded', String(!open));
			document.body.classList.toggle('nav-open', !open);
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
				toggle.click();
				toggle.focus();
			}
		});
	}
	// Header gets a hairline + shadow once the page scrolls.
	var header = document.querySelector('.site-header');
	var onScroll = function () { header && header.classList.toggle('is-stuck', window.scrollY > 40); };
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	// Light client-side validation that marks fields instead of using browser bubbles.
	document.querySelectorAll('form.form').forEach(function (form) {
		form.addEventListener('submit', function (e) {
			var bad = null;
			form.querySelectorAll('[required]').forEach(function (f) {
				var v = (f.value || '').trim();
				var ok = v.length >= (parseInt(f.getAttribute('minlength'), 10) || 1);
				if (f.type === 'tel') ok = v.replace(/[^0-9۰-۹]/g, '').length >= 10;
				if (f.type === 'radio') ok = !!form.querySelector('[name="' + f.name + '"]:checked');
				f.setAttribute('aria-invalid', ok ? 'false' : 'true');
				if (!ok && !bad) bad = f;
			});
			if (bad) { e.preventDefault(); bad.focus(); }
		});
	});
})();
