import React from 'react'
import { Typography } from '@mui/joy'

export default function PermissionGate({ allow, children }) {
  if (!allow) {
    return (
      <Typography level="body-sm" sx={{ opacity: 0.75 }}>
        אין הרשאה לצפייה בתשלומים.
      </Typography>
    )
  }
  return children
}
