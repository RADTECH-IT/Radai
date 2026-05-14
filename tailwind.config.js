/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        background: "var(--bg-base)",
        chat: "var(--bg-chat)",
        surface: "var(--glass-bg)",
        "surface-low": "var(--surface-low)",
        "surface-lowest": "var(--surface-lowest)",
        "on-surface": "var(--text-main)",
        "on-surface-variant": "var(--text-muted)",
        outline: "var(--border-color)",
        "accent-green": "var(--accent-green)",
        "accent-amber": "var(--accent-amber)",
        "accent-rose": "var(--accent-rose)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
      },
    },
  },
  plugins: [],
}
