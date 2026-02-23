/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aquatic': {
          50: '#f0f9fb',
          100: '#d1eff7',
          200: '#a3dff1',
          300: '#75cfeb',
          400: '#47bfe5',
          500: '#1aafdf',
          600: '#1395c0',
          700: '#0d6b8f',
          800: '#084260',
          900: '#051830',
        },
        'status': {
          'safe': '#10b981',
          'warning': '#f59e0b',
          'danger': '#ef4444',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(239, 68, 68, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
