/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0066cc", // AudioGenes Blue (Match Next.js)
        secondary: "#2563eb", // Vibrant Secondary Blue (Match Next.js)
        dark: {
          950: "#000000", // Onyx
          900: "#050505", // Matte
          800: "#0a0a0a", // Surface
          700: "#111111", // Elevation
        },
      },
      fontFamily: {
        sans: ["System"], // Use system fonts for now
      },
    },
  },
  plugins: [],
}
