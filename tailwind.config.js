/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gaming: {
          bg: '#0a0a0f',
          surface: '#12121a',
          card: '#1a1a26',
          border: '#2a2a3a',
          cyan: '#00d4ff',
          teal: '#00b894',
          glow: '#00d4ff33',
        }
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(0, 212, 255, 0.3)',
        'cyan-glow-lg': '0 0 40px rgba(0, 212, 255, 0.4)',
      }
    },
  },
  plugins: [],
}
