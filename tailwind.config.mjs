/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#10243E",
          50: "#E8EEF5",
          100: "#D1DDEB",
          200: "#A3BBD7",
          300: "#7599C3",
          400: "#4777AF",
          500: "#10243E",
          600: "#0D1D32",
          700: "#0A1626",
          800: "#070F19",
          900: "#03070D",
        },
        search: {
          DEFAULT: "#246BFD",
          hover: "#1A5AE0",
          light: "#E8F0FF",
        },
        bright: "#4F8CFF",
        teal: {
          DEFAULT: "#13998F",
          light: "#E6F5F4",
        },
        success: {
          DEFAULT: "#25845C",
          light: "#E8F5EF",
        },
        amber: {
          DEFAULT: "#E7A52E",
          light: "#FDF6E8",
        },
        cloud: "#F4F7FB",
        charcoal: "#222B36",
        muted: "#667180",
      },
      fontFamily: {
        sans: [
          '"DM Sans"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          '"Outfit"',
          '"DM Sans"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        "display-xl": ["3.25rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-lg": ["2.5rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-md": ["2rem", { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "700" }],
        "display-sm": ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "600" }],
      },
      borderRadius: {
        sm: "0.375rem",
        DEFAULT: "0.5rem",
        md: "0.625rem",
        lg: "0.875rem",
        xl: "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16, 36, 62, 0.06), 0 4px 12px rgba(16, 36, 62, 0.04)",
        raised: "0 4px 16px rgba(16, 36, 62, 0.08), 0 1px 3px rgba(16, 36, 62, 0.06)",
        focus: "0 0 0 3px rgba(36, 107, 253, 0.35)",
        drawer: "0 -4px 24px rgba(16, 36, 62, 0.12)",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        header: "4rem",
        "portfolio-bar": "2.75rem",
      },
      maxWidth: {
        content: "72rem",
        narrow: "40rem",
        prose: "40rem",
      },
      screens: {
        xs: "360px",
        sm: "390px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
      },
      transitionDuration: {
        DEFAULT: "200ms",
        slow: "320ms",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(100%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.32s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.28s ease-out",
      },
    },
  },
  plugins: [],
};
