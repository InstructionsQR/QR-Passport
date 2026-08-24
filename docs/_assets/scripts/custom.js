(function () {
  function addPdfButton() {
    if (document.querySelector('.pdf-header-btn')) return;

    var isEn = window.location.pathname.indexOf('/en/') !== -1;
    var a = document.createElement('a');
    a.className = 'pdf-header-btn';
    a.href = isEn ? '/en/single-page.pdf' : '/ru/single-page.pdf';
    a.setAttribute('download', '');
    a.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg>' +
      '<span>' + (isEn ? 'Download PDF' : 'Скачать PDF') + '</span>';
    document.body.appendChild(a);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addPdfButton);
  } else {
    addPdfButton();
  }
})();