import { extendTheme } from '@mui/joy/styles'

export const theme = extendTheme({
  direction: 'rtl',
  fontFamily: {
    body: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
    display: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
  },
  radius: {
    sm: '10px',
    md: '14px',
    lg: '18px',
  },
  shadow: {
    sm: '0 6px 18px rgba(0,0,0,0.08)',
    md: '0 10px 28px rgba(0,0,0,0.10)',
  },
})
