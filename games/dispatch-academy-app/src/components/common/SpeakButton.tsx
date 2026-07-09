import { useState } from 'react';
import { speak, isSpeechSupported } from '../../logic/speech';

interface SpeakButtonProps {
  text: string;
  /** Visual size of the button in px. */
  size?: number;
  className?: string;
}

/**
 * Small round button that pronounces English text via the Web Speech API.
 * Renders nothing when speech synthesis is unavailable. Stops click
 * propagation so it can sit on top of clickable cards without triggering them.
 */
export default function SpeakButton({ text, size = 36, className = '' }: SpeakButtonProps) {
  const [active, setActive] = useState(false);

  if (!isSpeechSupported()) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(text);
    setActive(true);
    window.setTimeout(() => setActive(false), 700);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Произнести: ${text}`}
      title="Произношение"
      className={`flex items-center justify-center rounded-full border transition-all active:scale-90 ${
        active
          ? 'bg-cyan-500/25 border-cyan-400/60 text-cyan-200'
          : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10 hover:text-cyan-300'
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: size * 0.5 }}>🔊</span>
    </button>
  );
}
