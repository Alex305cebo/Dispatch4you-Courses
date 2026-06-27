import { useState, useEffect, useMemo } from 'react';
import { loadFlashcards } from '../services/content-loader';
import { filterGlossary, getCategories, ALL_CATEGORIES } from '../logic/glossary-filter';
import SpeakButton from '../components/common/SpeakButton';
import type { Flashcard } from '../types/index';

type LoadState = 'loading' | 'error' | 'ready';

/**
 * Searchable glossary of all dispatch terms. Reuses the flashcards dataset and
 * the speech wrapper so learners can look up and hear any term on demand.
 */
export default function GlossaryPage() {
  const [state, setState] = useState<LoadState>('loading');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);

  useEffect(() => {
    let alive = true;
    loadFlashcards()
      .then((data) => {
        if (!alive) return;
        setCards(data);
        setState('ready');
      })
      .catch(() => alive && setState('error'));
    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(() => getCategories(cards), [cards]);
  const filtered = useMemo(
    () => filterGlossary(cards, query, category),
    [cards, query, category]
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      <div className="flex items-baseline justify-between mb-3">
        <h1 className="text-xl font-bold text-white">📖 Словарь терминов</h1>
        <span className="text-[11px] text-slate-400">{filtered.length} / {cards.length}</span>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔎</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск термина или определения…"
          aria-label="Поиск по словарю"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[14px] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <CategoryChip
          label="Все"
          active={category === ALL_CATEGORIES}
          onClick={() => setCategory(ALL_CATEGORIES)}
        />
        {categories.map((c) => (
          <CategoryChip
            key={c}
            label={c}
            active={category === c}
            onClick={() => setCategory(c)}
          />
        ))}
      </div>

      {/* States */}
      {state === 'loading' && (
        <p className="text-center text-slate-400 text-sm py-10">Загрузка словаря…</p>
      )}
      {state === 'error' && (
        <p className="text-center text-red-400 text-sm py-10">Не удалось загрузить словарь.</p>
      )}

      {state === 'ready' && filtered.length === 0 && (
        <p className="text-center text-slate-400 text-sm py-10">Ничего не найдено.</p>
      )}

      {/* Term list */}
      {state === 'ready' && filtered.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {filtered.map((c) => (
            <li
              key={c.id}
              className="rounded-2xl p-3.5 bg-white/[0.04] border border-white/10"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <h2 className="text-[16px] font-bold text-white">{c.term}</h2>
                <SpeakButton text={c.term} size={30} />
                <span className="ml-auto text-[10px] font-medium text-cyan-300/80 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  {c.category}
                </span>
              </div>
              <p className="text-[13px] text-slate-300 leading-relaxed">{c.definition}</p>
              {c.example && (
                <div className="mt-2 flex items-start gap-1.5">
                  <SpeakButton text={c.example} size={24} className="mt-0.5 shrink-0" />
                  <p className="text-[12px] text-cyan-200/70 italic leading-relaxed">"{c.example}"</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-[12px] font-semibold border transition-all ${
        active
          ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
          : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
      }`}
    >
      {label}
    </button>
  );
}
