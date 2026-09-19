// EHS LOOK & FEEL — palette derived from ehs.gov.ae (UAE Government Design System "aegov" tokens).
// Logo / wordmark is still a PLACEHOLDER text lockup — drop the real EHS + MDS Solutions brand files in before presenting.
//
// Single source of truth for colour + type tokens.
//   - tailwind.config.ts imports this to build utilities (bg-surface-1, text-gov-pass, border-model-granite …)
//   - runtime code (reactflow edge strokes, framer-motion glows) imports the same hex values
//
// Source values (ehs.gov.ae home.css):
//   primary   50 #EEF1F4 · 100 #DDE3E9 · 200 #BAC7D2 · 300 #98ABBC · 400 #768EA6 · 500 #547290 · 600 #315679 · 700 #274563 · 800 #1D344C · 900 #132336
//   secondary 50 #F1F8F3 · 100 #DDEEE1 · 200 #BEDCC7 · 300 #92C3A3 · 500 #438660 · 600 #76AE8C · 700 #27553D · 900 #1C382A
//   alert red #B91C1C · page grey #F7F7F7 · card border #BAC7D2 / #DDE3E9
//   fonts: Alexandria (headings) · Inter / Roboto (body) · Noto Kufi Arabic (ar)

/** EHS primary steel-blue scale — exposed for one-off uses (hero bands, wordmark). */
export const ehsPrimary = {
  50: '#eef1f4',
  100: '#dde3e9',
  200: '#bac7d2',
  300: '#98abbc',
  400: '#768ea6',
  500: '#547290',
  600: '#315679',
  700: '#274563',
  800: '#1d344c',
  900: '#132336',
} as const;

/** EHS secondary green scale. */
export const ehsSecondary = {
  50: '#f1f8f3',
  100: '#ddeee1',
  200: '#bedcc7',
  300: '#92c3a3',
  500: '#438660',
  600: '#76ae8c',
  700: '#27553d',
  900: '#1c382a',
} as const;

export const surface = {
  /** page background */
  0: '#f4f6f8',
  /** panel / card background */
  1: '#ffffff',
  /** raised card / hover / inputs */
  2: '#f7f9fb',
  /** hairline borders, dividers */
  3: '#dde3e9',
  /** stronger border (card outline) */
  4: '#bac7d2',
} as const;

export const fg = {
  /** primary text (EHS primary-900) */
  0: '#132336',
  /** secondary text */
  1: '#3f4f63',
  /** muted / captions */
  2: '#6b7a8c',
  /** disabled / placeholder */
  3: '#98abbc',
} as const;

/** EHS primary blue — buttons, headings, brand mark. */
export const accent = {
  DEFAULT: '#315679',
  hi: '#547290',
  lo: '#274563',
} as const;

/**
 * Governance semantics. These four meanings must stay identical everywhere:
 *   pass    = green  — passed / approved            (aegreen)
 *   pending = amber  — pending / awaiting human      (camel)
 *   fail    = red    — blocked / failed              (EHS alert red)
 *   info    = blue   — informational / in-progress   (techblue)
 * All chosen to hold AA contrast as text on white.
 */
export const gov = {
  pass: '#2f8a4a',
  pending: '#b7791f',
  fail: '#b91c1c',
  info: '#2563cf',
} as const;

/**
 * Model-fleet routing colours — one per fleet model from reference/agent_fleet.md.
 * Used on every badge, canvas node accent and audit-log entry that references the model.
 * Tuned for legibility as text on white.
 */
export const model = {
  /** Falcon-H1 / Jais 2 — sovereign Arabic dialogue */
  sovereignArabic: '#007d79',
  /** IBM Granite 4.1 — structuring / summarisation / RAG */
  granite: '#6929c4',
  /** MedGemma — imaging (not invoked in this scenario) */
  medgemma: '#9f1853',
  /** Classical ML — readmission / no-show risk */
  classicalMl: '#ba4e00',
  /** Governed frontier model — complex reasoning, human-gated */
  frontier: '#8a6a00',
} as const;

export type GovStatusColour = keyof typeof gov;
export type ModelColourToken = keyof typeof model;

type FontSizeEntry = [
  fontSize: string,
  configuration: Partial<{ lineHeight: string; letterSpacing: string; fontWeight: string | number }>,
];

/** Type scale — mirrored as Tailwind `fontSize` entries in tailwind.config.ts. Headings use `font-heading` (Alexandria). */
export const typeScale: Record<'page-title' | 'panel-heading' | 'body' | 'caption' | 'log', FontSizeEntry> = {
  'page-title': ['1.0625rem', { lineHeight: '1.25rem', letterSpacing: '-0.005em', fontWeight: '700' }],
  'panel-heading': ['0.8125rem', { lineHeight: '1rem', letterSpacing: '0.02em', fontWeight: '700' }],
  body: ['0.875rem', { lineHeight: '1.35rem', fontWeight: '400' }],
  caption: ['0.6875rem', { lineHeight: '0.9rem', letterSpacing: '0.02em', fontWeight: '500' }],
  log: ['0.75rem', { lineHeight: '1.1rem', fontWeight: '400' }],
};
