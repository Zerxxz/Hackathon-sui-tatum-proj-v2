import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand: deep ocean palette
        ocean: {
          50: "#eff8ff",
          100: "#dbeefe",
          200: "#bae0fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        // Cyan accent for glow & gradients
        accent: {
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
        // Warm amber for "unlocked" states
        warm: {
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      backdropBlur: {
        xs: "4px",
      },
      boxShadow: {
        glow: "0 0 60px -10px rgba(34, 211, 238, 0.5)",
        "glow-lg": "0 0 100px -20px rgba(34, 211, 238, 0.6)",
        card: "0 8px 32px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        "aurora-1": "aurora1 22s ease-in-out infinite alternate",
        "aurora-2": "aurora2 28s ease-in-out infinite alternate",
        "aurora-3": "aurora3 35s ease-in-out infinite alternate",
        float: "float 6s ease-in-out infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "fade-in": "fadeIn 0.6s ease-out forwards",
      },
      keyframes: {
        aurora1: {
          "0%": { transform: "translate(0%, 0%) scale(1)" },
          "100%": { transform: "translate(15%, 20%) scale(1.15)" },
        },
        aurora2: {
          "0%": { transform: "translate(0%, 0%) scale(1)" },
          "100%": { transform: "translate(-15%, -10%) scale(1.1)" },
        },
        aurora3: {
          "0%": { transform: "translate(0%, 0%) scale(1)" },
          "100%": { transform: "translate(-10%, 25%) scale(0.92)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
