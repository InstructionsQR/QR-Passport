/* Несколько открытых разделов меню + запоминание между переходами */
(function () {
  console.log('custom.js loaded');
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

  /* Запоминаем, что пользователь открыл/закрыл */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('button.dc-toc-item__text_clickable');
    if (!btn || !btn.closest('.dc-toc')) return;

    var list = load();
    var name = nameOf(btn);
    var i = list.indexOf(name);

    if (isOpen(btn)) { if (i > -1) list.splice(i, 1); }  // закрыли — убираем из списка
    else if (i === -1) { list.push(name); }              // открыли — добавляем
    save(list);

    scheduleReopen();
  }, true);

  /* Раскрываем сохранённые разделы (и возвращаем закрытые просмотрщиком) */
  function reopen() {
    var list = load();
    groupButtons().forEach(function (btn) {
      if (list.indexOf(nameOf(btn)) > -1 && !isOpen(btn)) btn.click();
    });
  }

  var timer = null;
  function scheduleReopen() {
    var tries = 0;
    if (timer) clearInterval(timer);
    timer = setInterval(function () {
      reopen();
      if (++tries >= 8) clearInterval(timer);
    }, 150);
  }

  scheduleReopen(); /* при каждой загрузке страницы */
})();