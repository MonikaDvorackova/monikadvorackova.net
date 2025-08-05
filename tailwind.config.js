/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // dark režim aktivovaný přes <html class="dark">
  theme: {
    extend: {
      colors: {
        'text-light': '#1a1a1a',
        'text-dark': '#f5e9dd',
        'background': '#fd1e7',
        'background-light': '#f5e9dd',
        'background-dark': '#121212',
      },
      animation: {
        'slide-in': 'slideIn 1s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
};
