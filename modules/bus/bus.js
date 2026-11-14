const LOGO = 'data:image/png;base64,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';
const $ = (s, e = document) => e.querySelector(s);
const $$ = (s, e = document) => [...e.querySelectorAll(s)];
const inr = n => '₹' + n.toLocaleString('en-IN');
let S = JSON.parse(sessionStorage.getItem('triptora_bus') || '{}');
const save = () => sessionStorage.setItem('triptora_bus', JSON.stringify(S));
const CITIES = {
  Pune: ['Swargate', 'Shivajinagar', 'Wakad'], Goa: ['Mapusa', 'Panaji', 'Margao'], Mumbai: ['Borivali', 'Dadar', 'Sion'],
  Bengaluru: ['Majestic', 'Silk Board', 'Madiwala'], Hyderabad: ['Ameerpet', 'MGBS', 'LB Nagar'],
  Kolhapur: ['Tarabai Park', 'Shiroli', 'Kasaba Bawada'], Nagpur: ['Sitabuldi', 'Wardha Road', 'Kamptee Road'], Ahmedabad: ['Paldi', 'Geeta Mandir', 'Naroda']
};
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fmt = d => `${DAY[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`;
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parse = s => { const [a, b, c] = s.split('-'); return new Date(+a, +b - 1, +c); };
const toMin = t => { const [a, b] = t.split(':'); return +a * 60 + +b; };
const hm = m => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
const dur = m => `${Math.floor(m / 60)}h${m % 60 ? m % 60 + 'm' : ''}`;
const hash = s => [...s].reduce((a, c) => a + c.charCodeAt(0), 0), rkey = (a, b) => [a, b].sort().join('|');
const routeBase = (a, b) => rkey(a, b) === 'Goa|Pune' ? 899 : 599 + (hash(rkey(a, b)) % 12) * 50;
const routeMins = (a, b) => rkey(a, b) === 'Goa|Pune' ? 510 : 360 + (hash(rkey(a, b)) % 10) * 45;
// po = price offset, dm = duration offset (min), bp/dp = which boarding/dropping points the bus serves
const TPL = [
  { name: 'Zingbus Electric Multi-Axle', tag: 'Electric coach', type: 'AC Sleeper 2+1', tags: ['AC', 'Sleeper'], rating: 4.6, dep: '21:30', po: 0, dm: 0, bp: [0, 1, 2], dp: [0, 1] },
  { name: 'IntrCity SmartBus Volvo', tag: 'SmartBus', type: 'AC Sleeper 2+1', tags: ['AC', 'Sleeper'], rating: 4.4, dep: '20:45', po: 150, dm: 20, bp: [0, 2], dp: [0, 1, 2] },
  { name: 'VRL Travels', tag: 'Standard', type: 'Non-AC Sleeper 2+1', tags: ['Non-AC', 'Sleeper'], rating: 4.1, dep: '19:30', po: -200, dm: 45, bp: [1, 2], dp: [1, 2] },
  { name: 'Neeta Tours & Travels', tag: 'Standard', type: 'AC Seater 2+2', tags: ['AC', 'Seater'], rating: 4.2, dep: '22:15', po: -300, dm: -15, bp: [0, 1], dp: [0] },
  { name: 'Paulo Travels', tag: 'Premium', type: 'AC Sleeper 2+1', tags: ['AC', 'Sleeper'], rating: 4.5, dep: '18:30', po: 350, dm: 30, bp: [0, 1, 2], dp: [0, 1, 2] },
  { name: 'Orange Tours', tag: 'Day bus', type: 'Non-AC Seater 2+2', tags: ['Non-AC', 'Seater'], rating: 3.9, dep: '06:15', po: -400, dm: 60, bp: [0, 2], dp: [1, 2] }
];
const getBuses = (from, to) => { const rb = routeBase(from, to), rm = routeMins(from, to);
  return TPL.map(t => ({ ...t, seater: t.tags.includes('Seater'), price: rb + t.po, mins: rm + t.dm, arr: hm(toMin(t.dep) + rm + t.dm), nextDay: toMin(t.dep) + rm + t.dm >= 1440 })); };

// fares: 5% tax, coupon TRIPBUS (−₹100)
const base = () => S.seats.reduce((a, s) => a + s.price, 0), taxes = () => Math.round(base() * .05);
const disc = () => S.coupon ? 100 : 0;
const total = () => Math.max(0, base() + taxes() - disc());
const REDIRECT = {};   // thrown by need() to stop a view that has no booking data yet
const need = k => { const v = S[k]; if (Array.isArray(v) ? !v.length : !v) { go({ bus: 'results', seats: 'seats', pax: 'passenger' }[k]); throw REDIRECT; } };
const row = (a, b, c = '') => `<div class="row ${c}"><span>${a}</span><span>${b}</span></div>`;

