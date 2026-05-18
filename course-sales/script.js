/* =============================================
   אנגלית בקלות — Landing Page Scripts
   ============================================= */

'use strict';

/* ── Footer year ── */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Scroll-fade animations ──────────────────
   Uses IntersectionObserver to add .visible
   to every .fade-in element as it enters view.
   ─────────────────────────────────────────── */
const fadeEls = document.querySelectorAll('.fade-in');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  fadeEls.forEach((el) => observer.observe(el));
} else {
  // Fallback for very old browsers
  fadeEls.forEach((el) => el.classList.add('visible'));
}

/* ── Sticky header shadow ─────────────────── */
const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10
      ? '0 2px 16px rgba(0,0,0,.12)'
      : '0 1px 3px rgba(0,0,0,.08)';
  }, { passive: true });
}

/* ── Smooth-scroll CTA links ─────────────────
   Handles anchor links that point to #pricing
   or other on-page IDs with an offset for the
   sticky header height.
   ─────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href').slice(1);
    const target   = document.getElementById(targetId);
    if (!target) return;
    e.preventDefault();
    const headerH = header ? header.offsetHeight : 0;
    const top     = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Countdown timer ─────────────────────────
   7-day countdown from first page load.
   Persists the end-time in localStorage so the
   timer survives page refreshes.
   ─────────────────────────────────────────── */
(function initCountdown() {
  const STORAGE_KEY = 'anglitBaKalut_offerEnd';
  const SEVEN_DAYS  = 7 * 24 * 60 * 60 * 1000;

  let endTime = parseInt(localStorage.getItem(STORAGE_KEY), 10);
  if (!endTime || isNaN(endTime)) {
    endTime = Date.now() + SEVEN_DAYS;
    localStorage.setItem(STORAGE_KEY, endTime);
  }

  const daysEl    = document.getElementById('cd-days');
  const hoursEl   = document.getElementById('cd-hours');
  const minsEl    = document.getElementById('cd-mins');
  const secsEl    = document.getElementById('cd-secs');
  const timerEl   = document.getElementById('countdown');
  const expiredEl = document.getElementById('countdown-expired');

  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  function pad(n) {
    return String(Math.max(0, n)).padStart(2, '0');
  }

  function tick() {
    const remaining = endTime - Date.now();

    if (remaining <= 0) {
      if (timerEl)   timerEl.classList.add('hidden');
      if (expiredEl) expiredEl.classList.remove('hidden');
      return;
    }

    const totalSecs = Math.floor(remaining / 1000);
    const d = Math.floor(totalSecs / 86400);
    const h = Math.floor((totalSecs % 86400) / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;

    daysEl.textContent  = pad(d);
    hoursEl.textContent = pad(h);
    minsEl.textContent  = pad(m);
    secsEl.textContent  = pad(s);

    setTimeout(tick, 1000);
  }

  tick();
})();

/* ── FAQ accordion ───────────────────────────
   Accessible: toggles aria-expanded + hidden
   on each question/answer pair.
   ─────────────────────────────────────────── */
document.querySelectorAll('.faq-question').forEach((btn) => {
  btn.addEventListener('click', () => {
    const expanded  = btn.getAttribute('aria-expanded') === 'true';
    const answerId  = btn.getAttribute('aria-controls');
    const answerEl  = document.getElementById(answerId);

    // Close all others
    document.querySelectorAll('.faq-question').forEach((other) => {
      if (other === btn) return;
      other.setAttribute('aria-expanded', 'false');
      const otherId = other.getAttribute('aria-controls');
      const otherEl = document.getElementById(otherId);
      if (otherEl) otherEl.hidden = true;
    });

    // Toggle current
    btn.setAttribute('aria-expanded', String(!expanded));
    if (answerEl) answerEl.hidden = expanded;
  });
});

/* ── Registration form + redirect to course portal ─
   Validates name / phone / email, then redirects to
   the course portal purchase page with the email
   pre-filled. The portal handles payment (Cardcom)
   and account creation.
   ─────────────────────────────────────────── */
const PORTAL_PURCHASE_URL = 'https://course-portal-iota.vercel.app/purchase';

const regForm  = document.getElementById('register-form');

function showError(inputId, errId, msg) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(errId);
  if (input) input.classList.add('input-error');
  if (err)   err.textContent = msg;
}

function clearError(inputId, errId) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(errId);
  if (input) input.classList.remove('input-error');
  if (err)   err.textContent = '';
}

function validateForm(name, phone, email) {
  let valid = true;

  clearError('reg-name',  'err-name');
  clearError('reg-phone', 'err-phone');
  clearError('reg-email', 'err-email');

  if (!name.trim()) {
    showError('reg-name', 'err-name', 'נא להזין שם מלא');
    valid = false;
  }

  const phoneClean = phone.replace(/[\s\-]/g, '');
  if (!phoneClean || !/^0\d{8,9}$/.test(phoneClean)) {
    showError('reg-phone', 'err-phone', 'נא להזין מספר טלפון תקין');
    valid = false;
  }

  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    showError('reg-email', 'err-email', 'נא להזין כתובת מייל תקינה');
    valid = false;
  }

  return valid;
}

if (regForm) {
  // Clear error on input
  ['reg-name', 'reg-phone', 'reg-email'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      el.classList.remove('input-error');
      const errEl = document.getElementById('err-' + id.replace('reg-', ''));
      if (errEl) errEl.textContent = '';
    });
  });

  regForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name  = document.getElementById('reg-name').value;
    const phone = document.getElementById('reg-phone').value;
    const email = document.getElementById('reg-email').value;

    if (!validateForm(name, phone, email)) return;

    // ── Analytics hooks (uncomment & configure as needed) ──
    // gtag('event', 'begin_checkout', { event_category: 'CTA', event_label: 'Portal' });
    // fbq('track', 'InitiateCheckout');

    // Redirect to the course portal purchase page with the email pre-filled.
    const destination = `${PORTAL_PURCHASE_URL}?email=${encodeURIComponent(email.trim())}`;

    window.location.href = destination;
  });
}

/* ── Privacy policy modal ────────────────────── */
(function initPrivacyModal() {
  const modal     = document.getElementById('privacy-modal');
  const openBtn   = document.getElementById('open-privacy');
  const closeBtn  = document.getElementById('close-privacy');
  if (!modal || !openBtn || !closeBtn) return;

  let lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
})();

/* ── Accessible skip-link injection ─────────── */
const skipLink = document.createElement('a');
skipLink.href      = '#pricing';
skipLink.className = 'skip-link';
skipLink.textContent = 'דלג לרכישה';
document.body.insertBefore(skipLink, document.body.firstChild);
