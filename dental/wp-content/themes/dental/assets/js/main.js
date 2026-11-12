/* Mehrsa: mobile nav, before/after sliders, case tabs, Persian digits. Vanilla JS, no dependencies. */
(function () {
	'use strict';
	var header = document.querySelector('.site-header');

	/* Mobile navigation */
	var toggle = document.querySelector('.nav-toggle'), nav = document.getElementById('main-nav');
	if (toggle && nav) {
		toggle.addEventListener('click', function () {
			var open = toggle.getAttribute('aria-expanded') !== 'true';
			document.documentElement.style.setProperty('--hdr', header.getBoundingClientRect().bottom + 'px');
			toggle.setAttribute('aria-expanded', String(open));
			nav.classList.toggle('is-open', open);
			document.body.style.overflow = open ? 'hidden' : '';
		});
		document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) toggle.click(); });
	}

	/* Before/after: a transparent <input type=range> drives the CSS variable --pos (keyboard accessible for free) */
	document.querySelectorAll('.ba').forEach(function (ba) {
		var r = ba.querySelector('.ba__range');
		var set = function () { ba.style.setProperty('--pos', r.value + '%'); };
		r.addEventListener('input', set); set();
	});

	/* Case tabs on the home page */
	document.querySelectorAll('.ba-tab').forEach(function (tab) {
		tab.addEventListener('click', function () {
			document.querySelectorAll('.ba-tab').forEach(function (t) { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
			document.querySelectorAll('.ba-panel').forEach(function (p) { p.hidden = p.id !== tab.dataset.target; });
			tab.classList.add('is-active'); tab.setAttribute('aria-selected', 'true');
		});
	});

	/* Persian digits for remaining text nodes (inputs, code and dir=ltr phone numbers are left alone) */
	var map = '۰۱۲۳۴۵۶۷۸۹', skip = /^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION|CODE)$/;
	(function walk(n) {
		if (n.nodeType === 3) { if (/[0-9]/.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(/[0-9]/g, function (d) { return map[d]; }); return; }
		if (n.nodeType !== 1 || skip.test(n.nodeName)) return;
		for (var c = n.firstChild; c; c = c.nextSibling) walk(c);
	})(document.body);
})();