function chrome(step) {
  const names = ['Seats', 'Passenger Details', 'Payment', 'Confirmation'];
  const sub = step ? `<ol class="steps">${names.map((n, i) => { const k = i + 1 < step ? 'done' : i + 1 === step ? 'on' : '';
    return `<li class="${k}">${k === 'done' ? '✓ ' : ''}${i + 1}. ${n}<small>${k === 'done' ? 'Done' : k ? '● Active' : ''}</small></li>`; }).join('')}</ol>`
    : `<div class="cats"><a class="cat" href="../flight/results.html">✈️ Flights</a><a class="cat on" href="#results">🚌 Buses</a><a class="cat" href="../packages/packages.html">🏝️ Packages</a></div>`;
  const hdrEl = $('#hdr');
  if (hdrEl) {
    hdrEl.innerHTML = `<div class="steps-nav" style="background:var(--card); border-bottom:1px solid var(--line); margin-top:var(--nav-height);">${sub}</div>`;
  }
  const ftrEl = $('#ftr');
  if (ftrEl) {
    ftrEl.innerHTML = '';
  }
}
const tripLine = () => `${S.bus.name} · ${S.bus.type}<br>${S.from} ${S.bus.dep} → ${S.to} ${S.bus.arr} · ${S.date}`;
function fareSummary() {
  const n = S.seats.length;
  return row(`Base fare (${n} ${S.bus.seater ? 'seat' : 'berth'}${n > 1 ? 's' : ''})`, inr(base())) + row('Taxes', inr(taxes())) +
    (S.coupon ? row(`Coupon ${S.coupon}`, '−' + inr(100), 'disc') : '');
}
const totalRow = () => `<hr><div class="total"><span>Total</span><span>${inr(total())}</span></div><p class="note">Taxes included. No hidden charges.</p>`;

