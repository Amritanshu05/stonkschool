import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1240px" },
    },
    extend: {
      colors: {
        // Calm fintech palette — original teal-based system.
        bg: {
          DEFAULT: "#FAFBFC",
          surface: "#FFFFFF",
          subtle: "#F4F6F8",
          inverted: "#0F1320",
        },
        line: {
          DEFAULT: "#E8ECF0",
          strong: "#D8DEE6",
        },
        ink: {
          DEFAULT: "#0F1320",
          muted: "#5B6473",
          soft: "#8C95A4",
          inverted: "#FFFFFF",
        },
        brand: {
          50: "#E6F7F1",
          100: "#C7EEDF",
          200: "#90DDC0",
          300: "#5DCBA2",
          400: "#2FB985",
          500: "#0DA068", // primary
          600: "#0A8456",
          700: "#076844",
          800: "#054C32",
          900: "#03301F",
        },
        accent: {
          // soft secondary, used sparingly
          50: "#EEF3FF",
          500: "#3D6BFB",
          700: "#2348C2",
        },
        gain: { DEFAULT: "#0DA068", soft: "#E6F7F1" },
        loss: { DEFAULT: "#D5454C", soft: "#FCEAEC" },
        warn: { DEFAULT: "#C97A0A", soft: "#FFF4E1" },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        xs: "6px",
        sm: "8px",
        DEFAULT: "12px",
        md: "14px",
        lg: "18px",
        xl: "24px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 19, 32, 0.04), 0 4px 16px rgba(15, 19, 32, 0.04)",
        pop: "0 8px 24px rgba(15, 19, 32, 0.08)",
        ring: "0 0 0 4px rgba(13, 160, 104, 0.12)",
      },
      transitionTimingFunction: {
        snappy: "cubic-bezier(.2,.8,.2,1)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s linear infinite",
        "fade-in": "fadeIn 200ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
