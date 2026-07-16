/**
 * pay-call-modal.js — попап «Оформление через менеджера». Общий для
 * pricing.html и checkout.html (RU+EN): пока онлайн-оплата отключена,
 * это единственное, что должно всплывать при попытке оплатить.
 *
 * Номер телефона и Telegram — приватные контакты. Они НЕ лежат ни в одном
 * файле сайта (HTML/JS) — иначе их достанет любой скрейпер, даже не
 * выполняющий JS, независимо от того, спрятаны ли они визуально. Реальные
 * значения приходят из Firestore (config/paymentContacts) только после
 * входа через Google — чтение документа ограничено правилом безопасности
 * Firestore (request.auth != null), это проверяется на сервере Firebase,
 * а не в браузере. См. getPaymentContacts() в d4y-auth.js.
 */
(function () {
  'use strict';

  var LANG = (document.documentElement.lang || 'ru').slice(0, 2) === 'en' ? 'en' : 'ru';
  var STR = {
    ru: {
      call: 'Позвонить', tg: 'Telegram', loading: 'Загружаем контакты…',
      error: 'Не получилось загрузить контакты. Напишите нам на info@dispatch4you.com — ответим быстро.'
    },
    en: {
      call: 'Call', tg: 'Telegram', loading: 'Loading contacts…',
      error: "Couldn't load contacts. Email us at info@dispatch4you.com — we'll reply fast."
    }
  }[LANG];

  window.openPayCallModal = function (planLabel) {
    var modal = document.getElementById('payCallModal');
    if (!modal) return;
    var planEl = document.getElementById('payCallModalPlan');
    if (planEl) planEl.textContent = planLabel || '';
    // Пометку 'active' ставим ДО updatePayCallGate: она же служит признаком
    // «попап открыт», по которому гейт решает, тянуть ли контакты.
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    updatePayCallGate();
  };

  window.closePayCallModal = function () {
    var modal = document.getElementById('payCallModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  function renderMessage(container, text) {
    clear(container);
    var p = document.createElement('p');
    p.className = 'pay-call-modal-text';
    p.textContent = text;
    container.appendChild(p);
  }

  function renderContacts(container, data) {
    clear(container);
    (data.phones || []).forEach(function (ph) {
      var a = document.createElement('a');
      a.className = 'pay-call-modal-btn pay-call-modal-btn--call';
      a.href = 'tel:' + ph.tel;
      a.textContent = '📞 ' + STR.call + (ph.name ? ': ' + ph.name + ' ' : ' ') + (ph.display || ph.tel);
      container.appendChild(a);
    });
    if (data.telegramUrl) {
      var tg = document.createElement('a');
      tg.className = 'pay-call-modal-btn pay-call-modal-btn--tg';
      tg.href = data.telegramUrl;
      tg.target = '_blank';
      tg.rel = 'noopener';
      tg.textContent = '💬 ' + STR.tg + (data.telegram ? ': ' + data.telegram : '');
      container.appendChild(tg);
    }
  }

  var fetchToken = 0;   // защита от гонки: второй вызов отменяет результат первого

  function updatePayCallGate() {
    var gate = document.getElementById('payCallGate');
    var contacts = document.getElementById('payCallContacts');
    if (!gate || !contacts) return;

    // Контакты тянем только при открытом попапе. onUserChange ниже срабатывает
    // на КАЖДОЙ загрузке страницы у залогиненного, и без этой проверки мы
    // ходили в Firestore за приватными контактами, даже если попап никто не
    // открывал. Вход через кнопку внутри попапа не ломается: там он уже 'active'.
    var modal = document.getElementById('payCallModal');
    if (!modal || !modal.classList.contains('active')) return;

    var user = window.D4Y_AUTH && window.D4Y_AUTH.currentUser && window.D4Y_AUTH.currentUser();
    if (!user) {
      gate.style.display = 'block';
      contacts.style.display = 'none';
      clear(contacts);
      return;
    }

    gate.style.display = 'none';
    contacts.style.display = 'block';
    renderMessage(contacts, STR.loading);

    var myToken = ++fetchToken;
    if (!(window.D4Y_AUTH && window.D4Y_AUTH.getPaymentContacts)) return;
    window.D4Y_AUTH.getPaymentContacts().then(function (data) {
      if (myToken !== fetchToken) return;   // устарело — пришёл более новый вызов
      if (data) renderContacts(contacts, data);
      else renderMessage(contacts, STR.error);
    }).catch(function () {
      if (myToken !== fetchToken) return;
      renderMessage(contacts, STR.error);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') window.closePayCallModal();
  });

  // d4y-auth.js — ES-модуль, грузится асинхронно (firebase-auth-init.js его
  // импортирует) — window.D4Y_AUTH может появиться позже, чем этот скрипт.
  // Ждём и подписываемся: как только пользователь входит (в т.ч. через
  // кнопку прямо в попапе, без перезагрузки страницы), контакты подтянутся сами.
  var authWaitTries = 0;
  (function waitForAuth() {
    if (window.D4Y_AUTH && window.D4Y_AUTH.onUserChange) {
      window.D4Y_AUTH.onUserChange(updatePayCallGate);
    } else if (++authWaitTries < 100) {
      // Потолок ~10 секунд. Раньше опрос шёл бесконечно: если Firebase не
      // поднялся (блокировщик, обрыв сети), таймер тикал каждые 100 мс, пока
      // открыта вкладка. За 10 с авторизация либо появилась, либо уже не придёт —
      // попап тогда честно покажет гейт «войдите», а не будет молча жечь таймер.
      setTimeout(waitForAuth, 100);
    }
  })();
})();