/* ===== Page templates ===== */
const T_results = `
<div class="band"><div class="wrap bandin"><div><small>Buses</small><h1 id="title"></h1></div>
  <div class="sum"><b id="sd"></b><button class="btn btn--light" id="mod" type="button" aria-expanded="false">Modify</button></div></div></div>
<div class="wrap"><form class="card mp" id="mp" hidden novalidate><div class="sgrid">
  <div class="f"><label for="mfrom">From</label><select id="mfrom"></select><small id="mfromA"></small></div>
  <button type="button" class="swap" id="mswap" aria-label="Swap cities">⇄</button>
  <div class="f"><label for="mto">To</label><select id="mto"></select><small id="mtoA"></small></div>
  <div class="f"><label for="mdate">Journey date</label><input type="date" id="mdate"><small id="mday"></small></div>
  <div class="f"><label>Travellers</label><select disabled><option>Up to 6 seats</option></select><small>Choose seats on the next page</small></div>
  <button class="sbtn" type="submit">Update Search</button></div><p class="err" id="merr"></p></form></div>
<main class="wrap page"><div class="layout layout--bus">
  <aside class="card filters" aria-label="Filters"><div class="fhead"><h2>Filters</h2></div>
    <fieldset><legend>Bus type</legend>
      <label><input type="checkbox" name="type" value="AC"> AC</label><label><input type="checkbox" name="type" value="Non-AC"> Non-AC</label>
      <label><input type="checkbox" name="type" value="Sleeper"> Sleeper</label><label><input type="checkbox" name="type" value="Seater"> Seater</label></fieldset>
    <fieldset id="fbp"><legend>Boarding point</legend></fieldset>
    <fieldset id="fdp"><legend>Dropping point</legend></fieldset>
    <fieldset><legend>Departure time</legend><div class="chips2" id="slots">
      <button type="button" class="chip2" data-s="early">Before 6 AM</button><button type="button" class="chip2" data-s="morning">6 AM–12 PM</button>
      <button type="button" class="chip2" data-s="afternoon">12 PM–6 PM</button><button type="button" class="chip2" data-s="evening">After 6 PM</button></div></fieldset>
  </aside>
  <section aria-live="polite">
    <p class="eyebrow" id="eyebrow"></p><h2 style="font-size:22px;color:var(--ink)" id="count"></h2>
    <div class="sorts" id="sorts" style="margin:10px 0"><span>Sort by</span><button class="sort on" data-s="price">Cheapest</button><button class="sort" data-s="dur">Fastest</button><button class="sort" data-s="dep">Earliest</button></div>
    <div id="list"></div><p class="note">All times are local. Seat prices are shown per berth or seat.</p></section>
</div></main>
`;
const T_seats = `
<main class="wrap page"><p class="crumb">Step 1 / Choose your seats</p><h1 id="h"></h1><div class="trip" id="trip"></div>
  <div class="cols cols--bus">
    <section class="card pad"><h2>Select your seats</h2>
      <div class="dtabs" id="dtabs" role="tablist"></div>
      <div class="legend"><span><i class="sw"></i>Available</span><span><i class="sw bk"></i>Booked</span><span><i class="sw sel"></i>Selected</span></div>
      <div class="coach"><div class="wheel" title="Driver"><svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="#95241F" stroke-width="2"><circle cx="15" cy="15" r="12"/><circle cx="15" cy="15" r="3"/><path d="M15 3v9M4 20l8-4M26 20l-8-4"/></svg></div><div class="deck" id="deck"></div></div>
      <p class="note center" id="hint"></p></section>
    <aside class="card pad side"><h2>Boarding &amp; dropping</h2>
      <p class="eyebrow">Boarding point</p><div class="pts" id="bp"></div>
      <p class="eyebrow">Dropping point</p><div class="pts" id="dp"></div><hr>
      <div class="sel-line"><span id="sl">Selected <span id="kind">berths</span></span><b id="picked"></b></div>
      <div class="total" style="margin-top:10px"><span>Subtotal</span><span id="sub"></span></div><p class="note">Includes taxes</p>
      <p class="err" id="err"></p><button class="btn btn--primary btn--block" id="go">Continue to Passenger Details</button></aside>
  </div></main>
`;
const T_passenger = `
<main class="wrap page"><p class="crumb">Step 2 / Passenger details</p><h1>Who’s travelling?</h1>
  <p class="muted">Enter details exactly as on a government ID. Your ticket is sent to the email below.</p>
  <div class="cols cols--pax"><div>
    <section class="card pad"><h2>Your trip</h2><div class="tripc"><div><div class="time" id="t1"></div><div class="place" id="p1"></div></div>
      <div class="mid" id="tm"></div><div><div class="time" id="t2"></div><div class="place" id="p2"></div></div></div><hr><p id="tinfo" class="muted"></p></section>
    <div id="pax"></div>
    <section class="card pad"><h2>Contact details</h2><p class="muted">Your e-ticket and trip updates will be sent here.</p><div class="grid2">
      <div class="field"><label for="email">Email</label><input id="email" type="email" autocomplete="email" placeholder="name@example.com"><small class="err"></small></div>
      <div class="field"><label for="mobile">+91 Mobile</label><input id="mobile" inputmode="numeric" maxlength="11" placeholder="98765 43210"><small class="err"></small></div></div></section>
    
  </div>
  <aside class="card pad side"><h2>Fare summary</h2><div id="sumA"></div><div id="cp"></div><div id="sumB"></div>
    <button class="btn btn--primary btn--block" id="go">Proceed to Payment</button></aside></div></main>
`;
const T_payment = `
<main class="wrap page"><p class="crumb">Step 3 / Secure payment</p><h1>You’re almost there</h1><p class="muted" id="lead"></p>
  <div class="trip" id="trip"></div>
  <div class="cols"><section class="card pad"><h2>Choose how to pay</h2>
    <div class="tabs" role="tablist"><button class="tab" data-m="upi" role="tab"><i></i> UPI</button><button class="tab" data-m="card" role="tab"><i></i> Card</button></div><hr>
    <div id="card" hidden><h2>Credit or debit card</h2>
      <div class="field"><label for="cn">Card number</label><input id="cn" inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000" maxlength="19"><small class="err"></small></div>
      <div class="grid2" style="margin-top:12px"><div class="field"><label for="ce">Expiry</label><input id="ce" inputmode="numeric" autocomplete="cc-exp" placeholder="MM / YY" maxlength="7"><small class="err"></small></div>
        <div class="field"><label for="cv">CVV</label><input id="cv" type="password" inputmode="numeric" maxlength="3" placeholder="•••"><small class="hint">3 digits on your card</small><small class="err"></small></div></div>
      <p class="note">Card details are encrypted. Your CVV is never stored.</p></div>
    <div id="upi" hidden><h2>Pay with UPI</h2><p>Scan the QR with your preferred UPI app or choose an app below.</p><div class="qr" id="qr"></div><p class="note center">Static QR representation · layout only</p>
      <div class="grid2" style="margin-top:12px"><button class="btn app" data-a="GPay">GPay</button><button class="btn app" data-a="PhonePe">PhonePe</button></div>
      <div class="field" style="margin-top:12px"><label for="uid">Or enter your UPI ID</label><input id="uid" placeholder="yourname@bank" autocapitalize="off"><small class="err"></small></div></div>
    <button class="btn btn--primary btn--block" id="pay"></button><hr>
    <div class="pills"><span>✓ Secure payment</span><span>256-bit SSL</span><span>PCI-DSS</span></div><p class="note">By paying, you agree to the cancellation policy and booking terms.</p></section>
  <aside class="card pad side"><h2>Fare summary</h2><div id="sumA"></div><div id="sumB"></div><hr><p class="muted" id="who"></p></aside></div></main>
`;
const T_confirmation = `
<main class="wrap page">
  <section class="banner"><span class="tick">✓</span><h1>Booking Confirmed!</h1><p id="msg"></p>
    <p class="pnr">Booking ID: <span id="bid"></span> <button class="link" id="copy" type="button">⧉ Copy</button></p></section>
  <div class="cols"><div>
    <section class="card pad"><h2>Your journey</h2><p class="big" id="bn"></p><p class="muted" id="bt"></p><hr>
      <div class="tline"><div><b id="d1"></b><p id="d1p"></p><p class="muted" id="d1a"></p></div><div><b id="d2"></b><p id="d2p"></p><p class="muted" id="d2a"></p></div></div></section>
    <section class="card pad"><h2>Passengers</h2><div id="pl"></div></section>
    <section class="card pad"><h2>Pickup address</h2><p class="big" id="pa"></p><p class="muted" id="pn"></p></section>
    <section class="card pad"><h2>Booking timeline</h2><div class="tl" id="tl"></div></section></div>
  <div class="side"><aside class="card pad"><h2>Ready for your journey</h2>
      <button class="btn btn--primary btn--block" id="dl">Download E-Ticket (PDF)</button><button class="btn btn--block" id="pt">Print Ticket</button>
      <p class="note">Show your e-ticket and a government photo ID at boarding.</p><hr><p id="adv"></p><hr><a class="btn btn--block" href="#results">Book another bus</a></aside>
    <aside class="card pad"><h2>Payment receipt</h2><div id="rc"></div></aside></div></div></main>
`;

