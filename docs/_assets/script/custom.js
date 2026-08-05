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

/* Переносим «режим чтения / настройки / язык» в шапку рядом с поиском */
(function () {
  var tries = 0;
  var t = setInterval(function () {
    tries++;
    var controls = document.querySelector('.dc-doc-page__controls');
    var input = document.querySelector('input[placeholder*="оиск"]');
    if (controls && input) {
      var bar = null, wrap = null, node = input;
      while (node.parentElement) {
        var p = node.parentElement;
        if (p.querySelector('img') && p.querySelector('input')) { bar = p; wrap = node; break; }
        node = p;
      }
      console.log('move controls: bar=', !!bar, 'wrap=', !!wrap, 'already=', bar ? bar.contains(controls) : '-');
      if (bar && wrap && !bar.contains(controls)) {
        bar.insertBefore(controls, wrap);
        console.log('controls moved');
      }
      clearInterval(t);
    }
    if (tries >= 30) clearInterval(t);
  }, 300);
})();