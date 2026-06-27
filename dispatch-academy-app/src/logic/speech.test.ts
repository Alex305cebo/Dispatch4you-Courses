import { describe, it, expect, vi, afterEach } from 'vitest';
import { speak, isSpeechSupported } from './speech';

afterEach(() => {
  // Clean up any mocks placed on window between tests.
  delete (window as any).speechSynthesis;
  delete (globalThis as any).SpeechSynthesisUtterance;
  vi.restoreAllMocks();
});

describe('isSpeechSupported', () => {
  it('is false when speechSynthesis is absent', () => {
    expect(isSpeechSupported()).toBe(false);
  });

  it('is true when speechSynthesis is present', () => {
    (window as any).speechSynthesis = { speak: vi.fn(), cancel: vi.fn(), getVoices: () => [] };
    expect(isSpeechSupported()).toBe(true);
  });
});

describe('speak', () => {
  it('no-ops without throwing when unsupported', () => {
    expect(() => speak('Deadhead')).not.toThrow();
  });

  it('cancels then speaks an utterance when supported', () => {
    const speakSpy = vi.fn();
    const cancelSpy = vi.fn();
    (window as any).speechSynthesis = {
      speak: speakSpy,
      cancel: cancelSpy,
      getVoices: () => [{ lang: 'en-US' }],
    };
    (globalThis as any).SpeechSynthesisUtterance = class {
      text: string;
      lang = '';
      rate = 1;
      voice: unknown = null;
      constructor(t: string) {
        this.text = t;
      }
    };

    speak('Deadhead');

    expect(cancelSpy).toHaveBeenCalledOnce();
    expect(speakSpy).toHaveBeenCalledOnce();
    const utterance = speakSpy.mock.calls[0]![0];
    expect(utterance.text).toBe('Deadhead');
    expect(utterance.lang).toBe('en-US');
  });

  it('ignores empty text', () => {
    const speakSpy = vi.fn();
    (window as any).speechSynthesis = { speak: speakSpy, cancel: vi.fn(), getVoices: () => [] };
    (globalThis as any).SpeechSynthesisUtterance = class {
      constructor(public text: string) {}
    };
    speak('   ');
    expect(speakSpy).not.toHaveBeenCalled();
  });
});
