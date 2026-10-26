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

// ===== Цель Метрики: скачивание PDF =====
(function () {
  var PDF_SELECTOR = '.pdf-dl-btn, a[href$=".pdf"], a[href*="print"], [aria-label*="PDF"], [title*="PDF"], [class*="pdf"]';
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest(PDF_SELECTOR);
    if (!btn) return;
    if (typeof ym === 'function') {
      ym(111923254, 'reachGoal', 'docs_pdf_download', { page: window.location.pathname });
      console.log('Метрика: цель PDF отправлена');
    }
  }, true);
})();

// ===== Цель Метрики: клик по кнопке технической поддержки =====
document.addEventListener('click', function (e) {
  var btn = e.target.closest && e.target.closest('.support-widget__btn');
  if (!btn) return;
  if (typeof ym === 'function') {
    ym(111923254, 'reachGoal', 'docs_support_open', { page: window.location.pathname });
    console.log('Метрика: цель support_open отправлена');
  }
}, true);

// ===== Цель: переход в приложение (docs_goto_app) =====
document.addEventListener('click', function (e) {
  var link = e.target.closest && e.target.closest('a[href*="app.qrpassport.tech"]');
  if (!link) return;
  if (typeof ym === 'function') {
    ym(111923254, 'reachGoal', 'docs_goto_app', { page: location.pathname, href: link.getAttribute('href') });
    console.log('Метрика: цель goto_app отправлена');
  }
}, true);

// ===== Цель: пустой результат поиска (docs_search_noresult) =====
(function () {
  var sent = {};

  function extractQuery(markerText) {
    var m = markerText.match(/«([^»]+)»/);
    if (m) return m[1].trim();
    var inputs = document.querySelectorAll('input');
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].value && inputs[i].value.trim()) return inputs[i].value.trim();
    }
    var u = location.search.match(/[?&](?:query|q|text)=([^&]+)/);
    return u ? decodeURIComponent(u[1].replace(/\+/g, ' ')) : '';
  }

  function trySend() {
    // ищем самый вложенный узел с текстом «ничего не найдено»
    var nodes = document.querySelectorAll('body *');
    var marker = null;
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      // Пропускаем окно умного поиска – у него свои цели в Метрике
      if (el.closest && el.closest('.ai-search-overlay')) continue;
      var t = el.textContent || '';
      if (t.length < 200 && /ничего не найдено/i.test(t)) marker = el;
    }
    if (!marker) return;

    var q = extractQuery(marker.textContent || '');
    if (!q || sent[q]) return;
    sent[q] = true;

    if (typeof ym === 'function') {
      ym(111923254, 'reachGoal', 'docs_search_noresult', { query: q, page: location.pathname });
      console.log('Метрика: цель search_noresult отправлена, запрос: ' + q);
    }
  }

  // выпадающая подсказка появляется без перезагрузки – наблюдаем за DOM
  if (typeof MutationObserver !== 'undefined') {
    var t = null;
    new MutationObserver(function () {
      clearTimeout(t);
      t = setTimeout(trySend, 300);
    }).observe(document.body, { childList: true, subtree: true });
  }

  // отдельная страница результатов – проверяем после загрузки
  if (document.readyState === 'complete') setTimeout(trySend, 300);
  else window.addEventListener('load', function () { setTimeout(trySend, 300); });
})();

