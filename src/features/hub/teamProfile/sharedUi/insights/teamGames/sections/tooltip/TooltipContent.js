// teamProfile/sharedUi/insights/teamGames/sections/tooltip/TooltipContent.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

export default function TooltipContent({ title = 'מידע', rows = [] }) {
  const safeRows = Array.isArray(rows) ? rows.filter(Boolean) : []

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 0.65,
        maxWidth: 300,
        maxHeight: 240,
        overflowY: 'auto',
        pr: 0.5,

        bgcolor: 'background.surface',
        color: 'text.primary',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 'md',
        boxShadow: 'lg',
        p: 1,
      }}
    >
      <Typography level="body-sm" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>

      {safeRows.map((row) => {
        if (Array.isArray(row?.items) && row.items.length) {
          return (
            <Box
              key={row.id || row.label}
              sx={{
                display: 'grid',
                gap: 0.35,
                minWidth: 0,
              }}
            >
              <Typography level="body-xs" sx={{ fontWeight: 700 }}>
                • {row.label}:
              </Typography>

              {row.items.map((item) => (
                <Typography
                  key={item.id || item.text}
                  level="body-xs"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.35,
                    whiteSpace: 'normal',
                  }}
                >
                  - {item.text}
                </Typography>
              ))}
            </Box>
          )
        }

        return (
          <Typography
            key={row.id || row.label}
            level="body-xs"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.35,
              whiteSpace: 'normal',
            }}
          >
            • {row.label}: {row.value}
          </Typography>
        )
      })}
    </Box>
  )
}
