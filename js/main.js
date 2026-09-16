/* DABIA — Shared scripts
   Vanilla JS, defensive: only attaches handlers if elements exist on the page.
   Compatible with V5 homepage, contact form, and future pages. */

(function () {
  'use strict';

  // ---------- FAQ accordion ----------
  const faqButtons = document.querySelectorAll('.faq-q');
  faqButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      if (!item) return;
      item.classList.toggle('open');
      const icon = btn.lastElementChild;
      if (icon) icon.textContent = item.classList.contains('open') ? '−' : '＋';
    });
  });

  // ---------- Contact form ----------
  // Phase 1: form is purely visual. We block the native submit and show a
  // local success message. The intended endpoint is read from data-endpoint
  // (currently "/api/contact") but is NOT called yet.
  //
  // Phase 2 (when /api/contact exists): replace the preventDefault-only path
  // with a fetch() POST. Keep the same data-endpoint source of truth so the
  // HTML does not need to change.
  const leadForm = document.getElementById('leadForm');
  if (leadForm) {
    const endpoint = leadForm.dataset.endpoint || '/api/contact';
    const success = document.getElementById('success');
    const errorBox = document.getElementById('formError');

    const showSuccess = () => {
      if (success) {
        success.classList.add('show');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    const showError = (msg) => {
      if (errorBox) {
        errorBox.textContent = msg;
        errorBox.classList.add('show');
      }
    };

    leadForm.addEventListener('submit', (event) => {
      event.preventDefault();

      // Minimal client-side validation. Server-side validation MUST also run
      // in /api/contact once it exists; never trust the client alone.
      const required = leadForm.querySelectorAll('[required]');
      let valid = true;
      required.forEach((field) => {
        if (!field.value || !field.value.trim()) {
          field.setAttribute('aria-invalid', 'true');
          valid = false;
        } else {
          field.removeAttribute('aria-invalid');
        }
      });
      const email = leadForm.querySelector('input[type="email"]');
      if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.setAttribute('aria-invalid', 'true');
        showError('Revisa el formato del correo electrónico.');
        valid = false;
      }
      if (!valid) {
        if (!errorBox) showError('Completa los campos obligatorios.');
        return;
      }

      // ---- Phase 1: local-only ----
      // TODO (Phase 2): replace this block with:
      //   fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify(Object.fromEntries(new FormData(leadForm))) })
      //     .then(r => r.ok ? showSuccess() : showError('No pudimos enviar tu mensaje. Intenta más tarde.'))
      //     .catch(() => showError('Sin conexión. Intenta más tarde.'));
      showSuccess();
    });
  }
})();
