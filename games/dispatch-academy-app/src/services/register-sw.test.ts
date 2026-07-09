import { describe, it, expect, vi } from 'vitest';
import { registerServiceWorker } from './register-sw';

describe('registerServiceWorker', () => {
  it('is a no-op in non-production (test) environment', () => {
    const register = vi.fn();
    // Provide a fake SW API to prove it is NOT called outside production.
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register },
      configurable: true,
    });

    expect(() => registerServiceWorker()).not.toThrow();

    // Even if 'load' had already fired, registration must not happen in dev/test.
    window.dispatchEvent(new Event('load'));
    expect(register).not.toHaveBeenCalled();

    delete (navigator as any).serviceWorker;
  });
});
