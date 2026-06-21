import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { AudioTermData } from '../../types/index';

interface AudioTermTaskProps {
  data: AudioTermData;
  onAnswer: (correct: boolean) => void;
}

export default function AudioTermTask({ data, onAnswer }: AudioTermTaskProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [audioFailed, setAudioFailed] = useState(!data.audioUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const maxPlays = 3;
  const correctIndex = data.options.indexOf(data.correctTerm);

  // Initialize audio element and handle errors
  useEffect(() => {
    if (!data.audioUrl) {
      setAudioFailed(true);
      return;
    }

    const audio = new Audio(data.audioUrl);

    const handleError = () => {
      setAudioFailed(true);
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audioRef.current = null;
    };
  }, [data.audioUrl]);

  const handlePlay = useCallback(() => {
    if (playCount >= maxPlays || isPlaying || !audioRef.current) return;
    setIsPlaying(true);
    setPlayCount((prev) => prev + 1);
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      setAudioFailed(true);
      setIsPlaying(false);
    });
  }, [playCount, isPlaying]);

  const handleSelect = useCallback(
    (index: number) => {
      if (answered) return;
      setSelectedIndex(index);
      setAnswered(true);
      onAnswer(index === correctIndex);
    },
    [answered, correctIndex, onAnswer]
  );

  const getOptionClasses = (index: number): string => {
    const base =
      'w-full min-h-[44px] px-4 py-3 rounded-xl text-left text-sm font-medium transition-all duration-200 border-2';

    if (!answered) {
      return `${base} bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-cyan-400/40 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900`;
    }

    if (index === correctIndex) {
      return `${base} bg-green-500/20 border-green-500 text-green-300`;
    }
    if (index === selectedIndex && index !== correctIndex) {
      return `${base} bg-red-500/20 border-red-500 text-red-300`;
    }
    return `${base} bg-white/5 border-white/10 text-slate-400 opacity-60`;
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-5">
      {/* Audio Player / Text Fallback */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-slate-300 text-sm text-center">
          {audioFailed
            ? 'Аудио недоступно. Определите термин:'
            : 'Прослушайте термин и выберите правильный ответ'}
        </p>

        {audioFailed ? (
          /* Fallback: show the English term as text (Requirement 6.13) */
          <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-center">
            <p className="text-white font-semibold text-xl">
              {data.correctTerm}
            </p>
          </div>
        ) : (
          /* Audio play button with replay counter */
          <div className="flex items-center gap-4">
            <motion.button
              type="button"
              aria-label="Воспроизвести аудио"
              disabled={playCount >= maxPlays || isPlaying}
              onClick={handlePlay}
              className={`min-w-[56px] min-h-[56px] flex items-center justify-center rounded-full text-3xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                playCount >= maxPlays
                  ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                  : isPlaying
                    ? 'bg-cyan-600/80 text-white cursor-wait animate-pulse'
                    : 'bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 text-white cursor-pointer'
              }`}
              whileTap={
                playCount < maxPlays && !isPlaying ? { scale: 0.92 } : undefined
              }
            >
              🔊
            </motion.button>
            <span className="text-slate-300 text-sm font-medium" aria-live="polite">
              {playCount}/{maxPlays}
            </span>
          </div>
        )}
      </div>

      {/* 4 Option buttons */}
      <div
        className="flex flex-col gap-3"
        role="group"
        aria-label="Варианты ответа"
      >
        {data.options.map((option, index) => (
          <motion.button
            key={index}
            type="button"
            aria-label={`Вариант ${index + 1}: ${option}`}
            aria-disabled={answered}
            disabled={answered}
            className={getOptionClasses(index)}
            onClick={() => handleSelect(index)}
            whileTap={!answered ? { scale: 0.98 } : undefined}
            animate={
              answered && index === selectedIndex && index !== correctIndex
                ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                : {}
            }
            transition={{ duration: 0.3 }}
          >
            {option}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
