/**
 * TripTora - Universal Common JavaScript
 * Manages Unified Navbar, Footer, User Session, J.A.R.V.I.S Chatbot, and Toasts.
 */

(function () {
  'use strict';

  // 1. Calculate path prefix to root based on current script or location
  function getRootPrefix() {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/modules/')) {
      return '../../';
    }
    if (path.includes('/auth/') || path.includes('/dashboard/')) {
      return '../';
    }
    return '';
  }

  const ROOT = getRootPrefix();

  const PROTECTED_SEGMENTS = [
    '/dashboard/',
    '/modules/flight/',
    '/modules/bus/',
    '/modules/packages/',
    '/modules/offers/',
    '/modules/enquiry/',
    '/modules/payment/',
    '/modules/profile/',
    '/modules/review/'
  ];

  function isProtectedPath(pathname) {
    const p = String(pathname || '').toLowerCase().replace(/\\/g, '/');
    return PROTECTED_SEGMENTS.some(seg => p.includes(seg));
  }

  function isAuthPath(pathname) {
    const p = String(pathname || '').toLowerCase().replace(/\\/g, '/');
    return p.includes('/auth/');
  }

  // 2. Toast Notification Function
  window.ttToast = function (msg, duration = 3200) {
    let t = document.getElementById('tt-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'tt-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => {
      t.classList.remove('show');
    }, duration);
  };

  // 3. Current User Session
  function getUserSession() {
    try {
      const data = localStorage.getItem('triptoraUser');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  window.getTripToraUser = getUserSession;

  window.logoutTripTora = function () {
    localStorage.removeItem('triptoraUser');
    sessionStorage.removeItem('triptora_redirect');
    window.ttToast('Logged out successfully.');
    setTimeout(() => {
      window.location.href = ROOT + 'index.html';
    }, 650);
  };

  function removeAccountKey(storageKey, targetEmails) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
      let changed = false;
      Object.keys(obj).forEach(key => {
        if (targetEmails.has(key.trim().toLowerCase())) {
          delete obj[key];
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem(storageKey, JSON.stringify(obj));
      }
    } catch (e) {}
  }

  window.deleteTripToraAccount = function (options) {
    const opts = options || {};
    const session = getUserSession();
    if (!session) {
      return { ok: false, reason: 'no-session', message: 'No active account session found.' };
    }

    const accountEmail = String(session.accountEmail || '').trim().toLowerCase();
    const sessionEmail = String(session.email || '').trim().toLowerCase();
    const primaryEmail = accountEmail || sessionEmail;

    if (session.role === 'admin' && primaryEmail === 'admin@triptora.com') {
      const msg = 'Built-in administrator accounts cannot be deleted.';
      if (!opts.silent) window.ttToast(msg);
      return { ok: false, reason: 'admin-protected', message: msg };
    }

    const targetEmails = new Set();
    if (primaryEmail) targetEmails.add(primaryEmail);
    if (sessionEmail && (!accountEmail || sessionEmail === accountEmail)) {
      targetEmails.add(sessionEmail);
    }

    if (targetEmails.size > 0) {
      removeAccountKey('triptoraAccounts', targetEmails);
      removeAccountKey('triptoraUsers', targetEmails);
      removeAccountKey('triptoraUserProfiles', targetEmails);
      if (session.role === 'admin') {
        removeAccountKey('triptoraAdmins', targetEmails);
      }
    }

    [
      'triptoraUser',
      'tp_profile',
      'tp_bookings',
      'tp_refunds',
      'tp_gemini_key',
      'tp_password_updated',
      'triptora_bookings'
    ].forEach(key => {
      try { localStorage.removeItem(key); } catch (e) {}
    });

    [
      'triptora_redirect',
      'triptora_registered_email',
      'triptora.checkout',
      'triptora_bus',
      'triptora',
      'triptora_packages'
    ].forEach(key => {
      try { sessionStorage.removeItem(key); } catch (e) {}
    });

    if (!opts.silent) {
      window.ttToast('Your account has been permanently deleted.');
    }

    if (!opts.noRedirect) {
      setTimeout(() => {
        window.location.replace(ROOT + 'index.html');
      }, 750);
    }

    return { ok: true, deletedEmail: primaryEmail };
  };

  window.requireTripToraLogin = function (targetUrl) {
    try {
      if (targetUrl) {
        const resolved = new URL(targetUrl, window.location.href);
        if (resolved.origin === window.location.origin && !resolved.pathname.includes('/auth/')) {
          sessionStorage.setItem('triptora_redirect', resolved.href);
        }
      } else {
        sessionStorage.removeItem('triptora_redirect');
      }
    } catch (e) {}
    window.location.href = ROOT + 'auth/login.html';
  };

  // Immediate guard for unauthorized direct navigation to protected routes
  const currentPathname = window.location.pathname.toLowerCase().replace(/\\/g, '/');
  const currentSession = getUserSession();
  if (isProtectedPath(currentPathname) && !currentSession) {
    try {
      sessionStorage.setItem('triptora_redirect', window.location.href);
    } catch (e) {}
    document.documentElement.style.visibility = 'hidden';
    const isAdminRoute = currentPathname.includes('/dashboard/admin.html');
    window.location.replace(ROOT + 'auth/login.html' + (isAdminRoute ? '?role=admin' : ''));
    return;
  }
  if (currentPathname.includes('/dashboard/admin.html') && currentSession && currentSession.role !== 'admin') {
    document.documentElement.style.visibility = 'hidden';
    window.location.replace(ROOT + 'dashboard/home.html');
    return;
  }

  // 4. Mount Universal Navbar
  function mountNavbar() {
    let navContainer = document.getElementById('tt-navbar-mount') || document.querySelector('header.tt-navbar');
    
    if (!navContainer) {
      navContainer = document.createElement('header');
      navContainer.className = 'tt-navbar';
      navContainer.id = 'tt-navbar-mount';
      document.body.insertBefore(navContainer, document.body.firstChild);
    } else {
      navContainer.className = 'tt-navbar';
    }

    const session = getUserSession();
    const currentPath = window.location.pathname.toLowerCase().replace(/\\/g, '/');

    const isFlights = currentPath.includes('flight');
    const isBus = currentPath.includes('bus');
    const isPackages = currentPath.includes('package');
    const isOffers = currentPath.includes('offer');
    const isEnquiry = currentPath.includes('enquiry') || currentPath.includes('contact');
    const isAdmin = currentPath.includes('/dashboard/admin');

    const safeText = s => String(s || '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));

    let authHtml = '';
    if (session) {
      let tpProf = null;
      try { tpProf = JSON.parse(localStorage.getItem('tp_profile') || 'null'); } catch (e) {}
      const isAdminUser = session.role === 'admin';
      const username = isAdminUser
        ? (session.username || 'Admin')
        : ((tpProf && (tpProf.first || tpProf.last) && tpProf.email === session.email)
          ? `${tpProf.first || ''} ${tpProf.last || ''}`.trim()
          : (session.username || (session.email ? session.email.split('@')[0] : 'Explorer')));

      const profileIconSvg = isAdminUser
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z"/><circle cx="12" cy="11" r="2.5"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M5 20c0-3.8 3.1-6.5 7-6.5s7 2.7 7 6.5"/></svg>`;

      const avatarContent = (!isAdminUser && tpProf && tpProf.photo && tpProf.email === session.email)
        ? `<img src="${tpProf.photo}" alt="${safeText(username)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
        : profileIconSvg;

      authHtml = `
        <div class="tt-user-dropdown" id="ttUserDropdown">
          <button class="tt-user-btn" id="ttUserBtn" type="button" aria-haspopup="true" aria-expanded="false" title="${safeText(username)} Profile">
            <span class="tt-user-avatar">${avatarContent}</span>
            <span class="tt-user-name">${safeText(username)}</span>
            <span>▾</span>
          </button>
          <div class="tt-dropdown-menu" id="ttDropdownMenu">
            <div class="tt-dropdown-header">
              <small>${isAdminUser ? 'Admin Account' : 'Signed In As'}</small>
              <strong>${safeText(username)}</strong>
            </div>
            <a href="${ROOT}dashboard/home.html" class="tt-dropdown-item">
              <span>🏠 Home</span>
              <span>›</span>
            </a>
            <a href="${ROOT}modules/profile/profile.html#overview" class="tt-dropdown-item">
              <span>👤 Profile</span>
              <span>›</span>
            </a>
            <div style="border-top: 1px solid var(--border-light); margin: 4px 0;"></div>
            <a href="javascript:void(0)" onclick="logoutTripTora()" class="tt-dropdown-item danger">
              <span>🚪 Sign Out</span>
              <span>›</span>
            </a>
          </div>
        </div>
      `;
    } else {
      authHtml = `
        <div class="tt-user-dropdown tt-login-dropdown" id="ttLoginDropdown">
          <button type="button" class="tt-btn-login" id="ttLoginMenuBtn" aria-haspopup="true" aria-expanded="false">
            Login ▾
          </button>
          <div class="tt-dropdown-menu" id="ttLoginMenu">
            <div class="tt-dropdown-header">
              <small>Choose Login Type</small>
              <strong>Sign in to TripTora</strong>
            </div>
            <a href="${ROOT}auth/login.html?role=user" class="tt-dropdown-item" data-login-role="user">
              <span>👤 User Login</span>
              <span>›</span>
            </a>
            <a href="${ROOT}auth/login.html?role=admin" class="tt-dropdown-item" data-login-role="admin">
              <span>🛡️ Admin Login</span>
              <span>›</span>
            </a>
          </div>
        </div>
      `;
    }

    const adminNavLink = (session && session.role === 'admin')
      ? `<a href="${ROOT}dashboard/admin.html" class="tt-nav-item ${isAdmin ? 'active' : ''}"><i>🛡️</i>Admin</a>`
      : '';

    const navLinksHtml = `
      <button class="tt-menu-toggle" id="ttMenuToggle" type="button" aria-label="Toggle navigation">&#9776;</button>
      <nav class="tt-nav-links" id="ttNavLinks">
        <a href="${ROOT}modules/flight/results.html" class="tt-nav-item ${isFlights ? 'active' : ''}">
          <i>✈️</i>Flights
        </a>
        <a href="${ROOT}modules/bus/bus.html" class="tt-nav-item ${isBus ? 'active' : ''}">
          <i>🚌</i>Bus
        </a>
        <a href="${ROOT}modules/packages/packages.html" class="tt-nav-item ${isPackages ? 'active' : ''}">
          <i>📍</i>Destination
        </a>
        <a href="${ROOT}modules/offers/offers.html" class="tt-nav-item ${isOffers ? 'active' : ''}">
          <i>🎁</i>Offers
        </a>
        <a href="${ROOT}modules/enquiry/enquiry.html" class="tt-nav-item ${isEnquiry ? 'active' : ''}">
          <i>📞</i>Contact
        </a>
        ${adminNavLink}
      </nav>
    `;

    navContainer.innerHTML = `
      <div class="tt-nav-container">
        <a href="${session ? (session.role === 'admin' ? ROOT + 'dashboard/admin.html' : ROOT + 'dashboard/home.html') : ROOT + 'index.html'}" class="tt-brand">
          <img src="${ROOT}assets/images/logo.jpeg" alt="TripTora Logo" onerror="this.src='${ROOT}assets/images/logo.png'">
          <span>Triptora</span>
        </a>
        ${navLinksHtml}
        <div class="tt-nav-auth">
          ${authHtml}
        </div>
      </div>
    `;

    const userBtn = document.getElementById('ttUserBtn');
    const userDropdown = document.getElementById('ttUserDropdown');
    if (userBtn && userDropdown) {
      userBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = userDropdown.classList.toggle('open');
        userBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }

    const loginMenuBtn = document.getElementById('ttLoginMenuBtn');
    const loginDropdown = document.getElementById('ttLoginDropdown');
    if (loginMenuBtn && loginDropdown) {
      loginMenuBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = loginDropdown.classList.toggle('open');
        loginMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      const userLoginLink = loginDropdown.querySelector('[data-login-role="user"]');
      if (userLoginLink) {
        userLoginLink.addEventListener('click', function () {
          try { sessionStorage.removeItem('triptora_redirect'); } catch (err) {}
        });
      }
    }

    // Mobile menu toggle
    const menuToggle = document.getElementById('ttMenuToggle');
    const navLinks = document.getElementById('ttNavLinks');
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        navLinks.classList.toggle('open');
      });
    }

    document.addEventListener('click', function (e) {
      if (userDropdown && !userDropdown.contains(e.target)) {
        userDropdown.classList.remove('open');
        if (userBtn) userBtn.setAttribute('aria-expanded', 'false');
      }
      if (loginDropdown && !loginDropdown.contains(e.target)) {
        loginDropdown.classList.remove('open');
        if (loginMenuBtn) loginMenuBtn.setAttribute('aria-expanded', 'false');
      }
      if (navLinks && menuToggle && !navLinks.contains(e.target) && e.target !== menuToggle) {
        navLinks.classList.remove('open');
      }
    });
  }

  // 5. Mount Universal Footer
  function mountFooter() {
    let footerContainer = document.getElementById('tt-footer-mount') || document.querySelector('footer.tt-footer') || document.querySelector('footer.footer');
    
    if (!footerContainer) {
      footerContainer = document.createElement('footer');
      footerContainer.id = 'tt-footer-mount';
      document.body.appendChild(footerContainer);
    }
    footerContainer.className = 'footer';

    footerContainer.innerHTML = `
      <div class="footer-container">
        <div class="footer-column footer-brand">
          <div class="footer-logo">
            <img src="${ROOT}assets/images/logo.jpeg" alt="Triptora" onerror="this.src='${ROOT}assets/images/logo.png'">
            <h2>Triptora</h2>
          </div>
          <p>A little curiosity. A world of possibilities.<br>Make your next journey a good one.</p>
          <h4>Your world, a little closer.</h4>
        </div>

        <div class="footer-column">
          <h3>Quick Links</h3>
          <a href="${getUserSession() ? ROOT + 'dashboard/home.html' : ROOT + 'index.html'}">Home</a>
          <a href="${ROOT}modules/packages/packages.html">Destination</a>
          <a href="${ROOT}modules/packages/packages.html">Packages</a>
          <a href="${ROOT}index.html#about">About Us</a>
          <a href="${ROOT}modules/review/review.html">Reviews/Ratings</a>
          <a href="${ROOT}modules/enquiry/enquiry.html">Help & Support</a>
        </div>

        <div class="footer-column">
          <h3>Contact Us</h3>
          <p>Email - hello@triptora.com</p>
          <p>Contact - +91 800 123 4567</p>
          <p>Address - 24 Palm Avenue, Bengaluru,<br>Karnataka 560001</p>
          <a href="${ROOT}modules/enquiry/enquiry.html">Terms & Conditions</a>
        </div>

        <div class="footer-column destinations">
          <h3>Top Destinations</h3>
          <a href="${ROOT}modules/packages/packages.html?q=Paris&open=1">
            <img src="${ROOT}assets/images/paris.jpeg" alt="Paris" onerror="this.src='${ROOT}assets/images/paris.jpg'">
            <span>Paris</span>
          </a>
          <a href="${ROOT}modules/packages/packages.html?q=Bali&open=1">
            <img src="${ROOT}assets/images/bali.jpeg" alt="Bali" onerror="this.src='${ROOT}assets/images/bali.jpg'">
            <span>Bali</span>
          </a>
          <a href="${ROOT}modules/packages/packages.html?q=Dubai&open=1">
            <img src="${ROOT}assets/images/dubai.jpeg" alt="Dubai" onerror="this.src='${ROOT}assets/images/dubai.jpg'">
            <span>Dubai</span>
          </a>
          <a href="${ROOT}modules/packages/packages.html?q=Maldives&open=1">
            <img src="${ROOT}assets/images/maldives.jpeg" alt="Maldives" onerror="this.src='${ROOT}assets/images/maldives.jpg'">
            <span>Maldives</span>
          </a>
          <a href="${ROOT}modules/packages/packages.html?q=Switzerland&open=1">
            <img src="${ROOT}assets/images/switzerland.jpg" alt="Switzerland" onerror="this.src='${ROOT}assets/images/swizerland.jpeg'">
            <span>Switzerland</span>
          </a>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© 2026 Triptora. All rights reserved.</p>
        <div class="social-links">
          <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">
            <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          </a>
          <a href="https://github.com" target="_blank" rel="noopener" aria-label="GitHub">
            <svg viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
        </div>
      </div>
    `;
  }

  // 6. Mount Universal J.A.R.V.I.S Assistant from modules/chatbot/
  function mountChatbot() {
    if (!document.querySelector('link[href*="jarvis-style.css"]')) {
      const link = document.createElement('link');
      link.id = 'tt-chatbot-css';
      link.rel = 'stylesheet';
      link.href = ROOT + 'modules/chatbot/jarvis-style.css';
      document.head.appendChild(link);
    }

    if (document.getElementById('jarvis')) return;

    const initBot = function () {
      if (typeof window.initTripToraChatbot === 'function') {
        window.initTripToraChatbot();
      }
    };

    const loadScript = function () {
      if (typeof window.initTripToraChatbot === 'function') {
        initBot();
        return;
      }
      if (!document.querySelector('script[src*="jarvis-script.js"]')) {
        const script = document.createElement('script');
        script.id = 'tt-chatbot-js';
        script.src = ROOT + 'modules/chatbot/jarvis-script.js';
        script.onload = initBot;
        document.body.appendChild(script);
      }
    };

    if ((window.JARVIS_FLIGHTS && window.JARVIS_BUSES) || document.querySelector('script[src*="jarvis-data.js"]')) {
      loadScript();
    } else {
      const dataScript = document.createElement('script');
      dataScript.id = 'tt-chatbot-data-js';
      dataScript.src = ROOT + 'modules/chatbot/jarvis-data.js';
      dataScript.onload = loadScript;
      dataScript.onerror = loadScript;
      document.body.appendChild(dataScript);
    }
  }

  // 7. Shared Home FAQ Section (#tt-faq-mount, Photo 1 Style)
  function mountHomeFAQ() {
    const container = document.getElementById('tt-faq-mount');
    if (!container) return;

    const faqs = [
      {
        q: 'What travel services does TripTora offer?',
        a: 'TripTora brings together domestic & international flight bookings, AC sleeper & electric bus tickets, and curated holiday packages with boutique stays, guided transfers, transparent pricing, and 24/7 travel concierge support.'
      },
      {
        q: 'How to book holiday packages, flights, or buses on TripTora?',
        a: 'Use the search bar above to switch between Flight Search, Bus Search, or Holiday Search, or select directly from the top navigation menu. Pick your route or destination, choose seats or itinerary, fill traveller details, and confirm online.'
      },
      {
        q: 'Which payment methods are accepted across Flights, Bus, and Destinations?',
        a: 'All TripTora checkouts—including Flights, Bus tickets, and Holiday Destinations—support Instant UPI (QR scan, GPay, PhonePe, or UPI ID) and Credit/Debit Cards protected by 256-bit SSL verification.'
      },
      {
        q: 'Does TripTora offer customizable tour packages?',
        a: 'Yes! You can book ready-to-go curated packages or send a custom itinerary request through our Contact & Enquiry desk for private group, honeymoon, or family tours.'
      },
      {
        q: 'How can I apply offer codes like FIRSTFLY, GETAWAY20, or TRIPBUS?',
        a: 'Grab any voucher code from the Offers section and enter it inside the "Have a coupon?" field at passenger or checkout summary before completing your payment.'
      },
      {
        q: 'Can I modify, cancel, or check my refund status online?',
        a: 'Yes! Log in and visit My Bookings or My Refunds in the top-right account menu to view active trips, request cancellations, and track refund status.'
      },
      {
        q: 'When will I receive my e-ticket and booking confirmation?',
        a: 'Your PNR reference, printable e-ticket, and itinerary summary are generated immediately right after checkout and saved to your Booking History.'
      },
      {
        q: 'Are there any hidden charges at checkout?',
        a: 'No. Every fare summary clearly breaks down base fare, taxes & GST, seat fees, and any applied promo savings upfront before you pay.'
      }
    ];

    const chevronSvg = `<svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

    container.innerHTML = `
      <div class="faq-section-wrap">
        <h2 class="faq-main-title">Frequently Asked Questions</h2>
        <div class="faq-list" id="ttFaqList">
          ${faqs.map((item, idx) => `
            <div class="faq-item${idx === 0 ? ' open' : ''}${idx >= 5 ? ' faq-extra' : ''}">
              <button type="button" class="faq-q" aria-expanded="${idx === 0 ? 'true' : 'false'}">
                <span>${item.q}</span>
                ${chevronSvg}
              </button>
              <div class="faq-a">
                <div class="faq-a-inner">${item.a}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="faq-more-wrap">
          <button type="button" class="faq-more-btn" id="ttFaqMoreBtn">Show More</button>
        </div>
      </div>
    `;

    const faqList = document.getElementById('ttFaqList');
    const moreBtn = document.getElementById('ttFaqMoreBtn');

    container.querySelectorAll('.faq-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        container.querySelectorAll('.faq-item').forEach(el => {
          el.classList.remove('open');
          el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    if (moreBtn && faqList) {
      moreBtn.addEventListener('click', () => {
        const expanded = faqList.classList.toggle('expanded');
        moreBtn.textContent = expanded ? 'Show Less' : 'Show More';
      });
    }
  }

  // 8. Shared Home Ratings & Reviews Section (#tt-ratings-mount, Hardcoded Only)
  function mountHomeRatings() {
    try {
      localStorage.removeItem('triptora_reviews');
    } catch (e) {}

    const container = document.getElementById('tt-ratings-mount');
    if (!container) return;

    const makeAvatarUri = (bg, shirt, hair, skin) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="${bg}"/><path d="M12 64c2-13 11-19 20-19s18 6 20 19z" fill="${shirt}"/><circle cx="32" cy="27" r="11" fill="${skin}"/><path d="M21 26c0-8 5-13 11-13s11 5 11 13c-2-4-6-6-11-6s-9 2-11 6z" fill="${hair}"/></svg>`;
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    };

    const reviews = [
      {
        name: 'Aarav Mehta',
        date: 'June, 2025 · Bali Package',
        rating: '5 / 5',
        avatar: makeAvatarUri('#FFE2CC', '#95241F', '#260A0A', '#F1C29B'),
        review: 'We completed our Bali getaway seamlessly with TripTora. The boutique Ubud stay, airport pickup, and guided tours were all smoothly arranged and transparent from start to finish.'
      },
      {
        name: 'Priya Nair',
        date: 'January, 2026 · Flight Booking',
        rating: '5 / 5',
        avatar: makeAvatarUri('#FADBD8', '#FF8A42', '#3B1E14', '#F5CFA8'),
        review: 'Booked Bengaluru to Goa flights in under two minutes! Seat selection was effortless, FIRSTFLY saved ₹1,500 instantly, and UPI checkout generated our e-ticket right away.'
      },
      {
        name: 'Rohan Kulkarni',
        date: 'December, 2025 · AC Sleeper Bus',
        rating: '4.9 / 5',
        avatar: makeAvatarUri('#E8F3EB', '#2E7D4F', '#1F1B24', '#E5B28A'),
        review: 'My family enjoyed an overnight trip from Pune to Goa—live berth layout, clear boarding points, and instant confirmation via UPI. Easily one of the cleanest booking experiences!'
      },
      {
        name: 'Kavya Iyer',
        date: 'February, 2026 · Paris Tour',
        rating: '5 / 5',
        avatar: makeAvatarUri('#FDE8D7', '#7A2E14', '#2C1810', '#F2C6A0'),
        review: 'Paris, With Love exceeded expectations! Museum passes, boutique Left Bank hotel, and responsive 24/7 concierge help made our entire holiday effortless.'
      }
    ];

    const pkgBaseReviews = 128 + 94 + 112 + 82 + 156 + 110 + 142 + 118 + 95;
    const pkgWeightedSum = 4.9 * 128 + 4.9 * 94 + 4.8 * 112 + 5.0 * 82 + 4.8 * 156 + 4.9 * 110 + 4.9 * 142 + 4.9 * 118 + 4.8 * 95;
    const avgRating = (pkgWeightedSum / pkgBaseReviews).toFixed(1);

    container.innerHTML = `
      <div class="container container-wide">
        <h2 class="ratings-title">Why Customers Love TripTora</h2>

        <div class="ratings-stats">
          <div class="r-stat">
            <strong>15+</strong>
            <span>Curated Destinations</span>
          </div>
          <div class="r-stat">
            <strong>${pkgBaseReviews}+</strong>
            <span>Verified Traveller Reviews</span>
          </div>
          <div class="r-stat">
            <strong>${avgRating} ★</strong>
            <span>Average Package Rating</span>
          </div>
          <div class="r-stat">
            <strong>24/7</strong>
            <span>Dedicated Support</span>
          </div>
        </div>

        <div class="reviews-track" id="ttReviewsTrack">
          ${reviews.map(r => `
            <article class="home-review-card">
              <div>
                <div class="review-card-top">
                  <span class="quote-mark" aria-hidden="true">“</span>
                  <span class="review-stars-pill">★★★★★ ${r.rating}</span>
                </div>
                <p class="home-review-text">${r.review}</p>
              </div>
              <div class="reviewer-meta">
                <img class="reviewer-avatar-img" src="${r.avatar}" alt="${r.name}">
                <div>
                  <strong>${r.name}</strong>
                  <small>${r.date}</small>
                </div>
              </div>
            </article>
          `).join('')}
        </div>

        <div class="ratings-nav-row">
          <button type="button" class="carousel-circle-btn" id="ttRevPrev" aria-label="Previous reviews">&#8249;</button>
          <button type="button" class="carousel-circle-btn" id="ttRevNext" aria-label="Next reviews">&#8250;</button>
        </div>
      </div>
    `;

    const track = document.getElementById('ttReviewsTrack');
    const prevBtn = document.getElementById('ttRevPrev');
    const nextBtn = document.getElementById('ttRevNext');
    if (track && prevBtn && nextBtn) {
      const scrollStep = () => Math.max(320, track.clientWidth * 0.45);
      prevBtn.addEventListener('click', () => track.scrollBy({ left: -scrollStep(), behavior: 'smooth' }));
      nextBtn.addEventListener('click', () => track.scrollBy({ left: scrollStep(), behavior: 'smooth' }));
    }
  }

  // 9. Shared Home Destinations Section (#tt-destinations-mount, directly below Search Bar)
  function mountHomeDestinations() {
    const container = document.getElementById('tt-destinations-mount');
    if (!container) return;

    const DESTINATIONS = [
      {
        name: 'Bali',
        region: 'international',
        label: 'International',
        sub: 'Indonesia · Rice terraces, ocean temples & boutique stays (5 Days / 4 Nights)',
        price: '₹32,500',
        img: ROOT + 'assets/images/bali.jpg'
      },
      {
        name: 'Paris',
        region: 'international',
        label: 'International',
        sub: 'France · Art museums, riverside strolls & café mornings (6 Days / 5 Nights)',
        price: '₹74,900',
        img: ROOT + 'assets/images/paris.jpg'
      },
      {
        name: 'Dubai',
        region: 'international',
        label: 'International',
        sub: 'UAE · Desert safaris, Marina nights & Burj Khalifa views (4 Days / 3 Nights)',
        price: '₹45,900',
        img: ROOT + 'assets/images/dubai.jpg'
      },
      {
        name: 'Maldives',
        region: 'international',
        label: 'International',
        sub: 'Atolls · Overwater villas, coral reefs & sunset cruises (4 Days / 3 Nights)',
        price: '₹58,900',
        img: ROOT + 'assets/images/maldives.jpg'
      },
      {
        name: 'Switzerland',
        region: 'international',
        label: 'International',
        sub: 'Swiss Alps · Scenic rail passes, Lucerne & Jungfraujoch (7 Days / 6 Nights)',
        price: '₹89,500',
        img: ROOT + 'assets/images/switzerland.jpg'
      },
      {
        name: 'Goa',
        region: 'domestic',
        label: 'Domestic',
        sub: 'India · Palm beaches, Latin quarters & Mandovi sunsets (4 Days / 3 Nights)',
        price: '₹12,500',
        img: ROOT + 'assets/images/goa.jpg'
      },
      {
        name: 'Jaipur',
        region: 'domestic',
        label: 'Domestic',
        sub: 'India · Amber Fort, Pink City havelis & royal heritage (3 Days / 2 Nights)',
        price: '₹14,900',
        img: ROOT + 'assets/images/jaipur.jpg'
      },
      {
        name: 'Kerala',
        region: 'domestic',
        label: 'Domestic',
        sub: 'India · Alleppey houseboats, spice hills & Munnar mist (5 Days / 4 Nights)',
        price: '₹18,700',
        img: ROOT + 'assets/images/kerala.jpg'
      },
      {
        name: 'Manali',
        region: 'domestic',
        label: 'Domestic',
        sub: 'India · Solang snow peaks, pine trails & alpine chalets (5 Days / 4 Nights)',
        price: '₹16,200',
        img: ROOT + 'assets/images/manali.jpg'
      },
      {
        name: 'USA',
        region: 'international',
        label: 'International',
        sub: 'USA · New York skylines, Grand Canyon & coastal drives (9 Days / 8 Nights)',
        price: '₹1,24,999',
        img: ROOT + 'assets/images/travel.jpeg'
      },
      {
        name: 'Europe',
        region: 'international',
        label: 'International',
        sub: 'France · Italy · Switzerland scenic rail & classic stays (8 Days / 7 Nights)',
        price: '₹1,09,999',
        img: ROOT + 'assets/images/paris.jpg'
      },
      {
        name: 'Singapore',
        region: 'international',
        label: 'International',
        sub: 'Singapore · Marina Bay gardens, Sentosa & Night Safari (5 Days / 4 Nights)',
        price: '₹74,999',
        img: ROOT + 'assets/images/maldives.jpg'
      },
      {
        name: 'Thailand',
        region: 'international',
        label: 'International',
        sub: 'Bangkok · Phuket & Phi Phi island hopping escapes (6 Days / 5 Nights)',
        price: '₹36,999',
        img: ROOT + 'assets/images/bali.jpg'
      },
      {
        name: 'Ladakh',
        region: 'domestic',
        label: 'Domestic',
        sub: 'India · Pangong Lake, Nubra dunes & high mountain passes (6 Days / 5 Nights)',
        price: '₹24,999',
        img: ROOT + 'assets/images/manali.jpg'
      },
      {
        name: 'Andaman',
        region: 'domestic',
        label: 'Domestic',
        sub: 'India · Havelock beaches, ferries & coral snorkelling (6 Days / 5 Nights)',
        price: '₹21,999',
        img: ROOT + 'assets/images/maldives.jpg'
      },
      {
        name: 'Vasota Fort',
        region: 'domestic',
        label: 'Domestic',
        sub: 'India · Koyna backwater boat ride & Sahyadri fort trek (3 Days / 2 Nights)',
        price: '₹4,999',
        img: ROOT + 'assets/images/kerala.jpg'
      }
    ];

    let activeRegion = 'all';

    function renderCards() {
      const grid = document.getElementById('ttDestGrid');
      if (!grid) return;
      const items = activeRegion === 'all'
        ? DESTINATIONS
        : DESTINATIONS.filter(d => d.region === activeRegion);
      const visibleItems = items.slice(0, 3);

      grid.innerHTML = visibleItems.map(d => `
        <a href="${ROOT}modules/packages/packages.html?q=${encodeURIComponent(d.name)}&open=1" class="home-dest-card" data-dest="${d.name}">
          <div class="home-dest-thumb" style="background-image: url('${d.img}');">
            <span class="home-dest-tag">${d.label}</span>
          </div>
          <div class="home-dest-body">
            <div>
              <div class="home-dest-top">
                <h3>${d.name}</h3>
                <span class="home-dest-arrow">↗</span>
              </div>
              <p class="home-dest-sub">${d.sub}</p>
            </div>
            <div class="home-dest-foot">
              <span>From <strong>${d.price}</strong> / person</span>
              <span class="home-dest-cta">Explore →</span>
            </div>
          </div>
        </a>
      `).join('');
    }

    container.innerHTML = `
      <div class="sec-head-row">
        <div>
          <h2>Where will your curiosity take you?</h2>
          <p>Handpicked international getaways and iconic Indian escapes ready to explore.</p>
        </div>
        <a href="${ROOT}modules/packages/packages.html#/destinations/all" class="btn btn-outline">View All Destinations (15+) →</a>
      </div>
      <div class="dest-tabs" id="ttDestTabs">
        <button type="button" class="dest-pill active" data-region="all">Top Destinations (3)</button>
        <button type="button" class="dest-pill" data-region="international">International</button>
        <button type="button" class="dest-pill" data-region="domestic">Domestic</button>
      </div>
      <div class="home-dest-grid" id="ttDestGrid"></div>
    `;

    container.querySelectorAll('.dest-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        container.querySelectorAll('.dest-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeRegion = pill.dataset.region;
        renderCards();
      });
    });

    renderCards();
  }

  // 10. Global Quick Search Mode Selector (Flight / Bus)
  function mountQuickSearch() {
    const form = document.getElementById('quickSearchForm');
    if (!form) return;

    const modeBar = document.getElementById('ttSearchModeBar');
    const srcInput = document.getElementById('srcCity');
    const dstInput = document.getElementById('dstCity');
    const srcLabel = document.querySelector('label[for="srcCity"]');
    const dstLabel = document.querySelector('label[for="dstCity"]');
    const dateInput = document.getElementById('travelDate');
    const submitBtn = document.getElementById('quickSearchSubmit') || form.querySelector('button[type="submit"]');
    const swapBtn = document.getElementById('swapCityBtn');
    const fromList = document.getElementById('ttFromList');
    const toList = document.getElementById('ttToList');

    const FLIGHT_OPTIONS = [
      'Bengaluru (BLR)', 'Goa (GOI)', 'New Delhi (DEL)', 'Mumbai (BOM)',
      'Hyderabad (HYD)', 'Chennai (MAA)', 'Kolkata (CCU)', 'Pune (PNQ)'
    ];
    const BUS_OPTIONS = [
      'Pune', 'Goa', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Kolhapur', 'Nagpur', 'Ahmedabad'
    ];

    const TO_BUS_MAP = {
      del: 'Pune', delhi: 'Pune', 'new delhi': 'Pune',
      bom: 'Mumbai', mumbai: 'Mumbai',
      blr: 'Bengaluru', bengaluru: 'Bengaluru', bangalore: 'Bengaluru',
      hyd: 'Hyderabad', hyderabad: 'Hyderabad',
      goi: 'Goa', goa: 'Goa',
      pnq: 'Pune', pune: 'Pune',
      kolhapur: 'Kolhapur', nagpur: 'Nagpur', ahmedabad: 'Ahmedabad'
    };
    const TO_FLIGHT_MAP = {
      pune: 'Pune (PNQ)', pnq: 'Pune (PNQ)',
      goa: 'Goa (GOI)', goi: 'Goa (GOI)',
      mumbai: 'Mumbai (BOM)', bom: 'Mumbai (BOM)',
      bengaluru: 'Bengaluru (BLR)', bangalore: 'Bengaluru (BLR)', blr: 'Bengaluru (BLR)',
      hyderabad: 'Hyderabad (HYD)', hyd: 'Hyderabad (HYD)',
      delhi: 'New Delhi (DEL)', 'new delhi': 'New Delhi (DEL)', del: 'New Delhi (DEL)',
      chennai: 'Chennai (MAA)', maa: 'Chennai (MAA)',
      kolkata: 'Kolkata (CCU)', ccu: 'Kolkata (CCU)'
    };

    const normalizeKey = str => String(str || '').replace(/\s*\([^)]*\)\s*/g, '').trim().toLowerCase();
    const fillDatalist = (dl, opts) => {
      if (dl) dl.innerHTML = opts.map(o => `<option value="${o}">`).join('');
    };

    if (dateInput) {
      const today = new Date();
      const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      dateInput.min = todayIso;
      if (!dateInput.value || dateInput.value < todayIso) {
        const wk = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
        dateInput.value = `${wk.getFullYear()}-${String(wk.getMonth() + 1).padStart(2, '0')}-${String(wk.getDate()).padStart(2, '0')}`;
      }
    }

    let activeMode = 'flight';

    function applyMode(mode) {
      activeMode = mode === 'bus' ? 'bus' : 'flight';
      if (modeBar) {
        modeBar.querySelectorAll('.search-mode-pill').forEach(btn => {
          const on = btn.dataset.mode === activeMode;
          btn.classList.toggle('active', on);
          btn.setAttribute('aria-selected', on ? 'true' : 'false');
        });
      }

      if (activeMode === 'bus') {
        if (srcLabel) srcLabel.textContent = 'From City';
        if (dstLabel) dstLabel.textContent = 'To City';
        fillDatalist(fromList, BUS_OPTIONS);
        fillDatalist(toList, BUS_OPTIONS);
        if (srcInput) {
          srcInput.placeholder = 'e.g., Pune, Bengaluru';
          srcInput.value = TO_BUS_MAP[normalizeKey(srcInput.value)] || 'Pune';
        }
        if (dstInput) {
          dstInput.placeholder = 'e.g., Goa, Mumbai';
          dstInput.value = TO_BUS_MAP[normalizeKey(dstInput.value)] || 'Goa';
          if (srcInput && normalizeKey(srcInput.value) === normalizeKey(dstInput.value)) {
            dstInput.value = srcInput.value === 'Goa' ? 'Pune' : 'Goa';
          }
        }
        if (submitBtn) submitBtn.textContent = 'Search Buses';
      } else {
        if (srcLabel) srcLabel.textContent = 'From';
        if (dstLabel) dstLabel.textContent = 'To';
        fillDatalist(fromList, FLIGHT_OPTIONS);
        fillDatalist(toList, FLIGHT_OPTIONS);
        if (srcInput) {
          srcInput.placeholder = 'e.g., Bengaluru (BLR)';
          srcInput.value = TO_FLIGHT_MAP[normalizeKey(srcInput.value)] || 'Bengaluru (BLR)';
        }
        if (dstInput) {
          dstInput.placeholder = 'e.g., Goa (GOI)';
          const mapped = TO_FLIGHT_MAP[normalizeKey(dstInput.value)];
          dstInput.value = mapped || 'Goa (GOI)';
          if (srcInput && normalizeKey(srcInput.value) === normalizeKey(dstInput.value)) {
            dstInput.value = srcInput.value.includes('(GOI)') ? 'Mumbai (BOM)' : 'Goa (GOI)';
          }
        }
        if (submitBtn) submitBtn.textContent = 'Search Flights';
      }
    }

    if (modeBar) {
      modeBar.querySelectorAll('.search-mode-pill').forEach(btn => {
        btn.addEventListener('click', () => applyMode(btn.dataset.mode || 'flight'));
      });
    }

    if (swapBtn && !swapBtn.dataset.ttBound) {
      swapBtn.dataset.ttBound = '1';
      swapBtn.addEventListener('click', () => {
        if (srcInput && dstInput) {
          [srcInput.value, dstInput.value] = [dstInput.value, srcInput.value];
        }
      });
    }

    if (!form.dataset.ttBound) {
      form.dataset.ttBound = '1';
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const src = (srcInput?.value || '').trim();
        const dst = (dstInput?.value || '').trim();
        const dt = (dateInput?.value || '').trim();

        let target = '';
        if (activeMode === 'bus') {
          const qs = new URLSearchParams();
          if (src) qs.set('from', src);
          if (dst) qs.set('to', dst);
          if (dt) qs.set('date', dt);
          target = ROOT + 'modules/bus/bus.html' + (qs.toString() ? '?' + qs.toString() : '');
        } else if (/bali|paris|dubai|maldives|jaipur|manali|kerala|switzerland/i.test(dst)) {
          target = ROOT + 'modules/packages/packages.html?q=' + encodeURIComponent(dst);
        } else {
          const qs = new URLSearchParams();
          if (src) qs.set('from', src);
          if (dst) qs.set('to', dst);
          if (dt) qs.set('date', dt);
          target = ROOT + 'modules/flight/results.html' + (qs.toString() ? '?' + qs.toString() : '');
        }

        if (!getUserSession()) {
          window.requireTripToraLogin(target);
          return;
        }
        window.location.href = target;
      });
    }

    applyMode('flight');
  }

  // 11. Global Guest Guard (redirects any click before login on non-auth pages to Login)
  function attachProtectedLinkGuard() {
    document.addEventListener('click', function (e) {
      if (getUserSession()) return;
      if (e.button && e.button !== 0) return;

      const onAuthPage = isAuthPath(window.location.pathname);
      const targetEl = (e.target && typeof e.target.closest === 'function')
        ? e.target
        : (e.target && e.target.parentElement ? e.target.parentElement : null);

      // Allow opening/selecting from the navbar Login dropdown (User Login / Admin Login)
      if (targetEl && targetEl.closest('#ttLoginDropdown')) {
        return;
      }

      const link = targetEl ? targetEl.closest('a[href]') : null;
      if (onAuthPage) {
        if (!link) return;
        const rawHref = link.getAttribute('href') || '';
        if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:')) return;
        try {
          const resolved = new URL(link.href, window.location.href);
          if (resolved.origin === window.location.origin && isProtectedPath(resolved.pathname)) {
            e.preventDefault();
            e.stopPropagation();
            window.requireTripToraLogin(resolved.href);
          }
        } catch (err) {}
        return;
      }

      // Before login on non-auth pages (e.g. index.html), clicking anywhere redirects to Login
      e.preventDefault();
      e.stopPropagation();

      if (link) {
        const rawHref = link.getAttribute('href') || '';
        if (rawHref && !rawHref.startsWith('#') && !rawHref.startsWith('javascript:')) {
          try {
            const resolved = new URL(link.href, window.location.href);
            if (resolved.origin === window.location.origin && isProtectedPath(resolved.pathname)) {
              window.requireTripToraLogin(resolved.href);
              return;
            }
          } catch (err) {}
        }
      }

      window.requireTripToraLogin();
    }, true);

    document.addEventListener('submit', function (e) {
      if (getUserSession()) return;
      if (isAuthPath(window.location.pathname)) return;
      if (e.target && e.target.id === 'quickSearchForm') return;
      e.preventDefault();
      e.stopPropagation();
      window.requireTripToraLogin();
    }, true);
  }

  // 12. Shared Home Hero Slider (#heroSlider)
  function mountHeroSlider() {
    const slider = document.getElementById('heroSlider');
    if (!slider) return;

    const slides = slider.querySelectorAll('.slide-item');
    const dotsBox = document.getElementById('slideDots');
    if (!slides.length || !dotsBox) return;

    let currentSlide = 0;
    let sliderTimer = null;

    dotsBox.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('span');
      if (idx === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        goToSlide(idx);
        startTimer();
      });
      dotsBox.appendChild(dot);
    });

    function goToSlide(n) {
      slides[currentSlide].classList.remove('active');
      dotsBox.children[currentSlide].classList.remove('active');
      currentSlide = (n + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
      dotsBox.children[currentSlide].classList.add('active');
    }

    function startTimer() {
      clearInterval(sliderTimer);
      sliderTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
    }

    const prevBtn = document.getElementById('slidePrev');
    const nextBtn = document.getElementById('slideNext');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToSlide(currentSlide - 1);
        startTimer();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goToSlide(currentSlide + 1);
        startTimer();
      });
    }

    startTimer();
  }

  // 13. Auto-initialize on DOM ready
  function init() {
    mountNavbar();
    mountFooter();
    mountChatbot();
    mountHeroSlider();
    mountQuickSearch();
    mountHomeDestinations();
    mountHomeFAQ();
    mountHomeRatings();
    attachProtectedLinkGuard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

