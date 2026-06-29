// Auto-fill RTS Pro login form
(function () {
  function fill(creds) {
    // Try to find username and password fields (RTS Pro uses standard patterns)
    const userField = document.querySelector(
      'input[type="email"], input[name="email"], input[name="username"], input[name="user"], input[id*="email" i], input[id*="user" i]'
    );
    const passField = document.querySelector(
      'input[type="password"]'
    );

    if (!userField || !passField) return false;

    // React/Angular apps need native input value setter to trigger onChange
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeSetter.call(userField, creds.user);
    userField.dispatchEvent(new Event('input', { bubbles: true }));
    userField.dispatchEvent(new Event('change', { bubbles: true }));

    nativeSetter.call(passField, creds.pass);
    passField.dispatchEvent(new Event('input', { bubbles: true }));
    passField.dispatchEvent(new Event('change', { bubbles: true }));

    // Submit
    const submitBtn = document.querySelector(
      'button[type="submit"], input[type="submit"], button[id*="login" i], button[id*="sign" i]'
    );
    if (submitBtn) submitBtn.click();

    return true;
  }

  chrome.storage.local.get('factorCreds', ({ factorCreds }) => {
    const creds = factorCreds?.rts;
    if (!creds?.user) return;

    // Try immediately, then wait for SPA to render the form
    if (!fill(creds)) {
      const observer = new MutationObserver(() => {
        if (fill(creds)) observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      // Stop trying after 10s
      setTimeout(() => observer.disconnect(), 10000);
    }
  });
})();
