/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // důležité pro přepínač
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
