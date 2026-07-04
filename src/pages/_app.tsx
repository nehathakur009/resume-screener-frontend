import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { Toaster } from 'react-hot-toast'
import { store } from '../store'
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
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Component {...pageProps} />
      </ThemeProvider>
    </Provider>
  )
}
