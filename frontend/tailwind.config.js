/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand:  '#534AB7',
        teal:   '#1D9E75',
        coral:  '#D85A30',
        amber:  '#BA7517',
        green:  '#639922',
        pink:   '#D4537E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
