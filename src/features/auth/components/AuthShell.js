import React from 'react'
import { Sheet, Box, Typography } from '@mui/joy'
import { authSx } from '../auth.sx'

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <Box sx={authSx.page}>
      <Sheet sx={authSx.shell}>
        <Box sx={authSx.hero}>
          <Typography level="h2">{title || 'התחברות למערכת'}</Typography>
          {subtitle ? (
            <Typography level="body-sm" sx={{ mt: 0.75, opacity: 0.75 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>

        <Box sx={authSx.content}>
          {children}
          {footer ? <Box>{footer}</Box> : null}
        </Box>
      </Sheet>
    </Box>
  )
}
