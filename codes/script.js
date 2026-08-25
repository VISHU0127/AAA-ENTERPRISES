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
      'Message: ' + (d.message || '')
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
   3. Floating language translator (Google Translate backend)
   - A custom cyan/turquoise FAB with a speech-bubble "A/文" icon opens an
     elegant, animated panel (green/teal organic blobs) listing languages
     with the most common ones shown first.
   - Uses Google Translate as the engine (no custom translation). Google's
     widget is kept hidden off-screen and driven programmatically, so the
     page translates in place (no reload) and the chosen language is
     remembered for the visit via sessionStorage + Google's googtrans cookie.
   - The default Google banner is hidden via CSS (.goog-te-banner-frame).
   ------------------------------------------------------------------------- */
(function initGoogleTranslate() {
  const ENGINE_ID = 'google_translate_element';

  const SPEECH_SVG =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">' +
    '<path d="M3.6 5.4h16.2A2.4 2.4 0 0 1 22.2 7.8v8.4a2.4 2.4 0 0 1-2.4 2.4h-7.2L8.2 21.6v-3.2H3.6A2.4 2.4 0 0 1 1.2 16.2V7.8A2.4 2.4 0 0 1 3.6 5.4Z" fill="#ffffff"/>' +
    '<text x="8.9" y="14.6" font-family="Arial, sans-serif" font-size="8.6" font-weight="800" fill="#0a6b66" text-anchor="middle">A</text>' +
    '<text x="15.3" y="14.6" font-family="Arial, sans-serif" font-size="8.6" font-weight="800" fill="#0a6b66" text-anchor="middle">文</text>' +
    '</svg>';

  // Common languages first (visible-list priority order).
  const PRIORITY = ['en','hi','ar','es','fr','zh-CN','de','pt','ru','ja','it','tr','id','bn','ur','ko','vi','nl'];
  const FLAGS = {
    en:'🇬🇧', hi:'🇮🇳', ar:'🇸🇦', es:'🇪🇸', fr:'🇫🇷', 'zh-CN':'🇨🇳', de:'🇩🇪',
    pt:'🇧🇷', ru:'🇷🇺', ja:'🇯🇵', it:'🇮🇹', tr:'🇹🇷', id:'🇮🇩', bn:'🇧🇩',
    ur:'🇵🇰', ko:'🇰🇷', vi:'🇻🇳', nl:'🇳🇱',
    cs:'🇨🇿', fi:'🇫🇮', sv:'🇸🇪', el:'🇬🇷', ro:'🇷🇴', ms:'🇲🇾',
    fa:'🇮🇷', he:'🇮🇱', th:'🇹🇭', pl:'🇵🇱'
  };
  const NAMES = {
    en:'English', hi:'हिन्दी', ar:'العربية', es:'Español', fr:'Français',
    'zh-CN':'中文', de:'Deutsch', pt:'Português', ru:'Русский', ja:'日本語',
    it:'Italiano', tr:'Türkçe', id:'Bahasa Indonesia', bn:'বাংলা', ur:'اردو',
    ko:'한국어', vi:'Tiếng Việt', nl:'Nederlands', cs:'Čeština', fi:'Suomi',
    sv:'Svenska', el:'Ελληνικά', ro:'Română', ms:'Bahasa Melayu', fa:'فارسی',
    he:'עברית', th:'ไทย', pl:'Polski'
  };
  const fallbackName = (code) => (code ? code.toUpperCase() : 'Language');

  // Hidden host for Google's engine (kept in the DOM, off-screen).
  const engine = document.createElement('div');
  engine.id = ENGINE_ID;
  engine.className = 'gt-engine';
  document.body.appendChild(engine);

  // Floating UI.
  const fab = document.createElement('div');
  fab.className = 'gt-fab';
  fab.innerHTML =
    '<div class="gt-panel" role="dialog" aria-modal="false" aria-label="Select language">' +
      '<div class="gt-blobs" aria-hidden="true">' +
        '<span class="gt-blob gt-blob-1"></span>' +
        '<span class="gt-blob gt-blob-2"></span>' +
        '<span class="gt-blob gt-blob-3"></span>' +
      '</div>' +
      '<div class="gt-panel-head">' +
        '<span class="gt-panel-ico" aria-hidden="true">' + SPEECH_SVG + '</span>' +
        '<span class="gt-panel-title">Select language</span>' +
        '<button type="button" class="gt-panel-close" aria-label="Close language panel">✕</button>' +
      '</div>' +
      '<div class="gt-search">' +
        '<input type="text" class="gt-search-input" placeholder="Search languages" aria-label="Search languages">' +
      '</div>' +
       '<ul class="gt-lang-list" role="listbox" aria-label="Languages" tabindex="-1"></ul>' +
       '<p class="gt-unavailable-note" hidden>Translation service is unavailable right now — please try again later.</p>' +
    '</div>' +
    '<button type="button" class="gt-fab-btn" aria-haspopup="dialog" aria-expanded="false" aria-label="Choose language">' +
      SPEECH_SVG +
    '</button>';
  document.body.appendChild(fab);

  const panel = fab.querySelector('.gt-panel');
  const btn = fab.querySelector('.gt-fab-btn');
  const list = fab.querySelector('.gt-lang-list');
  const search = fab.querySelector('.gt-search-input');
  const closeBtn = fab.querySelector('.gt-panel-close');

  let current = 'en';
  let items = [];

  function initCurrent() {
    let saved = null;
    try { saved = sessionStorage.getItem('aaa_site_lang'); } catch (e) {}
    if (!saved) {
      const m = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([^;]+)/);
      if (m) saved = m[1];
    }
    if (saved) current = saved;
  }
  initCurrent();

  function buildList() {
    const codes = PRIORITY.slice();
    Object.keys(NAMES).forEach((c) => { if (!codes.includes(c)) codes.push(c); });
    items = codes.map((code) => ({
      code,
      name: NAMES[code] || fallbackName(code),
      flag: FLAGS[code] || '🌐'
    }));
    renderList(items);
    updateActive();
  }

  function renderList(arr) {
    list.innerHTML = '';
    if (!arr.length) {
      const li = document.createElement('li');
      li.className = 'gt-lang-empty';
      li.textContent = 'No languages found';
      list.appendChild(li);
      return;
    }
    arr.forEach((lang) => {
      const li = document.createElement('li');
      li.className = 'gt-lang-item';
      li.setAttribute('role', 'option');
      li.dataset.code = lang.code;
      li.tabIndex = -1;
      li.setAttribute('aria-selected', lang.code === current ? 'true' : 'false');
      li.innerHTML =
        '<span class="gt-lang-flag" aria-hidden="true">' + lang.flag + '</span>' +
        '<span class="gt-lang-name">' + lang.name + '</span>' +
        '<span class="gt-lang-check" aria-hidden="true">✓</span>';
      li.addEventListener('click', () => selectLanguage(lang.code));
      list.appendChild(li);
    });
  }

  function updateActive() {
    list.querySelectorAll('.gt-lang-item').forEach((li) => {
      const sel = li.dataset.code === current;
      li.classList.toggle('is-current', sel);
      li.setAttribute('aria-selected', sel ? 'true' : 'false');
    });
    const nm = NAMES[current] || fallbackName(current);
    btn.setAttribute('aria-label', 'Current language: ' + nm + '. Change language');
  }

  function selectLanguage(code) {
    const combo = document.querySelector('#' + ENGINE_ID + ' .goog-te-combo');
    if (combo) {
      combo.value = code;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
      try { sessionStorage.setItem('aaa_site_lang', code); } catch (e) {}
      current = code;
      updateActive();
      closePanel();
    } else {
      // Google Translate engine has not loaded (blocked / offline / rate-limited).
      markGTUnavailable();
    }
  }

  function openPanel() {
    fab.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    loadGoogleTranslate(); // lazy, non-blocking
    setTimeout(() => {
      const first = list.querySelector('.gt-lang-item');
      if (first) first.focus();
    }, 70);
  }

  function closePanel() {
    fab.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.focus();
  }

  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    const filtered = items.filter(
      (l) => l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q)
    );
    renderList(filtered);
  });

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (fab.classList.contains('is-open')) closePanel();
    else openPanel();
  });
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closePanel(); });
  document.addEventListener('click', (e) => {
    if (fab.classList.contains('is-open') && !fab.contains(e.target)) closePanel();
  });
  document.addEventListener('keydown', (e) => {
    if (!fab.classList.contains('is-open')) return;
    if (e.key === 'Escape') { closePanel(); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End') {
      const opts = Array.from(list.querySelectorAll('.gt-lang-item'));
      if (!opts.length) return;
      e.preventDefault();
      const idx = opts.findIndex((o) => o === document.activeElement);
      let next = 0;
      if (e.key === 'ArrowDown') next = (idx + 1) % opts.length;
      else if (e.key === 'ArrowUp') next = (idx - 1 + opts.length) % opts.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = opts.length - 1;
      opts[next].focus();
    }
  });
  list.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const li = e.target.closest('.gt-lang-item');
      if (li) { e.preventDefault(); selectLanguage(li.dataset.code); }
    }
  });

  // Build the language list immediately so the panel is always populated,
  // independent of Google Translate loading.
  buildList();

  // ---- Google Translate (lazy, non-blocking) -----------------------------
  // The translate engine is loaded only when the user opens the language
  // panel. This guarantees a blocked/slow translate.google.com can never
  // delay or freeze the page itself.
  let gtReady = false;
  let gtFailed = false;
  let gtLoading = false;

  function markGTUnavailable() {
    if (gtReady || gtFailed) return;
    gtFailed = true;
    const f = document.querySelector('.gt-fab');
    if (f) f.classList.add('gt-unavailable');
    const note = document.querySelector('.gt-unavailable-note');
    if (note) note.hidden = false;
  }

  function loadGoogleTranslate() {
    if (gtReady || gtFailed || gtLoading) return;
    gtLoading = true;
    window.googleTranslateElementInit = function () {
      gtReady = true;
      gtFailed = false;
      gtLoading = false;
      const t = document.getElementById(ENGINE_ID);
      if (!t) return;
      const allCodes = PRIORITY.concat(
        Object.keys(NAMES).filter((c) => !PRIORITY.includes(c))
      );
      new google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: allCodes.join(','),
          layout: google.translate.TranslateElement.InlineLayout.VERTICAL,
          autoDisplay: false,
          multilanguagePage: true
        },
        ENGINE_ID
      );
      const combo = t.querySelector('.goog-te-combo');
      if (combo && combo.value && combo.value !== '') current = combo.value;
    };
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.onerror = function () { gtLoading = false; markGTUnavailable(); };
    document.body.appendChild(s);
    // If Google Translate does not initialize in time, flag it unavailable
    // but keep the site fully usable.
    setTimeout(markGTUnavailable, 8000);
  }

  // Auto-load the translator for returning visitors who already chose a
  // language, so the page appears translated on load. This is non-blocking:
  // the page renders immediately and a blocked/slow Google simply leaves it
  // untranslated but fully usable. Fresh visitors load it lazily on open.
  if (current !== 'en') loadGoogleTranslate();
})();

/* -------------------------------------------------------------------------
    4. Homepage hero video autoplay
    - Modern browsers may block autoplay even for muted videos until the user
      interacts with the page. We attempt play() and silently swallow the
      rejection so the controls remain usable.
    ------------------------------------------------------------------------- */
(function initHeroVideo() {
  const video = document.querySelector('.promo-video');
  if (!video) return;
  const attempt = () => {
    video.play().catch(() => {});
  };
  attempt();
  document.addEventListener('click', attempt, { once: true });
  document.addEventListener('touchstart', attempt, { once: true });
  document.addEventListener('keydown', attempt, { once: true });
})();
