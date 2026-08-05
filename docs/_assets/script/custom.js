(function () {
  console.log('custom.js v5');
  var KEY = 'qrpass-toc-open';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }
  function nameOf(btn) { return (btn.textContent || '').trim(); }
  function isOpen(btn) { return btn.getAttribute('aria-expanded') === 'true'; }
  function groupButtons() { return document.querySelectorAll('button.dc-toc-item__text'); }

  console.log('stored:', JSON.stringify(load()));

  /* Запоминаем, что открыл/закрыл пользователь */
  window.addEventListener('click', function (e) {
    var btn = e.target.closest('button.dc-toc-item__text');
    if (!btn || btn.tagName !== 'BUTTON') return;

    var list = load();
    var name = nameOf(btn);
    var i = list.indexOf(name);

    if (isOpen(btn)) { if (i > -1) list.splice(i, 1); }
    else if (i === -1) { list.push(name); }
    save(list);
    console.log('toc save:', JSON.stringify(list));

    scheduleReopen('click');
  }, true);

  /* Раскрываем сохранённые разделы */
  function reopen(source) {
    var list = load();
    groupButtons().forEach(function (btn) {
      var n = nameOf(btn);
      if (list.indexOf(n) > -1 && !isOpen(btn)) {
        console.log('reopen:', n, '| source:', source);
        btn.click();
      }
    });
  }

  var timer = null;
  function scheduleReopen(source) {
    var tries = 0;
    if (timer) clearInterval(timer);
    timer = setInterval(function () {
      reopen(source);
      if (++tries >= 30) clearInterval(timer);
    }, 300);
  }

  scheduleReopen('load');

  var mo = new MutationObserver(function () { reopen('observer'); });
  (function watch() {
    var toc = document.querySelector('nav') || document.body;
    mo.observe(toc, { childList: true, subtree: true });
  })();
})();

/* ===== ТЁМНАЯ ТЕМА ===== */

/* Лого в шапке: светлое, чтобы было видно на тёмном фоне */
.g-root_theme_dark img[src*="logo.svg"] {
  filter: grayscale(1) brightness(0) invert(1) !important;
}

/* Карточки в тёмной теме: #292b4e сверху → #09090b снизу */
.g-root_theme_dark [class*="basic-card"]:not([class*="__"]) {
  background: linear-gradient(180deg, #292b4e 0%, #09090b 100%) !important;
}

/* Кнопки «режим чтения / настройки / язык» — в шапку рядом с поиском */
.dc-doc-page__controls {
  position: fixed !important;
  top: 26px !important;
  right: 260px !important;
  z-index: 100;
  margin: 0 !important;
}

.dc-doc-page__controls .dc-controls {
  flex-direction: row !important;
  gap: 8px;
}