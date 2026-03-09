/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brb': {
          bg: '#0a0a0f',
          surface: '#12121a',
          card: '#1a1a26',
          border: '#2a2a3a',
          'border-bright': '#3a3a50',
          red: '#e63946',
          'red-glow': '#ff1a2d',
          'red-dark': '#991f28',
          gold: '#f4a825',
          'gold-dim': '#a37218',
          text: '#e8e8ef',
          'text-dim': '#7a7a8f',
          'text-muted': '#4a4a5f',
          green: '#22c55e',
          'green-dim': '#166534',
        },
      },
      fontFamily: {
        display: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'flash-in': 'flash-in 0.5s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(230, 57, 70, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(230, 57, 70, 0.6)' },
        },
        'flash-in': {
          '0%': { transform: 'scale(1.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
