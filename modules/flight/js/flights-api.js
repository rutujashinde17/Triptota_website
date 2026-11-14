/* Fake Flight API — reads ../../data/flights.json and behaves like a REST endpoint.
   To go live later, change only the body of search(): point it at the real provider URL. */
const FlightAPI = (() => {
  const URL_ = '../../data/flights.json', LATENCY = 600;
  let cache = null;
  const load = async () => {
    if (cache) return cache;
    const res = await fetch(URL_);
    if (!res.ok) throw new Error('Flight service unavailable (' + res.status + ')');
    return (cache = await res.json());
  };
  return {
    // GET /flights?from=DEL&to=BOM  ->  [{ id, airline, code, from, to, dep, arr, dur, stops, basePrice, bag, ... }]
    async search(from, to) {
      const [all] = await Promise.all([load(), new Promise(r => setTimeout(r, LATENCY))]);
      return all.filter(f => f.from === from && f.to === to);
    }
  };
})();
