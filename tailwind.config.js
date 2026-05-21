/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        "on-background": "var(--on-background)",
        surface: "var(--surface)",
        "on-surface": "var(--on-surface)",
        "surface-container-lowest": "var(--surface-container-lowest)",
        "surface-container-low": "var(--surface-container-low)",
        "surface-container": "var(--surface-container)",
        "surface-container-high": "var(--surface-container-high)",
        "surface-container-highest": "var(--surface-container-highest)",
        primary: "var(--primary)",
        "on-primary": "var(--on-primary)",
        "primary-container": "var(--primary-container)",
        secondary: "var(--secondary)",
        "on-secondary": "var(--on-secondary)",
        tertiary: "var(--tertiary)",
        "on-tertiary": "var(--on-tertiary)",
        outline: "var(--outline)",
        "outline-variant": "var(--outline-variant)",
        "on-surface-variant": "var(--on-surface-variant)",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        label: ["Outfit", "sans-serif"],
      },
      boxShadow: {
        ambient: "0 20px 40px rgba(242,242,242,0.04)",
      },
    },
  },
  plugins: [],
};
