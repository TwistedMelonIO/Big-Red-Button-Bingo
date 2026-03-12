/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brb': {
          bg: '#0a0304',
          surface: '#140708',
          card: '#1c0c0e',
          border: '#3a1520',
          'border-bright': '#5c2233',
          red: '#dc2626',
          'red-glow': '#ef4444',
          'red-dark': '#7f1d1d',
          'red-deep': '#450a0a',
          'red-hot': '#ff3333',
          gold: '#f59e0b',
          'gold-dim': '#92400e',
          text: '#fce4ec',
          'text-dim': '#c9878f',
          'text-muted': '#6b3a44',
          green: '#34d399',
          'green-dim': '#065f46',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'flash-in': 'flash-in 0.5s ease-out',
        'ember': 'ember 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(220, 38, 38, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(220, 38, 38, 0.7)' },
        },
        'flash-in': {
          '0%': { transform: 'scale(1.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
        'ember': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
