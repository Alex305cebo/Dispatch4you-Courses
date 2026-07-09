/**
 * Thin wrapper around the Web Speech API (speechSynthesis) used to pronounce
 * English dispatch terms for Russian-speaking learners. No assets required —
 * the browser provides the voices. Safely no-ops where unsupported.
 */

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Speaks the given text aloud, preferring an English voice. */
export function speak(text: string, lang = 'en-US'): void {
  if (!isSpeechSupported() || !text.trim()) return;
  try {
    const synth = window.speechSynthesis;
    // Cancel anything currently playing so taps feel responsive.
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    const voices = synth.getVoices?.() ?? [];
    const enVoice = voices.find((v) => v.lang?.toLowerCase().startsWith('en'));
    if (enVoice) utterance.voice = enVoice;
    synth.speak(utterance);
  } catch {
    /* speechSynthesis unavailable or threw — ignore */
  }
}
