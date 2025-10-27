import type { Config } from "tailwindcss";
import { designTokens } from "./design-tokens";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          light: designTokens.colors.light.primary,
          dark: designTokens.colors.dark.primary,
        },
        secondary: {
          light: designTokens.colors.light.secondary,
          dark: designTokens.colors.dark.secondary,
        },
        accent: {
          light: designTokens.colors.light.accent,
          dark: designTokens.colors.dark.accent,
        },
      },
      fontFamily: {
        sans: [...designTokens.typography.fontFamily.sans],
        mono: [...designTokens.typography.fontFamily.mono],
      },
      fontSize: designTokens.typography.sizes,
      borderRadius: designTokens.borderRadius,
      boxShadow: designTokens.shadows,
      backdropBlur: designTokens.backdropBlur,
    },
  },
  plugins: [],
};

export default config;