/* ===== Pages ===== */
function view_results() {
  chrome();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tm = new Date(today); tm.setDate(tm.getDate() + 1);
    const BUS_ALIASES = {
      pune: 'Pune', pnq: 'Pune',
      goa: 'Goa', goi: 'Goa',
      mumbai: 'Mumbai', bom: 'Mumbai',
      bengaluru: 'Bengaluru', bangalore: 'Bengaluru', blr: 'Bengaluru',
      hyderabad: 'Hyderabad', hyd: 'Hyderabad',
      kolhapur: 'Kolhapur',
      nagpur: 'Nagpur',
      ahmedabad: 'Ahmedabad'
    };
    const normBusCity = (val, fallback) => {
      const s = String(val || '').trim();
      const cleaned = s.replace(/\s*\([^)]*\)\s*/g, '').toLowerCase();
      if (BUS_ALIASES[cleaned]) return BUS_ALIASES[cleaned];
      const paren = s.match(/\(([A-Z]{3})\)/i);
      if (paren && BUS_ALIASES[paren[1].toLowerCase()]) return BUS_ALIASES[paren[1].toLowerCase()];
      return BUS_ALIASES[s.toLowerCase()] || fallback;
    };
    const sp = new URLSearchParams(location.search);
    let q = S.search || { from: 'Pune', to: 'Goa', date: iso(tm) };      // default search
    if (sp.has('from') || sp.has('to') || sp.has('date')) {
      const qFrom = normBusCity(sp.get('from'), q.from || 'Pune');
      let qTo = normBusCity(sp.get('to'), q.to || 'Goa');
      if (qFrom === qTo) qTo = qFrom === 'Goa' ? 'Pune' : 'Goa';
      const rawD = sp.get('date');
      const todayIso = iso(today);
      const qDate = (rawD && /^\d{4}-\d{2}-\d{2}$/.test(rawD) && rawD >= todayIso) ? rawD : iso(tm);
      q = { from: qFrom, to: qTo, date: qDate };
    }
    if (!CITIES[q.from]) q.from = 'Pune';
    if (!CITIES[q.to] || q.to === q.from) q.to = q.from === 'Goa' ? 'Pune' : 'Goa';
    S = { search: q }; save();                                             // a new search starts a fresh booking
    const list = getBuses(q.from, q.to);
    const AM = [];
    let sort = 'price';
    const slot = t => { const h = +t.slice(0, 2); return h < 6 ? 'early' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'; };
    const checked = n => $$(`input[name="${n}"]:checked`).map(i => i.value);
    $('#title').textContent = `${q.from} ⇄ ${q.to}`; $('#sd').textContent = fmt(parse(q.date));
    $('#eyebrow').textContent = `Buses from ${q.from} to ${q.to}`;
    const pts = (id, name, city) => $(id).insertAdjacentHTML('beforeend', CITIES[city].map((p, i) => `<label><input type="checkbox" name="${name}" value="${i}"> ${p}</label>`).join(''));
    pts('#fbp', 'bp', q.from); pts('#fdp', 'dp', q.to);

    function render() {
      const types = checked('type'), bps = checked('bp').map(Number), dps = checked('dp').map(Number), slots = $$('.chip2.on').map(c => c.dataset.s);
      const r = list.filter(b => types.every(t => b.tags.includes(t)) && (!bps.length || bps.some(i => b.bp.includes(i))) &&
        (!dps.length || dps.some(i => b.dp.includes(i))) && (!slots.length || slots.includes(slot(b.dep))))
        .sort((a, b) => sort === 'price' ? a.price - b.price : sort === 'dur' ? a.mins - b.mins : a.dep.localeCompare(b.dep));
      $('#count').textContent = `${r.length} bus${r.length === 1 ? '' : 'es'} available`;
      $('#list').innerHTML = r.length ? r.map(b => { const left = (b.seater ? 32 : 36) - (b.seater ? 6 : 9);
        const lowest = b.seater ? b.price : b.price - 100;
        return `<article class="card bc"><div class="bc__top"><div><span class="bc__tag">${b.tag}</span><h3 class="bc__name">${b.name}</h3><p class="muted">${b.type}</p></div><span class="rate">★ ${b.rating}</span></div>
        <div class="bc__mid"><div><div class="time">${b.dep}</div><div class="place">${q.from}</div></div>
          <div class="mid">${dur(b.mins)}<span class="dot"></span><span class="left">${left} seats left</span></div>
          <div><div class="time">${b.arr}</div><div class="place">${q.to}${b.nextDay ? ' · next day' : ''}</div></div>
          <div class="pr"><small>from</small><b>${inr(lowest)}</b><button class="btn btn--primary" data-name="${b.name}">Select Seats</button></div></div>
        <div class="bc__foot"><div>${AM.map(([i, t]) => `<span class="am" title="${t}" aria-label="${t}">${i}</span>`).join('')}</div><span>${b.bp.length} boarding · ${b.dp.length} dropping points</span></div></article>`; }).join('')
        : '<div class="card empty">No buses match these filters. Try removing some.</div>';
    }
    $('.filters').onchange = render;
    $('#slots').onclick = e => { const c = e.target.closest('.chip2'); if (c) { c.classList.toggle('on'); render(); } };
    $('#sorts').onclick = e => { const b = e.target.closest('.sort'); if (!b) return; sort = b.dataset.s; $$('.sort').forEach(x => x.classList.toggle('on', x === b)); render(); };
    $('#list').onclick = e => {
      const b = e.target.closest('[data-name]'); if (!b) return;
      const bus = list.find(x => x.name === b.dataset.name);
      S = { search: q, from: q.from, to: q.to, date: fmt(parse(q.date)), bus, seats: [] }; save(); go('seats');
    };

    // Modify panel
    const opts = Object.keys(CITIES).map(c => `<option>${c}</option>`).join('');
    $('#mfrom').innerHTML = opts; $('#mto').innerHTML = opts; $('#mfrom').value = q.from; $('#mto').value = q.to;
    $('#mdate').value = q.date; $('#mdate').min = iso(today);
    const lab = () => { $('#mfromA').textContent = CITIES[$('#mfrom').value].join(' · '); $('#mtoA').textContent = CITIES[$('#mto').value].join(' · ');
      const d = $('#mdate').value; $('#mday').textContent = d ? DAY[parse(d).getDay()] + ', ' + parse(d).getFullYear() : ''; };
    $('#mp').onchange = lab;
    $('#mod').onclick = () => { const p = $('#mp'); p.hidden = !p.hidden; $('#mod').textContent = p.hidden ? 'Modify' : 'Close'; $('#mod').setAttribute('aria-expanded', !p.hidden); };
    $('#mswap').onclick = () => { const a = $('#mfrom').value; $('#mfrom').value = $('#mto').value; $('#mto').value = a; lab(); };
    $('#mp').onsubmit = e => {
      e.preventDefault(); const s = { from: $('#mfrom').value, to: $('#mto').value, date: $('#mdate').value };
      const m = s.from === s.to ? 'Choose different cities for From and To.' : !s.date || parse(s.date) < today ? 'Pick a journey date from today onwards.' : '';
      $('#merr').textContent = m; if (!m) { S = { search: s }; save(); route(); }
    };
    lab(); render();
}

