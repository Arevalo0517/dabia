/* DABIA — Shared scripts
   Vanilla JS, defensive: only attaches handlers if elements exist on the page.
   V5.2 adds IntersectionObserver entrance reveal + animated number counter. */

(function () {
  'use strict';

  // ---------- Reveal on scroll (entrance animation) ----------
  // Toggles .is-in on any .reveal element when it enters the viewport.
  // Reduced-motion is handled in CSS; if prefers-reduced-motion, skip the observer
  // and apply .is-in immediately so nothing stays hidden.
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = document.querySelectorAll('.reveal');
  if (revealTargets.length) {
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      revealTargets.forEach((el) => el.classList.add('is-in'));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      );
      revealTargets.forEach((el) => io.observe(el));
    }
  }

  // ---------- Animated number counter (for .counter[data-target]) ----------
  // Counts from 0 to data-target on first viewport entry. No fake data:
  // counters are explicitly opt-in via data-target; sections without it stay still.
  const counters = document.querySelectorAll('.counter[data-target]');
  if (counters.length && !prefersReduced && typeof IntersectionObserver !== 'undefined') {
    const animate = (el) => {
      const target = Number(el.dataset.target) || 0;
      const dur = Number(el.dataset.duration) || 1400;
      if (target <= 0) { el.textContent = '0'; return; }
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased).toLocaleString();
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    // Fallback: if reduced motion or no observer, show final target immediately.
    counters.forEach((el) => {
      const t = Number(el.dataset.target);
      el.textContent = t ? t.toLocaleString() : el.textContent;
    });
  }

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
