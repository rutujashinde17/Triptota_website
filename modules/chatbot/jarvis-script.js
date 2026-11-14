(function () {
  "use strict";

  /* ============ 1) CONFIG ============ */
  var scriptEl = document.currentScript;
  var BASE = (scriptEl && scriptEl.src) ? scriptEl.src.replace(/[^/]*$/, "") : "";
  var CONFIG = {
    typingDelay: 450,
    // API / JSON file locations (apne server ka URL bhi daal sakte hain, e.g. "https://yoursite.com/api/flights")
    flightsUrl: BASE + "flights.json",
    busesUrl:   BASE + "Triptora_100_buses.json"
  };

  function inr(n) { return "\u20B9" + Number(n).toLocaleString("en-IN"); }

  /* ============ 2) DATA: apne real packages / buses se replace karein ============
     (Ye sample data hai. Baad mein isey apne database / API se bhi load kar sakte hain.) */
  var PACKAGES = [
    { id: "goa",       name: "Goa Beach Escape",   dest: "Goa",       type: "Domestic",      nights: "3 Nights / 4 Days", price: 8999,
      plan: "Day 1: Arrival, Baga & Calangute beach\nDay 2: North Goa sightseeing\nDay 3: South Goa & sunset cruise\nDay 4: Departure" },
    { id: "goa-prem",  name: "Goa Premium Stay",   dest: "Goa",       type: "Domestic",      nights: "5 Nights / 6 Days", price: 17999,
      plan: "Day 1: Arrival & beach resort check-in\nDay 2: North Goa tour\nDay 3: Water sports & cruise\nDay 4: South Goa & Old Goa\nDay 5: Leisure day\nDay 6: Departure" },
    { id: "kerala",    name: "Kerala Backwaters",  dest: "Kerala",    type: "Domestic",      nights: "4 Nights / 5 Days", price: 12499,
      plan: "Day 1: Kochi arrival\nDay 2: Munnar tea gardens\nDay 3: Thekkady wildlife\nDay 4: Alleppey houseboat\nDay 5: Departure" },
    { id: "manali",    name: "Manali Snow Escape", dest: "Manali",    type: "Domestic",      nights: "4 Nights / 5 Days", price: 9999,
      plan: "Day 1: Arrival in Manali\nDay 2: Solang Valley snow fun\nDay 3: Atal Tunnel & Sissu\nDay 4: Local sightseeing\nDay 5: Departure" },
    { id: "andaman",   name: "Andaman Island Trip", dest: "Andaman",  type: "Domestic",      nights: "5 Nights / 6 Days", price: 24999,
      plan: "Day 1: Port Blair arrival\nDay 2: Havelock Island\nDay 3: Radhanagar Beach\nDay 4: Neil Island\nDay 5: Cellular Jail\nDay 6: Departure" },
    { id: "dubai",     name: "Dubai Highlights",   dest: "Dubai",     type: "International", nights: "4 Nights / 5 Days", price: 39999,
      plan: "Day 1: Arrival & Dubai Marina\nDay 2: City tour & Burj Khalifa\nDay 3: Desert safari\nDay 4: Abu Dhabi day trip\nDay 5: Departure" },
    { id: "singapore", name: "Singapore Getaway",  dest: "Singapore", type: "International", nights: "4 Nights / 5 Days", price: 42999,
      plan: "Day 1: Arrival & Marina Bay\nDay 2: Sentosa Island\nDay 3: Universal Studios\nDay 4: Gardens by the Bay\nDay 5: Departure" }
  ];

  /* ---- Packages ---- */
  function matchPackages(a) {
    return PACKAGES.filter(function (p) {
      if (a.dest && p.dest.toLowerCase() !== String(a.dest).toLowerCase()) return false;
      if (a.type && p.type.toLowerCase() !== String(a.type).toLowerCase()) return false;
      if (a.min !== undefined && p.price < a.min) return false;
      if (a.max !== undefined && p.price > a.max) return false;
      return true;
    }).sort(function (x, y) { return x.price - y.price; });
  }
  function pkgCard(p) {
    return {
      title: p.name,
      sub: p.dest + " \u00B7 " + p.type + " \u00B7 " + p.nights,
      price: inr(p.price),
      priceNote: "per person",
      text: p.plan
    };
  }
  function pkgById(id) {
    return PACKAGES.filter(function (p) { return p.id === id; }).map(pkgCard);
  }

  /* ---------- LIVE DATA (flights + buses API) ---------- */
  var FLIGHTS = [], BUSES = [], dataState = "idle", dataPromise = null;

  // Flights API airport codes -> city names
  var AIRPORTS = {
    DEL: "New Delhi", BOM: "Mumbai", BLR: "Bengaluru", HYD: "Hyderabad",
    MAA: "Chennai",   CCU: "Kolkata", GOI: "Goa",      PNQ: "Pune"
  };
  function city(code) { return AIRPORTS[code] || code; }

  function fetchJson(url) {
    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error(url + " -> HTTP " + r.status);
      return r.json();
    });
  }
  function loadData() {
    if (dataPromise) return dataPromise;
    dataState = "loading";
    // 1) bundled data (jarvis-data.js) - works even when the page is opened by double-click
    if (window.JARVIS_FLIGHTS && window.JARVIS_BUSES) {
      FLIGHTS = window.JARVIS_FLIGHTS; BUSES = window.JARVIS_BUSES; dataState = "ready";
      dataPromise = Promise.resolve(); return dataPromise;
    }
    // 2) otherwise fetch from the JSON files / API URLs (needs a web server)
    dataPromise = Promise.all([fetchJson(CONFIG.flightsUrl), fetchJson(CONFIG.busesUrl)])
      .then(function (r) {
        FLIGHTS = Array.isArray(r[0]) ? r[0] : (r[0].flights || []);
        BUSES   = Array.isArray(r[1]) ? r[1] : (r[1].buses   || []);
        dataState = "ready";
      })
      .catch(function (e) {
        console.error("[J.A.R.V.I.S] Could not load flights/buses data:", e);
        dataState = "error"; dataPromise = null;      // next time retry
      });
    return dataPromise;
  }

  function uniq(arr) { return arr.filter(function (v, i) { return arr.indexOf(v) === i; }); }
  function t12(hhmm) {                                   // "14:10" -> "2:10 PM"
    var p = String(hhmm).split(":"), h = +p[0], m = p[1] || "00";
    return ((h % 12) || 12) + ":" + m + " " + (h >= 12 ? "PM" : "AM");
  }
  function mins(hhmm) { var p = String(hhmm).split(":"); return +p[0] * 60 + +p[1]; }
  function nextDay(dep, arr) { return mins(arr) <= mins(dep); }
  function niceDur(d) { return String(d || "").replace(/h(\d)/, "h $1"); }

  /* ---- Flights ---- */
  function flightFromList() {                            // airports that have flights
    return uniq(FLIGHTS.map(function (f) { return f.from; })).sort(function (x, y) { return city(x) < city(y) ? -1 : 1; });
  }
  function flightToList(from) {
    return uniq(FLIGHTS.filter(function (f) { return f.from === from; }).map(function (f) { return f.to; }))
      .sort(function (x, y) { return city(x) < city(y) ? -1 : 1; });
  }
  function matchFlights(a) {
    return FLIGHTS.filter(function (f) { return f.from === a.from && f.to === a.to; })
      .sort(function (x, y) { return x.basePrice - y.basePrice; })
      .map(function (f) {
        var stop = f.stops === 0 ? "Non-stop" : f.stops + " stop" + (f.stops > 1 ? "s" : "");
        return {
          title: f.airline + " \u00B7 " + f.code,
          sub: city(f.from) + " \u2192 " + city(f.to) + " \u00B7 " + stop,
          price: inr(f.basePrice), priceNote: "per person",
          text: "Departs " + t12(f.dep) + "  \u2022  Arrives " + t12(f.arr) + (nextDay(f.dep, f.arr) ? " (+1 day)" : "") +
                "\nDuration " + niceDur(f.dur) + "  \u2022  " + (f.refundable ? "Refundable" : "Non-refundable") +
                "\nBaggage: " + f.bag
        };
      });
  }

  /* ---- Buses ---- */
  function busFromList() {
    return uniq(BUSES.map(function (b) { return b.from; })).sort();
  }
  function busToList(from) {
    return uniq(BUSES.filter(function (b) { return b.from === from; }).map(function (b) { return b.to; })).sort();
  }
  function matchBuses(a) {
    return BUSES.filter(function (b) { return b.from === a.bfrom && b.to === a.bto; })
      .sort(function (x, y) { return x.price - y.price; })
      .map(function (b) {
        return {
          title: b.operator,
          sub: b.from + " \u2192 " + b.to + " \u00B7 " + b.busType,
          price: inr(b.price), priceNote: "per seat",
          text: "Departs " + t12(b.departure) + "  \u2022  Arrives " + t12(b.arrival) + (nextDay(b.departure, b.arrival) ? " (+1 day)" : "") +
                "\nSeats left: " + b.seatsAvailable + "  \u2022  Rating \u2605 " + Number(b.rating).toFixed(1)
        };
      });
  }
  function dataErrorMsg() {
    return "Sorry, I couldn\u2019t load the flight and bus data. Please make sure jarvis-data.js is in the same folder as jarvis-index.html (and loaded before jarvis-script.js), then press Ctrl+F5.";
  }

  /* ============ 3) FLOW: questions aur options ============
     msg    : bot ka text (string ya function(answers))
     cards  : function(answers) -> list of cards (package / bus)
     opts   : buttons -> { t, next, set, reset, link | linkFn }
     skipIf : agar answers[skipIf] pehle se hai to question skip karke skipTo par jao
     nav    : true => Back + Main menu buttons
  ====================================================================== */
  var FLOW = {

    start: {
      hero: { title: "Hey, wanderer! \uD83C\uDF1E", text: "I\u2019m J.A.R.V.I.S. Think of me as that friend who always has a great trip idea. Where shall we start?" },
      opts: [
        { t: "\uD83C\uDFD6\uFE0F Plan a Goa escape under \u20B920,000", reset: true,
          set: { dest: "Goa", type: "Domestic", budget: "Under \u20B920,000", min: 0, max: 20000 }, next: "pkg_result" },
        { t: "\u2708\uFE0F Find a flight from Delhi to Goa", reset: true,
          set: { from: "DEL", to: "GOI" }, next: "flight_result" },
        { t: "\uD83C\uDF05 Where should I go in December?", reset: true, next: "dec" },
        { t: "\u2728 More ways I can help", next: "menu" }
      ],
      foot: "A little inspiration, zero pressure. Let\u2019s dream up something lovely."
    },

    menu: {
      msg: "Sure! What would you like help with?",
      opts: [
        { t: "\uD83C\uDFDD\uFE0F Holiday packages",           reset: true, next: "pkg_type" },
        { t: "\u2708\uFE0F Find a flight",                    reset: true, next: "flight_from" },
        { t: "\uD83D\uDE8C Book a bus",                       reset: true, next: "bus_from" },
        { t: "\uD83C\uDF05 Where should I go in December?",   reset: true, next: "dec" },
        { t: "\uD83D\uDCCB Booking & cancellation help",      next: "help" }
      ]
    },

    /* ---------- PACKAGES: type -> budget -> available packages ---------- */
    pkg_type: {
      msg: "Lovely! Are you thinking India or abroad?",
      nav: true,
      opts: [
        { t: "\uD83C\uDDEE\uD83C\uDDF3 Domestic", set: { type: "Domestic" },      next: "pkg_budget" },
        { t: "\uD83C\uDF0D International",        set: { type: "International" }, next: "pkg_budget" }
      ]
    },
    pkg_budget: {
      msg: "What\u2019s your budget per person?",
      nav: true,
      opts: [
        { t: "Under \u20B910,000",               set: { budget: "Under \u20B910,000", min: 0,     max: 10000 },  next: "pkg_result" },
        { t: "\u20B910,000 \u2013 \u20B925,000", set: { budget: "\u20B910,000\u2013\u20B925,000", min: 10000, max: 25000 }, next: "pkg_result" },
        { t: "\u20B925,000 \u2013 \u20B950,000", set: { budget: "\u20B925,000\u2013\u20B950,000", min: 25000, max: 50000 }, next: "pkg_result" },
        { t: "\u20B950,000+",                    set: { budget: "\u20B950,000+",     min: 50000, max: 9999999 }, next: "pkg_result" }
      ]
    },
    pkg_result: {
      msg: function (a) {
        var n = matchPackages(a).length;
        var what = (a.dest ? a.dest + " " : "") + (a.type && !a.dest ? a.type.toLowerCase() + " " : "") + "packages";
        return n
          ? "Here are the available " + what + " (" + a.budget + "):"
          : "I couldn\u2019t find any " + what + " for this budget (" + a.budget + ") right now. Please go back and try a different budget.";
      },
      cards: function (a) { return matchPackages(a).map(pkgCard); },
      nav: true
    },

    /* ---------- FLIGHTS (from flights.json): from -> to -> results ---------- */
    flight_from: {
      msg: function () { return dataState === "error" || !FLIGHTS.length ? dataErrorMsg() : "Let\u2019s find you a flight. Where are you flying from?"; },
      needs: true, skipIf: "from", skipTo: "flight_to", nav: true,
      opts: function () {
        if (!FLIGHTS.length) return [{ t: "\uD83D\uDD04 Try again", next: "flight_from" }];
        return flightFromList().map(function (c) { return { t: city(c), set: { from: c }, next: "flight_to" }; });
      }
    },
    flight_to: {
      msg: function (a) { return dataState === "error" ? dataErrorMsg() : "And where to?"; },
      needs: true, skipIf: "to", skipTo: "flight_result", nav: true,
      opts: function (a) {
        return flightToList(a.from).map(function (c) { return { t: city(c), set: { to: c }, next: "flight_result" }; });
      }
    },
    flight_result: {
      msg: function (a) {
        if (dataState === "error") return dataErrorMsg();
        var n = matchFlights(a).length;
        return n ? "Found " + n + " flight" + (n > 1 ? "s" : "") + " from " + city(a.from) + " to " + city(a.to) + " (cheapest first):"
                 : "No flights are listed for " + city(a.from) + " \u2192 " + city(a.to) + " right now.";
      },
      needs: true,
      cards: function (a) { return matchFlights(a); },
      nav: true
    },

    /* ---------- BUSES (from Triptora_100_buses.json): from -> to -> results ---------- */
    bus_from: {
      msg: function () { return dataState === "error" || !BUSES.length ? dataErrorMsg() : "Let\u2019s find you a bus. Where are you travelling from?"; },
      needs: true, nav: true,
      opts: function () {
        if (!BUSES.length) return [{ t: "\uD83D\uDD04 Try again", next: "bus_from" }];
        return busFromList().map(function (c) { return { t: c, set: { bfrom: c }, next: "bus_to" }; });
      }
    },
    bus_to: {
      msg: function (a) { return dataState === "error" ? dataErrorMsg() : "And where do you want to go?"; },
      needs: true, nav: true,
      opts: function (a) {
        return busToList(a.bfrom).map(function (c) { return { t: c, set: { bto: c }, next: "bus_result" }; });
      }
    },
    bus_result: {
      msg: function (a) {
        if (dataState === "error") return dataErrorMsg();
        var n = matchBuses(a).length;
        return n ? "Found " + n + " bus" + (n > 1 ? "es" : "") + " from " + a.bfrom + " to " + a.bto + " (cheapest first):"
                 : "No buses are listed for " + a.bfrom + " \u2192 " + a.bto + " right now.";
      },
      needs: true,
      cards: function (a) { return matchBuses(a); },
      nav: true
    },

    /* ---------- DECEMBER IDEAS: mood -> main itinerary package ---------- */
    dec: {
      msg: "December is perfect for so many things! What\u2019s your mood?",
      nav: true,
      opts: [
        { t: "\uD83C\uDFD6\uFE0F Beach & parties", next: "dec_beach" },
        { t: "\u2744\uFE0F Snow & hills",          next: "dec_snow" },
        { t: "\uD83C\uDF34 Calm & scenic",         next: "dec_calm" },
        { t: "\u2728 International escape",       next: "dec_intl" }
      ]
    },
    dec_beach: { msg: "Goa is at its best in December \u2014 great weather, beach shacks and lively nights. Here\u2019s our main Goa package:", cards: function () { return pkgById("goa"); },   nav: true },
    dec_snow:  { msg: "For snow, Manali is a favourite. Book early \u2014 December fills up fast! Here\u2019s our main Manali package:",     cards: function () { return pkgById("manali"); }, nav: true },
    dec_calm:  { msg: "Kerala is calm and green in December \u2014 backwaters, houseboats and cool evenings. Here\u2019s our main Kerala package:", cards: function () { return pkgById("kerala"); }, nav: true },
    dec_intl:  { msg: "Dubai is wonderful in December \u2014 pleasant weather, shopping festival and desert safaris. Here\u2019s our main Dubai package:", cards: function () { return pkgById("dubai"); },  nav: true },

    /* ---------- BOOKING & CANCELLATION HELP ---------- */
    help: {
      msg: "Here\u2019s how to manage your booking:\n1. Log in and go to My Profile.\n2. Open the Cancellation & Refund section.\n3. Read all the cancellation and refund terms & conditions.",
      nav: true
    }
  };

  /* ============ 4) ENGINE (isse change karne ki zaroorat nahi) ============ */
  var $ = function (id) { return document.getElementById(id); };
  var panel = null, body = null, launch = null, initialized = false;

  var ans = {}, history = [], current = null, busy = false, started = false;

  var LOGO_SRC = "data:image/png;base64,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";

  function ensureMarkup() {
    if ($("jarvis")) return;
    var root = document.createElement("div");
    root.id = "jarvis";
    root.innerHTML =
      '<button id="jarvis-launch" aria-label="Open chat with J.A.R.V.I.S">' +
        'J.A.R.V.I.S' +
        '<img class="jv-logo" src="' + LOGO_SRC + '" alt="" width="19" height="30">' +
      '</button>' +
      '<section id="jarvis-panel" role="dialog" aria-label="J.A.R.V.I.S travel assistant" aria-hidden="true">' +
        '<header class="t-head">' +
          '<div class="t-avatar">' +
            '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.2 6.3L20.5 10l-6.3 1.7L12 18l-2.2-6.3L3.5 10l6.3-1.7z"/><path d="M19 15l.9 2.6L22.5 18.5l-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9z"/></svg>' +
          '</div>' +
          '<div>' +
            '<div class="t-title">J.A.R.V.I.S, your travel buddy</div>' +
            '<div class="t-status"><i></i> Here to help you go places</div>' +
          '</div>' +
          '<button class="t-close" id="jarvis-close" aria-label="Close chat">&#10005;</button>' +
        '</header>' +
        '<div id="jarvis-body" aria-live="polite"></div>' +
      '</section>';
    document.body.appendChild(root);
  }

  function scrollDown() { body.scrollTop = body.scrollHeight; }
  function removeChips() { var c = body.querySelectorAll(".t-chips, .t-foot"); for (var i = 0; i < c.length; i++) c[i].remove(); }

  function addBot(text) {
    var d = document.createElement("div"); d.className = "t-msg t-bot"; d.textContent = text; body.appendChild(d);
  }
  function addUser(text) {
    removeChips();
    var d = document.createElement("div"); d.className = "t-msg t-user"; d.textContent = text; body.appendChild(d); scrollDown();
  }
  function showTyping() {
    var d = document.createElement("div"); d.className = "t-typing"; d.id = "t-typing";
    d.innerHTML = "<span></span><span></span><span></span>"; body.appendChild(d); scrollDown();
  }
  function hideTyping() { var t = $("t-typing"); if (t) t.remove(); }

  function el(tag, cls, text) {
    var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e;
  }

  function renderCard(c) {
    var card = el("div", "t-card");
    var top = el("div", "t-card-top");
    var left = el("div"); left.appendChild(el("h4", "", c.title)); left.appendChild(el("div", "sub", c.sub));
    var price = el("div", "price", c.price); if (c.priceNote) price.appendChild(el("small", "", c.priceNote));
    top.appendChild(left); top.appendChild(price);
    card.appendChild(top);
    if (c.text) card.appendChild(el("div", "txt", c.text));
    body.appendChild(card);
  }

  function makeButton(label, cls, handler) {
    var b = el("button", "t-chip" + (cls ? " " + cls : ""), label); b.type = "button"; b.addEventListener("click", handler); return b;
  }

  function renderOptions(node) {
    var wrap = el("div", "t-chips");
    var optList = typeof node.opts === "function" ? node.opts(ans) : (node.opts || []);
    optList.forEach(function (o) {
      if (o.link || o.linkFn) {                       // link = real <a>, chat stays open
        var a = el("a", "t-chip", o.t); a.href = o.linkFn ? o.linkFn(ans) : o.link; a.target = "_blank"; a.rel = "noopener";
        wrap.appendChild(a);
      } else {
        wrap.appendChild(makeButton(o.t, "", function () { choose(o); }));
      }
    });
    if (wrap.children.length) body.appendChild(wrap);

    if (node.nav) {
      var nav = el("div", "t-chips t-nav");
      if (history.length) nav.appendChild(makeButton("\u2B05 Back", "ghost", function () { if (!busy) { addUser("Back"); goBack(); } }));
      nav.appendChild(makeButton("\uD83C\uDFE0 Main menu", "ghost", function () { if (!busy) { addUser("Main menu"); go("menu"); } }));
      body.appendChild(nav);
    }
    if (node.foot) body.appendChild(el("p", "t-foot", node.foot));
  }

  function go(id, push) {
    if (push === undefined) push = true;
    var node = FLOW[id] || FLOW.menu;
    if (!FLOW[id]) id = "menu";

    if (node.skipIf && ans[node.skipIf]) return go(node.skipTo, push);   // already answered -> skip

    if (push && current && current !== id) history.push(current);
    current = id; busy = true;

    showTyping();
    var ready = node.needs ? loadData() : Promise.resolve();      // flights/buses data load hone tak wait
    ready.then(function () {
      setTimeout(function () {
        hideTyping();
        if (node.hero) {
          var h = el("div", "t-hero"); h.appendChild(el("h3", "", node.hero.title)); h.appendChild(el("p", "", node.hero.text)); body.appendChild(h);
        }
        if (node.msg) addBot(typeof node.msg === "function" ? node.msg(ans) : node.msg);
        if (node.cards) node.cards(ans).forEach(renderCard);
        renderOptions(node);
        scrollDown();
        busy = false;
      }, CONFIG.typingDelay);
    });
  }

  function goBack() { go(history.pop() || "menu", false); }

  function choose(o) {
    if (busy) return;
    addUser(o.t);
    if (o.reset) { ans = {}; history = []; current = null; }
    if (o.set) for (var k in o.set) ans[k] = o.set[k];
    go(o.next || "menu");
  }

  /* ---------- open / close ---------- */
  function openChat() {
    panel.classList.add("open"); panel.setAttribute("aria-hidden", "false"); document.body.classList.add("jarvis-open");
    loadData();
    if (!started) { started = true; go("start"); }
  }
  function closeChat() {
    panel.classList.remove("open"); panel.setAttribute("aria-hidden", "true"); document.body.classList.remove("jarvis-open");
    launch.focus();
  }

  function initTripToraChatbot() {
    ensureMarkup();
    panel = $("jarvis-panel");
    body = $("jarvis-body");
    launch = $("jarvis-launch");
    var closeBtn = $("jarvis-close");
    if (!panel || !body || !launch || !closeBtn || initialized) return;
    initialized = true;
    launch.addEventListener("click", function () { panel.classList.contains("open") ? closeChat() : openChat(); });
    closeBtn.addEventListener("click", closeChat);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("open")) closeChat(); });
  }

  window.initTripToraChatbot = initTripToraChatbot;
  if ($("jarvis")) {
    initTripToraChatbot();
  }
})();