function view_seats() {
  need('bus'); chrome(1);
  const b = S.bus; S.seats = S.seats || [];
  $('#h').textContent = `${S.from} → ${S.to}`; $('#trip').innerHTML = tripLine();
  $('#kind').textContent = b.seater ? 'seats' : 'berths';
  const bpl = b.bp.map(i => ({ time: hm(toMin(b.dep) + [0, 20, 40][i]), place: CITIES[S.from][i] }));
  const dpl = b.dp.map(i => ({ time: hm(toMin(b.arr) - [0, 20, 40][i]), place: CITIES[S.to][i] }));
  S.boarding = S.boarding && bpl.find(p => p.place === S.boarding.place) || bpl[0]; S.dropping = S.dropping && dpl.find(p => p.place === S.dropping.place) || dpl[0];
  const radios = (id, name, list, cur) => $(id).innerHTML = list.map(p => `<label class="pt"><input type="radio" name="${name}" ${p.place === cur.place ? 'checked' : ''} value="${p.place}"><b>${p.time}</b> ${p.place}</label>`).join('');
  radios('#bp', 'bp', bpl, S.boarding); radios('#dp', 'dp', dpl, S.dropping);
  $('#bp').onchange = e => { S.boarding = bpl.find(p => p.place === e.target.value); save(); };
  $('#dp').onchange = e => { S.dropping = dpl.find(p => p.place === e.target.value); save(); };

  const BK = { Lower: [2, 7, 11, 15], Upper: [3, 8, 10, 14, 17] };
  const SBK = ['1A', '2C', '4B', '5D', '7A', '8C'];
  let deck = b.seater ? 'Seater' : 'Lower';
  $('#dtabs').innerHTML = (b.seater ? ['Seater'] : ['Lower', 'Upper Deck']).map((d, i) => `<button class="dtab ${i ? '' : 'on'}" role="tab" data-d="${d.split(' ')[0]}">${d}</button>`).join('');
  $('#dtabs').onclick = e => { const t = e.target.closest('.dtab'); if (!t) return; deck = t.dataset.d; $$('.dtab').forEach(x => x.classList.toggle('on', x === t)); draw(); };

  function draw() {
    let h = '';
    if (b.seater) {                                                  // 2+2 seater
      $('#deck').className = 'deck deck--st';
      for (let r = 1; r <= 8; r++) for (const c of ['A', 'B', '', 'C', 'D']) {
        if (!c) { h += '<span></span>'; continue; } const id = r + c, cls = SBK.includes(id) ? 'bk' : '';
        h += `<button class="seatr ${cls}" data-id="${id}" data-deck="Seater" ${cls === 'bk' ? 'disabled' : ''} aria-label="Seat ${id}">${id}</button>`;
      }
    } else {                                                         // 2+1 sleeper: L1 L2 | L3, L4 L5 | L6 ...
      $('#deck').className = 'deck deck--sl'; const p = deck === 'Lower' ? 'L' : 'U', price = deck === 'Lower' ? b.price : b.price - 100;
      for (let r = 0; r < 6; r++) for (const k of [1, 2, 0, 3]) {
        if (!k) { h += '<span></span>'; continue; } const n = r * 3 + k, id = p + n, cls = BK[deck].includes(n) ? 'bk' : '';
        h += `<button class="berth ${cls}" data-id="${id}" data-deck="${deck}" data-price="${price}" ${cls === 'bk' ? 'disabled' : ''} aria-label="Berth ${id}">${id}</button>`;
      }
    }
    $('#deck').innerHTML = h; paint();
  }
  function paint() {
    $$('.berth,.seatr').forEach(s => s.classList.toggle('sel', S.seats.some(x => x.id === s.dataset.id)));
    $('#picked').textContent = S.seats.length ? S.seats.map(s => s.id).join(', ') : 'None yet';
    $('#sub').textContent = S.seats.length ? inr(base() + taxes()) : '₹0';
    $('#hint').textContent = `Seats are open to everyone. Select up to 6 ${b.seater ? 'seats' : 'berths'}.`; save();
  }
  $('#deck').onclick = e => {
    const s = e.target.closest('.berth,.seatr'); if (!s || s.disabled) return; $('#err').textContent = '';
    const i = S.seats.findIndex(x => x.id === s.dataset.id);
    if (i >= 0) S.seats.splice(i, 1);
    else if (S.seats.length >= 6) return $('#err').textContent = 'You can select up to 6 seats per booking.';
    else S.seats.push({ id: s.dataset.id, deck: s.dataset.deck, price: +s.dataset.price || b.price });
    paint();
  };
  $('#go').onclick = () => { if (!S.seats.length) return $('#err').textContent = `Select at least one ${b.seater ? 'seat' : 'berth'} to continue.`; save(); go('passenger'); };
  draw();
}

