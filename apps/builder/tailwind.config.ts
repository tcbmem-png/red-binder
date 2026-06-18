import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

// Tokens from BRANDING — Build Handoff §1. shadcn semantic colors consume the :root HSL vars in
// globals.css; the brand tokens (binder/bone/ink/… and the path.* tile legend) are used directly.
// Note: --destructive is the caution amber, NOT red — binder red is the find-me color, not an alarm.
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },

        // Red Binder brand tokens (used directly)
        binder: { DEFAULT: '#C8362B', fg: '#FBF7F1' },
        bone: '#FBF7F1',
        ink: '#1F1B1A',
        steady: '#6B6360',
        success: { DEFAULT: '#3F6B53', bg: '#E6EFE9', fg: '#20382B' },
        caution: { DEFAULT: '#BE8A3E', bg: '#F5ECDB', fg: '#5C3F11' },
        info: { DEFAULT: '#4A5A6B', bg: '#E7ECF1', fg: '#25303B' },
        // POA tile legend (documentPath) — mirrors states.ts legend
        path: {
          universal: '#3F6B53',
          universalBg: '#E6EFE9',
          addendum: '#BE8A3E',
          addendumBg: '#F5ECDB',
          stateForm: '#4A5A6B',
          stateFormBg: '#E7ECF1',
        },
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: { lg: '0.625rem', md: '0.5rem', sm: '0.375rem' },
    },
  },
  plugins: [animate],
} satisfies Config;
