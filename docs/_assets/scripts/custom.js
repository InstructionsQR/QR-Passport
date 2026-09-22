// ============================================================
// QR-Passport — custom.js
// PDF-кнопка
// Сохранение состояния бокового меню
// Виджет технической поддержки
// ============================================================


(function () {

  // ==========================================================
  // PDF-КНОПКА
  // ==========================================================

  function makePdfButton() {

    var isEn =
      window.location.pathname.indexOf('/en/') !== -1;

    var a = document.createElement('a');

    a.className =
      'g-button g-button_view_flat-secondary ' +
      'g-button_size_m g-button_pin_round-round ' +
      'dc-control dc-controls__control pdf-dl-btn';

    a.href = isEn
      ? '/en/single-page.pdf'
      : '/ru/single-page.pdf';

    a.setAttribute(
      'download',
      isEn
        ? 'User guide QR-Passport.pdf'
        : 'Инструкция пользователя QR-Passport.pdf'
    );

    a.setAttribute(
      'data-tooltip',
      isEn
        ? 'Download PDF'
        : 'Скачать PDF'
    );

    a.setAttribute(
      'aria-label',
      isEn
        ? 'Download PDF'
        : 'Скачать PDF'
    );

    a.innerHTML =
      '<span class="g-button__icon">' +
        '<span class="g-button__icon-inner">' +
          '<svg xmlns="http://www.w3.org/2000/svg" ' +
          'width="16" height="16" viewBox="0 0 24 24" ' +
          'fill="none" stroke="currentColor" ' +
          'stroke-width="2" stroke-linecap="round" ' +
          'stroke-linejoin="round">' +
            '<path d="M12 3v12"></path>' +
            '<path d="m7 10 5 5 5-5"></path>' +
            '<path d="M5 21h14"></path>' +
          '</svg>' +
        '</span>' +
      '</span>';

    return a;
  }


  function ensurePdfButton() {

    var host =
      document.querySelector('.dc-controls');

    if (!host) {
      return;
    }

    var button =
      host.querySelector('.pdf-dl-btn');

    if (!button) {

      button = makePdfButton();

      host.appendChild(button);
    }

    var vertical =
      window.getComputedStyle(host).flexDirection === 'column';

    button.classList.toggle(
      'pdf-vertical',
      vertical
    );
  }


  // ==========================================================
  // СОХРАНЕНИЕ СОСТОЯНИЯ БОКОВОГО МЕНЮ
  // ==========================================================

  var STORAGE_KEY =
    'qrpassport-toc-state-v2';


  function getLanguage() {

    return window.location.pathname.indexOf('/en/') !== -1
      ? 'en'
      : 'ru';
  }


  function getStorageKey() {

    return STORAGE_KEY + '-' + getLanguage();
  }


  // ----------------------------------------------------------
  // Получаем все раскрываемые пункты меню.
  //
  // В Diplodoc такие пункты имеют:
  //
  // .dc-toc-item__arrow
  //
  // При этом aria-expanded у закрытого пункта может
  // отсутствовать, поэтому НЕ используем:
  //
  // .dc-toc-item__link[aria-expanded]
  // ----------------------------------------------------------

  function getExpandableItems() {

    var links =
      document.querySelectorAll(
        '.dc-toc-item__link'
      );

    var result = [];

    links.forEach(function (link) {

      var arrow =
        link.querySelector(
          '.dc-toc-item__arrow'
        );

      if (arrow) {
        result.push(link);
      }
    });

    return result;
  }


  // ----------------------------------------------------------
  // Проверяем, открыт ли пункт
  // ----------------------------------------------------------

  function isItemExpanded(item) {

    var aria =
      item.getAttribute('aria-expanded');

    if (aria === 'true') {
      return true;
    }

    if (aria === 'false') {
      return false;
    }

    var parent =
      item.closest(
        '.dc-toc__list-item'
      );

    if (
      parent &&
      parent.classList.contains(
        'dc-toc__list-item_opened'
      )
    ) {
      return true;
    }

    return false;
  }


  // ----------------------------------------------------------
  // Читаем сохраненное состояние
  // ----------------------------------------------------------

  function getSavedState() {

    try {

      var saved =
        localStorage.getItem(
          getStorageKey()
        );

      if (!saved) {
        return {};
      }

      return JSON.parse(saved);

    } catch (e) {

      return {};
    }
  }


  // ----------------------------------------------------------
  // Сохраняем состояние меню
  // ----------------------------------------------------------

  function saveMenuState() {

    var state = {};

    var items =
      getExpandableItems();

    items.forEach(function (item) {

      var href =
        item.getAttribute('href');

      if (!href) {
        return;
      }

      state[href] =
        isItemExpanded(item);
    });


    try {

      localStorage.setItem(
        getStorageKey(),
        JSON.stringify(state)
      );

    } catch (e) {

      // Если localStorage недоступен,
      // просто ничего не делаем.

    }
  }


  // ----------------------------------------------------------
  // Восстанавливаем состояние меню
  // ----------------------------------------------------------

  function restoreMenuState() {

    var state =
      getSavedState();

    var keys =
      Object.keys(state);

    if (!keys.length) {
      return;
    }


    var items =
      getExpandableItems();


    items.forEach(function (item) {

      var href =
        item.getAttribute('href');

      if (!href) {
        return;
      }


      // Если этот пункт раньше не сохранялся —
      // ничего с ним не делаем.

      if (
        !Object.prototype.hasOwnProperty.call(
          state,
          href
        )
      ) {
        return;
      }


      // Нам нужно восстановить только открытые
      // ранее пункты.

      if (state[href] !== true) {
        return;
      }


      // Если уже открыт — ничего не делаем.

      if (isItemExpanded(item)) {
        return;
      }


      var arrow =
        item.querySelector(
          '.dc-toc-item__arrow'
        );

      if (!arrow) {
        return;
      }


      // Используем настоящий механизм Diplodoc,
      // а не пытаемся вручную менять классы/ARIA.

      arrow.click();

    });
  }


  // ==========================================================
  // ОБРАБОТКА КЛИКОВ ПО МЕНЮ
  // ==========================================================

  document.addEventListener(
    'click',
    function (event) {


      // ------------------------------------------------------
      // Нажата стрелка раскрытия/сворачивания
      // ------------------------------------------------------

      var arrow =
        event.target.closest(
          '.dc-toc-item__arrow'
        );


      if (arrow) {

        // Diplodoc сначала изменит состояние,
        // затем сохраняем его на следующем кадре.

        window.requestAnimationFrame(
          function () {
            saveMenuState();
          }
        );

        return;
      }


      // ------------------------------------------------------
      // Нажата ссылка в боковом меню
      // ------------------------------------------------------

      var tocLink =
        event.target.closest(
          '.dc-toc-item__link'
        );


      if (tocLink) {

        // Сохраняем состояние ДО перехода.
        // Это важно при использовании shallow router.

        saveMenuState();
      }

    },
    true
  );


  // ==========================================================
  // ОБЩИЙ MUTATION OBSERVER
  // ==========================================================

  var observer =
    new MutationObserver(
      function () {

        // PDF-кнопка
        ensurePdfButton();

        // Восстанавливаем раскрытые пункты
        restoreMenuState();

      }
    );


  observer.observe(
    document.body,
    {
      childList: true,
      subtree: true,

      // Следим за изменением состояния
      // пунктов меню Diplodoc.
      attributes: true,
      attributeFilter: [
        'aria-expanded'
      ]
    }
  );


  // ==========================================================
  // ПЕРВИЧНАЯ ИНИЦИАЛИЗАЦИЯ
  // ==========================================================

  ensurePdfButton();

  restoreMenuState();


  // ==========================================================
  // ИЗМЕНЕНИЕ РАЗМЕРА ОКНА
  // ==========================================================

  window.addEventListener(
    'resize',
    ensurePdfButton
  );

})();



