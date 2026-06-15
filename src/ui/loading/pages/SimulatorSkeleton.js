import React from 'react'
import { Box, Skeleton } from '@mui/joy'

export default function SimulatorSkeleton() {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center' }}>
        <Skeleton variant="text" level="h3" sx={{ width: 220 }} />
        <Skeleton variant="rectangular" sx={{ width: 128, height: 36, borderRadius: 8 }} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' }, gap: 1 }}>
        {[0, 1, 2, 3, 4].map((item) => (
          <Skeleton key={item} variant="rectangular" sx={{ height: 42, borderRadius: 8 }} />
        ))}
      </Box>
      <Box sx={{ minHeight: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '360px 1fr' }, gap: 1.25 }}>
        <Skeleton variant="rectangular" sx={{ minHeight: 360, borderRadius: 8 }} />
        <Skeleton variant="rectangular" sx={{ minHeight: 360, borderRadius: 8 }} />
      </Box>
    </Box>
  )
}
