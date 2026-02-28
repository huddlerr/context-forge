// ── DESIGN TOKENS ─────────────────────────────────────────────
// Single source of truth for all visual constants.
// Import from here instead of hardcoding values in components.

export const colors = {
  // Backgrounds
  bg: "#0a0a0f",
  bgPanel: "#111118",
  bgCode: "#0c0c14",

  // Primary brand
  primary: "#ff672a",
  primaryHover: "#ff9500",
  primaryGradient: "linear-gradient(135deg, #ff672a, #ff9500)",
  primaryGlow: "0 4px 20px rgba(255,103,42,0.3)",
  primarySubtle: "rgba(255,103,42,0.15)",
  primaryBorder: "rgba(255,103,42,0.3)",
  primaryMuted: "#ff9966",

  // Text
  text: "#fff",
  textCode: "#e2e8f0",
  textSecondary: "rgba(255,255,255,0.7)",
  textMuted: "rgba(255,255,255,0.5)",
  textDimmed: "rgba(255,255,255,0.4)",
  textSubtle: "rgba(255,255,255,0.35)",
  textGhost: "rgba(255,255,255,0.25)",
  textFaint: "rgba(255,255,255,0.2)",
  textDisabled: "rgba(255,255,255,0.15)",

  // Borders
  border: "rgba(255,255,255,0.06)",
  borderLight: "rgba(255,255,255,0.08)",
  borderMedium: "rgba(255,255,255,0.1)",

  // Surfaces
  surface: "rgba(255,255,255,0.04)",
  surfaceLight: "rgba(255,255,255,0.06)",
  surfaceSubtle: "rgba(255,255,255,0.03)",
  surfaceHover: "rgba(255,255,255,0.02)",

  // Semantic
  success: "#16a34a",
  successLight: "#4ade80",
  successBg: "rgba(22,163,74,0.2)",
  successGlow: "0 4px 20px rgba(22,163,74,0.3)",
  warning: "#f59e0b",
  error: "#ef4444",
  errorBg: "rgba(239,68,68,0.2)",

  // Syntax highlighting
  syntaxKeyword: "#c084fc",
  syntaxType: "#38bdf8",
  syntaxString: "#f59e0b",
  syntaxComment: "#6b7280",

  // Overlays
  overlay: "rgba(0,0,0,0.5)",
  overlayHeavy: "rgba(0,0,0,0.6)",

  // Integration brands
  airtable: "#18BFFF",
  gsheets: "#0F9D58",
};

export const fonts = {
  primary: "'Satoshi', sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', monospace",
};

export const fontSizes = {
  xs: 9,
  sm: 10,
  md: 11,
  base: 12,
  lg: 13,
  xl: 14,
  "2xl": 15,
  "3xl": 16,
  "4xl": 18,
  "5xl": 20,
  "6xl": 24,
};

export const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
};

export const spacing = {
  0: 0,
  1: 2,
  2: 4,
  3: 5,
  4: 6,
  5: 8,
  6: 10,
  7: 12,
  8: 14,
  9: 16,
  10: 20,
  11: 24,
  12: 32,
  13: 48,
  14: 64,
};

export const radii = {
  xs: 3,
  sm: 4,
  md: 5,
  base: 6,
  lg: 7,
  xl: 8,
  "2xl": 10,
  "3xl": 12,
  "4xl": 14,
  "5xl": 16,
};

export const shadows = {
  modal: "0 24px 80px rgba(0,0,0,0.5)",
  glow: "0 4px 16px rgba(255,103,42,0.3)",
};

export const animations = {
  fadeIn: "cfFadeIn 0.3s",
  fadeInFast: "cfFadeIn 0.2s",
  pulse: "cfPulse 2s infinite",
};

export const globalStyles = `
  @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
  @keyframes cfFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes cfPulse { 0%,100% { box-shadow: 0 0 20px rgba(255,103,42,0.15); } 50% { box-shadow: 0 0 40px rgba(255,103,42,0.3); } }
  @keyframes cfPfly { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(var(--dx),var(--dy)) scale(0); opacity: 0; } }
  *{box-sizing:border-box;-webkit-font-smoothing:antialiased}
  html,body{margin:0;padding:0;height:100%;overflow:hidden}
  #root{height:100%}
  button{font-family:'Satoshi',sans-serif}
  textarea{font-family:'Satoshi',sans-serif}
  textarea::placeholder{color:rgba(255,255,255,0.2)}
  input::placeholder{color:rgba(255,255,255,0.2)}
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:3px}
`;
