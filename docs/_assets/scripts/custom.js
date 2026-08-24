(function () {
  function makeButton() {
    var isEn = window.location.pathname.indexOf('/en/') !== -1;
    var a = document.createElement('a');
    a.className = 'g-button g-button_view_flat-secondary g-button_size_m g-button_pin_round-round dc-control dc-controls__control pdf-dl-btn';
    a.href = isEn ? '/en/single-page.pdf' : '/ru/single-page.pdf';
    a.setAttribute('download', '');
    a.setAttribute('data-tooltip', isEn ? 'Download PDF' : 'Скачать PDF');
    a.setAttribute('aria-label', isEn ? 'Download PDF' : 'Скачать PDF');
    a.innerHTML =
      '<span class="g-button__icon"><span class="g-button__icon-inner">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg>' +
      '</span></span>';
    return a;
  }

  function ensureButton() {
    var host = document.querySelector('.dc-controls');
    if (!host) return;
    if (host.querySelector('.pdf-dl-btn')) return;
    host.appendChild(makeButton());
  }

  ensureButton();

  // Следим за перерисовками (SPA-переходы): как только .dc-controls
  // появился/перерисовался — вставляем кнопку, если её там нет.
  var observer = new MutationObserver(function () {
    ensureButton();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();