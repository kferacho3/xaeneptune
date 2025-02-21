/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000', // black
        secondary: '#013a63', // dark blue (Neptune-like)
        tertiary: '#ffffff', // white
      },
    },
  },
  plugins: [],
}
