import React from 'react'
import { Box, Skeleton } from '@mui/joy'

export default function HubSkeleton() {
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
          display: 'grid',
          gap: 1,
        }}
      >
        <Skeleton variant="text" level="h3" sx={{ width: 180 }} />
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {[0, 1, 2, 3, 4].map((item) => (
            <Skeleton key={item} variant="rectangular" sx={{ width: 96, height: 34, borderRadius: 8 }} />
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 340px' },
          gap: 1.25,
        }}
      >
        <Box
          sx={{
            minHeight: 0,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 'sm',
            bgcolor: 'background.surface',
            p: 1.25,
            display: 'grid',
            gridTemplateRows: 'auto minmax(0, 1fr)',
            gap: 1,
          }}
        >
          <Skeleton variant="rectangular" sx={{ height: 46, borderRadius: 8 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1 }}>
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} variant="rectangular" sx={{ height: 124, borderRadius: 8 }} />
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            display: { xs: 'none', lg: 'grid' },
            minHeight: 0,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 'sm',
            bgcolor: 'background.surface',
            p: 1.25,
            gridTemplateRows: 'auto minmax(0, 1fr)',
            gap: 1,
          }}
        >
          <Skeleton variant="rectangular" sx={{ height: 38, borderRadius: 8 }} />
          <Box sx={{ display: 'grid', gap: 0.75, alignContent: 'start' }}>
            {[0, 1, 2, 3, 4].map((item) => (
              <Skeleton key={item} variant="rectangular" sx={{ height: 58, borderRadius: 8 }} />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
