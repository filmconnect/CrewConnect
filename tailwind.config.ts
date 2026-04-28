import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        primary: '#111111',
        secondary: '#888888',
        tertiary: '#BBBBBB',
        placeholder: '#CCCCCC',
        border: '#EEEEEE',
        surface: '#FAFAFA',
        gold: {
          DEFAULT: '#DBA508',
          light: '#FFF8E1',
          border: '#F5E6A3',
          text: '#8B6508',
          surface: '#FFFDF5',
        },
        confirmed: {
          DEFAULT: '#1A8C5E',
          bg: '#F0FAF5',
        },
        danger: {
          DEFAULT: '#C44B4B',
          bg: '#FFF5F5',
        },
        done: '#AAAAAA',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '10px',
        '2xl': '12px',
      },
      boxShadow: {
        dropdown: '0 8px 24px rgba(0, 0, 0, 0.10)',
        modal: '0 16px 48px rgba(0, 0, 0, 0.15)',
      },
      spacing: {
        page: '32px',
        section: '24px',
        card: '16px',
      },
      fontSize: {
        h1: ['22px', { fontWeight: '700', letterSpacing: '-0.4px', lineHeight: '1.3' }],
        h2: ['18px', { fontWeight: '700', letterSpacing: '-0.3px', lineHeight: '1.3' }],
        body: ['14px', { fontWeight: '400', lineHeight: '1.7' }],
        small: ['13px', { fontWeight: '400', lineHeight: '1.5' }],
        caption: ['12px', { fontWeight: '400', lineHeight: '1.5' }],
        label: ['11px', { fontWeight: '500', letterSpacing: '0.06em', lineHeight: '1' }],
        stat: ['20px', { fontWeight: '700', letterSpacing: '-0.3px', lineHeight: '1' }],
        nav: ['13px', { fontWeight: '400', lineHeight: '1' }],
      },
    },
  },
  plugins: [],
};

export default config;
