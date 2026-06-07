/* ============================================
   TACTILE FEEDBACK SYSTEM
   Adds visual and haptic effects on click/interaction
   ============================================ */

(function() {
    'use strict';

    // === SELECTOR CONSTANTS ===
    const CLICK_SELECTORS = [
        'button',
        '.btn',
        '[role="button"]',
        '.clickable',
        '.truck-card',
        '[onclick*="assignLoad"]',
        '[onclick*="selectLoad"]',
        '[onclick*="viewTruck"]',
        'a[href]',
        '.tab',
        '[role="tab"]'
    ].join(', ');

    const HAPTIC_SELECTORS = [
        'button',
        '.btn',
        '[role="button"]',
        '.truck-card',
        '[onclick*="assignLoad"]',
        '[onclick*="selectLoad"]'
    ].join(', ');

    // === INITIALIZATION ON PAGE LOAD ===
    document.addEventListener('DOMContentLoaded', initInteractiveFeedback);

    function initInteractiveFeedback() {
        // Use global event delegation instead of attaching listeners to every element.
        // This optimizes performance (O(1) instead of O(N)) and automatically supports dynamic elements.
        setupDelegatedFeedback();
        
        // Add visual loading indicator (already uses delegation)
        addLoadingIndicator();
    }

    // === GLOBAL EVENT DELEGATION ===
    function setupDelegatedFeedback() {
        // Visual feedback (.clicking class)
        document.addEventListener('mousedown', handlePress);
        document.addEventListener('mouseup', handleRelease);
        document.addEventListener('touchstart', handlePress, { passive: true });
        document.addEventListener('touchend', handleRelease);
        document.addEventListener('mouseout', handleExit);

        // Haptic feedback for mobile
        document.addEventListener('click', handleHaptic, { passive: true });
    }

    function handlePress(e) {
        const target = e.target.closest(CLICK_SELECTORS);
        if (!target || target.disabled || target.hasAttribute('disabled')) return;
        target.classList.add('clicking');
    }

    function handleRelease(e) {
        const target = e.target.closest(CLICK_SELECTORS);
        if (!target) return;

        setTimeout(() => {
            target.classList.remove('clicking');
        }, 300);
    }

    function handleExit(e) {
        // Check if we actually left the element (relatedTarget is not a descendant)
        const target = e.target.closest(CLICK_SELECTORS);
        if (!target) return;

        if (!e.relatedTarget || !target.contains(e.relatedTarget)) {
            target.classList.remove('clicking');
        }
    }

    function handleHaptic(e) {
        if (!('vibrate' in navigator)) return;

        const target = e.target.closest(HAPTIC_SELECTORS);
        if (!target || target.disabled || target.hasAttribute('disabled')) return;

        // Noticeable vibration (20ms)
        navigator.vibrate(20);
    }

    // Legacy functions kept for backward compatibility (no-op)
    function addClickFeedback() {}
    function addHapticFeedback() {}

    // === LOADING INDICATOR FOR BUTTONS ===
    function addLoadingIndicator() {
        // Intercept clicks on buttons with onclick or target actions
        document.addEventListener('click', function(e) {
            const button = e.target.closest('button, .btn, [role="button"]');
            
            if (!button || button.disabled) return;

            // Check if there's an action (onclick, href, or within a form)
            const hasAction = button.hasAttribute('onclick') || 
                            button.getAttribute('href') ||
                            button.closest('form');

            if (hasAction) {
                showButtonLoading(button);
            }
        }, true);
    }

    function showButtonLoading(button) {
        // Save original content and width
        const originalContent = button.innerHTML;
        const originalWidth = button.offsetWidth;

        // Add loading class and styles
        button.classList.add('btn-loading');
        button.style.minWidth = originalWidth + 'px';
        button.disabled = true;

        // Show spinner
        button.innerHTML = `
            <span style="display: inline-flex; align-items: center; gap: 8px;">
                <svg style="animation: spin 0.8s linear infinite; width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                </svg>
                <span style="opacity: 0.7;">Loading...</span>
            </span>
        `;

        // Restore after 2 seconds (if page didn't redirect)
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.disabled = false;
            button.classList.remove('btn-loading');
            button.style.minWidth = '';
        }, 2000);
    }

    // === ADD CSS ANIMATIONS ===
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        .clicking {
            animation: pulse-click 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .btn-loading {
            pointer-events: none;
            opacity: 0.8;
        }

        /* Improved feedback for cards */
        .truck-card.clicking,
        [class*="truck-card"].clicking {
            transform: scale(0.97) !important;
            box-shadow: 0 4px 12px rgba(6, 182, 212, 0.25) !important;
            filter: brightness(0.95) !important;
        }

        /* Improved feedback for buttons */
        button.clicking,
        .btn.clicking {
            transform: scale(0.94) translateY(2px) !important;
            filter: brightness(0.9) !important;
        }

        /* Overflow for ripple effect - ignore carousel indicators */
        button:not(.carousel-indicator),
        .btn,
        [role="button"],
        .clickable {
            overflow: hidden;
            position: relative;
        }
    `;
    document.head.appendChild(style);

    // MutationObserver is no longer needed as event delegation
    // automatically handles new elements added to the DOM.

    // === EXPORT FOR EXTERNAL USE ===
    window.InteractiveFeedback = {
        showButtonLoading: showButtonLoading,
        reinit: function() { /* No-op: delegation handles dynamic elements automatically */ }
    };

})();
