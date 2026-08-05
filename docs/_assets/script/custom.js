(function () {
  console.log('custom.js v4');
  var KEY = 'qrpass-toc-open';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }
  function nameOf(btn) { return (btn.textContent || '').trim(); }
  function isOpen(btn) {
    var li = btn.parentElement;
    return !!(li && li.classList.contains('dc-toc__list-item_opened'));
  }
  function groupButtons() {
    return document.querySelectorAll('.dc-toc button.dc-toc-item__text_clickable');
  }

  console.log('stored:', JSON.stringify(load()));

  /* Запоминаем открытия/закрытия */
  window.addEventListener('click', function (e) {
    var btn = e.target.closest('button.dc-toc-item__text_clickable');
    if (!btn || !btn.closest('.dc-toc')) return;

    var list = load();
    var name = nameOf(btn);
    var i = list.indexOf(name);

    if (isOpen(btn)) { if (i > -1) list.splice(i, 1); }
    else if (i === -1) { list.push(name); }
    save(list);
    console.log('toc save:', JSON.stringify(list));

    scheduleReopen('click');
  }, true);

  /* Раскрываем сохранённые */
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
    var toc = document.querySelector('.dc-toc');
    if (toc) mo.observe(toc, { childList: true, subtree: true });
    else setTimeout(watch, 200);
  })();
})();