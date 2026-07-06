// widget/tailwind.config.js
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
        primary: '#F97316',
        background: '#ffffff',
        foreground: '#0a0a0a',
      },
    },
  },
  plugins: [],
}