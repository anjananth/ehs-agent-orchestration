import type { Config } from 'tailwindcss';
import { accent, ehsPrimary, ehsSecondary, fg, gov, model, surface, typeScale } from './src/styles/tokens';

// Colour + type values live in src/styles/tokens.ts (EHS palette — see that file).
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: { ...surface },
        fg: { ...fg },
        accent: { ...accent },
        gov: { ...gov },
        ehs: { ...ehsPrimary },
        'ehs-green': { ...ehsSecondary },
        model: {
          'sovereign-arabic': model.sovereignArabic,
          granite: model.granite,
          medgemma: model.medgemma,
          'classical-ml': model.classicalMl,
          frontier: model.frontier,
        },
      },
      fontFamily: {
        // Loaded via Google Fonts in index.html — matches ehs.gov.ae (Inter/Roboto body, Alexandria headings, Noto Kufi Arabic).
        sans: ['Inter', 'Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Alexandria', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        arabic: ['"Noto Kufi Arabic"', '"Segoe UI"', 'Tahoma', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: { ...typeScale },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        panel: '0 1px 2px rgba(19,35,54,0.05), 0 6px 20px -12px rgba(19,35,54,0.18)',
        glow: '0 0 0 1px rgba(49,86,121,0.25), 0 4px 14px -4px rgba(49,86,121,0.45)',
      },
      keyframes: {
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(37,99,207,0.45)' },
          '70%': { boxShadow: '0 0 0 10px rgba(37,99,207,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(37,99,207,0)' },
        },
        dash: {
          to: { strokeDashoffset: '-24' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-3px)' },
          '40%': { transform: 'translateX(3px)' },
          '60%': { transform: 'translateX(-2px)' },
          '80%': { transform: 'translateX(2px)' },
        },
      },
      animation: {
        'pulse-ring': 'pulseRing 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        dash: 'dash 0.8s linear infinite',
        shake: 'shake 0.45s ease-in-out 1',
      },
    },
  },
  plugins: [],
} satisfies Config;
