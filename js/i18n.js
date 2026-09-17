/* DABIA — Language toggle (EN | ES)
   Computes target URLs for the inline `<a data-lang="en|es">` links
   based on the current page slug (`document.body.dataset.page`).
   Marks the current language with `aria-current="true"` for screen
   readers and styling. Persists last-used language in localStorage
   to soften the experience when navigation crosses languages. */

(function () {
  'use strict';
  var slug = document.body.dataset.page || 'index';
  var filename = slug === 'index' ? 'index.html' : slug + '.html';

  var langLinks = document.querySelectorAll('[data-lang]');
  if (!langLinks.length) return;

  var pathMatch = location.pathname.match(/^\/(en|es)(\/|$)/);
  var currentLang = pathMatch ? pathMatch[1] : 'en';

  langLinks.forEach(function (a) {
    var target = a.getAttribute('data-lang');
    if (!target) return;
    a.setAttribute('href', '/' + target + '/' + filename);
    a.setAttribute('hreflang', target);
    if (target === currentLang) {
      a.setAttribute('aria-current', 'true');
      a.setAttribute('data-current', 'true');
    } else {
      a.removeAttribute('aria-current');
      a.removeAttribute('data-current');
    }
    a.addEventListener('click', function () {
      try { localStorage.setItem('dabia.lang', target); } catch (_e) { /* ignore */ }
    });
  });
})();
