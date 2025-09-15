import { createTheme } from '@mui/material/styles';

// Reference-inspired palette
const primary = {
  main: '#2F6C4E', // deep green
  light: '#4E8C6D',
  dark: '#224D38',
  contrastText: '#ffffff',
};
const secondary = {
  main: '#F4A340', // warm accent
  light: '#F7BD74',
  dark: '#BD7D2E',
  contrastText: '#1B1B1B',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary,
    secondary,
    background: {
      default: '#F7FAF8',
      paper: '#ffffff',
    },
    text: {
      primary: '#1B1B1B',
      secondary: '#475569',
    },
    success: { main: '#22C55E' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 18, boxShadow: '0 6px 24px rgba(0,0,0,0.06)' } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 12, paddingInline: 18, paddingBlock: 10 } } },
    MuiTextField: { styleOverrides: { root: { borderRadius: 12 } } },
  },
});

export default theme;