/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#D4AF37", // Gold
        secondary: "#C0B283", // Muted Gold
        dark: {
          950: "#0A0A0A", // Background
          900: "#121212", // Surface
          800: "#1E1E1E", // Card
        },
      },
      fontFamily: {
        sans: ["System"], // Use system fonts for now
      },
    },
  },
  plugins: [],
}
