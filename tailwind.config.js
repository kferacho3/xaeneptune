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
        primary: "#000000",
        secondary: "#013a63",
        tertiary: "#ffffff",

        /* accent used in component – Spotify green */
        brand: "#1db954",
      },
    },
  },
  plugins: [],
};
