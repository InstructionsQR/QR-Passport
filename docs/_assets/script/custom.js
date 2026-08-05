/* Несколько разделов меню могут быть открыты одновременно */
(function () {
  var keepOpen = {};
  var timer = null;

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.dc-toc')) return;

    var btn = e.target.closest('button.dc-toc-item__text_clickable');
    if (btn) {
      var li = btn.parentElement;
      if (li && li.id) {
        if (li.classList.contains('dc-toc__list-item_opened')) delete keepOpen[li.id];
        else keepOpen[li.id] = true;
      }
    }
    scheduleRestore();
  }, true);

  function scheduleRestore() {
    var tries = 0;
    if (timer) clearInterval(timer);
    timer = setInterval(function () {
      restore();
      if (++tries >= 3) clearInterval(timer);
    }, 80);
  }

  function restore() {
    for (var id in keepOpen) {
      var li = document.getElementById(id);
      if (!li) { delete keepOpen[id]; continue; }
      if (!li.classList.contains('dc-toc__list-item_opened')) {
        var btn = li.querySelector('button.dc-toc-item__text_clickable');
        if (btn) btn.click();
      }
    }
  }
})();