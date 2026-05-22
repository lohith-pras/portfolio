/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx,js,jsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        foreground: '#F0F0F0',
        accent: '#FF1E00',
        'accent-warm': '#FF4500',
        'accent-crimson': '#C0001A',
      },
      fontFamily: {
        display: ['var(--font-space-mono)', 'monospace'],
        body: ['var(--font-plus-jakarta)', 'sans-serif'],
        life: ['var(--font-courier-prime)', 'monospace'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
