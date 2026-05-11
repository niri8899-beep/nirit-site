/**
 * אנגלית בקלות — script.js
 * Handles: scroll animations, header, mobile menu,
 *          form validation, scroll-to-top, footer year.
 *
 * ── FORM INTEGRATION NOTE ────────────────────────────────────
 * By default the form runs client-side only (shows success state).
 * To send real submissions, choose one option:
 *
 *  A) Mailchimp embedded form
 *     Set `action` on <form> to your Mailchimp post URL and
 *     uncomment the fetch block below (change field names to match).
 *
 *  B) EmailOctopus / ConvertKit / ActiveCampaign
 *     Similar — set `action` to their API endpoint, pass fields via fetch.
 *
 *  C) Zapier Webhook (recommended for quick setup, no code server)
 *     1. Create a Zapier "Webhooks by Zapier" trigger (Catch Hook).
 *     2. Copy the webhook URL.
 *     3. Set FORM_ENDPOINT below to that URL.
 *     4. Zapier sends the lead to Gmail / Sheets / your email tool.
 *
 *  D) Custom backend (Node / PHP)
 *     Set FORM_ENDPOINT to your API route that handles email sending.
 * ────────────────────────────────────────────────────────────── */

// PLACEHOLDER: replace with real endpoint when ready
const FORM_ENDPOINT = '#FORM_ACTION_URL';

/* ── Utility ────────────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Footer year ────────────────────────────────────────────── */
const yearEl = qs('#footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Sticky header shadow ───────────────────────────────────── */
const header = qs('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

/* ── Mobile menu toggle ─────────────────────────────────────── */
const menuBtn = qs('.mobile-menu-toggle');
const mobileNav = qs('#mobile-nav');

if (menuBtn && mobileNav) {
  menuBtn.addEventListener('click', () => {
    const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!isOpen));
    mobileNav.hidden = isOpen;
  });

  // Close when a nav link is clicked
  qsa('a', mobileNav).forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.setAttribute('aria-expanded', 'false');
      mobileNav.hidden = true;
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!header.contains(e.target)) {
      menuBtn.setAttribute('aria-expanded', 'false');
      mobileNav.hidden = true;
    }
  });
}

/* ── Privacy Policy Modal ───────────────────────────────────── */
const privacyModal    = qs('#privacy-modal');
const modalCloseTop   = qs('#modal-close-btn');
const modalCloseBot   = qs('#modal-close-bottom');

function openModal() {
  privacyModal.hidden = false;
  document.body.style.overflow = 'hidden';
  // Focus trap — focus the close button
  setTimeout(() => modalCloseTop && modalCloseTop.focus(), 50);
}

function closeModal() {
  privacyModal.hidden = true;
  document.body.style.overflow = '';
}

if (privacyModal) {
  // Open on any link pointing to #privacy-note or .link-inline[href="#privacy-note"]
  document.addEventListener('click', e => {
    const trigger = e.target.closest('a[href="#privacy-note"], .privacy-modal-trigger');
    if (trigger) { e.preventDefault(); openModal(); }
  });

  // Close buttons
  modalCloseTop && modalCloseTop.addEventListener('click', closeModal);
  modalCloseBot && modalCloseBot.addEventListener('click', closeModal);

  // Close on overlay click (outside modal-box)
  privacyModal.addEventListener('click', e => {
    if (e.target === privacyModal) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !privacyModal.hidden) closeModal();
  });
}

/* ── Scroll-to-top button ───────────────────────────────────── */
const scrollTopBtn = qs('#scroll-top');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    const show = window.scrollY > 500;
    scrollTopBtn.hidden  = !show;
    scrollTopBtn.classList.toggle('visible', show);
  }, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── Fade-in on scroll (Intersection Observer) ──────────────── */
const fadeEls = qsa('.fade-in');

if (fadeEls.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  fadeEls.forEach(el => observer.observe(el));
} else {
  // Fallback: show everything
  fadeEls.forEach(el => el.classList.add('visible'));
}

/* ── Smooth scroll for anchor links ────────────────────────── */
document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const target = qs(link.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  const headerH = header ? header.offsetHeight : 0;
  const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
  window.scrollTo({ top, behavior: 'smooth' });
});

