import headlessuiPlugin from '@headlessui/tailwindcss'
import formsPlugin from '@tailwindcss/forms'
import typographyPlugin from '@tailwindcss/typography'
import tailwindScrollbarHide from 'tailwind-scrollbar-hide'
import { type Config } from 'tailwindcss'
import defaultTheme from "tailwindcss/defaultTheme";
import colors from "tailwindcss/colors";

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Bricolage Grotesque", ...defaultTheme.fontFamily.sans],
      },
      animation: {
        'marquee-left': 'marqueeLeft 20s linear infinite',
        'marquee-right': 'marqueeRight 20s linear infinite',
        'animation-paused': 'paused',
        'scroller-down': 'scrollerDown 12s linear infinite',
        'scroller-up': 'scrollerUp 12s linear infinite',
        'spin-reverse': 'spin-reverse 1s linear infinite',
      },
      keyframes: {
        marqueeLeft: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        marqueeRight: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(-0%)' },
        },
        scrollerDown: {
          '0%': {
            transform: 'translateY(-10em)'
          },
          '100%': {
            transform: 'translateY(14em)'
          },
        },
        scrollerUp: {
          '0%': {
            transform: 'translateY(10em)'
          },
          '100%': {
            transform: 'translateY(-14em)'
          },
        },
        'spin-reverse': {
          to: {
            transform: 'rotate(-360deg)',
          },
        },
      },
      boxShadow: {
        tiny: "0px 1.5px",
        small: "0px 3px",
        DEFAULT: "0px 5px", 
        large: "0px 10px",
      },
      colors: {
        'neon-green': '#39ff14',
        'neon-pink': '#ff0066',
        'neon-blue': '#00ffff',
        'neon-purple': '#9900ff',
        black: "#141520",
        white: "#f5f5f5",
        green: {
          50: "#F8FBFC",
          100: "#F2F7F8",
          200: "#E1EDEF",
          300: "#D3E5E8",
          400: "#C6DDE2",
          500: "#B7D4DA",
          600: "#82B5BF",
          700: "#51919E",
          800: "#366068",
          900: "#1C3236"
        },
        lila: {
          50: "#FBFAFF",
          100: "#F7F5FF",
          200: "#EAE6FE",
          300: "#E2DCFE",
          400: "#D6CEFD",
          500: "#C8BEFD",
          600: "#B4A6FC",
          700: "#A08DFB",
          800: "#836BFA",
          900: "#5534F9"
        },
        yellow: {
          50: "#FFFDFA",
          100: "#FFFAF5",
          200: "#FFF5EB",
          300: "#FEEEDC",
          400: "#FEE9D2",
          500: "#FEE3C6",
          600: "#FDC991",
          700: "#FCA446",
          800: "#EC7C04",
          900: "#AA5903"
        },
        red: {
          50: "#FEFBFB",
          100: "#FDF7F8",
          200: "#FBEAED",
          300: "#F8DDE2",
          400: "#F6D0D7",
          500: "#F3C4CD",
          600: "#EEAAB7",
          700: "#E88D9D",
          800: "#DE5E75",
          900: "#BF2743"
        },
        info: {
          '50': '#f2f6fc',
          '100': '#e1eaf8',
          '200': '#cadaf3',
          '300': '#a6c3ea',
          '400': '#7ca4de',
          '500': '#5d85d4',
          '600': '#496bc7',
          '700': '#3f59b6',
          '800': '#384a95',
          '900': '#324076',
          '950': '#222949',
        },
        success: {
          '50': '#f3faf8',
          '100': '#d7f0ec',
          '200': '#bfe7e1',
          '300': '#7ecac1',
          '400': '#53aea6',
          '500': '#3a928d',
          '600': '#2c7572',
          '700': '#275e5c',
          '800': '#234c4c',
          '900': '#20413f',
          '950': '#0e2425',
        },
        warning: {
          '50': '#fef5ee',
          '100': '#fce9d8',
          '200': '#f7ceb1',
          '300': '#f2ab7e',
          '400': '#ec804b',
          '500': '#e75f28',
          '600': '#d8471e',
          '700': '#b4341a',
          '800': '#8f2b1d',
          '900': '#74261a',
          '950': '#3e110c',
        },
        danger: {
          '50': '#fdf5f3',
          '100': '#fce8e4',
          '200': '#fad5ce',
          '300': '#f3ac9e',
          '400': '#ed8f7c',
          '500': '#e16a52',
          '600': '#cd4e35',
          '700': '#ac3f29',
          '800': '#8f3625',
          '900': '#773325',
          '950': '#40170f',
        },
      },
    },
  },
  plugins: [formsPlugin, headlessuiPlugin, typographyPlugin, tailwindScrollbarHide],
} satisfies Config
