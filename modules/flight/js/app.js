/* Shared helpers, booking state (sessionStorage) and page chrome (steps bar) */
const $ = (s, e = document) => e.querySelector(s);
const $$ = (s, e = document) => [...e.querySelectorAll(s)];
const inr = n => '₹' + n.toLocaleString('en-IN');
let S = JSON.parse(sessionStorage.getItem('triptora') || '{}');
const save = () => sessionStorage.setItem('triptora', JSON.stringify(S));
const FEE = 250, INS = 249;
const MULT = { 'Economy': 1, 'Premium Economy': 1.4, 'Business': 2.2 };
const CITIES = {
  DEL: ['New Delhi', 'Indira Gandhi International Airport'], BOM: ['Mumbai', 'Chhatrapati Shivaji Maharaj International Airport'],
  BLR: ['Bengaluru', 'Kempegowda International Airport'], HYD: ['Hyderabad', 'Rajiv Gandhi International Airport'],
  MAA: ['Chennai', 'Chennai International Airport'], CCU: ['Kolkata', 'Netaji Subhas Chandra Bose International Airport'],
  GOI: ['Goa', 'Manohar International Airport'], PNQ: ['Pune', 'Pune Airport']
};
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fmt = d => d.getDate() + ' ' + MON[d.getMonth()];
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parse = s => { const [a, b, c] = s.split('-'); return new Date(+a, +b - 1, +c); };
// One passenger per selected seat (minimum 1). Fare, fees, meal and baggage are charged per passenger.
const pax = () => Math.max(1, (S.seats || []).length);
const seatSum = () => (S.seats || []).reduce((a, s) => a + s.price, 0);
const seatIds = () => (S.seats || []).map(s => s.id).join(', ');
const total = (ins = S.insurance) => pax() * (S.airfare + FEE + (S.mealPrice || 0) + (S.bagPrice || 0) + (ins ? INS : 0)) + seatSum();
const need = k => { if (!S[k]) location.replace({ search: 'results.html', flight: 'results.html', pax: 'passenger.html' }[k]); };
const row = (a, b) => `<div class="row"><span>${a}</span><span>${b}</span></div>`;

function chrome(step) {
  const names = ['Flight', 'Seats', 'Passengers', 'Payment'];
  if (step) {
    const stepsHtml = `<div class="wrap" style="padding-top:14px;"><ol class="steps">${names.map((n, i) => {
      const k = i + 1 < step ? 'done' : i + 1 === step ? 'on' : '';
      return `<li class="${k}">${k === 'done' ? '✓ ' : ''}${i + 1}. ${n}<small>${k === 'done' ? 'Done' : k ? '● Active' : ''}</small></li>`;
    }).join('')}</ol></div>`;
    const pageWrap = document.querySelector('main.page') || document.body;
    pageWrap.insertAdjacentHTML('beforebegin', stepsHtml);
  } else {
    const modeBar = `<div class="steps-nav" style="background:var(--card); border-bottom:1px solid var(--line); margin-top:var(--nav-height);"><div class="cats"><a class="cat on" href="results.html">✈️ Flights</a><a class="cat" href="../bus/bus.html">🚌 Buses</a><a class="cat" href="../packages/packages.html">🏝️ Packages</a></div></div>`;
    const anchor = document.querySelector('.band') || document.querySelector('main.page') || document.body;
    anchor.insertAdjacentHTML('beforebegin', modeBar);
  }
}
const trip = () => { const n = pax(); return `${S.from}–${S.to} · ${S.date} · ${S.flight.code}${seatIds() ? ` · Seat${n > 1 ? 's' : ''} ${seatIds()}` : ''}<br>${S.flight.dep}–${S.flight.arr} · ${n} Adult${n > 1 ? 's' : ''} · ${S.cls}`; };
function fareSummary() {
  const n = pax(), x = n > 1 ? ` × ${n}` : '';
  return `<p class="muted">${n} Adult${n > 1 ? 's' : ''} · ${S.from} → ${S.to} · ${S.date}</p>${row('Airfare' + x, inr(S.airfare * n))}${row('Dev Fee' + x, inr(150 * n))}${row('GST' + x, inr(100 * n))}
    <hr><p class="muted">Add-ons</p>
    ${row(seatIds() ? `Seat${n > 1 ? 's' : ''} ${seatIds()} · ${seatSum() ? inr(seatSum()) : 'Free'}` : 'Seat · Not selected', inr(seatSum()))}
    ${row(S.meal ? S.meal + x : 'Meal · Not added', inr((S.mealPrice || 0) * n))}${S.insurance ? row('Insurance' + x, inr(INS * n)) : ''}
    ${row(S.bagPrice ? 'Extra baggage · ' + S.bagLabel + x : 'Extra baggage · Not added', inr((S.bagPrice || 0) * n))}`;
}
const couponBox = () => S.coupon ? `<div class="alert ok"><b>✓ ${S.coupon} applied</b><small>Fare benefit included in ${inr(S.airfare)} airfare. No additional deduction.</small></div>` : '';
const totalRow = () => `<hr><div class="total"><span>Total</span><span>${inr(total())}</span></div><p class="note">Includes ${inr(FEE * pax())} in fees &amp; GST. No hidden charges.</p>`;
