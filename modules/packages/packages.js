/* Triptora - destinations, packages & traveller details (plain JS, hash routing) */
(function () {
  "use strict";

  /* ---------- CONFIG ---------- */
  var NEXT_URL = "../payment/payment.html";
  var FEATURED = 3;                  /* packages shown per tab on the main page; "All" shows everything */
  var PHOTO_MAP = {
    dubai: ["../../assets/images/dubai.jpg", "../../assets/images/travel.jpeg"],
    usa: ["../../assets/images/travel.jpeg"],
    europe: ["../../assets/images/paris.jpg", "../../assets/images/switzerland.jpg", "../../assets/images/travel.jpeg"],
    paris: ["../../assets/images/paris.jpg", "../../assets/images/travel.jpeg"],
    bali: ["../../assets/images/bali.jpg", "../../assets/images/kerala.jpg"],
    maldives: ["../../assets/images/maldives.jpg", "../../assets/images/goa.jpg"],
    singapore: ["../../assets/images/maldives.jpg", "../../assets/images/travel.jpeg"],
    thailand: ["../../assets/images/bali.jpg", "../../assets/images/maldives.jpg"],
    switzerland: ["../../assets/images/switzerland.jpg", "../../assets/images/manali.jpg"],
    goa: ["../../assets/images/goa.jpg", "../../assets/images/maldives.jpg"],
    kerala: ["../../assets/images/kerala.jpg", "../../assets/images/bali.jpg"],
    rajasthan: ["../../assets/images/jaipur.jpg", "../../assets/images/travel.jpeg"],
    ladakh: ["../../assets/images/manali.jpg", "../../assets/images/switzerland.jpg"],
    himachal: ["../../assets/images/manali.jpg", "../../assets/images/switzerland.jpg"],
    andaman: ["../../assets/images/maldives.jpg", "../../assets/images/goa.jpg"],
    vasota: ["../../assets/images/kerala.jpg", "../../assets/images/manali.jpg"]
  };
  var QUERY_MAP = {
    dubai: "dubai", usa: "usa", america: "usa", europe: "europe", paris: "paris",
    bali: "bali", indonesia: "bali", maldives: "maldives", singapore: "singapore", thailand: "thailand",
    switzerland: "switzerland", goa: "goa", kerala: "kerala", rajasthan: "rajasthan",
    jaipur: "rajasthan", ladakh: "ladakh", himachal: "himachal", manali: "himachal",
    andaman: "andaman", vasota: "vasota", "vasota fort": "vasota",
    international: "__tab_international", india: "__tab_india", domestic: "__tab_india", all: "__tab_all"
  };

  var M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var NUM = ["","","","Three","Four","Five","Six","Seven","Eight","Nine"];
  var PAXH = { 1: "One traveller.", 2: "Two travellers.", 4: "Four travellers.", 7: "Seven travellers.", 10: "Ten travellers." };
  var IC = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>',
    plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
    mountain: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
    boat: '<path d="M22 18H2a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4Z"/><path d="M21 14 10 2 3 14h18Z"/><path d="M10 2v16"/>',
    route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/>',
    heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
    food: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    landmark: '<path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l8 5H4z"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    palette: '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1a1.6 1.6 0 0 1 1.7-1.7H16c3 0 5.6-2.5 5.6-5.6C22 6 17.5 2 12 2z"/><circle cx="7.5" cy="11" r=".6"/><circle cx="10" cy="7" r=".6"/><circle cx="15" cy="7" r=".6"/>',
    coffee: '<path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4ZM6 2v2M10 2v2M14 2v2"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    luggage: '<rect x="6" y="6" width="12" height="15" rx="2"/><path d="M9 6V3h6v3M9 10v7M15 10v7"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'
  };
  function ic(n, s) { s = s || 18; return '<svg class="ic" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + IC[n] + "</svg>"; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function inr(n) { return "₹" + Number(n).toLocaleString("en-IN"); }
  function $(id) { return document.getElementById(id); }

  /* ---------- DATA: pax = number of passengers, from = price per person (INR) ---------- */
  var DEST = [
    /* ===== INTERNATIONAL ===== */
    { id: "dubai", grp: "international", code: "DXB", name: "Dubai", crumb: "United Arab Emirates", n: 4, d: 5, pax: 2, from: 34999, g: ["#f6b26b", "#c0652f", "#3b2a4a"], start: [2026, 12, 12],
      tag: "A little gold. A lot of wow.", blurb: "Sky-high dreams, old-world souks and desert sunsets. Meet the city that makes a little extra feel effortless.",
      hl: [["building", "Skyline moments", "See the city from Burj Khalifa."], ["sun", "Desert magic", "Dunes, dinner & starry skies."], ["bag", "Souk wandering", "Spice lanes and golden finds."], ["boat", "Creekside stories", "Take a traditional abra ride."]],
      best: ["November – March", "Sunny days at 20–28°C. Perfect for desert evenings and wandering the waterfront."],
      reach: "Direct flights from Delhi, Mumbai and Bengaluru. Around 3–4 hours from India.", air: "Dubai International Airport (DXB)",
      hotel: "Creekside Gold · Deluxe room", inc: "Breakfast · Private transfers · Desert safari", sight: "City sightseeing", coupon: "DUBAI1000", pk: "A little golden escape" },
    { id: "usa", grp: "international", code: "USA", name: "USA", crumb: "United States of America", n: 8, d: 9, pax: 2, from: 124999, g: ["#f3a24b", "#6b5b95", "#1f3a5f"], start: [2027, 4, 10],
      tag: "Big skies. Bigger stories.", blurb: "City lights, epic road trips and landscapes that make you pause. Your American chapter starts wherever curiosity takes you.",
      hl: [["building", "New York energy", "Skylines and neighbourhood bites."], ["mountain", "Grand Canyon awe", "Views a camera can’t quite hold."], ["route", "Open-road freedom", "Iconic drives, endless detours."], ["camera", "West Coast sunsets", "Golden Gate to Pacific shores."]],
      best: ["April – June · September – October", "Mild days for city strolls and national parks. Weather varies by coast and state."],
      reach: "Direct flights from Delhi and Mumbai to New York, Chicago & San Francisco.", air: "New York (JFK) · San Francisco (SFO)",
      hotel: "Skyline Grand · Deluxe room", inc: "Breakfast · Private transfers · City & canyon tours", sight: "City sightseeing", coupon: "USA1000", pk: "A little big-sky escape" },
    { id: "europe", grp: "international", code: "EUR", name: "Europe", crumb: "France · Italy · Switzerland", n: 7, d: 8, pax: 2, from: 109999, g: ["#a8d0e6", "#e8c9a0", "#5f8f5a"], start: [2027, 4, 10],
      tag: "A hundred little love stories.", blurb: "Café mornings in Paris, golden canals in Venice and fresh Alpine air. Take the scenic route through your European daydream.",
      hl: [["coffee", "Paris, unhurried", "Café corners and Eiffel views."], ["boat", "Venetian days", "Canals, colour and slow strolls."], ["mountain", "Alpine wonder", "Crisp air and postcard peaks."], ["route", "Scenic rail rides", "The journey is the highlight."]],
      best: ["April – June · September – October", "Gentle temperatures, fewer crowds and just-right days for walking and sightseeing."],
      reach: "Fly direct from Delhi, Mumbai or Bengaluru. Connect between cities by rail.", air: "Paris Charles de Gaulle (CDG)",
      hotel: "Boutique Europe Stays · Classic room", inc: "Breakfast · Private transfers · Scenic rail ride", sight: "City sightseeing", coupon: "EURO1000", pk: "A little love-story escape" },
    { id: "paris", grp: "international", code: "PAR", name: "Paris", crumb: "France · The City of Light", n: 5, d: 6, pax: 2, from: 74900, g: ["#e9c6b4", "#b56576", "#355070"], start: [2027, 4, 14],
      tag: "Art, croissants & Seine evenings.", blurb: "Golden hour along the Seine, Louvre masterpieces and cosy café terraces in Montmartre. Paris made unhurried and personal.",
      hl: [["landmark", "Eiffel & Trocadéro", "Sparkling evening skyline views."], ["coffee", "Montmartre cafés", "Slow mornings in sunlit alleys."], ["boat", "Seine river cruise", "Glide past illuminated landmarks."], ["palette", "Louvre & d'Orsay", "Curated skip-the-line museum pass."]],
      best: ["April – June · September – October", "Mild spring & autumn strolls at 15–24°C with blooming parks."],
      reach: "Direct flights from Delhi, Mumbai and Bengaluru to Charles de Gaulle.", air: "Paris Charles de Gaulle (CDG)",
      hotel: "Left Bank Boutique Hotel · Classic room", inc: "Breakfast · Airport transfers · Louvre & Seine pass", sight: "City sightseeing", coupon: "PARIS1000", pk: "A little Parisian escape" },
    { id: "bali", grp: "international", code: "BAL", name: "Bali", crumb: "Indonesia · Ubud · Uluwatu", n: 5, d: 6, pax: 1, from: 42999, g: ["#8fd0a0", "#2f7f5f", "#f2c479"], start: [2027, 2, 6],
      tag: "Just you. Just the island.", blurb: "Rice terraces at sunrise, temple evenings and beach cafés. A solo trip where every hour is entirely yours.",
      hl: [["leaf", "Ubud rice terraces", "Sunrise walks through Tegalalang."], ["pin", "Temple hopping", "Uluwatu and Tanah Lot at sunset."], ["heart", "Slow wellness", "Yoga, spa and a Balinese massage."], ["sun", "Beach club days", "Seminyak and Nusa Dua shores."]],
      best: ["April – October", "Dry-season days at 26–31°C. Ideal for temples, terraces and beaches."],
      reach: "Direct and one-stop flights from Delhi, Mumbai and Bengaluru to Denpasar.", air: "Ngurah Rai International Airport (DPS)",
      hotel: "Ubud Leaf Villa · Private room", inc: "Breakfast · Private transfers · Ubud & temple tour", sight: "Ubud & temple tour", coupon: "BALI1000", pk: "A little solo escape" },
    { id: "maldives", grp: "international", code: "MLE", name: "Maldives", crumb: "Atolls · Lagoon Paradise", n: 3, d: 4, pax: 2, from: 58900, g: ["#6fd6e6", "#2389a8", "#0f4c75"], start: [2027, 3, 5],
      tag: "Blue lagoons, quiet mornings.", blurb: "Overwater sunrise breakfasts, reef snorkelling and turquoise horizons. An effortless island sanctuary built for two.",
      hl: [["sun", "Overwater decks", "Step straight into the lagoon."], ["boat", "Speedboat transfers", "Scenic island arrivals from Malé."], ["camera", "Coral reef snorkel", "Swim beside vibrant house reefs."], ["moon", "Sunset Dhoni cruise", "Warm ocean breeze at dusk."]],
      best: ["November – April", "Clear tropical skies at 27–31°C and calm lagoon waters."],
      reach: "Direct flights from Mumbai, Bengaluru, Kochi and Delhi to Malé.", air: "Velana International Airport (MLE)",
      hotel: "Atoll Sanctuary Resort · Overwater Villa", inc: "Breakfast · Speedboat transfers · Sunset cruise", sight: "Reef & island excursions", coupon: "MALDIVES1000", pk: "A little lagoon escape" },
    { id: "singapore", grp: "international", code: "SIN", name: "Singapore", crumb: "Singapore · Sentosa", n: 4, d: 5, pax: 4, from: 74999, g: ["#7fb7e6", "#5a7fc0", "#2a3f7a"], start: [2027, 5, 22],
      tag: "Little explorers. Big city.", blurb: "Gardens that glow, wildlife after dark and rides for every age. A city that keeps the whole family smiling.",
      hl: [["leaf", "Gardens by the Bay", "Supertree lights after sunset."], ["camera", "Sentosa fun", "Beaches, rides and easy family days."], ["moon", "Night Safari", "Wildlife wanders close after dark."], ["food", "Hawker feasts", "Tasty, simple bites for every taste."]],
      best: ["February – April", "Drier spells with warm days at 27–32°C. Easy for outdoor attractions."],
      reach: "Direct flights from Delhi, Mumbai, Bengaluru and Chennai. About 5–6 hours.", air: "Singapore Changi Airport (SIN)",
      hotel: "Marina Family Suites · Family room", inc: "Breakfast · Private transfers · Sentosa day pass", sight: "City & Sentosa tours", coupon: "SING1000", pk: "A little family escape" },
    { id: "thailand", grp: "international", code: "THA", name: "Thailand", crumb: "Bangkok · Phuket · Phi Phi", n: 5, d: 6, pax: 10, from: 36999, g: ["#f6c36b", "#e07a3f", "#2f7f8f"], start: [2027, 1, 15],
      tag: "Bring everyone. Skip the rules.", blurb: "Island hopping, street food and sunset boat rides. Made for a friends-or-cousins trip that needs a bigger table.",
      hl: [["boat", "Phi Phi island hop", "Speedboat days over clear water."], ["food", "Bangkok street food", "Night markets and noodle stops."], ["landmark", "Temples & palaces", "Grand Palace and Wat Arun."], ["moon", "Beach nights", "Phuket sunsets and seaside dinners."]],
      best: ["November – March", "Cooler, dry-season days at 24–33°C. Perfect for island days."],
      reach: "Direct flights from major Indian cities to Bangkok and Phuket.", air: "Bangkok (BKK) · Phuket (HKT)",
      hotel: "Andaman Group Villas · Twin & triple rooms", inc: "Breakfast · Private van transfers · Island-hopping tour", sight: "City & island tours", coupon: "THAI1000", pk: "A little big-group escape" },
    { id: "switzerland", grp: "international", code: "CHE", name: "Switzerland", crumb: "Zurich · Lucerne · Interlaken", n: 6, d: 7, pax: 7, from: 159999, g: ["#b8d8f0", "#6f9bc0", "#3f6f4f"], start: [2027, 6, 5],
      tag: "Postcard peaks, together.", blurb: "Lake mornings, mountain trains and cosy village evenings. A scenic trip for a close-knit group of seven.",
      hl: [["mountain", "Jungfraujoch", "Top of Europe, snow all year."], ["boat", "Lake Lucerne cruise", "Calm water and Alpine views."], ["route", "Scenic rail rides", "Window seats and glacier views."], ["coffee", "Village evenings", "Fondue, chocolate and slow strolls."]],
      best: ["May – September", "Mild days at 12–24°C, green valleys and open mountain routes."],
      reach: "Direct flights from Delhi and Mumbai to Zurich. Move between towns by train.", air: "Zurich Airport (ZRH)",
      hotel: "Alpine Lake Lodge · Twin & triple rooms", inc: "Breakfast · Private transfers · Swiss Travel Pass", sight: "Mountain & lake tours", coupon: "SWISS1000", pk: "A little Alpine escape" },

    /* ===== INDIA ===== */
    { id: "goa", grp: "india", code: "GOA", name: "Goa", crumb: "India · The Konkan Coast", n: 3, d: 4, pax: 2, from: 8999, g: ["#7ad0d6", "#f2d9a2", "#2e8b8f"], start: [2026, 12, 12],
      tag: "Less rush. More sea breeze.", blurb: "Barefoot mornings, colourful lanes and sunsets worth staying for. Find your own rhythm on India’s happiest coastline.",
      hl: [["sun", "Quiet beach days", "Palolem and peaceful Agonda."], ["camera", "Colourful little lanes", "Fontainhas’ postcard corners."], ["food", "Coastal cravings", "Fresh fish, poi and local cafés."], ["moon", "Sunset rituals", "Golden-hour memories, daily."]],
      best: ["November – February", "Breezy beach days at 22–30°C. Catch a sunset, then linger a little longer."],
      reach: "Direct flights to Manohar (GOX) and Dabolim (GOI), or a scenic train to Madgaon.", air: "Manohar (GOX) · Dabolim (GOI)",
      hotel: "Seashell Cove · Deluxe room", inc: "Breakfast · Private transfers · South Goa tour", sight: "Local sightseeing", coupon: "GOA1000", pk: "A little coastal escape",
      pdesc: "A pocket of sunshine for two. Quiet beaches, colourful lanes and mornings with nowhere to rush.",
      itin: [{ day: 1, i: "plane", t: "Hello, Goa. Hello, slow.", x: "Airport pickup, Seashell Cove check-in, then a sunset café stroll by the water." },
             { day: 2, i: "sun", t: "South Goa, one lovely stop at a time.", x: "Breakfast, a guided South Goa outing, peaceful Agonda beach and a golden-hour riverside pause." },
             { day: 3, i: "coffee", t: "Make a little room for wandering.", x: "A free day for Fontainhas cafés, beach reading or a dip. Optional activities are just a message away." },
             { day: 4, i: "luggage", t: "One last breakfast. A bag of memories.", x: "Enjoy breakfast, check out by 11 AM and take your private transfer to the airport." }] },
    { id: "kerala", grp: "india", code: "KER", name: "Kerala", crumb: "India · God’s Own Country", n: 4, d: 5, pax: 2, from: 12499, g: ["#9bd0a0", "#2f6f4f", "#12372a"], start: [2026, 12, 12],
      tag: "Slow down. Sail into green.", blurb: "Houseboats, misty tea hills and a thousand shades of green. A gentle escape that gives you room to breathe.",
      hl: [["boat", "Backwater bliss", "A houseboat day in Alleppey."], ["leaf", "Tea-country calm", "Misty mornings in Munnar."], ["heart", "A little restoration", "Traditional Ayurvedic wellness."], ["food", "Flavours of Kerala", "Coconut, spices and warm welcomes."]],
      best: ["September – March", "Comfortable days at 23–30°C, calm backwaters and cool mornings in Munnar."],
      reach: "Fly into Kochi, then explore Munnar and Alleppey with easy private transfers.", air: "Cochin International Airport (COK)",
      hotel: "Backwater Bliss Resort · Deluxe room", inc: "Breakfast · Private transfers · Houseboat cruise", sight: "Local sightseeing", coupon: "KERALA1000", pk: "A little backwater escape" },
    { id: "rajasthan", grp: "india", code: "RAJ", name: "Rajasthan", crumb: "India · The Land of Kings", n: 5, d: 6, pax: 2, from: 14999, g: ["#e9a58f", "#c4623f", "#f2c479"], start: [2026, 12, 12],
      tag: "Every shade tells a story.", blurb: "Rose-coloured palaces, golden dunes and royal welcomes. Step into a place where even the everyday feels a little grand.",
      hl: [["landmark", "Palace daydreams", "Jaipur’s intricate royal wonders."], ["moon", "Golden desert nights", "Dune sunsets near Jaisalmer."], ["boat", "Lakeside romance", "Slow evenings on Lake Pichola."], ["palette", "Crafted with colour", "Block prints and local bazaars."]],
      best: ["October – March", "Pleasant days at 15–28°C. Pack a light layer for chilly desert evenings."],
      reach: "Fly into Jaipur from major Indian cities. Continue to Jodhpur and Udaipur by road or rail.", air: "Jaipur International Airport (JAI)",
      hotel: "Royal Haveli Collection · Heritage room", inc: "Breakfast · Private transfers · Guided city tours", sight: "Guided city tours", coupon: "RAJ1000", pk: "A little royal escape" },
    { id: "ladakh", grp: "india", code: "LDK", name: "Ladakh", crumb: "India · The Land of High Passes", n: 5, d: 6, pax: 1, from: 24999, g: ["#e6c9a0", "#8f6f4f", "#3f5f8a"], start: [2027, 6, 12],
      tag: "Thin air. Wide open thoughts.", blurb: "Moonland roads, monasteries and turquoise lakes. A solo journey with all the quiet you could ask for.",
      hl: [["mountain", "Pangong Tso", "Blue water against brown peaks."], ["landmark", "Monastery mornings", "Thiksey and Hemis, unhurried."], ["route", "High-pass drives", "Khardung La and winding roads."], ["moon", "Starry nights", "Clear skies that go on forever."]],
      best: ["June – September", "Roads are open and days are 15–25°C. Nights are cold, so pack warm."],
      reach: "Fly into Leh from Delhi. Plan a full day to acclimatise on arrival.", air: "Kushok Bakula Rimpochee Airport (IXL)",
      hotel: "Leh Valley Homestay · Private room", inc: "Breakfast · Private transfers · Pangong & Nubra drive", sight: "Leh local sightseeing", coupon: "LADAKH1000", pk: "A little solo-quiet escape" },
    { id: "himachal", grp: "india", code: "HIM", name: "Himachal", crumb: "India · Shimla · Manali", n: 5, d: 6, pax: 4, from: 18999, g: ["#b8d8e8", "#5f8f6a", "#2f4f3a"], start: [2026, 12, 19],
      tag: "Cool air. Warm memories.", blurb: "Pine forests, snow-dusted views and toy-train rides. A family-friendly mountain break at an easy pace.",
      hl: [["mountain", "Solang Valley", "Snow play and easy adventures."], ["route", "Toy train ride", "Kalka–Shimla, window seats."], ["leaf", "Pine forest walks", "Gentle trails for all ages."], ["coffee", "Mountain cafés", "Hot momos and chai breaks."]],
      best: ["March – June · December – January", "Cool 10–25°C summers and snow in winter. Pick by what your family loves."],
      reach: "Fly into Chandigarh, then a private cab to Shimla and Manali.", air: "Chandigarh Airport (IXC)",
      hotel: "Pine View Resort · Family room", inc: "Breakfast · Private SUV · Solang Valley visit", sight: "Shimla & Manali tours", coupon: "HIMACHAL1000", pk: "A little family mountain escape" },
    { id: "andaman", grp: "india", code: "AND", name: "Andaman", crumb: "India · Port Blair · Havelock", n: 5, d: 6, pax: 10, from: 21999, g: ["#7fd6d6", "#2f9fbf", "#1f5f8a"], start: [2027, 2, 13],
      tag: "Ten friends. One blue ocean.", blurb: "Glass-clear water, white sand and sunset ferries. A relaxed island getaway made for a big group.",
      hl: [["sun", "Radhanagar Beach", "Long walks and golden sunsets."], ["boat", "Ferry to Havelock", "Island hops with a sea breeze."], ["camera", "Elephant Beach snorkel", "Reefs and bright, busy fish."], ["landmark", "Cellular Jail", "A moving evening light show."]],
      best: ["October – May", "Calm seas and sunny 24–32°C days for beaches and water sports."],
      reach: "Direct flights from Chennai, Kolkata and Delhi to Port Blair. Ferries link the islands.", air: "Veer Savarkar Airport (IXZ)",
      hotel: "Havelock Coral Resort · Twin rooms", inc: "Breakfast · Private transfers · Ferry & snorkelling", sight: "Island sightseeing", coupon: "ANDAMAN1000", pk: "A little island-group escape" },
    { id: "vasota", grp: "india", code: "VSF", name: "Vasota Fort", crumb: "Satara · Maharashtra", n: 2, d: 3, pax: 7, from: 4999, cp: 500, g: ["#9bc08a", "#3f6f4a", "#1f3f2f"], start: [2026, 12, 5],
      tag: "Boats, forest and a fort above the lake.", blurb: "Cross the Shivsagar backwaters by boat, trek through dense Koyna forest and climb to Vasota (Vyaghragad). A jungle weekend for a group of seven, starting in Satara.",
      hl: [["boat", "Shivsagar boat ride", "Cross the Koyna backwaters to the trailhead."], ["mountain", "Forest trek", "About 8 km of dense jungle trail."], ["landmark", "Fort ruins", "Old wada, jail ruins and temples on top."], ["camera", "Valley views", "Koyna Dam and layered Sahyadri peaks."]],
      best: ["October – February", "Cool, clear days and green forest. Entry is permit-based and we arrange it for your group."],
      reach: "Pickup in Satara, then a private drive to Bamnoli, the trailhead village by the lake.", air: "Satara (STR) station · Pune Airport (PNQ)",
      hotel: "Koyna Lakeside Camp · Twin-sharing tents", inc: "Breakfast · Dinner · Transport from Satara · Boat rides · Forest permits", sight: "Vasota trek & boating", coupon: "VASOTA500", pk: "A little jungle-fort escape",
      pdesc: "A jungle weekend for seven. Boat across the lake, trek to a fort in the Koyna forest and camp by the water.",
      itin: [{ day: 1, i: "route", t: "Satara to the lake.", x: "Pickup in Satara, drive to Bamnoli, check in at the lakeside camp and unwind by the Shivsagar backwaters." },
             { day: 2, i: "boat", t: "Boat, forest, fort.", x: "Early breakfast, a boat across the backwaters, then the forest trek (about 8 km, easy to moderate) to Vasota. Explore the ruins and viewpoints, eat a packed lunch on top, then trek and boat back." },
             { day: 3, i: "luggage", t: "A slow morning, then home.", x: "Breakfast by the lake, check out and travel back to Satara by private transport." }] }
  ];
  function dest(id) { return DEST.filter(function (x) { return x.id === id; })[0]; }

  var COPY = {
    international: { h: "A whole wide world of “wow”.", s: "Big dreams deserve a departure date. Find your next stamp, story and favourite somewhere." },
    india: { h: "So much wonder. So close to home.", s: "From sea-salt mornings to royal evenings. Fall in love with India, one little escape at a time." },
    all: { h: "Every escape, all in one place.", s: "Solo, family or group, near or far. Browse every Triptora package and pick your next story." }
  };

  /* ---------- helpers: dates, pricing, itinerary, images ---------- */
  function who(d) { return d.pax === 1 ? "Solo" : d.pax === 2 ? "For two" : d.pax === 4 ? "Family of 4" : "Group of " + d.pax; }
  function pl(d) { return d.pax + (d.pax === 1 ? " passenger" : " passengers"); }
  function dateOf(d, day) { var s = new Date(d.start[0], d.start[1] - 1, d.start[2]); s.setDate(s.getDate() + day); return s; }
  function dRange(d) { var s = dateOf(d, 0), e = dateOf(d, d.n); return (s.getMonth() === e.getMonth() ? s.getDate() : s.getDate() + " " + M[s.getMonth()]) + "–" + e.getDate() + " " + M[e.getMonth()] + " " + e.getFullYear(); }
  function dLabel(d, day) { var x = dateOf(d, day - 1); return x.getDate() + " " + M[x.getMonth()]; }
  function price(d) {
    var T = d.from * d.pax, tr = Math.round(T * 0.133 / 100) * 100, tx = Math.floor(T * 0.0555), cp = d.cp || 1000;
    return { stay: T - tr - tx + cp, tr: tr, tx: tx, cp: cp, total: T };
  }
  function itin(d) {
    if (d.itin) return d.itin;
    var out = [{ day: 1, i: "plane", t: "Hello, " + d.name + ". Hello, slow.", x: "Airport pickup, " + d.hotel.split(" ·")[0] + " check-in and an easy first evening." }], mid = Math.min(4, d.d - 2);
    for (var k = 0; k < mid; k++) out.push({ day: 2 + Math.floor(k * (d.d - 2) / mid), i: d.hl[k][0], t: d.hl[k][1], x: d.hl[k][2] });
    out.push({ day: d.d, i: "luggage", t: "One last breakfast. A bag of memories.", x: "Enjoy breakfast, check out by 11 AM and take your private transfer to the airport." });
    return out;
  }
  /* photo i of a package: d.img[i] or mapped local photo. Gradient shows if no photo slot or file missing. */
  function ph(d, i) {
    var c = d.g, r = [c[i % 3], c[(i + 1) % 3], c[(i + 2) % 3]],
      list = (d.img && d.img.length) ? d.img : (PHOTO_MAP[d.id] || []),
      src = list[i];
    return '<div class="ph" style="background:linear-gradient(' + (150 + i * 25) + "deg," + r.join(",") + ')"><span>' + esc(d.name) + "</span>" +
      (src ? '<img src="' + esc(src) + '" alt="' + esc(d.name) + '" decoding="async" onerror="this.remove()">' : "") + "</div>";
  }
  function whoChip(d) { return '<span class="who">' + ic(d.pax === 1 ? "user" : "users", 14) + who(d) + "</span>"; }

  /* ---------- state (sessionStorage so refresh keeps it) ---------- */
  var S;
  function blank() { return { first: "", last: "", gender: "Select", dob: "", nat: "Indian" }; }
  function defaults() {
    return { p: [{ first: "Aarav", last: "Sharma", gender: "Male", dob: "15 Aug 1994", nat: "Indian" }], email: "aarav.sharma@gmail.com", mobile: "+91 98765 43210", wa: true };
  }
  try { S = JSON.parse(sessionStorage.getItem("triptora.s2")) || defaults(); } catch (e) { S = defaults(); }
  function save() { try { sessionStorage.setItem("triptora.s2", JSON.stringify(S)); } catch (e) {} }
  function ensureP(n) { while (S.p.length < n) S.p.push(blank()); }
  function setPath(k, v) { var p = k.split("."), o = S; for (var i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p[p.length - 1]] = v; save(); }
  function toast(m) { var t = document.createElement("div"); t.className = "toast"; t.textContent = m; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600); }

  /* ---------- shared UI pieces ---------- */
  function stepper(id, cur) {
    return '<div class="steps">' + (cur === 1 ? '<span class="on">1 Itinerary</span><span>2 Travellers</span>' : '<a class="done" href="#/package/' + id + '">← Itinerary</a><span class="on">2 Travellers</span>') + "</div>";
  }
  function tally(d) {
    var p = price(d);
    return '<aside><div class="card tally"><h3>Your trip, tallied</h3><div class="pk"><div class="lbl">Package</div><b>' + d.name + " · " + d.pk + "</b><p>" + dRange(d) + " · " + pl(d) + "</p><p>" + d.n + " nights · " + d.hotel + "</p><em>" + d.inc + "</em></div>" +
      "<dl><div><span>Stay & experiences · " + pl(d) + "</span><span>" + inr(p.stay) + "</span></div><div><span>Private transfers</span><span>" + inr(p.tr) + "</span></div><div><span>Taxes</span><span>" + inr(p.tx) + "</span></div><div><span>" + d.coupon + " saving</span><span>−" + inr(p.cp) + "</span></div></dl>" +
      '<div class="tot"><b>Total to pay</b><span class="price">' + inr(p.total) + "</span></div><small>All taxes included. No last-minute surprises.</small></div>" +
      '<div class="treat"><h4>' + ic("mail") + " A little travel treat</h4><p>A happy little saving for your next memory.</p><div>" + d.coupon + '<span class="ok">Applied ✓</span></div></div></aside>';
  }
  function shell(d, cur, h1, main) {
    return '<section class="wrap page"><div class="eyebrow">A little escape. A lot to look forward to.</div><h1>' + h1 + "</h1>" + stepper(d.id, cur) + '<div class="cols"><div>' + main + "</div>" + tally(d) + "</div></section>";
  }
  function fld(k, label, val, o) {
    o = o || {};
    var inp = o.opts ? '<select data-k="' + k + '">' + o.opts.map(function (x) { return "<option" + (x === val ? " selected" : "") + ">" + x + "</option>"; }).join("") + "</select>"
      : '<input data-k="' + k + '" value="' + esc(val) + '"' + (o.ph ? ' placeholder="' + o.ph + '"' : "") + (o.mode ? ' inputmode="' + o.mode + '"' : "") + (o.max ? ' maxlength="' + o.max + '"' : "") + ' autocomplete="off">';
    return '<div class="fw"><label class="fld"><span>' + label + "</span>" + inp + '</label><small class="err" data-e="' + k + '"></small></div>';
  }

  /* ---------- views ---------- */
  function cards(list) {
    return list.map(function (d) {
      return '<article class="dcard">' + ph(d, 0) + '<div class="dbody"><div class="drow"><h2>' + d.name + '</h2><span class="chip">' + d.n + " nights · " + d.d + " days</span></div>" + whoChip(d) + "<h3>" + d.tag + "</h3><p>" + d.blurb + '</p><div class="dfoot"><div><div class="lbl">Escapes from / person</div><div class="price">' + inr(d.from) + '</div></div><a class="btn" href="#/destination/' + d.id + '">Explore ↗</a></div></div></article>';
    }).join("");
  }
  function vList(tab) {
    tab = tab === "india" || tab === "all" ? tab : "international";
    var c = COPY[tab], body;
    if (tab === "all") {
      body = ["international", "india"].map(function (g) {
        return '<h3 class="gh">' + (g === "india" ? "India" : "International") + '</h3><div class="dgrid">' + cards(DEST.filter(function (d) { return d.grp === g; })) + "</div>";
      }).join("");
    } else {
      var all = DEST.filter(function (d) { return d.grp === tab; });
      body = '<div class="dgrid">' + cards(all.slice(0, FEATURED)) + '</div><div class="more"><a class="btn" href="#/destinations/all">View all ' + DEST.length + " packages →</a></div>";
    }
    return '<section class="wrap page"><div class="eyebrow">Follow your curious</div><h1>' + c.h + '</h1><p class="sub">' + c.s + "</p>" +
      '<div class="toolbar"><div class="pills"><a class="pill' + (tab === "international" ? " on" : "") + '" href="#/destinations/international">International</a><a class="pill' + (tab === "india" ? " on" : "") + '" href="#/destinations/india">India</a><a class="pill' + (tab === "all" ? " on" : "") + '" href="#/destinations/all">All</a></div></div>' +
      body +
      '<div class="card easy"><h4>Travel a little easier</h4><ul><li>Handpicked stays & local experiences</li><li>Clear prices, thoughtful itineraries</li><li>A real human whenever you need one</li></ul></div></section>';
  }
  function vDest(d) {
    var tiles = d.hl.map(function (h) { return '<div class="tile"><b>' + ic(h[0]) + h[1] + "</b><p>" + h[2] + "</p></div>"; }).join("");
    return '<section class="wrap page"><div class="eyebrow"><a href="#/destinations/' + d.grp + '">Destinations</a> / ' + d.crumb + "</div><h1>" + d.name + ". " + d.tag + "</h1>" +
      '<div class="gal">' + ph(d, 0) + ph(d, 1) + ph(d, 2) + "</div>" +
      '<div class="tabs"><span class="pill on">Overview</span><a class="pill" href="#/package/' + d.id + '">Packages</a>' + whoChip(d).replace('class="who"', 'class="who" style="margin:0"') + "</div>" +
      '<p class="sub">' + d.blurb + '</p><div class="tiles">' + tiles + "</div>" +
      '<div class="two"><div class="card info"><h3>' + ic("sun", 20) + "Best time to say hello</h3><b>" + d.best[0] + "</b><p>" + d.best[1] + '</p></div><div class="card info"><h3>' + ic("plane", 20) + "Getting there, made easy</h3><p>" + d.reach + "</p><i>" + d.air + "</i></div></div>" +
      '<div class="banner cta"><div><h3>Your ' + d.name + " story starts here.</h3><p>" + d.n + " nights · " + d.d + " days · " + who(d) + ' · Handpicked stays, local moments & happy little details.</p></div><div class="right"><div><div class="lbl">From / person</div><div class="price">' + inr(d.from) + '</div></div><a class="btn" href="#/package/' + d.id + '">Explore package →</a></div></div></section>';
  }
  function vPackage(d) {
    var rows = itin(d).map(function (r) { return '<div class="row"><div class="d">' + ic(r.i, 22) + dLabel(d, r.day) + "</div><div><b>" + r.t + "</b><p>" + r.x + "</p></div></div>"; }).join("");
    var main = '<div class="phero">' + ph(d, 0) + '<div><span class="chip up">' + d.n + " nights · " + d.d + " days · " + who(d) + "</span><h2>" + d.name + ", at your own pace.</h2><p>" + (d.pdesc || d.blurb) + '</p><div class="rate"><b>★</b> 4.8 · ' + (d.id === "vasota" ? "Meals, boat rides & transport from Satara included" : "Breakfast & private transfers included") + "</div></div></div>" +
      '<span class="pill on sm">Itinerary</span><div class="card itin">' + rows + "</div>" +
      '<div class="incl"><span>✓ ' + d.n + "-night stay</span><span>✓ " + (d.id === "vasota" ? "Meals" : "Breakfast") + "</span><span>✓ Transfers</span><span>✓ " + d.sight + '</span></div><p class="note">' + (d.grp === "international" ? "Flights, visa and personal expenses are not included." : d.id === "vasota" ? "Personal expenses and travel insurance are not included." : "Flights to " + d.name + " and personal expenses are not included.") + '</p><div class="end"><a class="btn" href="#/travellers/' + d.id + '">' + (d.pax === 1 ? "Book solo" : "Book for " + d.pax) + " →</a></div>";
    return shell(d, 1, NUM[d.d] + " days of “we needed this”.", main);
  }
  function vTravellers(d) {
    ensureP(d.pax);
    var G = ["Select", "Male", "Female", "Other"], h = "";
    for (var i = 0; i < d.pax; i++) {
      var t = S.p[i], k = "p." + i + ".";
      h += '<div class="sec' + (i ? "" : " f") + '">Passenger ' + (i + 1) + '</div><div class="g3">' + fld(k + "first", "First name", t.first) + fld(k + "last", "Last name", t.last) + fld(k + "gender", "Gender", t.gender, { opts: G }) + "</div>" +
        '<div class="g2">' + fld(k + "dob", "Date of birth", t.dob, { ph: "15 Aug 1994" }) + fld(k + "nat", "Nationality", t.nat) + "</div>";
    }
    var main = '<div class="card form" id="tform"><div class="h"><div><h2>Who’s coming along?</h2><p class="hint">Enter names exactly as they appear on your government ID.</p></div><span class="chip">' + pl(d) + '</span></div>' +
      '<div class="saved">✓ Use saved traveller: Aarav Sharma</div>' + h +
      '<div class="sec">Where should we send the happy news?</div><div class="g2">' + fld("email", "Email address", S.email, { mode: "email" }) + fld("mobile", "Mobile number", S.mobile, { mode: "tel", max: 16 }) + "</div>" +
      '<label class="chk"><input type="checkbox" data-k="wa"' + (S.wa ? " checked" : "") + '> Save my ticket and trip updates on WhatsApp. No spam, just good journeys.</label><p class="tiny">Your details are safe with us.</p>' +
      '<div class="end"><button class="btn" data-act="cont">Continue to payment →</button></div></div>';
    return shell(d, 2, (PAXH[d.pax] || d.pax + " travellers.") + " One happy little escape.", main);
  }

  /* ---------- validation ---------- */
  function mk(y, m, d) { var x = new Date(y, m, d); return x.getFullYear() === y && x.getMonth() === m && x.getDate() === d ? x : null; }
  function pDate(s) {
    s = (s || "").trim(); var m;
    if ((m = s.match(/^(\d{1,2})[\s\/.\-]+([A-Za-z]{3,9})[\s\/.\-,]+(\d{4})$/))) { var i = M.map(function (x) { return x.toLowerCase(); }).indexOf(m[2].slice(0, 3).toLowerCase()); return i < 0 ? null : mk(+m[3], i, +m[1]); }
    if ((m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/))) return mk(+m[3], +m[2] - 1, +m[1]);
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) return mk(+m[1], +m[2] - 1, +m[3]);
    return null;
  }
  var NAME = /^[A-Za-z][A-Za-z .'\-]+$/;
  function showErr(errs) {
    var first = null;
    document.querySelectorAll("[data-e]").forEach(function (e) { e.textContent = ""; var f = e.previousElementSibling; if (f) f.classList.remove("bad"); });
    Object.keys(errs).forEach(function (k) {
      var e = document.querySelector('[data-e="' + k + '"]'); if (!e) return;
      e.textContent = errs[k]; e.previousElementSibling.classList.add("bad");
      if (!first) first = e.previousElementSibling.querySelector("input,select");
    });
    if (first) first.focus();
    return !first;
  }
  function checkTravellers(d) {
    var e = {}, now = new Date(), mob = String(S.mobile).replace(/\D/g, "");
    for (var i = 0; i < d.pax; i++) {
      var t = S.p[i], k = "p." + i + ".", dob = pDate(t.dob);
      if (!NAME.test(t.first.trim())) e[k + "first"] = "Enter a valid first name";
      if (!NAME.test(t.last.trim())) e[k + "last"] = "Enter a valid last name";
      if (!t.gender || t.gender === "Select") e[k + "gender"] = "Select gender";
      if (!dob || dob > now) e[k + "dob"] = "Use a valid date, e.g. 15 Aug 1994";
      else if (i === 0 && now.getFullYear() - dob.getFullYear() - (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0) < 18) e[k + "dob"] = "Passenger 1 must be 18 or older";
      if (!t.nat.trim()) e[k + "nat"] = "Enter nationality";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(S.email.trim())) e.email = "Enter a valid email address";
    if (!/^[6-9]\d{9}$/.test(mob.length === 12 && mob.slice(0, 2) === "91" ? mob.slice(2) : mob)) e.mobile = "Enter a valid 10-digit mobile number";
    return showErr(e);
  }

  /* ---------- router ---------- */
  function resolveInitialHash() {
    if (location.hash) return location.hash;
    var q = new URLSearchParams(window.location.search).get("q");
    if (!q) return "#/destinations";
    var key = q.trim().toLowerCase(), mapped = QUERY_MAP[key];
    if (!mapped) {
      var found = DEST.filter(function (x) { return x.name.toLowerCase().indexOf(key) !== -1 || x.id.indexOf(key) !== -1; })[0];
      if (found) mapped = found.id;
    }
    if (mapped && mapped.indexOf("__tab_") === 0) return "#/destinations/" + mapped.slice(6);
    if (mapped && dest(mapped)) return "#/destination/" + mapped;
    return "#/destinations";
  }
  var cur = resolveInitialHash();
  try { if (location.hash !== cur) history.replaceState(null, "", cur); } catch (x) {}
  function go(h) { cur = h; try { if (location.hash !== h) location.hash = h; } catch (x) {} route(); }
  function route() {
    var p = cur.replace(/^#\/?/, "").split("/"), name = p[0] || "destinations", d = p[1] && dest(p[1]), html, title = "Triptora";
    if (name === "destinations") { html = vList(p[1]); title = "Destinations · Triptora"; }
    else if (!d) return go("#/destinations");
    else if (name === "destination") { html = vDest(d); title = d.name + " · Triptora"; }
    else if (name === "package") { html = vPackage(d); title = d.name + " package · Triptora"; }
    else if (name === "travellers") { html = vTravellers(d); title = d.name + " travellers · Triptora"; }
    else return go("#/destinations");
    $("app").innerHTML = html;
    document.title = title;
    window.scrollTo(0, 0);
  }

  /* ---------- events ---------- */
  document.addEventListener("input", function (e) {
    var t = e.target, k = t.getAttribute && t.getAttribute("data-k"); if (!k) return;
    setPath(k, t.type === "checkbox" ? t.checked : t.value);
    var er = document.querySelector('[data-e="' + k + '"]'); if (er) { er.textContent = ""; er.previousElementSibling.classList.remove("bad"); }
  });
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#/"]') : null;
    if (a) { e.preventDefault(); go(a.getAttribute("href")); return; }
    var el = e.target.closest ? e.target.closest("[data-act]") : null; if (!el) return;
    var d = dest(cur.split("/")[2]);
    if (el.getAttribute("data-act") === "cont" && d && checkTravellers(d)) {
      save();
      var out = { package: d.id, passengersCount: d.pax, passengers: S.p.slice(0, d.pax), email: S.email.trim(), mobile: S.mobile.trim(), whatsapp: S.wa, dates: dRange(d), total: price(d).total };
      try { sessionStorage.setItem("triptora.checkout", JSON.stringify(out)); } catch (x) {}
      document.dispatchEvent(new CustomEvent("triptora:travellers-done", { detail: out }));
      var pnr = "TP" + Math.floor(100000 + Math.random() * 900000);
      var payUrl = NEXT_URL + "?ref=" + encodeURIComponent(pnr) +
        "&amt=" + encodeURIComponent(out.total) +
        "&desc=" + encodeURIComponent(d.name + " · " + d.pk) +
        "&dest=" + encodeURIComponent(d.name + " (" + (d.grp === "india" ? "India" : "International") + ")") +
        "&dur=" + encodeURIComponent(d.n + " Nights / " + d.d + " Days · " + out.dates + " · " + pl(d));
      if (NEXT_URL) location.href = payUrl; else toast("Traveller details saved ✓");
    }
  });
  window.addEventListener("hashchange", function () { if (location.hash && location.hash !== cur) { cur = location.hash; route(); } });

  route();
})();
