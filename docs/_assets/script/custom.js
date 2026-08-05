/* ===== 1. Меню: несколько открытых разделов + запоминание между страницами ===== */
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

/* ===== 2. Перенос кнопок управления в шапку рядом с поиском ===== */
(function () {
  console.log('qr: controls mover started');

  function place(controls, input) {
    var bar = null, wrap = null, node = input;
    while (node.parentElement) {
      var p = node.parentElement;
      if (p.querySelector('img[src*="logo.svg"]') && p.querySelector('input')) {
        bar = p; wrap = node; break;
      }
      node = p;
    }
    if (!bar) return false;
    bar.style.position = 'relative';
    bar.insertBefore(controls, wrap);
    controls.classList.add('qr-moved');
    return true;
  }

  function tryMove() {
    var controls = document.querySelector('.dc-doc-page__controls');
    var input = document.querySelector('input[placeholder*="оиск"]');
    if (controls && input && !controls.classList.contains('qr-moved')) {
      return place(controls, input);
    }
    return false;
  }

  var mo = new MutationObserver(function () {
    if (tryMove()) {
      console.log('qr: controls moved');
      mo.disconnect();
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });

  setTimeout(function () {
    mo.disconnect();
    var c = document.querySelector('.dc-doc-page__controls');
    if (c && !c.classList.contains('qr-moved')) {
      console.log('qr: move failed, showing at old place');
      c.style.opacity = '1';
    }
  }, 2000);

  tryMove();
})();