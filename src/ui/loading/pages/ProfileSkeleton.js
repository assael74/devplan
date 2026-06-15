import React from 'react'
import { Box, Skeleton } from '@mui/joy'

export default function ProfileSkeleton() {
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
          gridTemplateColumns: 'auto minmax(0, 1fr) auto',
          alignItems: 'center',
          gap: 1.25,
        }}
      >
        <Skeleton variant="circular" sx={{ width: 64, height: 64 }} />
        <Box>
          <Skeleton variant="text" level="h3" sx={{ width: 240, mb: 0.5 }} />
          <Skeleton variant="text" sx={{ width: 320, maxWidth: '80%' }} />
        </Box>
        <Skeleton variant="rectangular" sx={{ width: 120, height: 36, borderRadius: 8 }} />
      </Box>

      <Box
        sx={{
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 320px' },
          gap: 1.25,
        }}
      >
        <Box
          sx={{
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 1.25,
            alignContent: 'start',
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} variant="rectangular" sx={{ height: 126, borderRadius: 8 }} />
          ))}
        </Box>

        <Box sx={{ display: { xs: 'none', lg: 'grid' }, gap: 1, alignContent: 'start' }}>
          <Skeleton variant="rectangular" sx={{ height: 44, borderRadius: 8 }} />
          {[0, 1, 2, 3, 4].map((item) => (
            <Skeleton key={item} variant="rectangular" sx={{ height: 62, borderRadius: 8 }} />
          ))}
        </Box>
      </Box>
    </Box>
  )
}
