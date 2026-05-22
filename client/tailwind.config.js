/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        border: "var(--border)",
      },
      fontFamily: {
        sans: ['"Pixelify Sans"', 'Inter', 'system-ui', 'sans-serif'],
        press: ['"Press Start 2P"', 'monospace'],
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px #0f172a',
        'neo-sm': '2px 2px 0px 0px #0f172a',
        'neo-lg': '6px 6px 0px 0px #0f172a',
      },
      borderRadius: {
        'neo': '0px',
      }
    },
  },
  plugins: [],
}
