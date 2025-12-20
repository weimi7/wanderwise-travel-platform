// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enables class-based dark mode
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        inter: ['Inter', 'sans-serif'],
        merriweather: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
};