function view_passenger() {
  need('bus'); need('seats'); chrome(2);
  const bu = S.bus;
  $('#t1').textContent = bu.dep; $('#p1').textContent = `${S.from} · ${S.boarding.place} (${S.boarding.time})`;
  $('#t2').textContent = bu.arr; $('#p2').textContent = `${S.to} · ${S.dropping.place} (${S.dropping.time})`;
  $('#tm').innerHTML = `${dur(bu.mins)}<span class="dot"></span>${S.date}`;
  $('#tinfo').textContent = `${bu.name} · ${bu.type} · ${S.seats.length} ${bu.seater ? 'seat' : 'berth'}${S.seats.length > 1 ? 's' : ''}: ${S.seats.map(s => s.id).join(', ')}`;
  const P = S.pax || [];
  $('#pax').innerHTML = S.seats.map((s, i) => `<section class="card pad pcard"><h2>Passenger ${i + 1} <small>${bu.seater ? 'Seat' : 'Berth'} ${s.id}</small></h2>
    <div class="grid3"><div class="field"><label for="n${i}">Name</label><input id="n${i}" autocomplete="name" placeholder="As on government ID" value="${P[i] ? P[i].name : ''}"><small class="err"></small></div>
    <div class="field"><label for="a${i}">Age</label><input id="a${i}" inputmode="numeric" maxlength="2" placeholder="Age" value="${P[i] ? P[i].age : ''}"><small class="err"></small></div>
    <div class="field"><label for="g${i}">Gender</label><select id="g${i}"><option value="">Select</option>${['Male', 'Female', 'Other'].map(g => `<option ${P[i] && P[i].gender === g ? 'selected' : ''}>${g}</option>`).join('')}</select><small class="err"></small></div></div></section>`).join('');
  if (S.contact) { $('#email').value = S.contact.email; $('#mobile').value = S.contact.mobile; }
 

  function summary() { $('#sumA').innerHTML = fareSummary(); $('#sumB').innerHTML = totalRow(); }
  function coupon() {
    $('#cp').innerHTML = S.coupon ? `<div class="alert ok"><b>✓ ${S.coupon} applied</b><small>You saved ${inr(100)} on this booking.</small></div>`
      : `<hr><label for="code">Have a coupon?</label><input id="code" class="in" placeholder="Enter coupon code"><small class="err" id="cerr"></small><button class="btn btn--block" id="apply" type="button">Apply</button>`;
    if (!S.coupon) $('#apply').onclick = () => { const c = $('#code').value.trim().toUpperCase();
      if (c === 'TRIPBUS') { S.coupon = c; save(); coupon(); summary(); } else $('#cerr').textContent = c ? 'This coupon code is not valid. Check it and try again.' : 'Enter a coupon code.'; };
  }
  

  const setErr = (el, m) => { el.parentNode.querySelector('.err').textContent = m; el.classList.toggle('bad', !!m); return !m; };
  $('#go').onclick = () => {
    let ok = true;
    S.seats.forEach((s, i) => {
      ok = setErr($('#n' + i), /^[A-Za-z.' -]{2,}$/.test($('#n' + i).value.trim()) ? '' : 'Enter the passenger’s full name.') && ok;
      const a = +$('#a' + i).value; ok = setErr($('#a' + i), a >= 1 && a <= 99 ? '' : 'Enter an age from 1 to 99.') && ok;
      const g = $('#g' + i).value; ok = setErr($('#g' + i), !g ? 'Select a gender.' : '') && ok;
    });
    ok = setErr($('#email'), /^\S+@\S+\.\S+$/.test($('#email').value) ? '' : 'Enter a valid email address.') && ok;
    ok = setErr($('#mobile'), /^[6-9]\d{9}$/.test($('#mobile').value.replace(/\s/g, '')) ? '' : 'Enter a 10-digit Indian mobile number.') && ok;
    
    if (!ok) return $('.bad').focus();
    S.pax = S.seats.map((s, i) => ({ name: $('#n' + i).value.trim(), age: $('#a' + i).value, gender: $('#g' + i).value }));
    S.contact = { email: $('#email').value.trim(), mobile: $('#mobile').value.trim() };
    
    save(); go('payment');
  };
  summary(); coupon();
}

function view_payment() {
  need('bus'); need('seats'); need('pax'); chrome(3);
  const errOf = el => el.parentNode.querySelector('.err');
  $('#trip').innerHTML = tripLine();
  $('#who').innerHTML = `${S.pax.map(p => p.name).join(', ')}<br>${S.contact.email}`;
  let mode = 'card', app = '';
  function amounts() {
    $('#lead').textContent = `Your total is ${inr(total())}, including taxes.`;
    $('#sumA').innerHTML = fareSummary(); $('#sumB').innerHTML = totalRow();
    const t = inr(total());
    $('#pay').textContent = mode === 'card' ? `Pay ${t} Securely` : `Pay ${t} via UPI`;
  }
  function setMode(m) { mode = m; ['card', 'upi'].forEach(x => $('#' + x).hidden = x !== m);
    $$('.tab').forEach(t => { t.classList.toggle('on', t.dataset.m === m); t.setAttribute('aria-selected', t.dataset.m === m); }); amounts(); }
  $$('.tab').forEach(t => t.onclick = () => setMode(t.dataset.m));
  $$('.app').forEach(b => b.onclick = () => { app = app === b.dataset.a ? '' : b.dataset.a; $$('.app').forEach(x => x.classList.toggle('btn--sel', x.dataset.a === app)); });
  $('#cn').oninput = e => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
  $('#ce').oninput = e => { const d = e.target.value.replace(/\D/g, '').slice(0, 4); e.target.value = d.length > 2 ? d.slice(0, 2) + ' / ' + d.slice(2) : d; };
  $('#cv').oninput = e => e.target.value = e.target.value.replace(/\D/g, '');

  // static QR-style graphic (layout only)
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const N = 25, FP = [[0, 0], [N - 7, 0], [0, N - 7]]; let q = '';
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let on = rnd() > .5; const p = FP.find(([a, b]) => x >= a && x < a + 7 && y >= b && y < b + 7);
    if (p) { const dx = x - p[0], dy = y - p[1]; on = dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx > 1 && dx < 5 && dy > 1 && dy < 5); }
    if (on) q += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  }
  $('#qr').innerHTML = `<svg viewBox="-1 -1 ${N + 2} ${N + 2}" width="150" height="150" fill="#260A0A" shape-rendering="crispEdges">${q}</svg>`;

  const checks = {
    cn: v => v.replace(/\s/g, '').length === 16 ? '' : 'Enter the 16-digit card number.',
    ce: v => { const m = v.match(/^(\d\d) \/ (\d\d)$/); if (!m || +m[1] < 1 || +m[1] > 12) return 'Enter expiry as MM / YY.'; return new Date(2000 + +m[2], +m[1], 0, 23, 59) < new Date() ? 'This card has expired.' : ''; },
    cv: v => /^\d{3}$/.test(v) ? '' : 'Enter the 3-digit CVV.'
  };
  $('#pay').onclick = () => {
    let ok = true;
    if (total() > 0) {
      if (mode === 'card') Object.keys(checks).forEach(k => { const m = checks[k]($('#' + k).value); errOf($('#' + k)).textContent = m; if (m) ok = false; });
      else { const v = $('#uid').value.trim(), m = !app && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(v) ? 'Choose an app or enter a valid UPI ID.' : ''; errOf($('#uid')).textContent = m; if (m) ok = false; }
    }
    if (!ok) return;
    S.bookingId = 'BUS-' + String(Math.floor(100000 + Math.random() * 900000)); S.paid = total();
    S.method = mode === 'card' ? 'Card' : 'UPI'; save();
    $('#pay').disabled = true; $('#pay').textContent = 'Processing payment…'; setTimeout(() => go('confirmation'), 900);
  };
  setMode('card');
}

