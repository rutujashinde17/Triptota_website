/* seats.html — multi-seat map, meal, baggage (1 seat = 1 passenger, up to 6) */
need('flight'); chrome(2);
S.seats = S.seats || [];                      // one entry per passenger: { id, price }
const booked = ['11B', '11C', '13E', '14A', '15D', '16F', '18B'];
$('#trip').innerHTML = trip();
$('#cabin').textContent = `${S.flight.airline} · ${S.flight.code} · ${S.cls}`; $('#cab2').textContent = 'Cabin ' + S.flight.bag;
const kind = id => 'AF'.includes(id.slice(-1)) ? 'Window' : 'BE'.includes(id.slice(-1)) ? 'Middle' : 'Aisle';
const COLS = ['A', 'B', 'C', '', 'D', 'E', 'F'];
$('#map').innerHTML = '<span>Row</span>' + COLS.map(c => `<span>${c}</span>`).join('') +
  [10, 11, 12, 13, 14, 15, 16, 17, 18].map(r => `<span>${r}</span>` + COLS.map(c => {
    if (!c) return '<span></span>';
    const id = r + c, cls = booked.includes(id) ? 'bk' : r === 10 ? 'leg' : '';
    return `<button class="seat ${cls}" data-id="${id}" ${cls === 'bk' ? 'disabled' : ''} aria-label="Seat ${id}"></button>`;
  }).join('')).join('');
function render() {
  const n = S.seats.length, N = pax(), x = N > 1 ? ` × ${N}` : '';
  $$('.seat').forEach(s => { const on = S.seats.some(t => t.id === s.dataset.id); s.classList.toggle('sel', on); s.textContent = on ? s.dataset.id : ''; });
  $('#pick').className = 'pick' + (n ? ' on' : '');
  $('#pick').innerHTML = n ? `<b>✓ ${n} seat${n > 1 ? 's' : ''} selected</b><small>${S.seats.map(s => `${s.id} (${kind(s.id)})`).join(' · ')}</small>
      <small>${n} passenger${n > 1 ? 's' : ''} · ${seatSum() ? 'Legroom seats +' + inr(seatSum()) : 'Free standard seats'}</small>`
    : '<b>No seat selected</b><small>Choose one seat per passenger (up to 6)</small>';
  $('#bagNote').textContent = (S.bagPrice ? S.bagLabel + ' added' : 'Not added') + ' · Check-in 15kg included';
  $('#lines').innerHTML = row('Airfare' + x, inr(S.airfare * N)) + row('Dev Fee + GST' + x, inr(FEE * N)) +
    row(n ? `Seat${n > 1 ? 's' : ''} ${seatIds()} · ${seatSum() ? inr(seatSum()) : 'Free'}` : 'Seat charge', inr(seatSum())) +
    row('Meal' + x, inr((S.mealPrice || 0) * N)) + row('Extra baggage' + x, inr((S.bagPrice || 0) * N));
  $('#sub').textContent = inr(total(false)); save();
}
$('#map').onclick = e => {
  const b = e.target.closest('.seat'); if (!b || b.disabled) return; $('#serr').textContent = '';
  const i = S.seats.findIndex(t => t.id === b.dataset.id);
  if (i >= 0) S.seats.splice(i, 1);                                           // click again to unselect
  else if (S.seats.length >= 6) return $('#serr').textContent = 'You can select up to 6 seats per booking.';
  else S.seats.push({ id: b.dataset.id, price: b.dataset.id.startsWith('10') ? 600 : 0 });
  render();
};
$('#meal').onchange = e => { const [n, p] = e.target.value ? e.target.value.split('|') : ['', 0]; S.meal = n || null; S.mealPrice = +p; render(); };
$('#bag').onchange = e => { const [n, p] = e.target.value ? e.target.value.split('|') : ['', 0]; S.bagLabel = n; S.bagPrice = +p; render(); };
if (S.meal) $('#meal').selectedIndex = [...$('#meal').options].findIndex(o => o.value.startsWith(S.meal));
if (S.bagPrice) $('#bag').selectedIndex = [...$('#bag').options].findIndex(o => o.value.startsWith(S.bagLabel));
render();
