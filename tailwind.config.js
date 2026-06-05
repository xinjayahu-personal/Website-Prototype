/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["'Libre Baskerville'", "Georgia", "serif"],
      },
      colors: {
        surface: "#ffffff",
        "surface-bg": "#f1f0e9",
        "surface-subtle": "#f9f8f6",
        heading: "#032b3a",
        secondary: "#5d757e",
        interactive: "#388523",
        "interactive-subtle": "#233d48",
        border: "#dadfe2",
        brand: "#1f3b4d",
        "brand-hover": "#355e73",
        "brand-light": "#f3f6f8",
      },
    },
  },
  plugins: [],
};
