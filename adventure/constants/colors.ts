// Apple-style design system — premium dark UI
export const Colors = {
  // Backgrounds — layered depth
  bg: '#000000',           // pure black base (like iOS dark mode)
  bgCard: '#1c1c1e',       // iOS card background
  bgCardHover: '#2c2c2e',  // iOS elevated card
  bgSheet: '#1c1c1e',      // bottom sheet
  bgOverlay: 'rgba(0,0,0,0.6)',

  // Borders — subtle glass
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.14)',
  borderStrong: 'rgba(255,255,255,0.22)',

  // Primary — iOS blue
  primary: '#0a84ff',
  primaryDark: '#0071e3',
  primaryGlow: 'rgba(10,132,255,0.25)',

  // Semantic colors — iOS palette
  success: '#30d158',      // iOS green
  successDark: '#25a244',
  successGlow: 'rgba(48,209,88,0.2)',

  danger: '#ff453a',       // iOS red
  dangerDark: '#d93025',
  dangerGlow: 'rgba(255,69,58,0.2)',

  warning: '#ffd60a',      // iOS yellow
  warningDark: '#f5a623',
  warningGlow: 'rgba(255,214,10,0.2)',

  purple: '#bf5af2',       // iOS purple
  purpleGlow: 'rgba(191,90,242,0.2)',

  teal: '#5ac8fa',         // iOS teal
  orange: '#ff9f0a',       // iOS orange
  pink: '#ff375f',         // iOS pink

  // Text — iOS hierarchy
  text: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.85)',
  textMuted: 'rgba(255,255,255,0.55)',
  textDim: 'rgba(255,255,255,0.3)',
  textDisabled: 'rgba(255,255,255,0.18)',

  // Special
  xp: '#ffd60a',
  road: '#1c1c1e',
  roadLine: '#2c2c2e',

  // Gradients (as string pairs for LinearGradient)
  gradPrimary: ['#0a84ff', '#0071e3'] as [string, string],
  gradSuccess: ['#30d158', '#25a244'] as [string, string],
  gradDanger: ['#ff453a', '#d93025'] as [string, string],
  gradWarning: ['#ffd60a', '#f5a623'] as [string, string],
  gradPurple: ['#bf5af2', '#9b59b6'] as [string, string],
  gradDark: ['#1c1c1e', '#000000'] as [string, string],
  gradCard: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)'] as [string, string],
};
