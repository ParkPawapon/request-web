import { createTheme } from "@mui/material/styles";

import { designTokens } from "./tokens";

export const requestTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    background: {
      default: designTokens.color.background,
      paper: designTokens.color.surface,
    },
    divider: designTokens.color.border,
    error: {
      main: designTokens.color.danger,
    },
    primary: {
      main: designTokens.color.primary,
      dark: designTokens.color.primaryDark,
      light: designTokens.color.primaryLight,
      contrastText: "#ffffff",
    },
    success: {
      main: designTokens.color.success,
    },
    text: {
      primary: designTokens.color.foreground,
      secondary: "#6b7280",
    },
    warning: {
      main: designTokens.color.warning,
    },
  },
  shape: {
    borderRadius: designTokens.radius.md,
  },
  spacing: designTokens.spacing.unit,
  typography: {
    fontFamily: designTokens.typography.fontFamily,
    h3: {
      fontSize: "2.25rem",
      fontWeight: 700,
      letterSpacing: 0,
      lineHeight: 1.15,
    },
    h4: {
      fontSize: "1.75rem",
      fontWeight: 700,
      letterSpacing: 0,
      lineHeight: 1.2,
    },
    h5: {
      fontSize: "1.35rem",
      fontWeight: 700,
      letterSpacing: 0,
      lineHeight: 1.25,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 700,
      letterSpacing: 0,
      lineHeight: 1.35,
    },
    body1: {
      fontSize: "1rem",
      letterSpacing: 0,
      lineHeight: 1.65,
    },
    body2: {
      fontSize: "0.925rem",
      letterSpacing: 0,
      lineHeight: 1.6,
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 700,
      letterSpacing: 0,
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.radius.sm,
          boxShadow: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.radius.sm,
          fontWeight: 700,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderColor: designTokens.color.border,
          borderRadius: designTokens.radius.md,
        },
      },
    },
  },
});
