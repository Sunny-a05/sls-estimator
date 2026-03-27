import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        red: {
          DEFAULT: "#C8102E",
          dark: "#9B0B22",
          light: "#E8344E",
        },
        black: {
          DEFAULT: "#0A0A0A",
          soft: "#1A1A1A",
        },
        gray: {
          DEFAULT: "#6B6B6B",
          light: "#F4F4F4",
          border: "#E8E3DF",
          muted: "#9A9A9A",
        },
        cream: "#FAF9F7",
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      fontSize: {
        // formless.xyz-inspired scale — generous, editorial
        "display-xl": ["clamp(3rem, 6vw, 5.5rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display": ["clamp(2.25rem, 4.5vw, 4rem)", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        "heading": ["clamp(1.5rem, 3vw, 2.5rem)", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "subheading": ["clamp(1.125rem, 2vw, 1.5rem)", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        "body": ["1rem", { lineHeight: "1.6" }],
        "caption": ["0.875rem", { lineHeight: "1.5" }],
        "micro": ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.05em" }],
      },
      spacing: {
        // osmo.supply-inspired generous spacing
        "section": "clamp(5rem, 12vw, 10rem)",
        "block": "clamp(3rem, 6vw, 6rem)",
        "element": "clamp(1.5rem, 3vw, 3rem)",
      },
      borderRadius: {
        "xl": "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.25, 0.1, 0.25, 1)",
        "snap": "cubic-bezier(0.4, 0, 0, 1)",
        "bounce-soft": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
      },
      boxShadow: {
        "btn": "0 1px 3px rgba(200,16,46,0.2)",
        "btn-hover": "0 4px 12px rgba(200,16,46,0.3)",
        "card-selected": "0 0 0 3px rgba(200,16,46,0.08)",
        "card-hover": "0 0 0 3px rgba(200,16,46,0.06)",
        "step-active": "0 0 0 4px rgba(200,16,46,0.12)",
        "soft": "0 1px 3px rgba(0,0,0,0.03)",
        "elevated": "0 8px 30px rgba(0,0,0,0.06)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-right": {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) forwards",
        "fade-in": "fade-in 0.4s ease forwards",
        "scale-in": "scale-in 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards",
        "slide-right": "slide-right 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
