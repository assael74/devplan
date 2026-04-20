// playerProfile/mobile/modules/payments/components/PermissionNotice.js

import React from 'react'
import { Typography } from '@mui/joy'

export default function PermissionNotice({ text }) {
  return (
    <Typography level="body-sm" sx={{ opacity: 0.75 }}>
      {text || 'אין הרשאה לצפייה באזור זה.'}
    </Typography>
  )
}
