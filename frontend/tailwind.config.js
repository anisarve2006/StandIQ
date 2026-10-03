/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: {
          DEFAULT: 'var(--surface)',
          elevated: 'var(--surface-elevated)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        accent: {
          DEFAULT: '#ff9100',
          foreground: '#ffffff',
          hover: '#e68200',
        },
        // Tones and shades of #ff9100
        brand: {
          50: '#fff8ed',
          100: '#ffeed4',
          200: '#ffd9a8',
          300: '#ffbf70',
          400: '#ffa733',
          500: '#ff9100', // Base
          600: '#e68200', // Hover shade
          700: '#ba6800', // Text & contrast shade
          800: '#8f4f00',
          900: '#6e3c00',
          950: '#422300',
        },
        saffron: {
          50: '#fff8ed',
          100: '#ffeed4',
          200: '#ffd9a8',
          300: '#ffbf70',
          400: '#ffa733',
          500: '#ff9100',
          600: '#e68200',
          700: '#ba6800',
          800: '#8f4f00',
          900: '#6e3c00',
          950: '#422300',
        },
        // Override default orange so all existing website classes automatically use #ff9100 tones and shades
        orange: {
          50: '#fff8ed',
          100: '#ffeed4',
          200: '#ffd9a8',
          300: '#ffbf70',
          400: '#ffa733',
          500: '#ff9100', // Base #ff9100
          600: '#e68200', // Rich shade for buttons/hover
          700: '#ba6800', // Accessible text shade
          800: '#8f4f00',
          900: '#6e3c00',
          950: '#422300',
        },
        standiq: {
          50: '#fff8ed',
          100: '#ffeed4',
          200: '#ffd9a8',
          300: '#ffbf70',
          400: '#ffa733',
          500: '#ff9100',
          600: '#e68200',
          700: '#ba6800',
          800: '#8f4f00',
          900: '#6e3c00',
          950: '#422300',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        info: 'var(--info)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Playfair Display', 'Georgia', 'serif'],
        display: ['Newsreader', 'Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
