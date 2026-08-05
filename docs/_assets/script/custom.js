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