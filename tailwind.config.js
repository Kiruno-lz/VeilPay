/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'oklch(97% 0.02 195)',
          100: 'oklch(93% 0.04 195)',
          200: 'oklch(85% 0.08 195)',
          300: 'oklch(75% 0.12 195)',
          400: 'oklch(65% 0.14 195)',
          500: 'oklch(55% 0.15 195)',
          600: 'oklch(48% 0.14 195)',
          700: 'oklch(40% 0.12 195)',
          800: 'oklch(32% 0.09 195)',
          900: 'oklch(24% 0.06 195)',
          950: 'oklch(18% 0.04 195)',
        },
        secondary: {
          50: 'oklch(97% 0.02 85)',
          100: 'oklch(93% 0.04 85)',
          200: 'oklch(85% 0.08 85)',
          300: 'oklch(75% 0.12 85)',
          400: 'oklch(68% 0.14 85)',
          500: 'oklch(60% 0.15 85)',
          600: 'oklch(52% 0.13 85)',
          700: 'oklch(44% 0.11 85)',
          800: 'oklch(35% 0.08 85)',
          900: 'oklch(26% 0.05 85)',
          950: 'oklch(20% 0.03 85)',
        },
        neutral: {
          0: 'oklch(100% 0 195)',
          50: 'oklch(97% 0.005 195)',
          100: 'oklch(92% 0.01 195)',
          200: 'oklch(82% 0.015 195)',
          300: 'oklch(70% 0.02 195)',
          400: 'oklch(58% 0.02 195)',
          500: 'oklch(48% 0.02 195)',
          600: 'oklch(38% 0.015 195)',
          700: 'oklch(28% 0.01 195)',
          800: 'oklch(20% 0.008 195)',
          900: 'oklch(14% 0.005 195)',
          950: 'oklch(10% 0.003 195)',
        },
        success: {
          500: 'oklch(65% 0.18 145)',
          600: 'oklch(58% 0.16 145)',
        },
        error: {
          500: 'oklch(58% 0.18 25)',
          600: 'oklch(52% 0.16 25)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
