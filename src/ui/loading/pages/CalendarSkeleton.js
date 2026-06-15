import React from 'react'
import { Box, Skeleton } from '@mui/joy'

export default function CalendarSkeleton() {
  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'grid',
        gridTemplateRows: 'auto minmax(0, 1fr)',
        gap: 1.25,
        p: { xs: 1, md: 1.5 },
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'auto 1fr auto' },
          alignItems: 'center',
          gap: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 'sm',
          bgcolor: 'background.level1',
          p: 1.25,
        }}
      >
        <Skeleton variant="rectangular" sx={{ width: 132, height: 36, borderRadius: 8 }} />
        <Skeleton variant="text" level="h3" sx={{ width: 210, justifySelf: 'center' }} />
        <Skeleton variant="rectangular" sx={{ width: 132, height: 36, borderRadius: 8 }} />
      </Box>

      <Box
        sx={{
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(7, 1fr)' },
          gap: 1,
        }}
      >
        {Array.from({ length: 7 }).map((_, day) => (
          <Box
            key={day}
            sx={{
              minHeight: 0,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 'sm',
              bgcolor: 'background.surface',
              p: 1,
              display: 'grid',
              gridTemplateRows: 'auto minmax(0, 1fr)',
              gap: 1,
            }}
          >
            <Skeleton variant="text" sx={{ width: '55%' }} />
            <Box sx={{ display: 'grid', gap: 0.75, alignContent: 'start' }}>
              {[0, 1, 2].map((item) => (
                <Skeleton key={item} variant="rectangular" sx={{ height: 58, borderRadius: 8 }} />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
