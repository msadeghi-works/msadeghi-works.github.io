/* Mahoot front-end: drawers, search panel, variation swatches, Persian digits. No dependencies besides jQuery (already loaded by WooCommerce). */
(function ($) {
	'use strict';
	var body = document.body;
	var scrim = document.querySelector('.scrim');
	var lastFocus = null;

	/* ---------- Drawers (nav + mini-cart) ---------- */
	function openDrawer(id, trigger) {
		var d = document.getElementById(id);
		if (!d) return false;
		lastFocus = trigger || document.activeElement;
		d.classList.add('is-open'); d.setAttribute('aria-hidden', 'false');
		scrim.hidden = false; body.classList.add('has-drawer');
		if (trigger) trigger.setAttribute('aria-expanded', 'true');
		var f = d.querySelector('.drawer-close'); if (f) setTimeout(function () { f.focus(); }, 50);
		return true;
	}
	function closeDrawers() {
		document.querySelectorAll('.drawer.is-open').forEach(function (d) { d.classList.remove('is-open'); d.setAttribute('aria-hidden', 'true'); });
		document.querySelectorAll('[aria-controls^="drawer-"]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
		scrim.hidden = true; body.classList.remove('has-drawer');
		if (lastFocus) lastFocus.focus();
	}
	document.addEventListener('click', function (e) {
		var t = e.target.closest('.nav-toggle, .cart-toggle, .drawer-close, .scrim, .search-toggle');
		if (!t) return;
		if (t.classList.contains('nav-toggle')) { openDrawer('drawer-nav', t); }
		else if (t.classList.contains('cart-toggle')) { if (openDrawer('drawer-cart', t)) e.preventDefault(); }
		else if (t.classList.contains('search-toggle')) {
			var p = document.getElementById('search-panel'); p.hidden = !p.hidden;
			t.setAttribute('aria-expanded', String(!p.hidden)); if (!p.hidden) p.querySelector('input[type=search]').focus();
		}
		else closeDrawers();
	});
	document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawers(); });
	// After an AJAX add-to-cart, show the mini-cart drawer.
	$(document.body).on('added_to_cart', function () { var b = document.querySelector('.cart-toggle'); openDrawer('drawer-cart', b); });

	/* ---------- Variation swatches drive the hidden native <select> ---------- */
	function syncSwatches(form) {
		form.querySelectorAll('.swatch-wrap').forEach(function (w) {
			var sel = w.querySelector('select'); if (!sel) return;
			var enabled = Array.prototype.map.call(sel.options, function (o) { return o.value; });
			w.querySelectorAll('.swatch').forEach(function (b) {
				b.setAttribute('aria-checked', String(b.dataset.value === sel.value));
				b.classList.toggle('is-disabled', enabled.indexOf(b.dataset.value) === -1);
			});
		});
	}
	$(document).on('click', '.swatch', function () {
		var w = this.closest('.swatch-wrap'), sel = w.querySelector('select');
		sel.value = sel.value === this.dataset.value ? '' : this.dataset.value;
		$(sel).trigger('change');
	});
	$(document).on('woocommerce_update_variation_values reset_data check_variations', '.variations_form', function () { syncSwatches(this); });
	$('.variations_form').each(function () { syncSwatches(this); });

	/* ---------- Persian digits for any text WooCommerce/JS renders with Latin digits ---------- */
	var map = '۰۱۲۳۴۵۶۷۸۹', skip = /^(SCRIPT|STYLE|TEXTAREA|INPUT|CODE|PRE|OPTION)$/;
	function fa(node) {
		if (node.nodeType === 3) {
			var p = node.parentElement;
			if (!p || skip.test(p.nodeName) || p.closest('[dir="ltr"],.no-fa,.select2-container,code')) return;
			if (/[0-9]/.test(node.nodeValue)) node.nodeValue = node.nodeValue.replace(/[0-9]/g, function (d) { return map[d]; });
			return;
		}
		if (node.nodeType !== 1 || skip.test(node.nodeName) || node.closest('[dir="ltr"],.no-fa,.select2-container,code')) return;
		for (var c = node.firstChild; c; c = c.nextSibling) fa(c);
	}
	fa(document.body);
	new MutationObserver(function (list) {
		list.forEach(function (m) { m.addedNodes.forEach(fa); if (m.type === 'characterData') fa(m.target); });
	}).observe(document.body, { childList: true, subtree: true, characterData: true });
})(jQuery);
