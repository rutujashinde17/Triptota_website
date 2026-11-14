/**
 * TripTora - Authentication Logic
 * Login, Registration, OTP Verification, Credential Checks, and Profile Sync.
 */

(function () {
  'use strict';

  function getRoot() {
    const p = window.location.pathname.replace(/\\/g, '/');
    if (p.includes('/modules/')) return '../../';
    if (p.includes('/auth/') || p.includes('/dashboard/')) return '../';
    return '';
  }

  const ROOT = getRoot();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const nameRegex = /^[A-Za-z][A-Za-z\s'.-]*$/;
  const phoneCharsRegex = /^\+?[0-9\s-]+$/;

  const EMAILJS_PUBLIC_KEY = 'YZC56ThtvLsklSVsL';
  const EMAILJS_SERVICE_ID = 'service_sprexhh';
  const EMAILJS_TEMPLATE_ID = 'template_x48skdo';

  if (window.emailjs && typeof window.emailjs.init === 'function') {
    try {
      window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    } catch (e) {}
  }

  let generatedOtp = null;
  let otpTargetEmail = '';
  let otpExpiry = 0;
  let otpVerified = false;
  let resendTimer = null;

  const ADMIN_DEFAULTS = {
    'admin@triptora.com': { password: 'Admin@123', name: 'TripTora Admin' }
  };

  function getAdmins() {
    let admins = {};
    try {
      admins = JSON.parse(localStorage.getItem('triptoraAdmins') || '{}');
    } catch (e) {}
    return { ...ADMIN_DEFAULTS, ...admins };
  }

  function getAccounts() {
    let acc = {};
    try {
      acc = JSON.parse(localStorage.getItem('triptoraAccounts') || '{}');
    } catch (e) {}
    if (acc['maya.ellis@example.com'] === 'TripTora123') {
      delete acc['maya.ellis@example.com'];
      localStorage.setItem('triptoraAccounts', JSON.stringify(acc));
    }
    return acc;
  }

  function getUsers() {
    let users = {};
    try {
      users = JSON.parse(localStorage.getItem('triptoraUsers') || '{}');
    } catch (e) {}
    if (users['maya.ellis@example.com'] === 'Maya Ellis') {
      delete users['maya.ellis@example.com'];
      localStorage.setItem('triptoraUsers', JSON.stringify(users));
    }
    return users;
  }

  function getStoredProfiles() {
    let profiles = {};
    try {
      profiles = JSON.parse(localStorage.getItem('triptoraUserProfiles') || '{}');
    } catch (e) {}
    return profiles;
  }

  function syncProfileData(first, last, email, phone) {
    try {
      const existing = JSON.parse(localStorage.getItem('tp_profile') || 'null') || {};
      const sameUser = existing.email && email && existing.email.toLowerCase() === email.toLowerCase();
      const updated = {
        first: first || (sameUser ? existing.first : '') || 'Explorer',
        last: typeof last === 'string' ? last : (sameUser ? existing.last || '' : ''),
        dob: (sameUser && existing.dob) || '14/05/1992',
        nationality: (sameUser && existing.nationality) || 'Indian',
        email: email || existing.email || '',
        phone: phone || (sameUser && existing.phone) || '+91 98765 43210',
        street: (sameUser && existing.street) || '24 Palm Avenue',
        city: (sameUser && existing.city) || 'Bengaluru',
        country: (sameUser && existing.country) || 'India',
        photo: (sameUser && existing.photo) || ''
      };
      localStorage.setItem('tp_profile', JSON.stringify(updated));
    } catch (e) {}
  }

  function setFieldError(fieldId, errorMsg) {
    const errorEl = document.getElementById(fieldId + 'Err');
    const inputEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = errorMsg;
    if (inputEl) inputEl.classList.toggle('bad', !!errorMsg);
    return !errorMsg;
  }

  function validateEmail(rawValue) {
    const email = String(rawValue || '').trim().toLowerCase();
    if (!email) return 'Email address is required.';
    if (email.includes('..') || !emailRegex.test(email)) {
      return 'Enter a valid email address (e.g. name@gmail.com).';
    }
    return '';
  }

  function validateName(rawValue, label, minLen) {
    const val = String(rawValue || '').trim();
    if (!val) return label + ' is required.';
    if (val.length < minLen) return `${label} must be at least ${minLen} characters.`;
    if (!nameRegex.test(val)) return `${label} must contain letters only.`;
    return '';
  }

  function validatePhone(rawValue) {
    const val = String(rawValue || '').trim();
    if (!val) return 'Mobile number is required.';
    if (!phoneCharsRegex.test(val)) return 'Mobile number can contain only digits, spaces, or +.';
    const digits = val.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      return 'Enter a valid 10-digit mobile number.';
    }
    if (/^(\d)\1+$/.test(digits)) {
      return 'Enter a valid mobile number (cannot be all identical digits).';
    }
    return '';
  }

  function validateRegisterPassword(pass) {
    const val = String(pass || '');
    if (!val) return 'Password is required.';
    if (/\s/.test(val)) return 'Password cannot contain spaces.';
    if (val.length < 6) return 'Password must be at least 6 characters.';
    if (!/[A-Za-z]/.test(val) || !/[0-9]/.test(val)) {
      return 'Password must include at least 1 letter and 1 number.';
    }
    return '';
  }

  function validateConfirmPassword(pass, conf) {
    const confirmVal = String(conf || '');
    if (!confirmVal) return 'Please confirm your password.';
    if (String(pass || '') !== confirmVal) return 'Passwords do not match.';
    return '';
  }

  function validateLoginPassword(pass) {
    const val = String(pass || '');
    if (!val) return 'Password is required.';
    if (val.length < 6) return 'Password must be at least 6 characters.';
    return '';
  }

  function isEmailAlreadyRegistered(email) {
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized) return false;
    const accounts = getAccounts();
    const users = getUsers();
    return (
      Object.prototype.hasOwnProperty.call(accounts, normalized) ||
      Object.prototype.hasOwnProperty.call(users, normalized)
    );
  }

  function validateRegisterEmail(rawValue) {
    const formatErr = validateEmail(rawValue);
    if (formatErr) return formatErr;
    if (isEmailAlreadyRegistered(rawValue)) {
      return 'This email is already registered. Please sign in instead.';
    }
    return '';
  }

  function bindLiveValidation(fieldId, getErrFn) {
    const inputEl = document.getElementById(fieldId);
    if (!inputEl) return;
    inputEl.addEventListener('blur', function () {
      setFieldError(fieldId, getErrFn());
    });
    inputEl.addEventListener('input', function () {
      if (inputEl.classList.contains('bad')) {
        setFieldError(fieldId, getErrFn());
      }
    });
  }

  function focusFirstInvalid(fieldIds) {
    for (const id of fieldIds) {
      const el = document.getElementById(id);
      if (el && el.classList.contains('bad') && typeof el.focus === 'function') {
        el.focus();
        break;
      }
    }
  }

  function toast(msg) {
    if (window.ttToast) {
      window.ttToast(msg);
    } else {
      alert(msg);
    }
  }

  function getSafeRedirectUrl() {
    const fallback = ROOT + 'dashboard/home.html';
    try {
      const queued = sessionStorage.getItem('triptora_redirect');
      if (!queued) return fallback;
      sessionStorage.removeItem('triptora_redirect');
      const parsed = new URL(queued, window.location.href);
      if (parsed.origin === window.location.origin && !parsed.pathname.includes('/auth/')) {
        return parsed.href;
      }
    } catch (e) {}
    return fallback;
  }

  // Initialize Login Form (User Login & Admin Login switcher)
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const notice = document.getElementById('redirectNotice');
    const justRegistered = sessionStorage.getItem('triptora_registered_email');
    if (justRegistered) {
      sessionStorage.removeItem('triptora_registered_email');
    }

    if (notice && justRegistered) {
      notice.textContent = '✅ Gmail verified & account created! Please enter your email and password to login.';
      notice.style.display = 'block';
      notice.style.background = '#e8f5e9';
      notice.style.borderColor = '#a5d6a7';
      notice.style.color = '#1b5e20';
    } else if (notice && sessionStorage.getItem('triptora_redirect')) {
      notice.style.display = 'block';
    }

    let activeRole = 'user';
    const roleBtns = document.querySelectorAll('#roleSwitch .role-btn');
    const eyebrowEl = document.getElementById('loginEyebrow');
    const headingEl = document.getElementById('loginHeading');
    const subtitleEl = document.getElementById('loginSubtitle');
    const submitBtnEl = document.getElementById('loginSubmitBtn');
    const demoHintEl = document.getElementById('demoHintBox');
    const regRowEl = document.getElementById('registerSwitchRow');
    const footerRowEl = document.getElementById('loginFormFooter');
    const emailField = document.getElementById('lEmail');
    const passField = document.getElementById('lPass');

    function clearLoginInputs() {
      if (emailField) emailField.value = '';
      if (passField) passField.value = '';
    }

    clearLoginInputs();
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('pageshow', function (ev) {
        if (ev && ev.persisted) clearLoginInputs();
      });
    }

    function setLoginRole(role) {
      activeRole = role === 'admin' ? 'admin' : 'user';
      roleBtns.forEach(btn => {
        const on = btn.dataset.role === activeRole;
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      setFieldError('lEmail', '');
      setFieldError('lPass', '');

      if (activeRole === 'admin') {
        if (eyebrowEl) eyebrowEl.textContent = 'Administration Portal';
        if (headingEl) headingEl.textContent = 'Admin Login · TripTora';
        if (subtitleEl) subtitleEl.textContent = 'Manage bookings, customer accounts, reviews and enquiries.';
        if (emailField) emailField.placeholder = 'admin@triptora.com';
        if (submitBtnEl) submitBtnEl.textContent = 'Login as Admin →';
        if (demoHintEl) {
          demoHintEl.style.display = '';
          demoHintEl.innerHTML = 'Demo admin login: <strong>admin@triptora.com</strong> / <strong>Admin@123</strong>';
        }
        if (regRowEl) regRowEl.style.display = 'none';
        if (footerRowEl) footerRowEl.style.display = 'none';
        if (notice && justRegistered) notice.style.display = 'none';
      } else {
        if (eyebrowEl) eyebrowEl.textContent = 'Your Journey Starts Here';
        if (headingEl) headingEl.textContent = 'Sign in to TripTora';
        if (subtitleEl) subtitleEl.textContent = 'Access your bookings, profile and exclusive member deals.';
        if (emailField) emailField.placeholder = 'you@example.com';
        if (submitBtnEl) submitBtnEl.textContent = 'Login as User →';
        if (demoHintEl) demoHintEl.style.display = 'none';
        if (regRowEl) regRowEl.style.display = '';
        if (footerRowEl) footerRowEl.style.display = '';
        if (notice && justRegistered) notice.style.display = 'block';
      }
    }

    roleBtns.forEach(btn => {
      btn.addEventListener('click', () => setLoginRole(btn.dataset.role));
    });

    const roleParam = new URLSearchParams(window.location.search).get('role');
    if (roleParam === 'admin' || roleParam === 'user') {
      setLoginRole(roleParam);
    }

    if (justRegistered) {
      setLoginRole('user');
      clearLoginInputs();
    }

    bindLiveValidation('lEmail', () => validateEmail(emailField ? emailField.value : ''));
    bindLiveValidation('lPass', () => validateLoginPassword(passField ? passField.value : ''));

    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const emailInput = document.getElementById('lEmail');
      const passInput = document.getElementById('lPass');
      const rawEmail = (emailInput ? emailInput.value : '').trim().toLowerCase();
      const rawPass = passInput ? passInput.value : '';

      const isEmailValid = setFieldError('lEmail', validateEmail(rawEmail));
      const isPassValid = setFieldError('lPass', validateLoginPassword(rawPass));
      if (!isEmailValid || !isPassValid) {
        focusFirstInvalid(['lEmail', 'lPass']);
        return;
      }

      if (activeRole === 'admin') {
        const admins = getAdmins();
        const adminEntry = Object.prototype.hasOwnProperty.call(admins, rawEmail) ? admins[rawEmail] : null;
        if (!adminEntry) {
          setFieldError('lEmail', 'Admin account not recognized. Use admin@triptora.com.');
          focusFirstInvalid(['lEmail']);
          return;
        }
        if (adminEntry.password !== rawPass) {
          setFieldError('lPass', 'Incorrect admin password. Please try again.');
          focusFirstInvalid(['lPass']);
          return;
        }

        const adminSession = {
          email: rawEmail,
          username: adminEntry.name || 'TripTora Admin',
          role: 'admin',
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('triptoraUser', JSON.stringify(adminSession));
        sessionStorage.removeItem('triptora_redirect');
        toast('✅ Admin Login successful! Opening Admin Panel...');
        setTimeout(() => {
          window.location.href = ROOT + 'dashboard/admin.html';
        }, 650);
        return;
      }

      const admins = getAdmins();
      if (Object.prototype.hasOwnProperty.call(admins, rawEmail)) {
        setFieldError('lEmail', 'This is an admin email. Switch to the "Admin Login" tab above.');
        focusFirstInvalid(['lEmail']);
        return;
      }

      const accounts = getAccounts();
      const users = getUsers();
      const profiles = getStoredProfiles();
      const hasAcc = Object.prototype.hasOwnProperty.call(accounts, rawEmail);
      const hasLegacyUser = Object.prototype.hasOwnProperty.call(users, rawEmail);

      if (!hasAcc && !hasLegacyUser) {
        setFieldError('lEmail', 'Account not found. Please Register first.');
        focusFirstInvalid(['lEmail']);
        return;
      }

      if (hasAcc && accounts[rawEmail] !== rawPass) {
        setFieldError('lPass', 'Incorrect password. Please try again.');
        focusFirstInvalid(['lPass']);
        return;
      }

      if (!hasAcc && hasLegacyUser) {
        accounts[rawEmail] = rawPass;
        localStorage.setItem('triptoraAccounts', JSON.stringify(accounts));
      }

      const storedProfile = profiles[rawEmail] || {};
      const username = users[rawEmail]
        || `${storedProfile.first || ''} ${storedProfile.last || ''}`.trim()
        || rawEmail.split('@')[0];
      const parts = String(username).trim().split(/\s+/);
      const firstName = storedProfile.first || parts[0];
      const lastName = typeof storedProfile.last === 'string' ? storedProfile.last : parts.slice(1).join(' ');
      const phone = storedProfile.phone || '';
      syncProfileData(firstName, lastName, rawEmail, phone);

      const sessionUser = {
        email: rawEmail,
        accountEmail: rawEmail,
        username: username,
        role: 'user',
        phone: phone,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('triptoraUser', JSON.stringify(sessionUser));
      const nextUrl = getSafeRedirectUrl();
      toast('✅ Login successful! Welcome back, ' + username);

      setTimeout(() => {
        window.location.href = nextUrl;
      }, 650);
    });
  }

  // Initialize Registration Form (Gmail OTP Verification -> Set Password -> Redirect to Login)
  const regForm = document.getElementById('regForm');
  if (regForm) {
    const sendOtpBtn = document.getElementById('sendOtp');
    const verifyOtpBtn = document.getElementById('verifyOtp');
    const emailInput = document.getElementById('rEmail');
    const phoneInput = document.getElementById('rPhone');
    const otpInput = document.getElementById('rOtp');
    const passInput = document.getElementById('rPass');
    const confInput = document.getElementById('rConf');
    const passWrap = document.getElementById('passwordStepWrap');
    const passHint = document.getElementById('passwordStepHint');
    const otpStatusBox = document.getElementById('otpStatusBox');

    function setOtpStatus(type, msg) {
      if (!otpStatusBox) return;
      otpStatusBox.className = 'otp-status' + (type ? ' ' + type : '');
      otpStatusBox.textContent = msg || '';
    }

    function setVerificationVisualState(verified) {
      if (passWrap) passWrap.classList.toggle('verified', verified);
      if (passHint) {
        passHint.textContent = verified
          ? '✓ Gmail verified! You are ready to create your account.'
          : '🔑 Set your account password (verify Gmail OTP above before submitting)';
      }
      if (verifyOtpBtn) {
        verifyOtpBtn.classList.toggle('verified', verified);
        verifyOtpBtn.textContent = verified ? '✓ Verified' : 'Verify OTP';
      }
    }

    function clearResendCooldown() {
      if (resendTimer) {
        clearInterval(resendTimer);
        resendTimer = null;
      }
    }

    function startResendCooldown(seconds) {
      clearResendCooldown();
      if (!sendOtpBtn) return;
      let remaining = seconds;
      sendOtpBtn.disabled = true;
      sendOtpBtn.textContent = `Resend (${remaining}s)`;
      resendTimer = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearResendCooldown();
          sendOtpBtn.disabled = false;
          sendOtpBtn.textContent = 'Resend OTP';
        } else {
          sendOtpBtn.textContent = `Resend (${remaining}s)`;
        }
      }, 1000);
    }

    function resetOtpVerification() {
      clearResendCooldown();
      generatedOtp = null;
      otpTargetEmail = '';
      otpExpiry = 0;
      otpVerified = false;
      if (sendOtpBtn) {
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = '➤ Send OTP';
      }
      if (otpInput) otpInput.value = '';
      setFieldError('rOtp', '');
      setOtpStatus('', '');
      setVerificationVisualState(false);
    }

    setVerificationVisualState(false);

    const userInput = document.getElementById('rUser');
    const surInput = document.getElementById('rSur');

    bindLiveValidation('rUser', () => validateName(userInput ? userInput.value : '', 'First name', 2));
    bindLiveValidation('rSur', () => validateName(surInput ? surInput.value : '', 'Last name', 1));
    bindLiveValidation('rPhone', () => validatePhone(phoneInput ? phoneInput.value : ''));
    bindLiveValidation('rEmail', () => validateRegisterEmail(emailInput ? emailInput.value : ''));
    bindLiveValidation('rPass', () => validateRegisterPassword(passInput ? passInput.value : ''));
    bindLiveValidation('rConf', () => validateConfirmPassword(passInput ? passInput.value : '', confInput ? confInput.value : ''));

    if (passInput && confInput) {
      passInput.addEventListener('input', function () {
        if (confInput.value || confInput.classList.contains('bad')) {
          setFieldError('rConf', validateConfirmPassword(passInput.value, confInput.value));
        }
      });
    }

    if (emailInput) {
      emailInput.addEventListener('input', function () {
        const current = emailInput.value.trim().toLowerCase();
        if (otpTargetEmail && current !== otpTargetEmail) {
          resetOtpVerification();
        }
      });
      emailInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !otpVerified && sendOtpBtn && !sendOtpBtn.disabled) {
          e.preventDefault();
          sendOtpBtn.click();
        }
      });
    }

    if (otpInput) {
      otpInput.addEventListener('input', function () {
        const cleaned = otpInput.value.replace(/\D/g, '').slice(0, 6);
        if (otpInput.value !== cleaned) otpInput.value = cleaned;
        if (otpInput.classList.contains('bad') && /^\d{6}$/.test(cleaned)) {
          setFieldError('rOtp', '');
        }
      });
      otpInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !otpVerified && verifyOtpBtn) {
          e.preventDefault();
          verifyOtpBtn.click();
        }
      });
    }

    if (sendOtpBtn && emailInput) {
      sendOtpBtn.addEventListener('click', async function () {
        const email = emailInput.value.trim().toLowerCase();
        const emailErr = validateRegisterEmail(email);
        const isEmailValid = setFieldError('rEmail', emailErr);
        if (!isEmailValid) {
          focusFirstInvalid(['rEmail']);
          return;
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        generatedOtp = otp;
        otpTargetEmail = email;
        otpExpiry = Date.now() + 5 * 60 * 1000;
        otpVerified = false;

        setVerificationVisualState(false);
        if (otpInput) otpInput.value = '';
        setFieldError('rOtp', '');
        clearResendCooldown();
        sendOtpBtn.disabled = true;
        sendOtpBtn.textContent = 'Sending...';

        const firstName = (document.getElementById('rUser')?.value || '').trim();
        let emailSent = false;

        try {
          if (window.emailjs && typeof window.emailjs.send === 'function') {
            try {
              window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
            } catch (initErr) {}
            await window.emailjs.send(
              EMAILJS_SERVICE_ID,
              EMAILJS_TEMPLATE_ID,
              {
                to_email: email,
                otp: otp,
                email: email,
                to_name: firstName || email.split('@')[0]
              },
              { publicKey: EMAILJS_PUBLIC_KEY }
            );
            emailSent = true;
          }
        } catch (err) {
          console.warn('EmailJS OTP send failed:', err);
        }

        if (emailSent) {
          toast('📩 OTP sent to ' + email + '. Check your Gmail inbox or spam.');
          setOtpStatus(
            'sent',
            '📩 6-digit OTP sent to ' + email + '. Enter the code above and click Verify OTP.'
          );
          startResendCooldown(30);
        } else {
          toast('Mail server unavailable offline. Demo OTP: ' + otp);
          setOtpStatus(
            'warn',
            '⚠️ Could not reach mail server offline. Use Demo OTP ' + otp + ' above to verify.'
          );
          sendOtpBtn.disabled = false;
          sendOtpBtn.textContent = 'Resend OTP';
        }

        if (otpInput) otpInput.focus();
      });
    }

    if (verifyOtpBtn && otpInput && emailInput) {
      verifyOtpBtn.addEventListener('click', function () {
        const email = emailInput.value.trim().toLowerCase();
        const emailErr = validateRegisterEmail(email);
        if (emailErr) {
          setFieldError('rEmail', emailErr);
          focusFirstInvalid(['rEmail']);
          return;
        }
        if (!generatedOtp || otpTargetEmail !== email) {
          setFieldError('rOtp', 'Please click "Send OTP" to send a code to your email first.');
          focusFirstInvalid(['rOtp']);
          return;
        }
        const entered = otpInput.value.trim();
        if (!/^\d{6}$/.test(entered)) {
          otpVerified = false;
          setFieldError('rOtp', 'Please enter the 6-digit OTP sent to your Gmail.');
          focusFirstInvalid(['rOtp']);
          return;
        }
        if (!otpExpiry || Date.now() > otpExpiry) {
          otpVerified = false;
          setFieldError('rOtp', 'OTP expired. Please click "Resend OTP" for a new code.');
          focusFirstInvalid(['rOtp']);
          return;
        }
        if (entered === generatedOtp) {
          otpVerified = true;
          setFieldError('rOtp', '');
          setOtpStatus('verified', '✓ Gmail verified (' + email + ')!');
          setVerificationVisualState(true);
          clearResendCooldown();
          if (sendOtpBtn) {
            sendOtpBtn.disabled = false;
            sendOtpBtn.textContent = 'Resend OTP';
          }
          toast('✅ Gmail verified!');
          if (passInput && !passInput.value) passInput.focus();
        } else {
          otpVerified = false;
          setFieldError('rOtp', 'Incorrect OTP. Please check your Gmail and try again.');
          focusFirstInvalid(['rOtp']);
        }
      });
    }

    regForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const user = (userInput ? userInput.value : '').trim();
      const surname = (surInput ? surInput.value : '').trim();
      const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
      const pass = passInput ? passInput.value : '';
      const conf = confInput ? confInput.value : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const isOtpOk = otpVerified && otpTargetEmail === email;

      const checks = [
        setFieldError('rUser', validateName(user, 'First name', 2)),
        setFieldError('rSur', validateName(surname, 'Last name', 1)),
        setFieldError('rPhone', validatePhone(phone)),
        setFieldError('rEmail', validateRegisterEmail(email)),
        setFieldError(
          'rOtp',
          isOtpOk
            ? ''
            : (generatedOtp && otpTargetEmail === email
                ? 'Click "Verify OTP" to verify your Gmail before continuing.'
                : 'Click "Send OTP" and verify your Gmail first.')
        ),
        setFieldError('rPass', validateRegisterPassword(pass)),
        setFieldError('rConf', validateConfirmPassword(pass, conf))
      ];

      if (!checks.every(Boolean)) {
        focusFirstInvalid(['rUser', 'rSur', 'rPhone', 'rEmail', 'rOtp', 'rPass', 'rConf']);
        return;
      }

      const accounts = getAccounts();
      const users = getUsers();
      const profiles = getStoredProfiles();
      const fullName = `${user} ${surname}`.trim();

      accounts[email] = pass;
      users[email] = fullName;
      profiles[email] = {
        first: user,
        last: surname,
        email: email,
        phone: phone
      };
      localStorage.setItem('triptoraAccounts', JSON.stringify(accounts));
      localStorage.setItem('triptoraUsers', JSON.stringify(users));
      localStorage.setItem('triptoraUserProfiles', JSON.stringify(profiles));
      syncProfileData(user, surname, email, phone);

      // Clear active session so the newly registered user logs in with their email & password
      localStorage.removeItem('triptoraUser');
      sessionStorage.removeItem('triptora_redirect');
      sessionStorage.setItem('triptora_registered_email', email);

      toast('🎉 Account created & Gmail verified! Redirecting to Login...');
      setTimeout(() => {
        window.location.href = ROOT + 'auth/login.html?role=user';
      }, 750);
    });
  }

  // Auth Guard Helper
  window.requireAuth = function () {
    const user = localStorage.getItem('triptoraUser');
    if (!user) {
      toast('Please login to continue.');
      setTimeout(() => {
        window.location.replace(ROOT + 'auth/login.html');
      }, 500);
      return false;
    }
    return true;
  };
})();
