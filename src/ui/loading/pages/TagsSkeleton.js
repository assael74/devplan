import React from 'react'
import { Box, Skeleton } from '@mui/joy'

export default function TagsSkeleton() {
  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'grid',
        gridTemplateRows: 'auto auto minmax(0, 1fr)',
        gap: 1.25,
        p: { xs: 1, md: 1.5 },
      }}
    >
      <Skeleton variant="text" level="h3" sx={{ width: 170 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, gap: 1 }}>
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} variant="rectangular" sx={{ height: 38, borderRadius: 8 }} />
        ))}
      </Box>
      <Box sx={{ minHeight: 0, display: 'grid', gap: 1, alignContent: 'start' }}>
        {[0, 1, 2, 3, 4, 5, 6].map((item) => (
          <Skeleton key={item} variant="rectangular" sx={{ height: 64, borderRadius: 8 }} />
        ))}
      </Box>
    </Box>
  )
}
