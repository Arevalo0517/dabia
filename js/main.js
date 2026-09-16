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
  // Envio real a /api/contact. Validacion cliente + servidor.
  // El servidor siempre vuelve a validar; nunca se confía solo en esto.
  const leadForm = document.getElementById('leadForm');
  if (leadForm) {
    const endpoint = leadForm.dataset.endpoint || '/api/contact';
    const submitBtn = leadForm.querySelector('button[type="submit"]');
    const successBox = document.getElementById('success');
    const errorBox = document.getElementById('formError');
    const emailField = leadForm.querySelector('input[type="email"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';

    const isEmailFormat = (value) =>
      typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const setBusy = (busy) => {
      if (submitBtn) {
        submitBtn.disabled = busy;
        submitBtn.setAttribute('aria-busy', busy ? 'true' : 'false');
        submitBtn.textContent = busy ? 'Enviando…' : originalBtnText;
      }
    };

    const resetMessages = () => {
      if (successBox) {
        successBox.classList.remove('show');
        successBox.textContent = '✓ Gracias. Recibimos tu información correctamente.';
      }
      if (errorBox) {
        errorBox.classList.remove('show');
        errorBox.textContent = '';
      }
    };

    const clearFieldErrors = () => {
      leadForm.querySelectorAll('[aria-invalid="true"]').forEach((f) => {
        f.removeAttribute('aria-invalid');
      });
    };

    const showError = (msg) => {
      if (!errorBox) return;
      errorBox.textContent = msg;
      errorBox.classList.add('show');
      errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const showSuccess = () => {
      if (!successBox) return;
      successBox.classList.add('show');
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    leadForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      resetMessages();
      clearFieldErrors();

      // Validacion cliente minima.
      const required = leadForm.querySelectorAll('[required]');
      let valid = true;
      required.forEach((field) => {
        if (!field.value || !field.value.trim()) {
          field.setAttribute('aria-invalid', 'true');
          valid = false;
        }
      });
      if (emailField && emailField.value && !isEmailFormat(emailField.value)) {
        emailField.setAttribute('aria-invalid', 'true');
        valid = false;
      }
      if (!valid) {
        showError('Completa los campos obligatorios.');
        return;
      }

      // Construir payload desde FormData (claves: nombre, empresa, correo, telefono, proceso).
      const data = {};
      new FormData(leadForm).forEach((value, key) => {
        data[key] = typeof value === 'string' ? value : '';
      });

      setBusy(true);
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        // Intentar parsear JSON; si falla, tratar como error temporal.
        let payload = null;
        try { payload = await response.json(); } catch (_e) { /* ignore */ }

        if (response.ok && payload && payload.ok === true) {
          showSuccess();
          leadForm.reset();
          clearFieldErrors();
        } else if (response.status === 400) {
          showError('Revisa la información e inténtalo nuevamente.');
        } else {
          showError('No pudimos enviar tu solicitud en este momento. Inténtalo nuevamente.');
        }
      } catch (_err) {
        showError('No pudimos enviar tu solicitud en este momento. Inténtalo nuevamente.');
      } finally {
        setBusy(false);
      }
    });
  }
})();
