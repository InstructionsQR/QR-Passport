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
  observer.observe(document.body, { childList: true, subtree: true });
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



// ===== TOC: remember expanded nested sections =====
(function () {
  var STORAGE_KEY = 'qrpassport.docs.toc.open.v1';
  var TOC = 'nav.dc-toc';
  var ITEM = 'li.dc-toc__list-item';
  var OPEN = 'dc-toc__list-item_opened';
  var applying = false;
  var syncTimer = null;
  var lastUrl = location.href;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function norm(s) {
    return (s || '').replace(/\s+/g, ' ').trim();
  }

  function hasChildren(li) {
    for (var i = 0; i < li.children.length; i++) {
      if (li.children[i].tagName === 'UL') {
        return li.children[i].children.length > 0;
      }
    }
    return false;
  }

  function control(li) {
    return (
      li.querySelector(':scope > .dc-toc-item__link .dc-toc-item__arrow') ||
      li.querySelector(':scope > .dc-toc-item__text-block[aria-expanded]') ||
      li.querySelector(':scope > .dc-toc-item__text-block')
    );
  }

  function isOpen(li) {
    var c = control(li);
    return (
      li.classList.contains(OPEN) ||
      (c && c.getAttribute('aria-expanded') === 'true')
    );
  }

  function label(li) {
    var el =
      li.querySelector(':scope > .dc-toc-item__text-block') ||
      li.querySelector(':scope > .dc-toc-item__link .dc-toc-item__wrapper .dc-toc-item__text') ||
      li.querySelector(':scope > .dc-toc-item__link') ||
      li.querySelector(':scope > *:first-child');
    return norm(el && el.textContent);
  }

  function key(li) {
    var parts = [];
    var cur = li;
    while (cur && cur.matches && cur.matches(ITEM)) {
      var name = label(cur);
      if (name) parts.unshift(name);
      cur = cur.parentElement ? cur.parentElement.closest(ITEM) : null;
    }
    return parts.join(' / ');
  }

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return [];
    }
  }

  function write(keys) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    } catch (e) {}
  }

  function collect() {
    var keys = [];
    Array.prototype.forEach.call(
      document.querySelectorAll(TOC + ' ' + ITEM),
      function (li) {
        if (hasChildren(li) && isOpen(li)) keys.push(key(li));
      }
    );
    return keys;
  }

  function syncSoon() {
    if (applying) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(function () {
      write(collect());
    }, 80);
  }

  function openIfNeeded(li) {
    if (!li || isOpen(li)) return;
    var c = control(li);
    if (!c) return;
    if (c.tagName === 'BUTTON' || c.classList.contains('dc-toc-item__arrow')) {
      c.click();
    }
  }

  function restore() {
    var toc = document.querySelector(TOC);
    if (!toc) return;

    var saved = read();
    if (!saved.length) {
      syncSoon();
      return;
    }

    var byKey = {};
    Array.prototype.forEach.call(toc.querySelectorAll(ITEM), function (li) {
      if (hasChildren(li)) byKey[key(li)] = li;
    });

    applying = true;
    saved.forEach(function (k) {
      openIfNeeded(byKey[k]);
    });

    setTimeout(function () {
      applying = false;
      write(collect());
    }, 250);
  }

  function urlChanged() {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    setTimeout(restore, 40);
  }

  function patchHistory() {
    ['pushState', 'replaceState'].forEach(function (type) {
      var orig = history[type];
      history[type] = function () {
        var ret = orig.apply(this, arguments);
        setTimeout(urlChanged, 0);
        return ret;
      };
    });
  }

  function start() {
    restore();
    patchHistory();
    window.addEventListener('popstate', urlChanged);

    document.addEventListener(
      'click',
      function (e) {
        var el = e.target;
        if (!el || !el.closest) return;

        if (el.closest(TOC)) {
          setTimeout(syncSoon, 80);
        }
        if (el.closest('a[href]')) {
          setTimeout(urlChanged, 80);
        }
      },
      true
    );

    window.addEventListener('beforeunload', function () {
      if (!applying) write(collect());
    });
  }

  ready(start);
})();