// ============================================================
// ВИДЖЕТ ТЕХНИЧЕСКОЙ ПОДДЕРЖКИ
// ============================================================

(function () {

  function init() {

    // --------------------------------------------------------
    // Создаем основной контейнер
    // --------------------------------------------------------

    var root =
      document.createElement('div');

    root.className =
      'support-widget';


    // --------------------------------------------------------
    // Содержимое виджета
    // --------------------------------------------------------

    root.innerHTML =

      '<button ' +
        'class="support-widget__btn" ' +
        'type="button" ' +
        'aria-label="Техническая поддержка">' +

        '<svg viewBox="0 0 24 24" ' +
          'fill="none" ' +
          'stroke="currentColor" ' +
          'stroke-linecap="round" ' +
          'stroke-linejoin="round">' +

          '<circle cx="12" cy="12" r="10"/>' +
          '<circle cx="12" cy="12" r="4"/>' +

          '<line x1="4.93" y1="4.93" ' +
            'x2="9.17" y2="9.17"/>' +

          '<line x1="14.83" y1="14.83" ' +
            'x2="19.07" y2="9.17"/>' +

          '<line x1="4.93" y1="14.83" ' +
            'x2="9.17" y2="19.07"/>' +

        '</svg>' +

      '</button>' +


      '<div class="support-widget__pop" hidden>' +

        '<div class="support-widget__title">' +
          'Техническая поддержка' +
        '</div>' +

        '<p class="support-widget__text">' +
          'Если возникнут трудности – мы на связи. ' +
          'Выберите удобный способ:' +
        '</p>' +


        // ----------------------------------------------------
        // EMAIL
        // ----------------------------------------------------

        '<a ' +
          'class="support-widget__link" ' +
          'href="mailto:info@qrpassport.tech">' +

          '<span class="support-widget__icon">' +

            '<svg viewBox="0 0 24 24" ' +
              'fill="none" ' +
              'stroke="currentColor" ' +
              'stroke-linecap="round" ' +
              'stroke-linejoin="round">' +

              '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>' +

              '<polyline points="22,6 12,13 2,6"/>' +

            '</svg>' +

          '</span>' +

          '<span class="support-widget__col">' +

            '<span class="support-widget__name">' +
              'Email' +
            '</span>' +

            '<span class="support-widget__sub">' +
              'info@qrpassport.tech' +
            '</span>' +

          '</span>' +

        '</a>' +


        // ----------------------------------------------------
        // MAX
        // ----------------------------------------------------

        '<a ' +
          'class="support-widget__link" ' +
          'href="https://max.ru/u/f9LHodD0cOJtyuTGaqVohFwY9J_oThzVp6dTDYOtiMee5uMTvVtQVub2BWM" ' +
          'target="_blank" ' +
          'rel="noopener">' +

          '<span class="support-widget__icon">' +

            '<svg viewBox="0 0 24 24" ' +
              'fill="none" ' +
              'stroke="currentColor" ' +
              'stroke-linecap="round" ' +
              'stroke-linejoin="round">' +

              '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>' +

            '</svg>' +

          '</span>' +

          '<span class="support-widget__col">' +

            '<span class="support-widget__name">' +
              'MAX' +
            '</span>' +

            '<span class="support-widget__sub">' +
              'Написать в мессенджере' +
            '</span>' +

          '</span>' +

        '</a>' +


        // ----------------------------------------------------
        // TELEGRAM
        // ----------------------------------------------------

        '<a ' +
          'class="support-widget__link" ' +
          'href="https://t.me/ya_rozaliya" ' +
          'target="_blank" ' +
          'rel="noopener">' +

          '<span class="support-widget__icon">' +

            '<svg viewBox="0 0 24 24" ' +
              'fill="none" ' +
              'stroke="currentColor" ' +
              'stroke-linecap="round" ' +
              'stroke-linejoin="round">' +

              '<line x1="22" y1="2" ' +
                'x2="11" y2="13"/>' +

              '<polygon points="22 2 15 22 11 13 2 9 22 2"/>' +

            '</svg>' +

          '</span>' +

          '<span class="support-widget__col">' +

            '<span class="support-widget__name">' +
              'Telegram' +
            '</span>' +

            '<span class="support-widget__sub">' +
              'Написать в мессенджере' +
            '</span>' +

          '</span>' +

        '</a>' +

      '</div>';


    // --------------------------------------------------------
    // Добавляем виджет на страницу
    // --------------------------------------------------------

    document.body.appendChild(root);


    // --------------------------------------------------------
    // Обработчик кнопки
    // --------------------------------------------------------

    var button =
      root.querySelector(
        '.support-widget__btn'
      );

    var popup =
      root.querySelector(
        '.support-widget__pop'
      );


    button.addEventListener(
      'click',
      function () {

        popup.hidden =
          !popup.hidden;

        root.classList.toggle(
          'widget-open',
          !popup.hidden
        );

      }
    );

  }


  // ----------------------------------------------------------
  // Запуск
  // ----------------------------------------------------------

  if (
    document.readyState === 'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      init
    );

  } else {

    init();

  }

})();