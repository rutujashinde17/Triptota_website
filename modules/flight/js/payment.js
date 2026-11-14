/* payment.html — UPI / card checkout (demo only: nothing is charged) */
need('flight'); need('pax'); chrome(4);
const T = total(), errOf = el => el.parentNode.querySelector('.err');
$('#lead').textContent = `Your total is ${inr(T)}, including all selected add-ons and taxes.`;
$('#trip').innerHTML = trip();
$('#sumA').innerHTML = fareSummary(); $('#cp').innerHTML = couponBox(); $('#sumB').innerHTML = totalRow();
$('#trav').innerHTML = S.pax.map((p, i) => `<p class="big">${p.title} ${p.name}</p><p>Adult · ${(S.seats || [])[i] ? 'Seat ' + S.seats[i].id : 'No seat'}${S.meal ? ' · ' + S.meal : ''}</p>`).join('') + `<p>${S.contact.email}</p>`;
$('#cname').value = S.pax[0].name; $('#amt').textContent = 'Amount to pay · ' + inr(T);
$('#pay').textContent = `Pay ${inr(T)} Securely`; $('#upiNote').textContent = `Approve the ${inr(T)} request in your UPI app. Never share your UPI PIN.`;

// static QR-style graphic (layout only)
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const N = 25, FP = [[0, 0], [N - 7, 0], [0, N - 7]]; let q = '';
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
  let on = rnd() > .5; const p = FP.find(([a, b]) => x >= a && x < a + 7 && y >= b && y < b + 7);
  if (p) { const dx = x - p[0], dy = y - p[1]; on = dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx > 1 && dx < 5 && dy > 1 && dy < 5); }
  if (on) q += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
}
$('#qr').innerHTML = `<svg viewBox="-1 -1 ${N + 2} ${N + 2}" width="150" height="150" fill="#260A0A" shape-rendering="crispEdges">${q}</svg>`;

let mode = 'upi', app = '';
function setMode(m) { mode = m; $('#card').hidden = m !== 'card'; $('#upi').hidden = m !== 'upi'; $$('.tab').forEach(t => { t.classList.toggle('on', t.dataset.m === m); t.setAttribute('aria-selected', t.dataset.m === m); }); }
$$('.tab').forEach(t => t.onclick = () => setMode(t.dataset.m));
$$('.app').forEach(b => b.onclick = () => { app = app === b.dataset.a ? '' : b.dataset.a; $$('.app').forEach(x => x.classList.toggle('btn--sel', x.dataset.a === app)); });
$('#cn').oninput = e => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
$('#ce').oninput = e => { const d = e.target.value.replace(/\D/g, '').slice(0, 4); e.target.value = d.length > 2 ? d.slice(0, 2) + ' / ' + d.slice(2) : d; };
$('#cv').oninput = e => e.target.value = e.target.value.replace(/\D/g, '');
const checks = {
  cn: v => v.replace(/\s/g, '').length === 16 ? '' : 'Enter the 16-digit card number.',
  ce: v => { const m = v.match(/^(\d\d) \/ (\d\d)$/); if (!m || +m[1] < 1 || +m[1] > 12) return 'Enter expiry as MM / YY.'; return new Date(2000 + +m[2], +m[1], 0, 23, 59) < new Date() ? 'This card has expired.' : ''; },
  cv: v => /^\d{3}$/.test(v) ? '' : 'Enter the 3-digit CVV.',
  cname: v => v.trim() ? '' : 'Enter the name on the card.'
};
$('#pay').onclick = () => {
  let ok = true;
  if (mode === 'card') Object.keys(checks).forEach(k => { const m = checks[k]($('#' + k).value); errOf($('#' + k)).textContent = m; if (m) ok = false; });
  else { const v = $('#uid').value.trim(), m = !app && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(v) ? 'Choose an app or enter a valid UPI ID.' : ''; errOf($('#uid')).textContent = m; if (m) ok = false; }
  if (!ok) return;
  S.pnr = '6E-' + Math.random().toString(36).slice(2, 7).toUpperCase(); S.paid = T; S.method = mode === 'card' ? 'Card' : 'UPI'; save();
  $('#pay').disabled = true; $('#pay').textContent = 'Processing payment…'; setTimeout(() => location.href = 'confirmation.html', 900);
};
setMode('upi');
