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
  // Submit handler: prevents default, shows a local success message.
  // When /api/contact becomes available, swap the preventDefault for a real POST.
  const leadForm = document.getElementById('leadForm');
  if (leadForm) {
    leadForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const success = document.getElementById('success');
      if (success) {
        success.classList.add('show');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // TODO: replace with real POST to /api/contact once backend is connected.
    });
  }
})();
