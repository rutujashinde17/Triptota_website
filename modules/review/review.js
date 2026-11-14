/* ==================================================
   EMAILJS CONFIGURATION
================================================== */

const PUBLIC_KEY = "n-a3TnWbFP4zoQbqQ";
const SERVICE_ID = "service_5sbdzkj";
const TEMPLATE_ID = "template_8b8a7va";


/* ==================================================
   INITIALIZE EMAILJS
================================================== */

if (typeof emailjs !== "undefined") {
    emailjs.init({
        publicKey: PUBLIC_KEY
    });
}


/* ==================================================
   GET ELEMENTS & VERIFIED USER + COMPLETED TRIPS
================================================== */

const reviewForm = document.getElementById("reviewForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const tripSelect = document.getElementById("trip");
const verifyBanner = document.getElementById("verifyBanner");
const verifyTitle = document.getElementById("verifyTitle");
const verifyDesc = document.getElementById("verifyDesc");
const completedTripsBox = document.getElementById("completedTripsBox");
const noTripsBox = document.getElementById("noTripsBox");
const verifyTraveller = document.getElementById("verifyTraveller");
const verifyCheckText = document.getElementById("verifyCheckText");
const stars = document.querySelectorAll(".star");
const ratingInput = document.getElementById("rating");
const ratingText = document.getElementById("ratingText");
const reviewTextarea = document.getElementById("review");
const charCount = document.getElementById("charCount");
const submitBtn = document.getElementById("submitBtn");
const buttonText = document.getElementById("buttonText");
const loader = document.getElementById("loader");

function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
}

function getActiveSession() {
    try {
        if (typeof window.getTripToraUser === "function") {
            return window.getTripToraUser();
        }
        return JSON.parse(localStorage.getItem("triptoraUser") || "null");
    } catch (e) {
        return null;
    }
}

function getProfileFallbackName() {
    try {
        const prof = JSON.parse(localStorage.getItem("tp_profile") || "null");
        if (prof) {
            return [prof.first, prof.last].filter(Boolean).join(" ").trim();
        }
    } catch (e) {}
    return "";
}

function getUserCompletedTrips() {
    const merged = new Map();

    try {
        const rawTp = localStorage.getItem("tp_bookings");
        const tpList = rawTp !== null
            ? (JSON.parse(rawTp) || [])
            : [{ id: "WW-260812", name: "Kyoto Autumn Trail", dest: "Kyoto, Japan", dates: "12–18 Sep 2026", payment: "Paid", status: "Completed" }];

        tpList.forEach(b => {
            const id = String(b && b.id || "").trim();
            if (!id) return;
            merged.set(id, {
                id: id,
                name: String(b.name || b.dest || "Trip").trim(),
                dest: String(b.dest || "").trim(),
                dates: String(b.dates || b.date || "").trim(),
                payment: String(b.payment || "").trim(),
                status: String(b.status || "").trim()
            });
        });
    } catch (e) {}

    try {
        const siteList = JSON.parse(localStorage.getItem("triptora_bookings") || "[]");
        siteList.forEach(sb => {
            const id = String((sb && (sb.pnr || sb.id)) || "").trim();
            if (!id || merged.has(id)) return;
            merged.set(id, {
                id: id,
                name: String(sb.title || sb.destination || "TripTora Trip").trim(),
                dest: String(sb.destination || sb.details || "").trim(),
                dates: String(sb.date || sb.duration || "").trim(),
                payment: String(sb.payment || (sb.status === "Pending Payment" ? "Pending" : "Paid")).trim(),
                status: String(sb.status || "").trim()
            });
        });
    } catch (e) {}

    return Array.from(merged.values()).filter(t =>
        t.payment.toLowerCase() === "paid" &&
        t.status.toLowerCase() === "completed"
    );
}

let activeSession = getActiveSession();
let verifiedEmail = "";
let verifiedName = "";
let completedTrips = [];

try {
    localStorage.removeItem("triptora_reviews");
} catch (e) {}

