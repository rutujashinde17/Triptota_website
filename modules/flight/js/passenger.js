/* passenger.html — one form per passenger (= selected seats), contact, coupon */
need('flight'); chrome(3);
S.insurance = false;           // travel protection removed
$('#trip').innerHTML = trip();
const n = pax(), ids = (S.seats || []).map(s => s.id), P = Array.isArray(S.pax) ? S.pax : [];
const opt = (list, v) => list.map(o => `<option ${o === v ? 'selected' : ''}>${o}</option>`).join('');
$('#pax').innerHTML = Array.from({ length: n }, (_, i) => { const p = P[i] || {}; return `<section class="card pad"><h2>Adult ${i + 1} · Passenger details${ids[i] ? ` <small style="font-size:12px;color:var(--muted);font-weight:500;margin-left:8px">Seat ${ids[i]}</small>` : ''}</h2>
  ${i === 0 ? '<p class="muted">Your ticket and airport ID must have the same name.</p>' : ''}
  <div class="grid2">
    <div class="field"><label for="title${i}">Title</label><select id="title${i}">${opt(['Mr', 'Ms', 'Mrs'], p.title)}</select></div>
    <div class="field"><label for="name${i}">Name (Govt ID)</label><input id="name${i}" autocomplete="name" placeholder="e.g. Aarav Sharma" value="${p.name || ''}"><small class="hint">Enter the name exactly as on your government ID.</small><small class="err"></small></div>
    <div class="field"><label for="gender${i}">Gender</label><select id="gender${i}">${opt(['Male', 'Female', 'Other'], p.gender)}</select></div>
    <div class="field"><label for="dob${i}">DOB</label><input id="dob${i}" type="date" value="${p.dob || ''}"><small class="err"></small></div></div></section>`; }).join('');
if (S.contact) { $('#email').value = S.contact.email; $('#mobile').value = S.contact.mobile; }
function summary() {
  $('#sumA').innerHTML = fareSummary(); $('#sumB').innerHTML = totalRow();
}
function coupon() {
  $('#cp').innerHTML = S.coupon ? couponBox() : `<hr><label for="code">Have a coupon?</label><input id="code" class="in" placeholder="Enter coupon code">
    <small class="err" id="cerr"></small><button class="btn btn--block" id="apply" type="button">Apply</button>`;
  if (!S.coupon) $('#apply').onclick = () => {
    const c = $('#code').value.trim().toUpperCase();
    if (c === 'FARELOCK') { S.coupon = c; save(); coupon(); } else $('#cerr').textContent = c ? 'This coupon code is not valid. Check it and try again.' : 'Enter a coupon code.';
  };
}
const rules = {
  name: v => /^[A-Za-z.'-]+(\s+[A-Za-z.'-]+)+$/.test(v.trim()) ? '' : 'Enter your first and last name as on your ID.',
  dob: v => v && new Date(v) < new Date() ? '' : 'Enter a valid date of birth.',
  email: v => /^\S+@\S+\.\S+$/.test(v) ? '' : 'Enter a valid email address.',
  mobile: v => /^[6-9]\d{9}$/.test(v.replace(/\s/g, '')) ? '' : 'Enter a 10-digit Indian mobile number.'
};
$('#go').onclick = () => {
  let ok = true;
  const chk = (id, fn) => { const el = $('#' + id), m = fn(el.value); el.parentNode.querySelector('.err').textContent = m; el.classList.toggle('bad', !!m); if (m) ok = false; };
  for (let i = 0; i < n; i++) { chk('name' + i, rules.name); chk('dob' + i, rules.dob); }
  chk('email', rules.email); chk('mobile', rules.mobile);
  if (!ok) return $('.bad').focus();
  S.pax = Array.from({ length: n }, (_, i) => ({ title: $('#title' + i).value, name: $('#name' + i).value.trim(), gender: $('#gender' + i).value, dob: $('#dob' + i).value }));
  S.contact = { email: $('#email').value.trim(), mobile: $('#mobile').value.trim() };
  save(); location.href = 'payment.html';
};
summary(); coupon();
