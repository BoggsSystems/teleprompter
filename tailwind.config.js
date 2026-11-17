/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pro: {
          dark: '#0a0a0a',
          pitch: '#000000',
          charcoal: '#121212',
          surface: '#1c1c1e',
          border: '#2c2c2e',
          amber: '#f59e0b',
          amberText: '#fbbf24',
          yellowText: '#fde047',
          dim: '#8e8e93',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