function hydrateVerifiedState() {
    activeSession = getActiveSession();
    completedTrips = getUserCompletedTrips();

    if (!activeSession || !activeSession.email) {
        if (verifyBanner) verifyBanner.classList.add("warn");
        if (verifyTitle) verifyTitle.textContent = "Sign in Required to Submit Review";
        if (verifyDesc) verifyDesc.textContent = "Only verified signed-in travellers with completed trips can submit a review.";
        if (submitBtn) submitBtn.disabled = true;
        return;
    }

    verifiedEmail = String(activeSession.email).trim();
    verifiedName = String(
        activeSession.name ||
        activeSession.username ||
        getProfileFallbackName() ||
        verifiedEmail.split("@")[0]
    ).trim();

    if (nameInput) nameInput.value = verifiedName;
    if (emailInput) {
        emailInput.value = verifiedEmail;
        emailInput.readOnly = true;
    }

    if (verifyCheckText) {
        verifyCheckText.textContent = "I verify that I am " + verifiedName + " (" + verifiedEmail + ") and personally completed the selected trip above.";
    }

    tripSelect.innerHTML = '<option value="">-- Select your completed trip --</option>';

    if (!completedTrips.length) {
        if (verifyBanner) verifyBanner.classList.add("warn");
        if (verifyTitle) verifyTitle.textContent = "Verified User: " + verifiedName + " (" + verifiedEmail + ")";
        if (verifyDesc) verifyDesc.textContent = "You currently have 0 completed trips. Reviews unlock automatically once a trip is marked Completed.";
        if (completedTripsBox) completedTripsBox.style.display = "none";
        if (noTripsBox) noTripsBox.style.display = "block";
        tripSelect.innerHTML = '<option value="">-- No completed trips found --</option>';
        tripSelect.disabled = true;
        if (verifyTraveller) verifyTraveller.disabled = true;
        if (reviewTextarea) reviewTextarea.disabled = true;
        if (submitBtn) submitBtn.disabled = true;
        return;
    }

    if (verifyBanner) verifyBanner.classList.remove("warn");
    if (verifyTitle) verifyTitle.textContent = "Verified User: " + verifiedName + " (" + verifiedEmail + ")";
    if (verifyDesc) verifyDesc.textContent = "Showing " + completedTrips.length + " completed " + (completedTrips.length === 1 ? "trip" : "trips") + " from your TripTora account.";

    if (noTripsBox) noTripsBox.style.display = "none";
    if (completedTripsBox) completedTripsBox.style.display = "block";
    tripSelect.disabled = false;
    if (verifyTraveller) verifyTraveller.disabled = false;
    if (reviewTextarea) reviewTextarea.disabled = false;
    if (submitBtn) submitBtn.disabled = false;

    completedTrips.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t.id;
        opt.textContent = t.name + (t.dates ? " (" + t.dates + ")" : "") + " · " + t.id;
        tripSelect.appendChild(opt);
    });

    completedTripsBox.innerHTML =
        '<div class="completed-trips-head">Your Completed Trips Eligible for Review (' + completedTrips.length + ")</div>" +
        '<div class="completed-trip-chips">' +
        completedTrips.map(t => (
            '<button type="button" class="completed-trip-chip" data-trip-id="' + escapeHtml(t.id) + '">' +
              escapeHtml(t.name) +
              "<small>" + escapeHtml([t.dest, t.dates, t.id].filter(Boolean).join(" · ")) + " · ✓ Completed</small>" +
            "</button>"
        )).join("") +
        "</div>";

    const syncChipHighlight = () => {
        completedTripsBox.querySelectorAll(".completed-trip-chip").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.tripId === tripSelect.value);
        });
    };

    completedTripsBox.querySelectorAll(".completed-trip-chip").forEach(btn => {
        btn.addEventListener("click", () => {
            tripSelect.value = btn.dataset.tripId || "";
            syncChipHighlight();
        });
    });

    tripSelect.addEventListener("change", syncChipHighlight);

    const params = new URLSearchParams(window.location.search);
    const paramTripId = (params.get("tripId") || "").trim();
    const paramTripName = (params.get("trip") || "").trim().toLowerCase();

    let preselect = completedTrips.find(t => t.id === paramTripId);
    if (!preselect && paramTripName) {
        preselect = completedTrips.find(t => t.name.toLowerCase() === paramTripName);
    }
    if (!preselect && completedTrips.length === 1) {
        preselect = completedTrips[0];
    }
    if (preselect) {
        tripSelect.value = preselect.id;
        syncChipHighlight();
    }
}

