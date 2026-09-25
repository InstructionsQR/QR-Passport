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

// ===== Поддержка =====
(function () {
  function init() {
    var root = document.createElement('div');
    root.className = 'support-widget';
    root.innerHTML =
      '<button class="support-widget__btn" type="button" aria-label="Техническая поддержка"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg></button>' +
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


// ===== Меню: сохраняем раскрытые разделы (v7) =====
(function () {
  var KEY = 'menu-state';
  var state = loadState();
  var restoring = {};
  var lastPointer = { label: null, time: 0 };
  var innerObserver = null;

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
    return btn.textContent.trim().replace(/\s+/g, ' ');
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

  function handleInnerMutation(mutations) {
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

  function attachInner(toc) {
    if (innerObserver) innerObserver.disconnect();
    innerObserver = new MutationObserver(handleInnerMutation);
    innerObserver.observe(toc, { subtree: true, attributes: true, attributeFilter: ['aria-expanded'] });
  }

  var outer = new MutationObserver(function () {
    var toc = document.querySelector('.dc-toc');
    if (toc && toc.dataset.menuBound !== 'v7') {
      toc.dataset.menuBound = 'v7';
      attachInner(toc);
      acceptAncestors();
      restore();
    }
  });

  function init() {
    var toc = document.querySelector('.dc-toc');
    if (toc) {
      toc.dataset.menuBound = 'v7';
      attachInner(toc);
      acceptAncestors();
      restore();
    }
    outer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();



// ===== Дата обновления документации вверху страниц (авто, без главной) =====
(function () {
  var FALLBACK_DATE = '22.09.2026';
  var dateText = null;

  function isHomePage() {
    var p = window.location.pathname.replace(/index\.html$/, '');
    return p === '/ru/' || p === '/ru' || p === '/en/' || p === '/en' || p === '/';
  }

  function findHost() {
    var candidates = ['.dc-doc-page__main', '.dc-doc-page', 'main', '.dc-layout__content', '.dc-layout'];
    for (var i = 0; i < candidates.length; i++) {
      var el = document.querySelector(candidates[i]);
      if (el) return el;
    }
    return null;
  }

  function ensureDate() {
    var existing = document.querySelector('.doc-update-date');

    // на главной даты быть не должно
    if (isHomePage()) {
      if (existing) existing.remove();
      return;
    }

    if (existing || !dateText) return;
    var host = findHost();
    if (!host) return;
    var div = document.createElement('div');
    div.className = 'doc-update-date';
    var span = document.createElement('span');
    span.textContent = 'Дата обновления документации: ' + dateText;
    div.appendChild(span);
    host.insertBefore(div, host.firstChild);
  }

  function init() {
    fetch(location.pathname, { method: 'HEAD' })
      .then(function (r) {
        var lm = r.headers.get('Last-Modified');
        dateText = lm ? new Date(lm).toLocaleDateString('ru-RU') : FALLBACK_DATE;
        ensureDate();
      })
      .catch(function () {
        dateText = FALLBACK_DATE;
        ensureDate();
      });

    var observer = new MutationObserver(function () {
      ensureDate();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


// ===== Обратная связь: была ли страница полезна (цели Метрики) =====
(function () {
  var COUNTER = 111923254;

  function isHomePage() {
    var p = window.location.pathname.replace(/index\.html$/, '');
    return p === '/ru/' || p === '/ru' || p === '/en/' || p === '/en' || p === '/';
  }

  function storeKey() { return 'doc-feedback:' + window.location.pathname; }

  function sendGoal(vote) {
    if (typeof window.ym === 'function') {
      window.ym(COUNTER, 'reachGoal', vote === 'yes' ? 'docs_feedback_yes' : 'docs_feedback_no', { page: window.location.pathname });
    }
  }

  function renderThanks(container, vote) {
    container.innerHTML = '';
    var span = document.createElement('span');
    span.className = 'doc-feedback__thanks';
    span.textContent = vote === 'yes'
      ? 'Спасибо! Рады, что страница оказалась полезной.'
      : 'Спасибо! Мы учтём ваш отзыв и улучшим страницу.';
    container.appendChild(span);
  }

  function build() {
    var div = document.createElement('div');
    div.className = 'doc-feedback';
    div.dataset.path = window.location.pathname;

    var saved = null;
    try { saved = localStorage.getItem(storeKey()); } catch (e) {}
    if (saved) { renderThanks(div, saved); return div; }

    var q = document.createElement('span');
    q.textContent = 'Была ли эта страница полезна?';
    div.appendChild(q);

    ['yes', 'no'].forEach(function (vote) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'doc-feedback__btn';
      var icon = document.createElement('span');
      icon.className = 'doc-feedback__icon';
      icon.innerHTML = vote === 'yes'
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3 3 0 0 1 3 3.88Z"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3 3 0 0 1-3-3.88Z"/></svg>';
      b.appendChild(icon);
      b.setAttribute('aria-label', vote === 'yes' ? 'Полезно' : 'Не полезно');
      b.addEventListener('click', function () {
        sendGoal(vote);
        try { localStorage.setItem(storeKey(), vote); } catch (e) {}
        renderThanks(div, vote);
      });
      div.appendChild(b);
    });

    return div;
  }

  function ensure() {
    var existing = document.querySelector('.doc-feedback');
    if (isHomePage()) {
      if (existing) existing.remove();
      return;
    }
    if (existing) {
      if (existing.dataset.path === window.location.pathname) return;
      existing.remove();
    }
    var candidates = ['.dc-doc-page__main', '.dc-doc-page', 'main', '.dc-layout__content', '.dc-layout'];
    var host = null;
    for (var i = 0; i < candidates.length; i++) {
      host = document.querySelector(candidates[i]);
      if (host) break;
    }
    if (!host) return;
    host.appendChild(build());
  }

  function init() {
    ensure();
    var observer = new MutationObserver(function () { ensure(); });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();