/* ── Form validation & submission ───────────────────────────── */
const form        = qs('#contact-form');
const formSuccess = qs('#form-success');
const submitBtn   = qs('#submit-btn');

if (form) {
  /* Validation rules */
  const validators = {
    'field-name': {
      el:      qs('#field-name'),
      errorEl: qs('#name-error'),
      validate(val) {
        if (!val.trim())         return 'נא להזין שם מלא';
        if (val.trim().length < 2) return 'השם חייב להכיל לפחות 2 תווים';
        return '';
      }
    },
    'field-phone': {
      el:      qs('#field-phone'),
      errorEl: qs('#phone-error'),
      validate(val) {
        if (!val.trim()) return 'נא להזין מספר טלפון';
        const digits = val.replace(/[\s\-()]/g, '');
        if (!/^0\d{8,9}$/.test(digits)) return 'נא להזין מספר טלפון ישראלי תקין (למשל 050-1234567)';
        return '';
      }
    },
    'field-email': {
      el:      qs('#field-email'),
      errorEl: qs('#email-error'),
      validate(val) {
        if (!val.trim())               return 'נא להזין כתובת אימייל';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return 'נא להזין כתובת אימייל תקינה';
        return '';
      }
    },
    'privacy-check': {
      el:      qs('#privacy-check'),
      errorEl: qs('#privacy-error'),
      validate(_val, el) {
        if (!el.checked) return 'יש לאשר את מדיניות הפרטיות להמשך';
        return '';
      }
    }
  };

  /** Show/clear error for a field */
  function setFieldState(rule, errorMsg) {
    const { el, errorEl } = rule;
    const group = el.closest('.form-group');

    errorEl.textContent = errorMsg;

    if (errorMsg) {
      el.classList.add('error');
      el.classList.remove('success');
      el.setAttribute('aria-invalid', 'true');
      // Shake animation
      group.classList.remove('shaking');
      void group.offsetWidth; // reflow to restart
      group.classList.add('shaking');
      group.addEventListener('animationend', () => group.classList.remove('shaking'), { once: true });
    } else {
      el.classList.remove('error');
      if (el.type !== 'checkbox') el.classList.add('success');
      el.removeAttribute('aria-invalid');
    }
  }

  /** Validate a single field, return true if valid */
  function validateField(key) {
    const rule = validators[key];
    const val  = rule.el.type === 'checkbox' ? '' : rule.el.value;
    const err  = rule.validate(val, rule.el);
    setFieldState(rule, err);
    return err === '';
  }

  // Real-time validation on blur (not on change to avoid premature errors)
  Object.keys(validators).forEach(key => {
    const { el } = validators[key];
    el.addEventListener('blur',  () => validateField(key));
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) validateField(key);
    });
    if (el.type === 'checkbox') {
      el.addEventListener('change', () => validateField(key));
    }
  });

  /** Full form validation, returns true if all pass */
  function validateAll() {
    return Object.keys(validators)
      .map(key => validateField(key))
      .every(Boolean);
  }

  /* Form submit */
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateAll()) {
      // Focus first error
      const firstError = form.querySelector('[aria-invalid="true"]');
      if (firstError) firstError.focus();
      return;
    }

    // ── Show loading state ──
    submitBtn.setAttribute('data-loading', 'true');
    submitBtn.disabled = true;

    const data = {
      name:  qs('#field-name').value.trim(),
      phone: qs('#field-phone').value.trim(),
      email: qs('#field-email').value.trim(),
    };

    // ── Send to endpoint (skip if placeholder) ──
    if (FORM_ENDPOINT && FORM_ENDPOINT !== '#FORM_ACTION_URL') {
      try {
        await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.error('Form submission error:', err);
        // Decide: show success anyway (since lead is captured) or show error
        // For now, still show success to avoid blocking the user.
      }
    } else {
      // Development mode: simulate network delay
      await new Promise(r => setTimeout(r, 900));
    }

    // ── Show success ──
    submitBtn.removeAttribute('data-loading');
    submitBtn.disabled = false;

    form.style.transition = 'opacity .3s ease';
    form.style.opacity = '0';
    setTimeout(() => {
      form.hidden = true;
      formSuccess.hidden = false;
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  });
}
