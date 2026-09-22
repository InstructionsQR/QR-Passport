(function () {
  function makeButton() {
    var isEn = window.location.pathname.indexOf('/en/') !== -1;
    var a = document.createElement('a');
    a.className = 'g-button g-button_view_flat-secondary g-button_size_m g-button_pin_round-round dc-control dc-controls__control pdf-dl-btn';
    a.href = isEn ? '/en/single-page.pdf' : '/ru/single-page.pdf';
    a.setAttribute('download', isEn ? 'User guide QR-Passport.pdf' : 'Инструкция пользователя QR-Passport.pdf');
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
    var btn = host.querySelector('.pdf-dl-btn');
    if (!btn) {
      btn = makeButton();
      host.appendChild(btn);
    }
    // вертикальная панель или горизонтальная – подставляем нужный отступ
    var vertical = window.getComputedStyle(host).flexDirection === 'column';
    btn.classList.toggle('pdf-vertical', vertical);
  }

  ensureButton();
  window.addEventListener('resize', ensureButton);

  var observer = new MutationObserver(function () {
    ensureButton();
  });
  var panel = document.querySelector('.dc-controls') || document.body;
  observer.observe(panel, { childList: true, subtree: true });
})();

// ===== Поддержка: плавающая кнопка =====
(function () {
  function init() {
    var root = document.createElement('div');
    root.className = 'support-widget';
    root.innerHTML =
      '<button class="support-widget__btn" type="button" aria-label="Техническая поддержка"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="4.93" x2="19.07" y2="9.17"/><line x1="4.93" y1="14.83" x2="9.17" y2="19.07"/></svg></button>' +
      '<div class="support-widget__pop" hidden>' +
      '<div class="support-widget__title">Техническая поддержка</div>' +
      '<p class="support-widget__text">Если возникнут трудности – мы на связи. Выберите удобный способ:</p>' +
      '<a class="support-widget__link" href="mailto:info@qrpassport.tech">' +
        '<span class="support-widget__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>' +
        '<span class="support-widget__col"><span class="support-widget__name">Email</span><span class="support-widget__sub">info@qrpassport.tech</span></span>' +
      '</a>' +
      '<a class="support-widget__link" href="https://max.ru/u/f9LHodD0cOJtyuTGaqVohFwY9J_oThzVp6dTDYOtiMee5uMTvVtQVub2BWM" target="_blank" rel="noopener">' +
        '<span class="support-widget__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></span>' +
        '<span class="support-widget__col"><span class="support-widget__name">MAX</span><span class="support-widget__sub">Написать в мессенджере</span></span>' +
      '</a>' +
      '<a class="support-widget__link" href="https://t.me/ya_rozaliya" target="_blank" rel="noopener">' +
        '<span class="support-widget__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></span>' +
        '<span class="support-widget__col"><span class="support-widget__name">Telegram</span><span class="support-widget__sub">Написать в мессенджере</span></span>' +
      '</a>' +
      '</div>';
    document.body.appendChild(root);

    var btn = root.querySelector('.support-widget__btn');
    var pop = root.querySelector('.support-widget__pop');
    btn.addEventListener('click', function () {
      pop.hidden = !pop.hidden;
      root.classList.toggle('widget-open', !pop.hidden);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  })();


// ===== Меню: сохраняем раскрытые разделы (v5) =====
(function () {
  var KEY = 'menu-state';
  var state = loadState();
  var restoring = {};
  var lastPointer = { label: null, time: 0 };

  function loadState() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }

  function persistState() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) {}
  }

  function getLabel(btn) {
    var label = btn.getAttribute('aria-label');
    if (label && label.indexOf('Выпадающий список') === 0) {
      return label.replace('Выпадающий список ', '').trim();
    }
    return btn.textContent.trim();
  }

  document.addEventListener('pointerdown', function (e) {
    var btn = e.target.closest ? e.target.closest('.dc-toc button[aria-expanded]') : null;
    if (btn) {
      lastPointer = { label: getLabel(btn), time: Date.now() };
    }
  }, true);

  function getActiveAncestors() {
    var active = document.querySelector('.dc-toc a[aria-current="true"]');
    var ancestors = new Set();
    if (!active) return ancestors;
    var current = active.parentElement;
    while (current && current !== document.body) {
      var li = current.closest('li');
      if (!li) break;
      var btn = li.querySelector(':scope > button[aria-expanded]');
      if (btn) {
        if (ancestors.has(btn)) break;
        ancestors.add(btn);
      }
      current = li.parentElement;
    }
    return ancestors;
  }

  function acceptAncestors() {
    var changed = false;
    getActiveAncestors().forEach(function (btn) {
      var label = getLabel(btn);
      if (state[label] !== true) { state[label] = true; changed = true; }
    });
    if (changed) persistState();
  }

  function restore() {
    var ancestors = getActiveAncestors();
    document.querySelectorAll('.dc-toc button[aria-expanded]').forEach(function (btn) {
      if (ancestors.has(btn)) return;
      var label = getLabel(btn);
      if (state[label] === true && btn.getAttribute('aria-expanded') !== 'true') {
        restoring[label] = true;
        btn.click();
        setTimeout(function () { delete restoring[label]; }, 200);
      }
    });
  }

  function handleMutation(mutations) {
    var ancestors = getActiveAncestors();
    mutations.forEach(function (m) {
      if (m.type !== 'attributes' || m.attributeName !== 'aria-expanded') return;
      var btn = m.target;
      if (!btn.matches || !btn.matches('.dc-toc button[aria-expanded]')) return;

      var label = getLabel(btn);
      if (restoring[label]) return;

      var isNow = btn.getAttribute('aria-expanded') === 'true';
      var isUser = lastPointer.label === label && (Date.now() - lastPointer.time) < 800;

      if (isUser) {
        state[label] = isNow;
        persistState();
        return;
      }

      if (ancestors.has(btn) && isNow) {
        state[label] = true;
        persistState();
        return;
      }

      if ((state[label] === true) !== isNow) {
        restoring[label] = true;
        btn.click();
        setTimeout(function () { delete restoring[label]; }, 200);
      }
    });
  }

  var observer = new MutationObserver(handleMutation);

  function startObserving() {
    var toc = document.querySelector('.dc-toc');
    if (toc) {
      observer.observe(toc, { subtree: true, attributes: true, attributeFilter: ['aria-expanded'] });
    } else {
      setTimeout(startObserving, 100);
    }
  }

  function init() {
    acceptAncestors();
    restore();
    startObserving();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();