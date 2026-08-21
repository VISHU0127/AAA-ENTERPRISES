/* =========================================================================
   AAA Internationals — site scripts
   Loaded at the end of <body> on every page, so the DOM is already parsed.
   ========================================================================= */

/* Keep each page at the top on navigation so the sticky header doesn't jump,
   unless the URL has a hash (e.g. #markets) — then scroll to that section. */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) {
  const target = document.querySelector(location.hash);
  if (target) {
    requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth' }));
  } else {
    window.scrollTo(0, 0);
  }
} else {
  window.scrollTo(0, 0);
}

/* -------------------------------------------------------------------------
   1. Mobile navigation
   - Toggles the .nav menu when the hamburger (.menu) is tapped.
   - Closes the menu when a link is tapped or when clicking outside the menu.
   - Keeps aria-expanded in sync for accessibility.
   ------------------------------------------------------------------------- */
(function initMobileNav() {
  const menu = document.querySelector('.menu');
  const navEl = document.querySelector('.nav');
  if (!menu || !navEl) return;

  const sync = () =>
    menu.setAttribute('aria-expanded', navEl.classList.contains('open') ? 'true' : 'false');

  menu.setAttribute('aria-expanded', 'false');

  menu.addEventListener('click', () => {
    navEl.classList.toggle('open');
    sync();
  });

  navEl.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      navEl.classList.remove('open');
      sync();
    })
  );

  // Close the menu when tapping anywhere outside the menu or the hamburger.
  document.addEventListener('click', (e) => {
    if (!navEl.classList.contains('open')) return;
    if (navEl.contains(e.target) || menu.contains(e.target)) return;
    navEl.classList.remove('open');
    sync();
  });
})();

/* -------------------------------------------------------------------------
   2. Buyer inquiry form (contact.html)
   - Restricts the shipment date picker to today or later.
   - Pre-selects the product if ?product= is present in the URL.
   - On submit, opens a pre-filled mailto: and shows a success note.
   ------------------------------------------------------------------------- */
(function initInquiryForm() {
  const shipmentEl = document.querySelector('input[name="shipment"]');
  if (shipmentEl) shipmentEl.min = new Date().toISOString().split('T')[0];

  const form = document.getElementById('inquiryForm');
  const success = document.getElementById('success');
  const productSelect = document.getElementById('productSelect');
  if (!form) return;

  const preselected = new URLSearchParams(location.search).get('product');
  if (preselected && productSelect) {
    [...productSelect.options].forEach((o) => {
      if (o.text.toLowerCase() === preselected.toLowerCase()) o.selected = true;
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    const lines = [
      '*New Buyer Inquiry — AAA Internationals*',
      'Name: ' + (d.name || ''),
      'Company: ' + (d.company || ''),
      'Country: ' + (d.country || ''),
      'Email: ' + (d.email || ''),
      'WhatsApp / Phone: ' + (d.phone || ''),
      'Product: ' + (d.product || ''),
      'Quantity: ' + (d.quantity || ''),
      'Packaging: ' + (d.packaging || ''),
      'Destination Port: ' + (d.port || ''),
      'Incoterm: ' + (d.incoterm || ''),
      'Shipment Date: ' + (d.shipment || ''),
      'Message: ' + (d.message || ''),
    ];
    const url =
      'mailto:business@aaainternationals.com?subject=' +
      encodeURIComponent('New Buyer Inquiry - AAA Internationals') +
      '&body=' +
      encodeURIComponent(lines.join('\n'));
    window.location.href = url;
    success.classList.add('show');
  });
})();

/* -------------------------------------------------------------------------
   3. Google Translate widget (Arabic / Hindi)
   - Injects the #google_translate_element after the header CTA.
   - On phone widths (<=992px) it is moved inside the .nav menu instead, so it
     stays reachable without crowding the header.
   ------------------------------------------------------------------------- */
(function initGoogleTranslate() {
  const gt = document.createElement('div');
  gt.id = 'google_translate_element';

  const header = document.querySelector('.site-header');
  const navCta = header ? header.querySelector('.nav-cta') : null;
  const navEl = document.querySelector('.nav');

  if (header && navCta) {
    navCta.insertAdjacentElement('afterend', gt);
  } else {
    const fb = document.querySelector('footer');
    if (fb) fb.insertAdjacentElement('afterbegin', gt);
  }

  function place() {
    if (!gt || !navCta || !navEl) return;
    if (window.matchMedia('(max-width:992px)').matches) {
      if (gt.parentNode !== navEl) navEl.appendChild(gt);
    } else if (gt.parentNode !== navCta) {
      navCta.insertAdjacentElement('afterend', gt);
    }
  }

  place();
  window.addEventListener('resize', place);

  window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement(
      {
        pageLanguage: 'en',
        includedLanguages: 'en,ar,hi',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
      },
      'google_translate_element'
    );
  };

  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.async = true;
  s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.body.appendChild(s);
})();
