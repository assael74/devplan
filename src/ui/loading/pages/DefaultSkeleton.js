import React from 'react'
import { Box, Skeleton } from '@mui/joy'

export default function DefaultSkeleton() {
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
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 'sm',
          bgcolor: 'background.level1',
          p: 1.25,
        }}
      >
        <Skeleton variant="text" level="h3" sx={{ width: 180, mb: 1 }} />
        <Skeleton variant="rectangular" sx={{ height: 36, borderRadius: 8 }} />
      </Box>

      <Box
        sx={{
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 1.25,
        }}
      >
        {[0, 1, 2, 3].map((item) => (
          <Box
            key={item}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 'sm',
              bgcolor: 'background.surface',
              p: 1.25,
              minHeight: 120,
            }}
          >
            <Skeleton variant="text" sx={{ width: '45%', mb: 1 }} />
            <Skeleton variant="rectangular" sx={{ height: 28, borderRadius: 8, mb: 1 }} />
            <Skeleton variant="rectangular" sx={{ height: 56, borderRadius: 8 }} />
          </Box>
        ))}
      </Box>
    </Box>
  )
}
