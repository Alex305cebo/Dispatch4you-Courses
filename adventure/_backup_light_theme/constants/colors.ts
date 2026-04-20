// Re-export from themes for backward compatibility
// Components that import Colors directly get the current theme's colors
// For reactive updates, use useThemeStore(s => s.colors) instead

export { lightTheme as Colors } from './themes';
export type { ThemeColors } from './themes';
