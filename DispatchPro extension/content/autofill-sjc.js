// Saint John Factoring — auto-login + broker credit check
(function () {
  const path = location.pathname.toLowerCase();

  // --- Result banner ---
  function showBanner(msg) {
    const approved = /approved/i.test(msg) && !/not approved|decline/i.test(msg);
    const banner = document.createElement('div');
    banner.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:999999',
      'padding:18px 24px', 'font-size:22px', 'font-weight:700',
      'text-align:center', 'font-family:sans-serif', 'cursor:pointer',
      approved
        ? 'background:#16a34a;color:#fff'
        : 'background:#dc2626;color:#fff'
    ].join(';');
    banner.textContent = approved ? '✅ APPROVED' : '❌ NOT APPROVED';
    banner.title = msg;
    banner.onclick = () => banner.remove();
    document.body.appendChild(banner);
    // Also close after 8s
    setTimeout(() => banner.remove(), 8000);
  }

  // --- Credit Check page (/Client_Home/Index) ---
  function runCreditCheck(mc) {
    // Intercept alert BEFORE clicking Next so we catch the response
    const origAlert = window.alert;
    window.alert = function (msg) {
      showBanner(msg);
      window.alert = origAlert; // restore
    };

    // Select "Broker" (first radio)
    const radios = document.querySelectorAll('input[type="radio"]');
    const brokerRadio = [...radios].find(r =>
      /broker/i.test(r.value) || /broker/i.test(r.nextSibling?.textContent || '')
    ) || radios[0];
    if (brokerRadio) { brokerRadio.checked = true; brokerRadio.click(); }

    // Select "MC" in the type dropdown
    const sel = document.querySelector('select');
    if (sel) {
      sel.value = 'MC';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Fill MC number
    const mcInput = document.querySelector('input[type="text"], input[type="number"]');
    if (mcInput) {
      mcInput.value = mc;
      mcInput.dispatchEvent(new Event('input',  { bubbles: true }));
      mcInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Click Next
    const nextBtn = [...document.querySelectorAll('a, button, input[type="button"], input[type="submit"]')]
      .find(el => /next/i.test(el.textContent || el.value || ''));
    if (nextBtn) nextBtn.click();
  }

  // --- Login page ---
  function doLogin(creds) {
    const userField = document.querySelector(
      'input[type="email"], input[name="UserName"], input[name="Email"], input[id*="user" i], input[id*="email" i]'
    );
    const passField = document.querySelector('input[type="password"]');
    if (!userField || !passField) return false;

    const set = (el, val) => {
      const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      s.call(el, val);
      el.dispatchEvent(new Event('input',  { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };
    set(userField, creds.user);
    set(passField, creds.pass);

    const btn = document.querySelector('button[type="submit"], input[type="submit"]');
    if (btn) btn.click();
    return true;
  }

  chrome.storage.local.get(['factorCreds', 'factorCheckMc'], ({ factorCreds, factorCheckMc }) => {
    const creds = factorCreds?.sjc;
    const mc    = factorCheckMc;

    // Credit check page — fill MC and check
    if (/client_home|dashboard/i.test(path)) {
      if (!mc) return;
      const tryFill = () => {
        const sel = document.querySelector('select');
        if (sel) { runCreditCheck(mc); return true; }
        return false;
      };
      if (!tryFill()) {
        const obs = new MutationObserver(() => { if (tryFill()) obs.disconnect(); });
        obs.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => obs.disconnect(), 10000);
      }
      return;
    }

    // Login page — auto-fill credentials
    if (!creds?.user) return;
    const tryLogin = () => doLogin(creds);
    if (!tryLogin()) {
      const obs = new MutationObserver(() => { if (tryLogin()) obs.disconnect(); });
      obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => obs.disconnect(), 10000);
    }
  });
})();
