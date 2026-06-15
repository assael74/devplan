import React from 'react'
import { Box, Skeleton } from '@mui/joy'

export default function VideoSkeleton() {
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
        <Skeleton variant="text" level="h3" sx={{ width: 180 }} />
        <Skeleton variant="rectangular" sx={{ width: 132, height: 36, borderRadius: 8 }} />
      </Box>

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
        <Skeleton variant="rectangular" sx={{ height: 40, borderRadius: 8 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 1 }}>
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} variant="rectangular" sx={{ height: 36, borderRadius: 8 }} />
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' },
          gap: 1.25,
          alignContent: 'start',
        }}
      >
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <Skeleton key={item} variant="rectangular" sx={{ height: 144, borderRadius: 8 }} />
        ))}
      </Box>
    </Box>
  )
}
