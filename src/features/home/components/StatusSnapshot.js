import React from 'react'
import { Box, Card, Typography } from '@mui/joy'

export default function StatusSnapshot({ items = [], isMobile = false }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          sm: 'repeat(3, minmax(0, 1fr))',
          md: 'repeat(5, minmax(0, 1fr))',
        },
        gap: 1,
      }}
    >
      {items.map((it) => (
        <Card key={it.key} variant="soft" sx={{ p: 1.2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>{it.icon}</Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography level="h3" sx={{ lineHeight: 1 }}>
                {Number.isFinite(it.value) ? it.value : 0}
              </Typography>

              {!isMobile && (
                <Typography level="body-xs" sx={{ opacity: 0.85 }}>
                  {it.label}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Mobile: טקסט אופציונלי שקט (אם תרצה) */}
          {isMobile && (
            <Typography level="body-xs" sx={{ opacity: 0.75, mt: 0.5 }}>
              {it.label}
            </Typography>
          )}
        </Card>
      ))}
    </Box>
  )
}
