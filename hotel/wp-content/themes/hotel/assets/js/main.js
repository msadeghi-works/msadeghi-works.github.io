/* Saray-e Narenj — nav, lightbox and the Jalali booking calendar. No dependencies.
 * The calendar uses the browser's built-in Persian calendar (Intl, "u-ca-persian"),
 * so no Jalali conversion library is needed on the client. */
(function () {
	'use strict';
	var fa = function (n) { return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); };
	var money = function (n) { return fa(Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '٬')); };

	/* ---------- Mobile nav ---------- */
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

	/* ---------- Lightbox (<dialog>) ---------- */
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

	/* ---------- Booking calendar ---------- */
	var form = document.querySelector('form.booking');
	if (!form) return;

	var rooms = JSON.parse(form.dataset.rooms || '{}');
	var booked = JSON.parse(form.dataset.booked || '{}');
	var monthsBox = form.querySelector('[data-cal-months]');
	var inInput = form.querySelector('[name=checkin]');
	var outInput = form.querySelector('[name=checkout]');
	var guests = form.querySelector('[data-guests]');
	var $ = function (s) { return form.querySelector(s); };

	var numFmt = new Intl.DateTimeFormat('en-u-ca-persian', { year: 'numeric', month: 'numeric', day: 'numeric' });
	var monthFmt = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'long', year: 'numeric' });
	var longFmt = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long' });
	var jparts = function (d) {
		var o = {};
		numFmt.formatToParts(d).forEach(function (p) { if (p.type !== 'literal') o[p.type] = parseInt(p.value, 10); });
		return o; // {year, month, day}
	};
	var iso = function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
	var addDays = function (d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; };

	// Build ~6 Jalali months starting from the first day of the current Jalali month.
	var today = new Date(); today.setHours(12, 0, 0, 0);
	var start = addDays(today, 1 - jparts(today).day);
	var months = [];
	for (var d = start, guard = 0; months.length < 7 && guard < 230; d = addDays(d, 1), guard++) {
		var p = jparts(d), key = p.year + '-' + p.month, m = months[months.length - 1];
		if (!m || m.key !== key) { m = { key: key, label: monthFmt.format(d), days: [] }; months.push(m); }
		m.days.push(d);
	}
	months.pop(); // last one is partial

	var state = { room: null, inD: null, outD: null, offset: 0 };
	var takenSet = function () {
		var s = {};
		(booked[state.room] || []).forEach(function (r) {
			for (var x = new Date(r[0] + 'T12:00:00'), end = new Date(r[1] + 'T12:00:00'); x < end; x = addDays(x, 1)) s[iso(x)] = 1;
		});
		return s;
	};

	function render() {
		var taken = takenSet(), todayIso = iso(today), html = '';
		months.slice(state.offset, state.offset + 2).forEach(function (m) {
			html += '<div class="cal__month"><p class="cal__title">' + m.label + '</p><div class="cal__grid" role="grid">';
			['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].forEach(function (w) { html += '<span class="cal__wd" aria-hidden="true">' + w + '</span>'; });
			var lead = (m.days[0].getDay() + 1) % 7; // Saturday-first week
			for (var i = 0; i < lead; i++) html += '<span></span>';
			m.days.forEach(function (day) {
				var k = iso(day), cls = 'cal__day', dis = false;
				if (k < todayIso) { cls += ' is-past'; dis = true; }
				else if (taken[k]) { cls += ' is-taken'; }
				if (state.inD && k === iso(state.inD)) cls += ' is-start';
				if (state.outD && k === iso(state.outD)) cls += ' is-end';
				if (state.inD && state.outD && day > state.inD && day < state.outD) cls += ' is-range';
				html += '<button type="button" class="' + cls + '" data-day="' + k + '"' + (dis ? ' disabled' : '') +
					' aria-label="' + longFmt.format(day) + (taken[k] ? '، رزروشده' : '') + '">' + fa(jparts(day).day) + '</button>';
			});
			html += '</div></div>';
		});
		monthsBox.innerHTML = html;
		form.querySelector('[data-cal-prev]').disabled = state.offset === 0;
		form.querySelector('[data-cal-next]').disabled = state.offset >= months.length - 2;
		summary();
	}

	function msg(t) { var el = $('[data-sum-msg]'); el.textContent = t || ''; el.hidden = !t; }

	function summary() {
		var r = rooms[state.room] || {}, nights = 0;
		$('[data-sum-room]').textContent = r.title || '—';
		$('[data-sum-price]').textContent = r.price ? money(r.price) + ' تومان' : '—';
		$('[data-sum-in]').textContent = state.inD ? longFmt.format(state.inD) : 'انتخاب نشده';
		$('[data-sum-out]').textContent = state.outD ? longFmt.format(state.outD) : 'انتخاب نشده';
		if (state.inD && state.outD) nights = Math.round((state.outD - state.inD) / 864e5);
		$('[data-sum-nights]').textContent = nights ? fa(nights) + ' شب' : '—';
		$('[data-sum-total]').textContent = nights ? money(nights * r.price) + ' تومان' : '—';
		inInput.value = state.inD ? iso(state.inD) : '';
		outInput.value = state.outD ? iso(state.outD) : '';
		$('[data-submit]').disabled = !nights;
	}

	monthsBox.addEventListener('click', function (e) {
		var b = e.target.closest('[data-day]');
		if (!b || b.disabled) return;
		var day = new Date(b.dataset.day + 'T12:00:00'), taken = takenSet();
		msg('');
		var problem = '';
		if (state.inD && !state.outD && day > state.inD) {
			// Choosing check-out: every night in [in, out) must be free.
			for (var x = state.inD; x < day; x = addDays(x, 1)) {
				if (taken[iso(x)]) { problem = 'بین این دو تاریخ شبی رزروشده هست؛ این روز به‌عنوان تاریخ ورود جدید انتخاب شد.'; break; }
			}
			if (!problem && Math.round((day - state.inD) / 864e5) > 30) problem = 'حداکثر اقامت ۳۰ شب است؛ این روز به‌عنوان تاریخ ورود جدید انتخاب شد.';
			if (!problem) { state.outD = day; render(); focusDay(b.dataset.day); return; }
		}
		// Otherwise (or after a clash) the click starts a new stay.
		{
			if (taken[b.dataset.day]) { msg('این شب رزرو شده است.'); return; }
			state.inD = day; state.outD = null;
		}
		render();
		msg(problem);
		focusDay(b.dataset.day);
	});
	function focusDay(k) { var el = monthsBox.querySelector('[data-day="' + k + '"]'); if (el) el.focus(); }
	form.querySelector('[data-cal-prev]').addEventListener('click', function () { state.offset = Math.max(0, state.offset - 1); render(); });
	form.querySelector('[data-cal-next]').addEventListener('click', function () { state.offset = Math.min(months.length - 2, state.offset + 1); render(); });

	function setRoom(id) {
		state.room = id;
		var cap = (rooms[id] || {}).cap || 2, cur = parseInt(guests.value, 10) || 2;
		guests.innerHTML = '';
		for (var i = 1; i <= cap; i++) guests.insertAdjacentHTML('beforeend', '<option value="' + i + '"' + (i === Math.min(cur, cap) ? ' selected' : '') + '>' + fa(i) + ' نفر</option>');
		// A new room may have bookings inside the chosen range — reset if so.
		var taken = takenSet();
		if (state.inD) {
			for (var x = state.inD; x < (state.outD || addDays(state.inD, 1)); x = addDays(x, 1)) {
				if (taken[iso(x)]) { state.inD = state.outD = null; msg('تاریخ‌های قبلی برای این اتاق آزاد نیست؛ دوباره انتخاب کنید.'); break; }
			}
		}
		render();
	}
	form.querySelectorAll('[name=room]').forEach(function (r) {
		r.addEventListener('change', function () { setRoom(r.value); });
	});
	var checked = form.querySelector('[name=room]:checked') || form.querySelector('[name=room]');
	if (checked) { checked.checked = true; setRoom(checked.value); }
})();
