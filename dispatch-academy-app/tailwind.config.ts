import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'sm': '320px',
      'md': '768px',
      'lg': '1024px',
    },
    extend: {
      colors: {
        primary: '#06b6d4',
        'primary-dark': '#0891b2',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateX(-50%) translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(6, 182, 212, 0.4), 0 0 20px rgba(6, 182, 212, 0.2)' },
          '50%': { boxShadow: '0 0 16px rgba(6, 182, 212, 0.6), 0 0 40px rgba(6, 182, 212, 0.3)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'sparkle': {
          '0%, 100%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1) rotate(180deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
