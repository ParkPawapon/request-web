export const designTokens = {
  color: {
    background: "#f7f7fb",
    foreground: "#111827",
    surface: "#ffffff",
    surfaceMuted: "#fff4ef",
    border: "#e5e7eb",
    primary: "#f66a38",
    primaryDark: "#c74517",
    primaryLight: "#ffe3d7",
    danger: "#be123c",
    warning: "#b7791f",
    success: "#15803d",
  },
  radius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
  },
  spacing: {
    unit: 8,
  },
  shadow: {
    focus: "0 0 0 3px rgba(255, 176, 149, 0.55)",
    raised: "0 14px 40px rgba(17, 24, 39, 0.10)",
  },
  typography: {
    fontFamily:
      'var(--font-kanit), "Kanit", "Kanit Fallback", ui-sans-serif, system-ui, sans-serif',
    monoFamily:
      'var(--font-geist-mono), "Geist Mono", "Geist Mono Fallback", ui-monospace, monospace',
  },
} as const;
