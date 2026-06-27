/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx,js,jsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Hex mirrors of the canonical OKLCH tokens — kept hex so Tailwind alpha
        // modifiers (bg-accent/30, text-foreground/60) resolve. Values must track
        // --color-paper / --color-ink / --color-accent in globals.css & tokens.css.
        background: '#0A0A0A',
        foreground: '#F0F0F0',
        accent: '#FF1E00',
        beige: '#F5DDB6',
        paper: 'var(--color-paper)',
        'paper-2': 'var(--color-paper-2)',
        ink: 'var(--color-ink)',
        'ink-2': 'var(--color-ink-2)',
        muted: 'var(--color-muted)',
        rule: 'var(--color-rule)',
      },
      fontFamily: {
        // display = Oswald — condensed grotesque for hero name + all h2 section headings
        display: ['var(--font-oswald)', 'sans-serif'],
        // body = Plus Jakarta Sans — prose, captions, UI copy
        body: ['var(--font-plus-jakarta)', 'sans-serif'],
        // mono = Space Mono — eyebrows, ledger labels, chips, counters
        mono: ['var(--font-space-mono)', 'monospace'],
        // life = Courier Prime — /life route only, loaded in life/layout.tsx
        life: ['var(--font-courier-prime)', 'monospace'],
      },
    },
  },
  plugins: [],
}