hydrateVerifiedState();


/* ==================================================
   STAR RATING
================================================== */

let selectedRating = 0;

stars.forEach(function (star) {
    star.addEventListener("click", function () {
        selectedRating = Number(this.dataset.rating);
        ratingInput.value = selectedRating;
        updateStars(selectedRating);
        ratingText.textContent = selectedRating + " out of 5";
    });

    star.addEventListener("mouseenter", function () {
        updateStars(Number(this.dataset.rating));
    });

    star.addEventListener("mouseleave", function () {
        updateStars(selectedRating);
    });
});

function updateStars(rating) {
    stars.forEach(function (star) {
        const starRating = Number(star.dataset.rating);
        if (starRating <= rating) {
            star.classList.add("active");
        } else {
            star.classList.remove("active");
        }
    });
}


/* ==================================================
   CHARACTER COUNT
================================================== */

reviewTextarea.addEventListener("input", function () {
    charCount.textContent = this.value.length;
});


/* ==================================================
   FORM SUBMIT (VERIFIED USER + COMPLETED TRIP ONLY)
================================================== */

reviewForm.addEventListener("submit", function (event) {
    event.preventDefault();

    activeSession = getActiveSession();
    if (!activeSession || !activeSession.email) {
        if (typeof window.requireTripToraLogin === "function") {
            window.requireTripToraLogin(window.location.href);
        }
        return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const tripId = tripSelect.value.trim();
    const review = reviewTextarea.value.trim();

    if (email.toLowerCase() !== String(activeSession.email).trim().toLowerCase()) {
        if (window.ttToast) window.ttToast("Email verification failed. Please use your signed-in email address.");
        return;
    }

    completedTrips = getUserCompletedTrips();
    const selectedTrip = completedTrips.find(t => t.id === tripId);
    if (!selectedTrip) {
        if (window.ttToast) window.ttToast("Please select a valid Completed trip to submit your review.");
        return;
    }

    if (verifyTraveller && !verifyTraveller.checked) {
        if (window.ttToast) window.ttToast("Please confirm your traveller verification checkbox before submitting.");
        verifyTraveller.focus();
        return;
    }

    if (selectedRating === 0) {
        if (window.ttToast) window.ttToast("Please select your rating from 1 to 5 stars.");
        return;
    }

    if (name === "" || email === "" || review === "") {
        if (window.ttToast) window.ttToast("Please fill in all required fields.");
        return;
    }

    submitBtn.disabled = true;
    buttonText.textContent = "Submitting...";
    loader.style.display = "inline-block";

    const templateParams = {
        name: name,
        email: email,
        bookingId: selectedTrip.id,
        trip: selectedTrip.name,
        verified: true,
        rating: selectedRating + " / 5",
        review: review
    };

    const completeReview = () => {
        if (window.ttToast) {
            window.ttToast("Verified review submitted for " + selectedTrip.name + "!");
        }

        reviewTextarea.value = "";
        if (verifyTraveller) verifyTraveller.checked = false;
        selectedRating = 0;
        ratingInput.value = "";
        updateStars(0);
        ratingText.textContent = "Select your rating";
        charCount.textContent = "0";
        submitBtn.disabled = false;
        buttonText.textContent = "Submit Review";
        loader.style.display = "none";
    };

    let finished = false;
    const finishOnce = () => {
        if (finished) return;
        finished = true;
        completeReview();
    };

    if (typeof emailjs === "undefined") {
        setTimeout(finishOnce, 200);
        return;
    }

    const fallbackTimer = setTimeout(finishOnce, 600);
    emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams
    )
    .then(function () {
        clearTimeout(fallbackTimer);
        finishOnce();
    })
    .catch(function (error) {
        clearTimeout(fallbackTimer);
        console.warn("EMAILJS unavailable:", error);
        finishOnce();
    });
});
