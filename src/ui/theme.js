import { extendTheme } from '@mui/joy/styles'
import '@fontsource/heebo/400.css'
import '@fontsource/heebo/500.css'
import '@fontsource/heebo/600.css'
import '@fontsource/heebo/700.css'

const appFontFamily = '"Heebo", Arial, sans-serif'

export const theme = extendTheme({
  direction: 'rtl',
  fontFamily: {
    body: appFontFamily,
    display: appFontFamily,
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
