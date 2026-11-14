/**
 * TripTora - Destination Checkout Controller
 * Uses the unified Bus & Flight payment flow (UPI + Card) with validation and voucher confirmation.
 */

(function () {
  'use strict';

  const $ = (s, e = document) => e.querySelector(s);
  const $$ = (s, e = document) => [...e.querySelectorAll(s)];
  const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');

  const params = new URLSearchParams(window.location.search);
  const pnr = params.get('ref') || 'TP' + Math.floor(100000 + Math.random() * 900000);
  const rawAmt = parseInt(params.get('amt') || '32500', 10);
  const baseAmt = isNaN(rawAmt) || rawAmt <= 0 ? 32500 : rawAmt;
  const desc = params.get('desc') || 'Bali, Beautifully Slow';
  const dest = params.get('dest') || 'Curated Holiday Package';
  const dur = params.get('dur') || 'Flexible Departure Dates';

  const taxAmt = Math.round(baseAmt * 0.05);
  let couponCode = '';
  let couponDiscount = 0;
  let mode = 'upi';
  let app = '';

  const getTotal = () => Math.max(0, baseAmt + taxAmt - couponDiscount);
  const errOf = el => el.parentNode.querySelector('.err');
  const row = (a, b, cls = '') => `<div class="row ${cls}"><span>${a}</span><span>${b}</span></div>`;

  // Static crisp QR SVG matching Flight & Bus checkout
  function renderQR() {
    let seed = 17;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const N = 25;
    const FP = [[0, 0], [N - 7, 0], [0, N - 7]];
    let q = '';
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        let on = rnd() > 0.5;
        const p = FP.find(([a, b]) => x >= a && x < a + 7 && y >= b && y < b + 7);
        if (p) {
          const dx = x - p[0], dy = y - p[1];
          on = dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx > 1 && dx < 5 && dy > 1 && dy < 5);
        }
        if (on) q += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
      }
    }
    $('#qr').innerHTML = `<svg viewBox="-1 -1 ${N + 2} ${N + 2}" width="150" height="150" fill="#260A0A" shape-rendering="crispEdges">${q}</svg>`;
  }

  function renderSummary() {
    const T = getTotal();
    $('#lead').textContent = `Your total is ${inr(T)}, including taxes & holiday inclusions.`;
    $('#trip').innerHTML = `<strong>${desc}</strong> · ${dest} · ${dur}<br>Booking Reference: <strong>${pnr}</strong> · 1 Traveller`;
    $('#pkgInfo').innerHTML = `<p class="big">${desc}</p><p class="muted">${dest} · ${dur}</p><p class="muted" style="margin-top:6px;">Includes curated stays, breakfasts & guided transfers.</p>`;

    $('#sumA').innerHTML =
      row('Package fare (1 Traveller)', inr(baseAmt)) +
      row('Taxes & GST (5%)', inr(taxAmt)) +
      (couponCode ? row(`Coupon ${couponCode}`, '−' + inr(couponDiscount), 'disc') : '');

    $('#sumB').innerHTML = `<hr><div class="total"><span>Total</span><span>${inr(T)}</span></div><p class="note">Includes ${inr(taxAmt)} in taxes & GST. No hidden charges.</p>`;
    $('#amt').textContent = 'Amount to pay · ' + inr(T);
    $('#upiNote').textContent = `Approve the ${inr(T)} request in your UPI app. Never share your UPI PIN.`;
    $('#pay').textContent = mode === 'card' ? `Pay ${inr(T)} Securely` : `Pay ${inr(T)} via UPI`;
  }

  function renderCoupon() {
    $('#cp').innerHTML = couponCode
      ? `<div class="alert ok"><b>✓ ${couponCode} applied</b><small>You saved ${inr(couponDiscount)} on this holiday package.</small></div>`
      : `<hr><label for="code">Have a coupon?</label><input id="code" class="in" placeholder="Try GETAWAY20 or FIRSTFLY"><small class="err" id="cerr"></small><button class="btn btn--block" id="apply" type="button">Apply</button>`;

    if (!couponCode) {
      $('#apply').onclick = () => {
        const c = $('#code').value.trim().toUpperCase();
        if (c === 'GETAWAY20') {
          couponCode = c;
          couponDiscount = Math.min(8000, Math.round(baseAmt * 0.2));
        } else if (c === 'FIRSTFLY') {
          couponCode = c;
          couponDiscount = 1500;
        } else {
          $('#cerr').textContent = c ? 'Invalid coupon code. Try GETAWAY20 or FIRSTFLY.' : 'Enter a coupon code.';
          return;
        }
        renderCoupon();
        renderSummary();
      };
    }
  }

  function setMode(m) {
    mode = m;
    $('#card').hidden = m !== 'card';
    $('#upi').hidden = m !== 'upi';
    $$('.tab').forEach(t => {
      const on = t.dataset.m === m;
      t.classList.toggle('on', on);
      t.setAttribute('aria-selected', on);
    });
    renderSummary();
  }

  $$('.tab').forEach(t => t.addEventListener('click', () => setMode(t.dataset.m)));

  $$('.app').forEach(b => b.addEventListener('click', () => {
    app = app === b.dataset.a ? '' : b.dataset.a;
    $$('.app').forEach(x => x.classList.toggle('btn--sel', x.dataset.a === app));
  }));

  $('#cn').addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
  });
  $('#ce').addEventListener('input', e => {
    const d = e.target.value.replace(/\D/g, '').slice(0, 4);
    e.target.value = d.length > 2 ? d.slice(0, 2) + ' / ' + d.slice(2) : d;
  });
  $('#cv').addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  const checks = {
    cn: v => v.replace(/\s/g, '').length === 16 ? '' : 'Enter the 16-digit card number.',
    ce: v => {
      const m = v.match(/^(\d\d) \/ (\d\d)$/);
      if (!m || +m[1] < 1 || +m[1] > 12) return 'Enter expiry as MM / YY.';
      return new Date(2000 + +m[2], +m[1], 0, 23, 59) < new Date() ? 'This card has expired.' : '';
    },
    cv: v => /^\d{3}$/.test(v) ? '' : 'Enter the 3-digit CVV.',
    cname: v => v.trim() ? '' : 'Enter the name on the card.'
  };

  $('#pay').addEventListener('click', () => {
    let ok = true;
    if (mode === 'card') {
      Object.keys(checks).forEach(k => {
        const msg = checks[k]($('#' + k).value);
        errOf($('#' + k)).textContent = msg;
        if (msg) ok = false;
      });
    } else {
      const v = $('#uid').value.trim();
      const msg = !app && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(v) ? 'Choose an app or enter a valid UPI ID.' : '';
      errOf($('#uid')).textContent = msg;
      if (msg) ok = false;
    }

    if (!ok) return;

    const paidTotal = getTotal();
    const methodLabel = mode === 'card' ? 'Card' : (app ? `UPI (${app})` : 'UPI');
    $('#pay').disabled = true;
    $('#pay').textContent = 'Processing payment…';

    setTimeout(() => {
      try {
        const list = JSON.parse(localStorage.getItem('triptora_bookings') || '[]');
        const idx = list.findIndex(b => b.pnr === pnr);
        const entry = {
          type: 'package',
          title: desc,
          destination: dest,
          duration: dur,
          details: `${dest} · ${dur} · Paid via ${methodLabel}`,
          date: new Date().toLocaleDateString('en-GB') + ' · Confirmed',
          amount: inr(paidTotal),
          pnr: pnr,
          method: methodLabel,
          status: 'Confirmed'
        };
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...entry };
        } else {
          list.unshift(entry);
        }
        localStorage.setItem('triptora_bookings', JSON.stringify(list));
      } catch (e) {}

      if (window.ttToast) {
        window.ttToast(`✅ Payment Successful! Voucher generated (${pnr})`);
      }

      // Show unified confirmation screen matching Bus & Flight
      $('#checkoutView').hidden = true;
      $('#confirmView').hidden = false;
      $('#cMsg').textContent = `Your ${desc} holiday is confirmed. Have a wonderful trip!`;
      $('#cPnr').textContent = pnr;
      $('#cTitle').textContent = desc;
      $('#cMeta').textContent = `${dest} · ${dur}`;
      $('#cTimeline').innerHTML =
        `<div class="tl"><p class="okt">✓ Payment received<small>${inr(paidTotal)} paid via ${methodLabel}</small></p>` +
        `<p class="okt">✓ Holiday voucher confirmed<small>Reference ${pnr}</small></p>` +
        `<p class="okt">✓ Itinerary ready<small>Saved to My Bookings</small></p></div>`;
      $('#cReceipt').innerHTML =
        row('Package fare', inr(baseAmt)) +
        row('Taxes & GST', inr(taxAmt)) +
        (couponCode ? row(`Coupon ${couponCode}`, '−' + inr(couponDiscount), 'disc') : '') +
        `<hr><div class="total"><span>Amount paid</span><span>${inr(paidTotal)}</span></div>`;

      window.scrollTo(0, 0);
    }, 800);
  });

  $('#copyPnr').addEventListener('click', async e => {
    try {
      await navigator.clipboard.writeText(pnr);
      e.target.textContent = '✓ Copied';
    } catch {
      e.target.textContent = pnr;
    }
  });
  $('#printBtn').addEventListener('click', () => window.print());

  renderQR();
  renderCoupon();
  setMode('upi');
})();
