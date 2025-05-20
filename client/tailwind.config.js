const { text } = require('stream/consumers');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        foreground: '#0c4a6e',
        background: '#f0f9ff',
        primary: '#A3C49A',
        accent: '#F4A259',
        beige: '#F7F6E7',
        brown: '#7C5E3C',
        gray: '#E5E5E5',
      },
      fontFamily: {
        sans: ['Inter', 'Nunito', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}; 