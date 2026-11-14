/* confirmation.html — booking summary, receipt, print */
if (!S.paid) location.replace('index.html');
chrome();
const f = S.flight, P = S.pax, C = S.contact, n = P.length, A = `${n} Adult${n > 1 ? 's' : ''}`;
$('#msg').textContent = `Your trip to ${CITIES[S.to][0]} is booked. Have a wonderful journey.`;
$('#pnr').textContent = S.pnr;
$('#copy').onclick = async e => { try { await navigator.clipboard.writeText(S.pnr); e.target.textContent = '✓ Copied'; } catch { e.target.textContent = 'Copy failed'; } };
$('#fl').textContent = `${f.airline} · ${f.code}`; $('#fl2').textContent = `${S.date} · ${A} · ${S.cls}`;
$('#dep').textContent = f.dep; $('#arr').textContent = f.arr; $('#dur').innerHTML = `↓ ${f.dur}<br><small>${f.stops ? f.stops + ' stop' : 'Non-Stop'}</small>`;
$('#fc').textContent = S.from; $('#tc').textContent = S.to;
$('#fcity').textContent = `${CITIES[S.from][0]} · ${S.date}`; $('#tcity').textContent = `${CITIES[S.to][0]} · ${S.date}`;
$('#fap').textContent = CITIES[S.from][1]; $('#tap').textContent = CITIES[S.to][1];
$('#cab').textContent = 'Cabin ' + f.bag;
$('#adv').textContent = `Carry your government photo ID and arrive at ${CITIES[S.from][0]} airport at least 2 hours before departure.`;
$('#pl').innerHTML = P.map((p, i) => `<div class="row"><span><b>${p.title} ${p.name}</b></span><span>${(S.seats || [])[i] ? 'Seat ' + S.seats[i].id : 'No seat'}</span></div>`).join('');
$('#adds').innerHTML = row('Passengers', `${A} · ${S.cls}`) + row('Seats', seatIds() || 'Not selected') + row('Meal', S.meal ? S.meal + (n > 1 ? ` × ${n}` : '') : 'Not added') +
  `<p class="note">${S.bagPrice ? 'Extra baggage ' + S.bagLabel : 'No extra baggage added'} · Seat charge ${inr(seatSum())}</p>`;
$('#tl').innerHTML = `<p class="okt">✓ Payment received<small>${inr(S.paid)} paid securely via ${S.method}</small></p>
  <p class="okt">✓ Flight booking confirmed<small>PNR: ${S.pnr}</small></p><p class="okt">✓ E-ticket &amp; invoice issued<small>Sent to ${C.email}</small></p>`;
$('#rc').innerHTML = fareSummary() +
  `<hr><div class="total"><span>Amount paid</span><span>${inr(S.paid)}</span></div><p class="note">Fare benefit included in displayed airfare.</p>`;
$('#dl').onclick = () => window.print();
