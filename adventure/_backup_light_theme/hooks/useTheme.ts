// Convenience hook — use this in components instead of importing Colors directly
// Returns reactive theme colors that update when user switches theme
import { useThemeStore } from '../store/themeStore';

export function useTheme() {
  return useThemeStore(s => s.colors);
}

export function useThemeMode() {
  return useThemeStore(s => s.mode);
}