function view_confirmation() {
  if (!S.paid) { go('results'); throw REDIRECT; }
  chrome(5);
  const b = S.bus, bp = S.boarding, dp = S.dropping;
  $('#msg').textContent = `Your bus to ${S.to} is booked. Have a safe journey.`; $('#bid').textContent = S.bookingId;
  $('#copy').onclick = async e => { try { await navigator.clipboard.writeText(S.bookingId); e.target.textContent = '✓ Copied'; } catch { e.target.textContent = 'Copy failed'; } };
  $('#bn').textContent = b.name; $('#bt').textContent = `${b.type} · ${S.date}`;
  $('#d1').textContent = `${bp.time} · ${S.from}`; $('#d1p').textContent = `Boarding: ${bp.place}`; $('#d1a').textContent = 'Please arrive 15 minutes before departure';
  $('#d2').textContent = `${dp.time} · ${S.to}${b.nextDay ? ' (next day)' : ''}`; $('#d2p').textContent = `Dropping: ${dp.place}`; $('#d2a').textContent = `Journey time ${dur(b.mins)}`;
  $('#pl').innerHTML = S.pax.map((p, i) => `<div class="row"><span>${p.name} · ${p.age} · ${p.gender}</span><b>${b.seater ? 'Seat' : 'Berth'} ${S.seats[i].id}</b></div>`).join('');
  $('#pa').textContent = `${bp.place}, ${S.from}`; $('#pn').textContent = `Boarding time ${bp.time}. Look for the ${b.name} bus.`;
  $('#adv').textContent = `Ticket sent to ${S.contact.email}. Mobile updates go to +91 ${S.contact.mobile}.`;
  $('#tl').innerHTML = `<p class="okt">✓ Payment received<small>${inr(S.paid)} paid via ${S.method}</small></p><p class="okt">✓ Booking confirmed<small>${S.bookingId}</small></p><p class="okt">✓ E-ticket issued<small>Sent to ${S.contact.email}</small></p>`;
  $('#rc').innerHTML = fareSummary() + `<hr><div class="total"><span>Amount paid</span><span>${inr(S.paid)}</span></div>`;
  $('#dl').onclick = $('#pt').onclick = () => window.print();
}

/* favicon from the embedded logo */
(() => { const l = document.createElement('link'); l.rel = 'icon'; l.href = LOGO; document.head.appendChild(l); })();

/* ===== Router: #results → #seats → #passenger → #payment → #confirmation ===== */
const VIEWS = {
  results: [T_results, view_results, 'Bus results'], seats: [T_seats, view_seats, 'Select seats'],
  passenger: [T_passenger, view_passenger, 'Passenger details'], payment: [T_payment, view_payment, 'Secure payment'],
  confirmation: [T_confirmation, view_confirmation, 'Booking confirmed']
};
function go(name) { if (location.hash === '#' + name) route(); else location.hash = name; }
function route() {
  const v = VIEWS[location.hash.slice(1)] || VIEWS.results;
  $('#app').innerHTML = v[0]; document.title = v[2] + ' · Triptora Bus'; window.scrollTo(0, 0);
  try { v[1](); } catch (e) { if (e !== REDIRECT) throw e; }
}
window.addEventListener('hashchange', route);
route();

