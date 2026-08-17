/* Меню: несколько открытых разделов + запоминание между страницами */
(function () {
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

  window.addEventListener('click', function (e) {
    var btn = e.target.closest('button.dc-toc-item__text');
    if (!btn) return;

    var list = load();
    var name = nameOf(btn);
    var i = list.indexOf(name);

    if (isOpen(btn)) { if (i > -1) list.splice(i, 1); }
    else if (i === -1) { list.push(name); }
    save(list);
    scheduleReopen();
  }, true);

  function reopen() {
    var list = load();
    groupButtons().forEach(function (btn) {
      var n = nameOf(btn);
      if (list.indexOf(n) > -1 && !isOpen(btn)) btn.click();
    });
  }

  var timer = null;
  function scheduleReopen() {
    var tries = 0;
    if (timer) clearInterval(timer);
    timer = setInterval(function () {
      reopen();
      if (++tries >= 30) clearInterval(timer);
    }, 300);
  }

  scheduleReopen();

  var mo = new MutationObserver(function () { reopen(); });
  (function watch() {
    var toc = document.querySelector('.dc-toc') || document.body;
    mo.observe(toc, { childList: true, subtree: true });
  })();
})();





(function () {
    function positionHeaderControls() {
        // Работаем только на десктопе
        if (window.innerWidth < 768) {
            return;
        }

        const search = document.querySelector(
            '.pc-desktop-navigation__buttons .dc-search-suggest'
        );

        const settings = document.querySelector(
            '.dc-control[aria-label="Настройки"]'
        );

        const language = document.querySelector(
            '.dc-control[aria-label="Язык"]'
        );

        if (!search || !settings || !language) {
            return;
        }

        const searchRect = search.getBoundingClientRect();

        // Расстояние между поиском и первой кнопкой
        const gap = 6;

        // Положение кнопок относительно поиска
        const settingsLeft = searchRect.right + gap;
        const languageLeft = settingsLeft + settings.offsetWidth + 2;

        const searchCenter = searchRect.top + searchRect.height / 2;

        settings.style.position = 'fixed';
        settings.style.left = settingsLeft + 'px';
        settings.style.top =
            (searchCenter - settings.offsetHeight / 2) + 'px';
        settings.style.zIndex = '1000';

        language.style.position = 'fixed';
        language.style.left = languageLeft + 'px';
        language.style.top =
            (searchCenter - language.offsetHeight / 2) + 'px';
        language.style.zIndex = '1000';
    }

    function init() {
        positionHeaderControls();

        // При изменении размера окна
        window.addEventListener('resize', positionHeaderControls);

        // Diplodoc может дорисовывать интерфейс после загрузки
        const observer = new MutationObserver(function () {
            positionHeaderControls();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();