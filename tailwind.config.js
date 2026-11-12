/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        albion: {
          dark: '#0e1117',
          card: '#161b22',
          border: '#30363d',
          gold: '#f59e0b',
          silver: '#94a3b8',
          accent: '#3b82f6',
          green: '#10b981',
          red: '#ef4444',
          tier4: '#3b82f6',
          tier5: '#ef4444',
          tier6: '#f97316',
          tier7: '#eab308',
          tier8: '#e2e8f0',
        }
      }
    },
  },
  plugins: [],
}
