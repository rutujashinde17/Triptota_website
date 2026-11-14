/* results.html — fare calendar, filters, sorting, fare choices */
(function () {
  chrome();
  const wk = new Date(); wk.setHours(0, 0, 0, 0); wk.setDate(wk.getDate() + 7);
  const FLIGHT_ALIASES = {
    del: 'DEL', delhi: 'DEL', 'new delhi': 'DEL',
    bom: 'BOM', mumbai: 'BOM', bombay: 'BOM',
    blr: 'BLR', bengaluru: 'BLR', bangalore: 'BLR',
    hyd: 'HYD', hyderabad: 'HYD',
    maa: 'MAA', chennai: 'MAA', madras: 'MAA',
    ccu: 'CCU', kolkata: 'CCU', calcutta: 'CCU',
    goi: 'GOI', goa: 'GOI',
    pnq: 'PNQ', pune: 'PNQ'
  };
  const normFlightCity = (val, fallback) => {
    const s = String(val || '').trim();
    const paren = s.match(/\(([A-Z]{3})\)/i);
    if (paren && CITIES[paren[1].toUpperCase()]) return paren[1].toUpperCase();
    const key = s.replace(/\s*\([^)]*\)\s*/g, '').toLowerCase();
    return FLIGHT_ALIASES[key] || (CITIES[s.toUpperCase()] ? s.toUpperCase() : fallback);
  };
  const sp = new URLSearchParams(location.search);
  let q = S.search || { from: 'DEL', to: 'BOM', date: iso(wk), cls: 'Economy' };
  if (sp.has('from') || sp.has('to') || sp.has('date')) {
    const qFrom = normFlightCity(sp.get('from'), q.from || 'BLR');
    let qTo = normFlightCity(sp.get('to'), q.to || 'GOI');
    if (qFrom === qTo) qTo = qFrom === 'BOM' ? 'DEL' : 'BOM';
    const rawD = sp.get('date');
    const todayIso = iso(new Date());
    const qDate = (rawD && /^\d{4}-\d{2}-\d{2}$/.test(rawD) && rawD >= todayIso) ? rawD : iso(wk);
    const qCls = MULT[sp.get('cls')] ? sp.get('cls') : (q.cls || 'Economy');
    q = { from: qFrom, to: qTo, date: qDate, cls: qCls };
  }
  if (!CITIES[q.from]) q.from = 'DEL';
  if (!CITIES[q.to] || q.to === q.from) q.to = q.from === 'BOM' ? 'DEL' : 'BOM';
  S = { search: q }; save();                         // a new search starts a fresh booking
  let FL = [], status = 'loading', errMsg = '';   // filled from FlightAPI
  const COL = { 'IndiGo': '#3B2A8C', 'Air India': '#C8202F', 'Akasa Air': '#F26A21' }, INI = { 'IndiGo': '6E', 'Air India': 'AI', 'Akasa Air': 'QP' };
  const FLEXI = 750, mult = MULT[q.cls];
  const dayAdj = d => ((d.getDate() * 37) % 9) * 100;
  const price = (d, basePrice) => Math.round((basePrice + dayAdj(d) + 1) * mult / 100) * 100 - 1;
  const lowest = () => FL.length ? Math.min(...FL.map(f => f.basePrice)) : 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const sel = parse(q.date), k = Math.max(0, Math.min(3, Math.round((sel - today) / 864e5)));
  const days = [...Array(7)].map((_, i) => { const d = new Date(sel); d.setDate(sel.getDate() - k + i); return d; });
  let si = k, openCode = null, pick = 'Saver', sort = 'price';
  const mins = s => { const m = s.match(/(\d+)h(\d+)m/); return +m[1] * 60 + +m[2]; };
  const slot = t => { const h = +t.slice(0, 2); return h < 6 ? 'early' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'; };
  const checked = n => $$(`input[name="${n}"]:checked`).map(i => i.value);

  $('#title').textContent = `${CITIES[q.from][0]} to ${CITIES[q.to][0]}`;
  $('#sr').textContent = `${q.from} → ${q.to}`; $('#sc').textContent = q.cls;
  const head = () => $('#sd').textContent = `${DAY[days[si].getDay()]}, ${fmt(days[si])}`;
  const strip = () => $('#dates').innerHTML = days.map((d, i) => `<button class="date" role="tab" aria-selected="${i === si}" data-i="${i}"><small>${DAY[d.getDay()]}, ${fmt(d)}</small><span>${FL.length ? inr(price(d, lowest())) : '—'}</span></button>`).join('');

  const fares = f => {
    const card = (n, p, items) => { const on = pick === n; return `<div class="fc ${on ? 'is-sel' : ''}" data-fare="${n}"><h4>${n}</h4><div class="fp">${inr(p)}</div><small>per adult · airfare</small>
      <ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>      <button class="btn btn--block ${on ? 'btn--primary' : ''}" data-book="${n}" data-code="${f.code}">Book Now</button>${on ? '<small class="red">Fare used in this booking flow</small>' : ''}</div>`; };
    return `<div class="choose"><h3>Choose your fare</h3><div class="fcs">
      ${card('Saver', f.price, ['• Standard seat, subject to availability', '• Meals available at extra cost', '✓ Cabin ' + f.bag, '• Standard change fees apply'])}
      ${card('Flexi Plus', f.price + FLEXI, ['✓ Free standard seat selection', '✓ Snack included', '✓ Cabin ' + f.bag, '✓ Lower change fees'])}</div>
      <p class="note">Prices shown are airfare. Fees, optional meals and insurance are itemised before payment.</p></div>`;
  };
  function render() {
    if (status !== 'ok') {
      $('#count').textContent = status === 'loading' ? 'Searching flights…' : '';
      $('#list').innerHTML = status === 'loading' ? '<div class="card empty">Searching the best fares…</div>'
        : `<div class="card empty">${errMsg}<br><button class="btn btn--primary" id="retry" type="button">Retry</button></div>`;
      return;
    }
    const stops = checked('stops').map(Number), air = checked('airline'), deps = checked('dep'), max = +$('#price').value;
    const list = FL.map(f => ({ ...f, price: price(days[si], f.basePrice) }))
      .filter(f => (!stops.length || stops.includes(Math.min(f.stops, 2))) &&
        (!air.length || air.includes(f.airline)) &&
        (!deps.length || deps.includes(slot(f.dep))) &&
        f.price <= max)
      .sort((a, b) => sort === 'price' ? a.price - b.price : sort === 'dur' ? mins(a.dur) - mins(b.dur) : a.dep.localeCompare(b.dep));
    $('#count').textContent = `${list.length} flight${list.length === 1 ? '' : 's'} found`;
    $('#list').innerHTML = list.length ? list.map(f => { const open = openCode === f.code; return `<article class="card fl">
      <div class="fl__row">
        <div class="al"><span class="badge" style="background:${COL[f.airline]}">${INI[f.airline]}</span><div><b>${f.airline}</b><small>${f.code}</small></div></div>
        <div><div class="time">${f.dep}</div><div class="place">${q.from} · ${CITIES[q.from][0]}</div></div>
        <div class="mid">${f.dur}<i></i>${f.stops ? f.stops + ' stop' : 'Non-Stop'}</div>
        <div><div class="time">${f.arr}</div><div class="place">${q.to} · ${CITIES[q.to][0]}</div></div>
        <div class="pr"><b>${inr(f.price)}</b><small>per adult · + ${inr(FEE)} fees &amp; GST</small><button class="btn btn--primary" data-open="${f.code}">Book</button></div></div>
      <div class="fl__foot"><div><span class="bag" style="margin-left:0">Cabin ${f.bag}</span></div>
        <button class="link" data-open="${f.code}" aria-expanded="${open}">View Fares ${open ? '▴' : '▾'}</button></div>${open ? fares(f) : ''}</article>`; }).join('')
      : '<div class="card empty">No flights match these filters. Try resetting them.</div>';
  }
  const label = () => $('#priceOut').textContent = `₹3,000 — ${inr(+$('#price').value)}`;
  $('#dates').onclick = e => { const b = e.target.closest('.date'); if (!b) return; si = +b.dataset.i; S.search.date = iso(days[si]); save(); head(); strip(); render(); };
  $('#sorts').onclick = e => { const b = e.target.closest('.sort'); if (!b) return; sort = b.dataset.s; $$('.sort').forEach(x => x.classList.toggle('on', x === b)); render(); };
  $('.filters').oninput = e => { if (e.target.id === 'price') { label(); render(); } };
  $('.filters').onchange = e => { if (e.target.id === 'price') label(); render(); };
  $('#reset').onclick = () => { $$('.filters input[type=checkbox]').forEach(i => i.checked = false); $('#price').value = 20000; label(); render(); };
  $('#list').onclick = e => {
    const o = e.target.closest('[data-open]'), b = e.target.closest('[data-book]'), c = e.target.closest('[data-fare]');
    if (b) {
      const f = FL.find(x => x.code === b.dataset.code), d = days[si];
      S = { search: S.search, from: q.from, to: q.to, cls: q.cls, date: fmt(d), isoDate: iso(d), fare: b.dataset.book,
        flight: { airline: f.airline, code: f.code, dep: f.dep, arr: f.arr, dur: f.dur, stops: f.stops, bag: f.bag },
        airfare: price(d, f.basePrice) + (b.dataset.book === 'Flexi Plus' ? FLEXI : 0) };
      save(); location.href = 'seats.html';
    } else if (o) { openCode = openCode === o.dataset.open ? null : o.dataset.open; pick = 'Saver'; render(); }
    else if (c) { pick = c.dataset.fare; render(); }
  };
  // ---- Modify Search panel: change route, date or class without leaving the page ----
  const opts = Object.entries(CITIES).map(([c, [n]]) => `<option value="${c}">${n} (${c})</option>`).join('');
  $('#mfrom').innerHTML = opts; $('#mto').innerHTML = opts;
  $('#mfrom').value = q.from; $('#mto').value = q.to; $('#mcls').value = q.cls;
  $('#mdate').value = q.date; $('#mdate').min = iso(today);
  const mlabels = () => {
    $('#mfromA').textContent = CITIES[$('#mfrom').value][1]; $('#mtoA').textContent = CITIES[$('#mto').value][1];
    const d = $('#mdate').value; $('#mday').textContent = d ? DAY[parse(d).getDay()] + ', ' + parse(d).getFullYear() : '';
  };
  $('#mp').onchange = mlabels;
  $('#mod').onclick = () => { const p = $('#mp'); p.hidden = !p.hidden; $('#mod').textContent = p.hidden ? 'Modify Search' : 'Close'; $('#mod').setAttribute('aria-expanded', !p.hidden); };
  $('#mswap').onclick = () => { const a = $('#mfrom').value; $('#mfrom').value = $('#mto').value; $('#mto').value = a; mlabels(); };
  $('#mp').onsubmit = e => {
    e.preventDefault();
    const s = { from: $('#mfrom').value, to: $('#mto').value, date: $('#mdate').value, cls: $('#mcls').value };
    const m = s.from === s.to ? 'Choose different cities for From and To.' : !s.date || parse(s.date) < today ? 'Pick a departure date from today onwards.' : '';
    $('#merr').textContent = m; if (m) return;
    S = { search: s }; save();
    if (location.search) { const u = new URL(location.href); u.search = ''; location.href = u.href; } else location.reload();
  };
  mlabels(); head(); strip(); label(); render();
  const loadFlights = () => {
    status = 'loading'; render();
    FlightAPI.search(q.from, q.to)
      .then(list => { FL = list; status = 'ok'; strip(); render(); })
      .catch(err => { status = 'error'; errMsg = err.message + '. Open the site through a local server (not file://).'; render(); });
  };
  document.addEventListener('click', e => { if (e.target.id === 'retry') loadFlights(); });
  loadFlights();
})();
