import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { Toaster } from 'react-hot-toast'
import { store } from '../store'
import Layout from '../components/Layout'
import '../../styles/globals.css'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary:    { main: '#2563EB' },
    secondary:  { main: '#7C3AED' },
    background: { default: '#F8FAFC' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    fontSize: 13,
    h5:        { fontSize: '1.25rem', fontWeight: 800, letterSpacing: -0.5 },
    h6:        { fontSize: '1.05rem', fontWeight: 700 },
    subtitle1: { fontSize: '0.9rem',  fontWeight: 600 },
    subtitle2: { fontSize: '0.82rem', fontWeight: 600 },
    body1:     { fontSize: '0.875rem' },
    body2:     { fontSize: '0.8rem' },
    caption:   { fontSize: '0.72rem' },
    overline:  { fontSize: '0.65rem', fontWeight: 700, letterSpacing: 0.8 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton:  { defaultProps: { disableElevation: true } },
    MuiPaper:   { defaultProps: { elevation: 0, variant: 'outlined' as const } },
  },
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              maxWidth: 360,
              fontSize: '0.82rem',
              wordBreak: 'break-word',
            },
          }}
        />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </Provider>
  )
}