// ===== Цель: дочитали страницу до конца (docs_scroll_bottom) =====
(function () {
  var sent = false;
  function onScroll() {
    if (sent) return;
    var doc = document.documentElement;
    // короткие страницы, которые и так видны целиком, не считаем
    if (doc.scrollHeight <= window.innerHeight + 150) return;
    if (window.scrollY + window.innerHeight >= doc.scrollHeight - 120) {
      sent = true;
      if (typeof ym === 'function') {
        ym(111923254, 'reachGoal', 'docs_scroll_bottom', { page: location.pathname });
        console.log('Метрика: цель scroll_bottom отправлена');
      }
      window.removeEventListener('scroll', onScroll);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ===== Цель Метрики: клик по мессенджеру в меню поддержки =====
document.addEventListener('click', function (e) {
  var link = e.target.closest && e.target.closest('.support-widget a, .support-widget__popup a, .support-widget__menu a');
  if (!link) return;
  
  var messenger = 'unknown';
  var text = link.textContent.toLowerCase();
  if (text.includes('email') || text.includes('почта')) messenger = 'email';
  else if (text.includes('max') || text.includes('макс')) messenger = 'max';
  else if (text.includes('telegram') || text.includes('телеграм')) messenger = 'telegram';
  
  if (typeof ym === 'function') {
    ym(111923254, 'reachGoal', 'docs_messenger_click', { 
      messenger: messenger, 
      page: location.pathname 
    });
    // виртуальная страница для отчёта
    ym(111923254, 'hit', '/support-messenger/' + messenger);
    console.log('Метрика: цель messenger_click отправлена, мессенджер: ' + messenger);
  }
}, true);


// ===== Умный локальный поиск по документации =====
(function () {
  var COUNTER_ID = 111923254;
  var sentQueries = {}; // чтобы не слать одну цель на каждое нажатие клавиши

  // Отправка цели в Метрику + лог в консоль для проверки
  function sendGoal(name, params) {
    var q = params && (params.query || params.empty_query || params.found_query || params.click_query);
    console.log('Метрика: цель ' + name + ' отправлена' +
      (q ? ', запрос: ' + q : '') +
      (params && params.results ? ', результатов: ' + params.results : '') +
      (params && params.section ? ', раздел: ' + params.section : ''));
    if (typeof ym === 'function') {
      ym(COUNTER_ID, 'reachGoal', name, params);
    }
  }

  var INDEX = [
    { title: 'Начало работы', keywords: ['начало', 'старт', 'знакомство', 'структура', 'новичок', 'введение', 'первый раз', 'с чего начать'], desc: 'Как устроена документация QR-Passport, с чего начать знакомство с системой.', url: '/ru/about.html' },
    { title: 'Основные понятия', keywords: ['понятия', 'термины', 'определения', 'марка', 'сертификат', 'деталь', 'модель', 'шаблон', 'изделие', 'что такое'], desc: 'Марка материала, сертификат, деталь, модель, шаблон паспорта, изделие – ключевые термины системы.', url: '/ru/concepts.html' },
    { title: 'Практическое руководство', keywords: ['практика', 'руководство', 'инструкция', 'пошагово', 'арматура', 'трубопровод', 'выпуск', 'passport', 'qr-код', 'как сделать', 'как создать'], desc: 'Пошаговая инструкция по выпуску паспорта трубопроводной арматуры.', url: '/ru/quick_start.html' },
    { title: 'Быстрый старт (другое оборудование)', keywords: ['быстрый', 'пневмопривод', 'электропривод', 'другое', 'упрощенный', 'без сертификатов'], desc: 'Выпуск паспорта пневмопривода, электропривода и другого оборудования.', url: '/ru/quick_start_other.html' },
    { title: 'Марки материалов', keywords: ['марка', 'материал', 'химический', 'состав', 'механический', 'свойства', 'сталь', 'сплав'], desc: 'Создание марки материала с химическим составом и механическими свойствами.', url: '/ru/equipment/material_grades/about.html' },
    { title: 'Сертификаты', keywords: ['сертификат', 'партия', 'плавка', 'качество', 'подтверждение', 'измерения', 'свойства'], desc: 'Добавление сертификата с партией или плавкой материала.', url: '/ru/equipment/certificates/about.html' },
    { title: 'Детали', keywords: ['деталь', 'составная', 'часть', 'изделие', 'связь', 'марка'], desc: 'Создание детали – составной части изделия.', url: '/ru/equipment/details/about.html' },
    { title: 'Создание модели', keywords: ['модель', 'группа', 'однотипные', 'изделия', 'создать', 'форму', 'шаблон'], desc: 'Описание группы однотипных изделий, форма создания модели.', url: '/ru/equipment/models/create_model.html' },
    { title: 'Шаблоны паспорта', keywords: ['шаблон', 'настройка', 'поля', 'разделы', 'блоки', 'структура', 'passport'], desc: 'Настройка шаблона: обязательные поля, разделы, включение и отключение блоков.', url: '/ru/equipment/models/templates.html' },
    { title: 'AI-помощник', keywords: ['ai', 'ии', 'помощник', 'распознавание', 'автоматическое', 'заполнение', 'умный', 'ocr'], desc: 'Распознавание данных из готового технического паспорта и автоматическое заполнение.', url: '/ru/equipment/models/templates.html#ai' },
    { title: 'Регистрация изделия', keywords: ['регистрация', 'изделие', 'выпуск', 'qr-код', 'код', 'продукция', 'цифровой'], desc: 'Выпуск паспорта изделия и генерация QR-кода.', url: '/ru/equipment/registered_products/about.html' },
    { title: 'Биллинг', keywords: ['биллинг', 'тариф', 'баланс', 'оплата', 'пополнение', 'счет', 'акт', 'деньги', 'цена'], desc: 'Тарифные планы, баланс, пополнение счёта, закрывающие документы.', url: '/ru/billing.html' },
    { title: 'Часто задаваемые вопросы', keywords: ['faq', 'вопросы', 'ответы', 'помощь', 'справка', 'часто'], desc: 'Ответы на типовые вопросы.', url: '/ru/FAQ.html' },
    { title: 'Типовые ошибки', keywords: ['ошибки', 'troubleshooting', 'проблемы', 'не работает', 'решение', 'исправление'], desc: 'Решения частых проблем при работе с системой.', url: '/ru/troubleshooting.html' }
  ];

  var SYNONYMS = {
    'паспорт': ['паспорт', 'документ', 'certificate'],
    'создать': ['создать', 'сделать', 'добавить', 'завести', 'выпустить', 'оформить'],
    'модель': ['модель', 'группа', 'тип'],
    'материал': ['материал', 'сырье', 'сплав', 'сталь'],
    'качество': ['качество', 'сертификат', 'подтверждение', 'партия'],
    'qr': ['qr', 'код', 'qr-код', 'qrкод'],
    'ошибка': ['ошибка', 'проблема', 'не работает', 'сбой', 'troubleshooting'],
    'цена': ['цена', 'стоимость', 'тариф', 'оплата', 'биллинг', 'деньги']
  };

  function normalize(text) {
    return text.toLowerCase().replace(/ё/g, 'е').replace(/[^\wа-яё\s]/gi, ' ').trim();
  }

  function expandQuery(query) {
    var words = normalize(query).split(/\s+/).filter(function (w) { return w.length >= 2; });
    var expanded = [];
    words.forEach(function (w) {
      expanded.push(w);
      Object.keys(SYNONYMS).forEach(function (key) {
        if (SYNONYMS[key].indexOf(w) !== -1) {
          SYNONYMS[key].forEach(function (s) {
            if (expanded.indexOf(s) === -1) expanded.push(s);
          });
        }
      });
    });
    return expanded;
  }

  function search(query) {
    var terms = expandQuery(query);
    var scored = INDEX.map(function (item) {
      var score = 0;
      var text = normalize(item.title + ' ' + item.keywords.join(' ') + ' ' + item.desc);
      terms.forEach(function (term) {
        if (normalize(item.title).indexOf(term) !== -1) score += 10;
        if (item.keywords.indexOf(term) !== -1) score += 5;
        if (text.indexOf(term) !== -1) score += 2;
        if (term.length >= 3 && text.indexOf(term.slice(0, 3)) !== -1) score += 1;
      });
      return { item: item, score: score };
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.filter(function (r) { return r.score > 0; }).slice(0, 5);
  }

  // === Модальное окно поиска ===
  var overlayBuilt = false;
  function ensureOverlay() {
    if (overlayBuilt) return;
    overlayBuilt = true;

    var overlay = document.createElement('div');
    overlay.className = 'ai-search-overlay';
    overlay.innerHTML =
      '<div class="ai-search-modal">' +
      '  <div class="ai-search-header"><h3>Поиск по документации</h3><button class="ai-search-close" type="button">✕</button></div>' +
      '  <div class="ai-search-hint">Введите вопрос – поиск найдёт разделы по смыслу и синонимам.</div>' +
      '  <input type="text" class="ai-search-input" placeholder="Например: как создать паспорт?">' +
      '  <div class="ai-search-status">Готов к работе</div>' +
      '  <div class="ai-search-results"></div>' +
      '</div>';
    document.body.appendChild(overlay);

    var input = overlay.querySelector('input');
    var status = overlay.querySelector('.ai-search-status');
    var results = overlay.querySelector('.ai-search-results');
    var timer = null;

    overlay.querySelector('.ai-search-close').addEventListener('click', function () {
      overlay.classList.remove('open');
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.classList.remove('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') overlay.classList.remove('open');
    });

    // --- Цель уходит только после окончания ввода ---
    var pendingGoal = null;
    var goalTimer = null;

    function flushGoal() {
      clearTimeout(goalTimer);
      if (!pendingGoal) return;
      var p = pendingGoal;
      pendingGoal = null;
      if (p.count === 0) {
        if (!sentQueries['no:' + p.q]) {
          sentQueries['no:' + p.q] = true;
          sendGoal('smart_search_noresult', { empty_query: p.q });
        }
      } else {
        if (!sentQueries['ok:' + p.q]) {
          sentQueries['ok:' + p.q] = true;
          sendGoal('smart_search_query', { found_query: p.q, results: p.count });
        }
      }
    }

    function queueGoal(q, count) {
      pendingGoal = { q: q, count: count };
      clearTimeout(goalTimer);
      goalTimer = setTimeout(flushGoal, 2000); // 2 секунды без клавиш – фраза готова
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') flushGoal(); // Enter – отправить сразу, не ждать 2 секунды
    });

    input.addEventListener('input', function () {
      var q = input.value.trim();
      if (q.length < 2) {
        results.innerHTML = '';
        status.textContent = 'Готов к работе';
        pendingGoal = null;
        clearTimeout(goalTimer);
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(function () {
        var top = search(q);
        if (top.length === 0) {
          status.textContent = 'Не нашлось разделов по запросу. Попробуйте другие слова.';
          results.innerHTML = '';
          queueGoal(q, 0);
          return;
        }
        status.textContent = 'Найдено ' + top.length + ' разделов:';
        results.innerHTML = top.map(function (r) {
          return '<a class="ai-search-item" href="' + r.item.url + '">' +
            '<div class="ai-search-title">' + r.item.title + '</div>' +
            '<div class="ai-search-desc">' + r.item.desc + '</div>' +
            '<div class="ai-search-score">релевантность ' + r.score + '</div>' +
            '</a>';
        }).join('');
        queueGoal(q, top.length);
      }, 300);
    });

    // Метрика: клик по результату (делегирование – ссылки создаются динамически)
    results.addEventListener('click', function (e) {
      var link = e.target.closest ? e.target.closest('.ai-search-item') : null;
      if (!link) return;
      var titleEl = link.querySelector('.ai-search-title');
      sendGoal('smart_search_click', {
        click_query: input.value.trim(),
        section: titleEl ? titleEl.textContent : ''
      });
    });

    window._aiSearchOverlay = overlay;
  }

  function openSearch() {
    ensureOverlay();
    window._aiSearchOverlay.classList.add('open');
    setTimeout(function () {
      window._aiSearchOverlay.querySelector('input').focus();
    }, 50);
    sendGoal('smart_search_open');
  }

  // === Кнопка в панели управления ===
  function makeButton() {
    var isEn = window.location.pathname.indexOf('/en/') !== -1;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'g-button g-button_view_flat-secondary g-button_size_m g-button_pin_round-round dc-control dc-controls__control ai-search-btn';
    b.setAttribute('data-tooltip', isEn ? 'Smart search' : 'Умный поиск');
    b.setAttribute('aria-label', isEn ? 'Smart search' : 'Умный поиск');
    b.innerHTML =
      '<span class="g-button__icon"><span class="g-button__icon-inner">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="11" cy="11" r="7"></circle>' +
      '<path d="m21 21-4.3-4.3"></path>' +
      '</svg></span></span>';
    b.addEventListener('click', openSearch);
    return b;
  }

  function ensureButton() {
    var host = document.querySelector('.dc-controls');
    if (!host) return;
    var btn = host.querySelector('.ai-search-btn');
    if (!btn) {
      btn = makeButton();
      host.appendChild(btn);
    }
    var vertical = window.getComputedStyle(host).flexDirection === 'column';
    btn.classList.toggle('ai-search-vertical', vertical);
  }

  // Наблюдатель за панелью; переподключается, если панель пересоздаётся
  var currentPanel = null;
  var observer = null;

  function attachObserver() {
    var panel = document.querySelector('.dc-controls');
    if (panel && panel !== currentPanel) {
      currentPanel = panel;
      if (observer) observer.disconnect();
      observer = new MutationObserver(function () {
        ensureButton();
      });
      observer.observe(panel, { childList: true, subtree: true });
    }
    ensureButton();
  }

  attachObserver();
  window.addEventListener('resize', ensureButton);

  // Ловим момент появления панели в DOM – вставляем кнопку мгновенно
  var bootObserver = new MutationObserver(function () {
    attachObserver();
  });
  bootObserver.observe(document.documentElement, { childList: true, subtree: true });

  // Страховка: раз в секунду проверяем, что кнопка на месте
  setInterval(attachObserver, 1000);
})();



// ===== Название вкладки = название раздела (с учётом главной страницы) =====
(function () {
  function clean(s) {
    return (s || '').replace(/\s+/g, ' ').trim();
  }

  // Главная ли это страница?
  function isHomePage() {
    var p = window.location.pathname.replace(/\/+$/, '');
    return p === '' || p === '/ru' || p === '/en' || /\/index\.html?$/.test(p);
  }

  function nameFromDOM() {
    try {
      // 1. Главная страница – фиксированное название
      if (isHomePage()) return 'Инструкция пользователя QR-Passport';

      // 2. Внутренние страницы – последний пункт хлебных крошек
      var bc = document.querySelector('[class*="breadcrumbs"]');
      if (bc) {
        var nodes = bc.querySelectorAll('*');
        for (var i = nodes.length - 1; i >= 0; i--) {
          if (nodes[i].children.length) continue; // только листовые элементы
          var t = clean(nodes[i].textContent);
          if (t && t !== '/' && t.length < 100) return t;
        }
      }

      // 3. Запасной вариант – заголовок страницы
      var h1 = document.querySelector('h1');
      return h1 ? clean(h1.textContent) : null;
    } catch (e) {
      return null;
    }
  }

  var wanted = null;
  var domObs = null;

  function trySet() {
    var name = nameFromDOM();
    if (!name) return;
    wanted = name;
    if (document.title !== name) document.title = name;
    if (domObs) { domObs.disconnect(); domObs = null; }
  }

  try {
    if (typeof MutationObserver !== 'undefined') {
      domObs = new MutationObserver(trySet);
      domObs.observe(document.documentElement, { childList: true, subtree: true });
    }
  } catch (e) { /* молча */ }
  trySet();
  document.addEventListener('DOMContentLoaded', trySet);
  window.addEventListener('load', trySet);

  // Защита: если чужой скрипт перезапишет title – возвращаем наш
  function watchTitle() {
    try {
      var tag = document.querySelector('title');
      if (!tag || typeof MutationObserver === 'undefined') return;
      new MutationObserver(function () {
        if (wanted && document.title !== wanted) document.title = wanted;
      }).observe(tag, { childList: true, characterData: true, subtree: true });
    } catch (e) { /* молча */ }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchTitle);
  } else {
    watchTitle();
  }
})();