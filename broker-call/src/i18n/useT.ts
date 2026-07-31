import { create } from 'zustand'
import type { Lang } from '../types'
import { detectLang, saveLang, translator, type TranslationKey } from './index'

interface LangStore {
  lang: Lang
  setLang(lang: Lang): void
}

export const useLangStore = create<LangStore>((set) => ({
  lang: detectLang(),
  setLang(lang) {
    saveLang(lang)
    document.documentElement.lang = lang
    set({ lang })
  },
}))

/** Перевод по ключу. Язык интерфейса — разговор с брокером всегда английский. */
export function useT(): (key: TranslationKey) => string {
  const lang = useLangStore((s) => s.lang)
  return translator(lang)
}

/** Локализованное поле данных (заголовки сценариев). */
export function useLocalized(): (value: Record<Lang, string>) => string {
  const lang = useLangStore((s) => s.lang)
  return (value) => value[lang]
}
