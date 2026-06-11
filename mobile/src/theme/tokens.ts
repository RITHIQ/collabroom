// ─── ColabRoom × HashFame Design System — Dark Theme ─────────────────────────
// Matches web exactly: bg #0a0a0a, white text, glass surfaces

export const colors = {
  // ── Backgrounds ──────────────────────────────────────────────
  background:      '#0a0a0a',
  surface:         'rgba(255,255,255,0.03)',
  surfaceElevated: 'rgba(255,255,255,0.05)',
  surfaceMuted:    'rgba(255,255,255,0.02)',

  // ── Borders ──────────────────────────────────────────────────
  border:        'rgba(255,255,255,0.08)',
  borderInput:   'rgba(255,255,255,0.10)',
  borderFocused: 'rgba(255,255,255,0.30)',

  // ── Text ─────────────────────────────────────────────────────
  textPrimary:   '#ffffff',
  textSecondary: '#aaaaaa',
  textMuted:     '#666666',

  // ── Accent — WHITE (HashFame style, no purple) ───────────────
  accent:      '#ffffff',
  accentHover: 'rgba(255,255,255,0.85)',
  accentLight: 'rgba(255,255,255,0.06)',
  accentMid:   'rgba(255,255,255,0.10)',

  // ── Semantic ─────────────────────────────────────────────────
  success:      '#4ade80',
  successLight: 'rgba(74,222,128,0.08)',
  warning:      '#fbbf24',
  warningLight: 'rgba(251,191,36,0.08)',
  danger:       '#f87171',
  dangerLight:  'rgba(248,113,113,0.08)',
  info:         '#60a5fa',
  infoLight:    'rgba(96,165,250,0.08)',

  // ── Legacy aliases (keep so old imports don't break) ─────────
  primary:        '#ffffff',
  primaryPressed: 'rgba(255,255,255,0.85)',
};

export const spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 32,
};

export const radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  pill: 9999,
};

export const typography = {
  titleLarge: 32,
  title:      24,
  subtitle:   18,
  body:       14,
  caption:    12,
  small:      10,
  button:     15,
};

export const shadows = {
  card: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius:  8,
    elevation:     4,
  },
  nav: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: -1 },
    shadowOpacity: 0.4,
    shadowRadius:  12,
    elevation:     8,
  },
};
