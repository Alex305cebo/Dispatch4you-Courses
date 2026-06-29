// Service worker
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    factorCreds: {
      rts: { user: 'jb@vscarrier.com',         pass: 'Truck1299'  },
      sjc: { user: 'dispatchdiam@abc.com',      pass: 'Kndh7j!n'  },
      otr: { user: '',                          pass: ''           }
    }
  });
});

console.log('[D4Y] background ready');
