/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        publicpixel: ['PublicPixel', 'sans-serif'],
      },
      colors: {
        dark: {
          background: '#1a202c',
          text: '#e2e8f0',
          card: '#2d3748',
          border: '#4a5568',
          primary: '#6366f1',
          secondary: '#a855f7',
        }
      }
    },
  },
  plugins: [],
}; 