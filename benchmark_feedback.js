
const { JSDOM } = require('jsdom');

const code = `
    function addClickFeedback() {
        const selectors = [
            'button', '.btn', '[role="button"]', '.clickable', '.truck-card',
            '[onclick*="assignLoad"]', '[onclick*="selectLoad"]', '[onclick*="viewTruck"]',
            'a[href]', '.tab', '[role="tab"]'
        ];
        const elements = document.querySelectorAll(selectors.join(', '));
        elements.forEach(element => {
            if (element.disabled || element.hasAttribute('disabled')) return;
            element.addEventListener('mousedown', function(e) { this.classList.add('clicking'); });
            element.addEventListener('mouseup', function() { setTimeout(() => { this.classList.remove('clicking'); }, 300); });
            element.addEventListener('mouseleave', function() { this.classList.remove('clicking'); });
            element.addEventListener('touchstart', function(e) { this.classList.add('clicking'); }, { passive: true });
            element.addEventListener('touchend', function() { setTimeout(() => { this.classList.remove('clicking'); }, 300); });
        });
    }
`;

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

const container = document.getElementById('container');
const count = 1000;
for (let i = 0; i < count; i++) {
    const btn = document.createElement('button');
    btn.textContent = 'Button ' + i;
    container.appendChild(btn);
}

const evalInContext = (js) => {
    return new Function('document', 'window', js)(document, window);
};

console.log(`Benchmarking with ${count} elements...`);

const start = Date.now();
evalInContext(code + ' addClickFeedback();');
const end = Date.now();
console.log(`Initial call took: ${end - start}ms`);

const start2 = Date.now();
evalInContext(code + ' addClickFeedback();');
const end2 = Date.now();
console.log(`Second call (simulating MutationObserver) took: ${end2 - start2}ms`);
