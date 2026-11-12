/* Setbar: mobile navigation + Persian digits. Vanilla JS. */
(function () {
	'use strict';
	var header = document.querySelector('.site-header');
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
	/* Persian digits — but technical codes with Latin letters (API 5L, ISO 9001, SCH 40) stay Latin on purpose. */
	var map = '۰۱۲۳۴۵۶۷۸۹', skip = /^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION|CODE)$/;
	(function walk(n) {
		if (n.nodeType === 3) {
			if (/[0-9]/.test(n.nodeValue) && !/[A-Za-z]/.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(/[0-9]/g, function (d) { return map[d]; });
			return;
		}
		if (n.nodeType !== 1 || skip.test(n.nodeName) || n.getAttribute('dir') === 'ltr') return;
		for (var c = n.firstChild; c; c = c.nextSibling) walk(c);
	})(document.body);
})();
