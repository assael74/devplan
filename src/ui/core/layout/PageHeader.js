import React from 'react'
import { Box, Typography } from '@mui/joy'

export default function PageHeader({ title, subtitle, right }) {
  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 2 },
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        bgcolor: 'background.body',
        zIndex: 10,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography level="title-lg" sx={{ lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 0.25 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>

      {right ? <Box sx={{ flexShrink: 0 }}>{right}</Box> : null}
    </Box>
  )
}
