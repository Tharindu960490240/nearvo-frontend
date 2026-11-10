// Light / dark mode (like AFC): sets data-theme on <html> for the CSS variables
// and builds a matching Material UI theme for the form controls.
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeModeContext = createContext({ mode: 'light', toggle: () => {} });

function initialMode() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* storage unavailable */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    try { localStorage.setItem('theme', mode); } catch { /* optional */ }
  }, [mode]);

  const theme = useMemo(() => {
    const dark = mode === 'dark';
    return createTheme({
      palette: {
        mode,
        primary: { main: '#0288d1', light: '#4fc3f7', dark: '#01579b', contrastText: '#fff' },
        secondary: { main: dark ? '#7fd3fa' : '#0d2b45' },
        error: { main: dark ? '#ff6b6b' : '#d93f3f' },
        success: { main: dark ? '#4db6ac' : '#00796b' },
        warning: { main: '#f5a623' },
        background: { default: dark ? '#060d16' : '#f2f9fe', paper: dark ? '#101c29' : '#ffffff' },
        text: { primary: dark ? '#e6edf3' : '#0d2b45', secondary: dark ? 'rgba(230,237,243,0.68)' : 'rgba(13,43,69,0.68)' },
        divider: dark ? 'rgba(255,255,255,0.09)' : '#dceaf4',
      },
      shape: { borderRadius: 8 },
      typography: { fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', button: { textTransform: 'none', fontWeight: 600 } },
      components: {
        MuiTextField: { defaultProps: { fullWidth: true } },
        MuiOutlinedInput: {
          styleOverrides: {
            root: { backgroundColor: dark ? 'rgba(255,255,255,0.02)' : '#fff' },
            notchedOutline: { borderColor: dark ? 'rgba(255,255,255,0.14)' : '#d4e4ef' },
          },
        },
        MuiMenu: { styleOverrides: { paper: { borderRadius: 10, marginTop: 4 } } },
        MuiAutocomplete: { styleOverrides: { paper: { borderRadius: 10, marginTop: 4 }, option: { borderRadius: 6, margin: '0 6px' } } },
        MuiDialog: { styleOverrides: { paper: { borderRadius: 16, backgroundImage: 'none' } } },
        MuiAlert: { styleOverrides: { root: { borderRadius: 10, alignItems: 'center' } } },
        MuiRating: { styleOverrides: { iconFilled: { color: '#f5a623' }, iconHover: { color: '#f5a623' } } },
        MuiButton: { defaultProps: { disableElevation: true } },
        MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      },
    });
  }, [mode]);

  const value = useMemo(() => ({ mode, toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')) }), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export const useThemeMode = () => useContext(ThemeModeContext);
