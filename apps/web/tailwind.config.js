/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: { 900: '#0a0e17', 800: '#111827', 700: '#1a2236', 600: '#243056', 500: '#3b4a7a', 400: '#5b73b5', 300: '#7b93d4', 200: '#a3b8e0', 100: '#c8d6ed' },
        threat: { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#6b7280' },
      },
    },
  },
  plugins: [],
};
