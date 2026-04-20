// ═══════════════════════════════════════════════════════════
// THEMES — Light & Dark color palettes
// ═══════════════════════════════════════════════════════════

export type ThemeColors = {
  // Backgrounds
  bg: string;
  bgCard: string;
  bgCardHover: string;
  bgSheet: string;
  bgOverlay: string;

  // Borders
  border: string;
  borderLight: string;
  borderStrong: string;

  // Primary
  primary: string;
  primaryDark: string;
  primaryGlow: string;

  // Semantic
  success: string;
  successDark: string;
  successGlow: string;
  danger: string;
  dangerDark: string;
  dangerGlow: string;
  warning: string;
  warningDark: string;
  warningGlow: string;
  purple: string;
  purpleGlow: string;
  teal: string;
  orange: string;
  pink: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textDim: string;
  textDisabled: string;

  // Special
  xp: string;
  road: string;
  roadLine: string;

  // Gradients
  gradPrimary: [string, string];
  gradSuccess: [string, string];
  gradDanger: [string, string];
  gradWarning: [string, string];
  gradPurple: [string, string];
  gradDark: [string, string];
  gradCard: [string, string];

  // Map
  mapBg: string;
  mapState: string;
  mapStateBorder: string;
  mapStateLabel: string;

  // TopBar
  topBarBg: string;
  topBarBorder: string;

  // BottomNav
  navBg: string;
  navBorder: string;
  navActiveBtn: string;
  navActiveTxt: string;
  navInactiveBtn: string;

  // Panels
  panelBg: string;
  panelBorder: string;

  // Modal
  modalBg: string;
  modalBorder: string;
};

export const darkTheme: ThemeColors = {
  bg: '#000000',
  bgCard: '#1c1c1e',
  bgCardHover: '#2c2c2e',
  bgSheet: '#1c1c1e',
  bgOverlay: 'rgba(0,0,0,0.6)',

  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.14)',
  borderStrong: 'rgba(255,255,255,0.22)',

  primary: '#0a84ff',
  primaryDark: '#0071e3',
  primaryGlow: 'rgba(10,132,255,0.25)',

  success: '#30d158',
  successDark: '#25a244',
  successGlow: 'rgba(48,209,88,0.2)',
  danger: '#ff453a',
  dangerDark: '#d93025',
  dangerGlow: 'rgba(255,69,58,0.2)',
  warning: '#ffd60a',
  warningDark: '#f5a623',
  warningGlow: 'rgba(255,214,10,0.2)',
  purple: '#bf5af2',
  purpleGlow: 'rgba(191,90,242,0.2)',
  teal: '#5ac8fa',
  orange: '#ff9f0a',
  pink: '#ff375f',

  text: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.85)',
  textMuted: 'rgba(255,255,255,0.55)',
  textDim: 'rgba(255,255,255,0.3)',
  textDisabled: 'rgba(255,255,255,0.18)',

  xp: '#ffd60a',
  road: '#1c1c1e',
  roadLine: '#2c2c2e',

  gradPrimary: ['#0a84ff', '#0071e3'],
  gradSuccess: ['#30d158', '#25a244'],
  gradDanger: ['#ff453a', '#d93025'],
  gradWarning: ['#ffd60a', '#f5a623'],
  gradPurple: ['#bf5af2', '#9b59b6'],
  gradDark: ['#1c1c1e', '#000000'],
  gradCard: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)'],

  mapBg: '#0f172a',
  mapState: '#334155',
  mapStateBorder: '#64748b',
  mapStateLabel: '#e2e8f0',

  topBarBg: 'linear-gradient(180deg, rgba(15,25,50,0.98) 0%, rgba(10,18,38,0.98) 100%)',
  topBarBorder: 'rgba(56,189,248,0.12)',

  navBg: '#111118',
  navBorder: 'rgba(255,255,255,0.07)',
  navActiveBtn: '#ffffff',
  navActiveTxt: '#0f172a',
  navInactiveBtn: 'rgba(255,255,255,0.07)',

  panelBg: '#111118',
  panelBorder: 'rgba(255,255,255,0.07)',

  modalBg: '#0f172a',
  modalBorder: 'rgba(255,255,255,0.1)',
};

export const lightTheme: ThemeColors = {
  bg: '#f2f2f7',
  bgCard: '#ffffff',
  bgCardHover: '#f9fafb',
  bgSheet: '#ffffff',
  bgOverlay: 'rgba(0,0,0,0.35)',

  border: 'rgba(0,0,0,0.08)',
  borderLight: 'rgba(0,0,0,0.06)',
  borderStrong: 'rgba(0,0,0,0.14)',

  primary: '#007aff',
  primaryDark: '#0062cc',
  primaryGlow: 'rgba(0,122,255,0.18)',

  success: '#34c759',
  successDark: '#28a745',
  successGlow: 'rgba(52,199,89,0.18)',
  danger: '#ff3b30',
  dangerDark: '#d93025',
  dangerGlow: 'rgba(255,59,48,0.18)',
  warning: '#ff9500',
  warningDark: '#e08600',
  warningGlow: 'rgba(255,149,0,0.18)',
  purple: '#af52de',
  purpleGlow: 'rgba(175,82,222,0.18)',
  teal: '#32ade6',
  orange: '#ff9500',
  pink: '#ff2d55',

  text: '#000000',
  textSecondary: '#3c3c43',
  textMuted: '#6c6c70',
  textDim: '#aeaeb2',
  textDisabled: '#c7c7cc',

  xp: '#ff9500',
  road: '#e5e5ea',
  roadLine: '#d1d1d6',

  gradPrimary: ['#007aff', '#0062cc'],
  gradSuccess: ['#34c759', '#28a745'],
  gradDanger: ['#ff3b30', '#d93025'],
  gradWarning: ['#ff9500', '#e08600'],
  gradPurple: ['#af52de', '#9b59b6'],
  gradDark: ['#f2f2f7', '#e5e5ea'],
  gradCard: ['rgba(0,0,0,0.03)', 'rgba(0,0,0,0.01)'],

  mapBg: '#b8ccd8',
  mapState: '#8fafc4',
  mapStateBorder: '#6b8fa8',
  mapStateLabel: '#475569',

  topBarBg: '#ffffff',
  topBarBorder: 'rgba(0,0,0,0.08)',

  navBg: '#ffffff',
  navBorder: 'rgba(0,0,0,0.08)',
  navActiveBtn: '#007aff',
  navActiveTxt: '#ffffff',
  navInactiveBtn: '#f3f4f6',

  panelBg: '#ffffff',
  panelBorder: 'rgba(0,0,0,0.08)',

  modalBg: '#ffffff',
  modalBorder: 'rgba(0,0,0,0.08)',
};
