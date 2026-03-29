import { createTheme } from '@mui/material/styles'

export const tealTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#14B8A6',
      light: '#5EEAD4',
      dark: '#0D9488',
      contrastText: '#fff',
    },
    secondary: {
      main: '#FB7185',
      light: '#FDA4AF',
      dark: '#F43F5E',
      contrastText: '#fff',
    },
    success: {
      main: '#34D399',
      light: '#6EE7B7',
      dark: '#10B981',
    },
    warning: {
      main: '#FBBF24',
      light: '#FCD34D',
      dark: '#F59E0B',
    },
    error: {
      main: '#FB7185',
      light: '#FDA4AF',
      dark: '#F43F5E',
    },
    background: {
      default: '#F0FDFA',
      paper: '#fff',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': { boxSizing: 'border-box' },
        html: { scrollBehavior: 'smooth' },
        body: {
          backgroundColor: '#F0FDFA',
          transition: 'background-color 0.3s ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          transition: 'all 0.2s ease',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          background: 'linear-gradient(135deg, #14B8A6 0%, #5EEAD4 100%)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
          },
        },
        outlined: {
          background: 'transparent',
          border: '1.5px solid #14B8A6',
          color: '#14B8A6',
          '&:hover': {
            background: 'rgba(20, 184, 166, 0.08)',
            border: '1.5px solid #0D9488',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
          color: '#14B8A6',
        },
        colorSuccess: {
          background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
          color: '#fff',
        },
        colorWarning: {
          background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
          color: '#fff',
        },
        colorError: {
          background: 'linear-gradient(135deg, #FB7185 0%, #F43F5E 100%)',
          color: '#fff',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
          boxShadow: '0 2px 12px rgba(20, 184, 166, 0.25)',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 60,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            '& .MuiBottomNavigationAction-label': {
              fontWeight: 600,
            },
          },
        },
      },
    },
  },
})