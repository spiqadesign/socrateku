/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'noble': {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fad7ac',
          300: '#f6ba77',
          400: '#f2933d',
          500: '#ef7516',
          600: '#e05a0c',
          700: '#b9440c',
          800: '#943612',
          900: '#772e12',
        }
      }
    },
  },
  plugins: [],
} 