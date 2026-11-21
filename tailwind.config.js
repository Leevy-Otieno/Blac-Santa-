/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#FFF1F2",
          surface: "#FFFFFF",
          surfaceMuted: "#FFE4E6",
          text: "#4C0519",
          textMuted: "#9F1239",
          border: "#FECDD3",
          primary: "#E11D48",
          accent: "#FB7185",
        },
      },
    },
  },
  plugins: [],
};
