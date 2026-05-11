'use strict';

/* =====================================================
   אנגלית בקלות — SOS Landing Page · script.js
   ===================================================== */

// ---------- PLACEHOLDERS (replace before going live) ----------
const CONFIG = {
  CARDCOM_URL:      'https://secure.cardcom.solutions/EA/EA5/MCD2309kZEqDG4TXSeLApQ/Intro',
  WHATSAPP_NUMBER:  'https://wa.me/972546904940',
};

// ---------- FOOTER YEAR ----------
(function setFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();

// ---------- SCROLL REVEAL ----------
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

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

  elements.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 0.04, 0.25)}s`;
    observer.observe(el);
  });
})();

// ---------- FAQ ACCORDION ----------
(function initFAQ() {
  const questions = document.querySelectorAll('.faq-item__question');

  questions.forEach((btn) => {
    btn.addEventListener('click', () => {
      const isOpen   = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      const answer   = document.getElementById(answerId);
      if (!answer) return;

      // close all others
      questions.forEach((otherBtn) => {
        if (otherBtn === btn) return;
        otherBtn.setAttribute('aria-expanded', 'false');
        const other = document.getElementById(otherBtn.getAttribute('aria-controls'));
        if (other) other.classList.remove('open');
      });

      // toggle current
      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.classList.toggle('open', !isOpen);
    });
  });
})();

// ---------- FORM VALIDATION & SUBMIT ----------
(function initForm() {
  const form       = document.getElementById('sos-form');
  const success    = document.getElementById('form-success');
  const submitBtn  = document.getElementById('submit-btn');
  if (!form) return;

  // ---- validators ----
  const validators = {
    name(val) {
      if (!val.trim()) return 'נא להזין שם';
      if (val.trim().length < 2) return 'השם קצר מדי';
      return '';
    },
    phone(val) {
      const clean = val.replace(/[\s\-]/g, '');
      if (!clean) return 'נא להזין מספר טלפון';
      if (!/^(\+972|0)[0-9]{9,10}$/.test(clean)) return 'מספר הטלפון אינו תקין';
      return '';
    },
    email(val) {
      if (!val.trim()) return 'נא להזין כתובת אימייל';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return 'כתובת האימייל אינה תקינה';
      return '';
    },
    privacy(checked) {
      if (!checked) return 'נא לאשר את מדיניות הפרטיות';
      return '';
    },
  };

  // ---- show/clear error ----
  function showError(fieldId, msg) {
    const input = document.getElementById(fieldId);
    const error = document.getElementById(`${fieldId}-error`);
    if (!input || !error) return;

    error.textContent = msg;
    input.classList.toggle('error', !!msg);
    input.classList.toggle('valid', !msg && input.value.trim() !== '');
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  // ---- validate single field ----
  function validateField(fieldId) {
    const input = document.getElementById(fieldId);
    if (!input) return true;

    let error = '';
    if (fieldId === 'privacy') {
      error = validators.privacy(input.checked);
    } else {
      error = validators[fieldId]?.(input.value) ?? '';
    }

    showError(fieldId, error);
    return !error;
  }

  // ---- live validation (on blur & input) ----
  ['name', 'phone', 'email'].forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener('blur', () => validateField(id));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(id);
    });
  });

  const privacyCheck = document.getElementById('privacy');
  if (privacyCheck) {
    privacyCheck.addEventListener('change', () => validateField('privacy'));
  }

  // ---- submit ----
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fields   = ['name', 'phone', 'email', 'privacy'];
    const allValid = fields.every((id) => validateField(id));

    if (!allValid) {
      const firstError = form.querySelector('.form-field__input.error, input[aria-invalid="true"]');
      if (firstError) firstError.focus();
      return;
    }

    // loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const data = {
      name:   document.getElementById('name').value.trim(),
      phone:  document.getElementById('phone').value.trim(),
      email:  document.getElementById('email').value.trim(),
      source: 'sos-landing-v1',
      date:   new Date().toISOString(),
    };

    try {
      // Optional: POST to your CRM / webhook before redirect
      // await fetch('/api/leads', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });

      form.hidden    = true;
      success.hidden = false;
      success.focus();

      try { sessionStorage.setItem('sos_lead', JSON.stringify(data)); } catch (_) {}

      setTimeout(() => {
        window.location.href = CONFIG.CARDCOM_URL;
      }, 1600);

    } catch (err) {
      console.error('Form submit error:', err);
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      const genericErr = document.createElement('p');
      genericErr.textContent = 'אירעה שגיאה. נסו שוב או צרו קשר בוואטסאפ.';
      genericErr.style.cssText = 'color:#ef4444;font-size:.9rem;text-align:center;margin-top:.75rem;';
      genericErr.setAttribute('role', 'alert');
      form.appendChild(genericErr);
      setTimeout(() => genericErr.remove(), 6000);
    }
  });
})();

// ---------- SMOOTH SCROLL FOR ANCHOR LINKS ----------
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id     = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
})();

// ---------- WHATSAPP LINK ----------
(function patchWhatsApp() {
  document.querySelectorAll('a[href*="wa.me/WHATSAPP_NUMBER"]').forEach((el) => {
    el.href = CONFIG.WHATSAPP_NUMBER;
  });
})();

// ---------- PRIVACY MODAL ----------
(function initPrivacyModal() {
  const modal      = document.getElementById('privacy-modal');
  const closeBtn   = document.getElementById('privacy-close');
  const openBtns   = document.querySelectorAll('.inline-link');
  if (!modal) return;

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  openBtns.forEach((btn) => btn.addEventListener('click', openModal));
  closeBtn.addEventListener('click', closeModal);

  // close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
})();

// ---------- MICRO-INTERACTION: button press ripple ----------
(function initRipple() {
  document.querySelectorAll('.btn--primary').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => {
      const rect   = btn.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const ripple = document.createElement('span');

      ripple.style.cssText = `
        position:absolute;
        border-radius:50%;
        background:rgba(255,255,255,.25);
        width:120px;height:120px;
        left:${x - 60}px;top:${y - 60}px;
        transform:scale(0);
        animation:rippleOut .55s ease forwards;
        pointer-events:none;
      `;

      if (!document.getElementById('ripple-style')) {
        const s = document.createElement('style');
        s.id = 'ripple-style';
        s.textContent = '@keyframes rippleOut{to{transform:scale(3);opacity:0;}}';
        document.head.appendChild(s);
      }

      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
})();
