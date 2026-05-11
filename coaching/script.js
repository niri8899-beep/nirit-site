/* ═══════════════════════════════════════════════════════
   CONFIGURATION — Edit these values before deploying
═══════════════════════════════════════════════════════ */
const CONFIG = {
  // Replace with your WhatsApp number (digits only, country code first)
  // Example: '972501234567' for Israeli number 050-1234567
  whatsappNumber: '972546904940',

  // ── Email automation ──────────────────────────────────
  // Option A: EmailJS (https://www.emailjs.com — free tier available)
  emailjs: {
    serviceId:  'YOUR_SERVICE_ID',   // EmailJS → Email Services → Service ID
    templateId: 'YOUR_TEMPLATE_ID',  // EmailJS → Email Templates → Template ID
    publicKey:  'YOUR_PUBLIC_KEY',   // EmailJS → Account → Public Key
  },

  // Option B: Formspree (https://formspree.io — free tier available)
  // Uncomment the line below and set your form endpoint:
  // formspreeUrl: 'https://formspree.io/f/YOUR_FORM_ID',

  // When true, logs form data to console instead of sending (for testing)
  devMode: true,
};

/* ═══════════════════════════════════════════════════════
   DOM READY
═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  setFooterYear();
  initStickyHeader();
  initScrollAnimations();
  initSmoothScroll();
  initForm();
  initPrivacyModal();
  injectWhatsAppLinks();
});

/* ─── Privacy modal ─────────────────────────────────── */
function initPrivacyModal() {
  const modal      = document.getElementById('privacy-modal');
  const openBtn    = document.getElementById('open-privacy-modal');
  const closeTop   = document.getElementById('modal-close-btn');
  const closeBot   = document.getElementById('modal-close-bottom');

  if (!modal || !openBtn) return;

  // Element that triggered the modal (for returning focus on close)
  let lastFocus = null;

  function openModal(e) {
    e && e.preventDefault();
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    // Focus the scrollable content area for screen readers
    const content = modal.querySelector('.modal-content');
    requestAnimationFrame(() => content && content.focus());

    modal.addEventListener('keydown', trapFocus);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    modal.removeEventListener('keydown', trapFocus);
    lastFocus && lastFocus.focus();
  }

  // Close on Escape
  function trapFocus(e) {
    if (e.key === 'Escape') { closeModal(); return; }

    // Trap Tab inside modal
    if (e.key !== 'Tab') return;
    const focusable = Array.from(
      modal.querySelectorAll(
        'button, [href], input, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.disabled && el.offsetParent !== null);

    if (!focusable.length) { e.preventDefault(); return; }

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  // Close on overlay click (outside the box)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  openBtn.addEventListener('click', openModal);
  closeTop && closeTop.addEventListener('click', closeModal);
  closeBot && closeBot.addEventListener('click', closeModal);
}

/* ─── Footer year ───────────────────────────────────── */
function setFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ─── Sticky header shadow on scroll ───────────────── */
function initStickyHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ─── Scroll-triggered entrance animations ──────────── */
function initScrollAnimations() {
  const targets = document.querySelectorAll('.animate-on-scroll');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ─── Smooth scroll for anchor links ────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const headerHeight = document.getElementById('site-header')?.offsetHeight ?? 72;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ─── WhatsApp link injection ────────────────────────── */
function injectWhatsAppLinks() {
  const num = CONFIG.whatsappNumber;
  document.querySelectorAll('[href*="wa.me/"]').forEach((link) => {
    link.href = `https://wa.me/${num}`;
  });
}

/* ═══════════════════════════════════════════════════════
   FORM
═══════════════════════════════════════════════════════ */
function initForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  const submitBtn = document.getElementById('submit-btn');

  if (!form) return;

  // Real-time validation
  form.querySelectorAll('.form-input').forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('input-error')) validateField(input);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm(form)) return;

    const data = collectFormData(form);

    setButtonLoading(submitBtn, true);

    try {
      await submitForm(data);

      // Show success
      form.hidden = true;
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (err) {
      console.error('Form submission error:', err);
      showGlobalError(form, 'אירעה שגיאה. אנא נסו שוב או צרו קשר ישירות בוואטסאפ.');
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

/* ─── Collect form data ──────────────────────────────── */
function collectFormData(form) {
  return {
    name:  form.querySelector('#name')?.value.trim()  ?? '',
    phone: form.querySelector('#phone')?.value.trim() ?? '',
    email: form.querySelector('#email')?.value.trim() ?? '',
  };
}

/* ─── Submit handler ─────────────────────────────────── */
async function submitForm(data) {
  if (CONFIG.devMode) {
    console.log('[DEV MODE] Form data:', data);
    await delay(1200); // simulate network
    return;
  }

  // ── Option A: EmailJS ─────────────────────────────────
  // 1. Add this script to <head> in index.html:
  //    <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
  // 2. Uncomment the block below:
  /*
  if (typeof emailjs !== 'undefined') {
    await emailjs.send(
      CONFIG.emailjs.serviceId,
      CONFIG.emailjs.templateId,
      {
        from_name:  data.name,
        from_email: data.email,
        phone:      data.phone,
        // The email template should contain a WhatsApp link button.
        // Use this URL in your EmailJS template:
        whatsapp_url: `https://wa.me/${CONFIG.whatsappNumber}`,
      },
      CONFIG.emailjs.publicKey
    );
    return;
  }
  */

  // ── Option B: Formspree ───────────────────────────────
  // 1. Create account at formspree.io
  // 2. Set CONFIG.formspreeUrl above
  // 3. Uncomment the block below:
  /*
  const res = await fetch(CONFIG.formspreeUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Formspree error');
  return;
  */

  // If no service is configured, warn in console
  console.warn(
    'No email service configured. Set CONFIG.devMode = false and ' +
    'uncomment Option A (EmailJS) or Option B (Formspree) in script.js.'
  );
}

/* ─── Validation ─────────────────────────────────────── */
function validateForm(form) {
  let valid = true;

  form.querySelectorAll('.form-input[required]').forEach((input) => {
    if (!validateField(input)) valid = false;
  });

  const privacyBox   = form.querySelector('#privacy');
  const privacyError = document.getElementById('privacy-error');
  if (privacyBox && !privacyBox.checked) {
    if (privacyError) privacyError.textContent = 'יש לאשר את מדיניות הפרטיות';
    valid = false;
  } else if (privacyError) {
    privacyError.textContent = '';
  }

  return valid;
}

function validateField(input) {
  const errorEl = document.getElementById(`${input.id}-error`);
  const value   = input.value.trim();

  let message = '';

  if (!value) {
    message = 'שדה חובה';
  } else if (input.type === 'email' && !isValidEmail(value)) {
    message = 'כתובת מייל לא תקינה';
  } else if (input.id === 'phone' && !isValidPhone(value)) {
    message = 'מספר טלפון לא תקין';
  }

  const isError = Boolean(message);

  if (errorEl) errorEl.textContent = message;
  input.classList.toggle('input-error', isError);
  input.classList.toggle('input-valid', !isError && Boolean(value));
  input.setAttribute('aria-invalid', String(isError));

  return !isError;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function isValidPhone(phone) {
  // Accepts Israeli formats: 05X-XXXXXXX, +972, 972, with or without dashes/spaces
  return /^(\+?972|0)[2-9]\d{7,8}$/.test(phone.replace(/[\s\-]/g, ''));
}

/* ─── UI helpers ─────────────────────────────────────── */
function setButtonLoading(btn, loading) {
  if (!btn) return;
  btn.classList.toggle('btn--loading', loading);
  btn.disabled = loading;
  btn.setAttribute('aria-busy', String(loading));
}

function showGlobalError(form, message) {
  let errEl = form.querySelector('.form-global-error');
  if (!errEl) {
    errEl = document.createElement('p');
    errEl.className = 'form-global-error form-error';
    errEl.style.cssText = 'margin-bottom:16px;font-size:0.95rem;text-align:center;';
    form.prepend(errEl);
  }
  errEl.textContent = message;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ═══════════════════════════════════════════════════════
   EMAIL TEMPLATE GUIDE (for EmailJS)
   ───────────────────────────────────────────────────────
   After setting up EmailJS, create a template with the
   following structure. The recipient is the lead's email.

   Subject:
     קיבלתי את פרטייך — לתיאום שיחת ההתאמה עם נירית שוך

   Body (HTML):
     <div dir="rtl" style="font-family:Arial,sans-serif; max-width:600px; margin:0 auto;">
       <h2>שלום {{from_name}},</h2>
       <p>תודה שהשארת פרטים!</p>
       <p>
         אני נירית שוך ואשמח לתאם איתך שיחת התאמה אישית
         שבה נבין יחד מה המטרות שלך ואיך אני יכולה לעזור.
       </p>
       <p>לתיאום השיחה ישירות בוואטסאפ:</p>
       <a href="{{whatsapp_url}}"
          style="display:inline-block;background:#25D366;color:#fff;
                 padding:14px 32px;border-radius:50px;
                 text-decoration:none;font-weight:bold;font-size:16px;">
         לתיאום שיחת התאמה בוואטסאפ
       </a>
       <p style="margin-top:24px; color:#888; font-size:13px;">
         אנגלית בקלות | נירית שוך
       </p>
     </div>

═══════════════════════════════════════════════════════ */
