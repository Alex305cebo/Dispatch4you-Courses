const DEFAULT_SETTINGS = { companyName: '', dispatcherName: '', companyPhone: '', mcNumber: '', minRpm: 2.0 };
const DEFAULT_TEMPLATE = `Subject: CHECKING YOUR LOAD - {{origin}} to {{dest}}

Hello,

Could you please provide more details for the following load?

Reference Number: {{ref_id}}
Origin: {{origin}}
Destination: {{dest}}
Truck Location: {{deadhead}}
Trip: {{miles}} mi
Rate: {{rate}}

Could you also confirm the commodity and the best available rate for this shipment?

Thank you`;

// Tabs
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab, .panel').forEach(el => el.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// Load saved values
chrome.storage.sync.get(['settings', 'template'], ({ settings = DEFAULT_SETTINGS, template = DEFAULT_TEMPLATE }) => {
  document.getElementById('companyName').value = settings.companyName || '';
  document.getElementById('dispatcherName').value = settings.dispatcherName || '';
  document.getElementById('companyPhone').value = settings.companyPhone || '';
  document.getElementById('mcNumber').value = settings.mcNumber || '';
  document.getElementById('minRpm').value = settings.minRpm ?? 2.0;
  document.getElementById('groqKey').value = settings.groqKey || '';
  document.getElementById('emailTemplate').value = template;
});

document.getElementById('saveSettings').addEventListener('click', () => {
  const settings = {
    companyName: document.getElementById('companyName').value,
    dispatcherName: document.getElementById('dispatcherName').value,
    companyPhone: document.getElementById('companyPhone').value,
    mcNumber: document.getElementById('mcNumber').value,
    minRpm: parseFloat(document.getElementById('minRpm').value) || 2.0,
    groqKey: document.getElementById('groqKey').value.trim()
  };
  chrome.storage.sync.set({ settings }, () => {
    document.getElementById('saveSettings').textContent = 'Saved ✓';
    setTimeout(() => { document.getElementById('saveSettings').textContent = 'Save Settings'; }, 1500);
  });
});

document.getElementById('saveTemplate').addEventListener('click', () => {
  const template = document.getElementById('emailTemplate').value;
  chrome.storage.sync.set({ template }, () => {
    document.getElementById('saveTemplate').textContent = 'Saved ✓';
    setTimeout(() => { document.getElementById('saveTemplate').textContent = 'Save Template'; }, 1500);
  });
});

// RPM Calc
['calcRate', 'calcMiles', 'calcFuel'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcRpm);
});

function calcRpm() {
  const rate = parseFloat(document.getElementById('calcRate').value) || 0;
  const miles = parseFloat(document.getElementById('calcMiles').value) || 0;
  const fuel = parseFloat(document.getElementById('calcFuel').value) || 0;
  const result = document.getElementById('calcResult');
  if (!rate || !miles) { result.textContent = '—'; result.style.color = '#94a3b8'; return; }
  const rpm = (rate - fuel) / miles;
  result.textContent = `$${rpm.toFixed(2)}/mi`;
  result.style.color = rpm >= 2 ? '#22c55e' : '#f97316';
}
