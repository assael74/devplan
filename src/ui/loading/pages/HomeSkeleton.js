import React from 'react'
import { Box, Skeleton } from '@mui/joy'

export default function HomeSkeleton() {
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
          gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
          alignItems: 'center',
          gap: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 'sm',
          bgcolor: 'background.level1',
          p: 1.25,
        }}
      >
        <Box>
          <Skeleton variant="text" level="h3" sx={{ width: 220, mb: 0.5 }} />
          <Skeleton variant="text" sx={{ width: 340, maxWidth: '80%' }} />
        </Box>
        <Skeleton variant="rectangular" sx={{ width: 120, height: 34, borderRadius: 8 }} />
      </Box>

      <Box
        sx={{
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 1.25,
        }}
      >
        {[0, 1].map((section) => (
          <Box
            key={section}
            sx={{
              minHeight: 0,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 'sm',
              bgcolor: 'background.surface',
              p: 1.25,
              display: 'grid',
              gridTemplateRows: 'auto auto minmax(0, 1fr)',
              gap: 1,
            }}
          >
            <Skeleton variant="text" level="title-lg" sx={{ width: 190 }} />
            <Skeleton variant="rectangular" sx={{ height: 48, borderRadius: 8 }} />
            <Box sx={{ display: 'grid', gap: 1 }}>
              {[0, 1, 2, 3].map((item) => (
                <Skeleton
                  key={item}
                  variant="rectangular"
                  sx={{ height: 74, borderRadius: 8 }}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
