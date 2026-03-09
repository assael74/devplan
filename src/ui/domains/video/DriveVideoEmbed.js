// src/ui/video/DriveVideoEmbed.js
import React, { useMemo } from 'react'
import { Box, Typography } from '@mui/joy'
import { getDrivePreviewUrl } from '../../../shared/media/driveLinks'

export default function DriveVideoEmbed({ link, height = 360, radius = 12 }) {
  const src = useMemo(() => getDrivePreviewUrl(link), [link])

  if (!src) {
    return (
      <Typography level="body-sm" sx={{ p: 2 }}>
        לא ניתן להציג את הוידאו – הקישור שגוי או חסר
      </Typography>
    )
  }

  return (
    <Box sx={{ width: '100%', overflow: 'hidden', borderRadius: radius }}>
      <iframe
        src={src}
        width="100%"
        height={height}
        style={{
          border: 'none',
          borderRadius: radius,
          display: 'block',
          overflow: 'hidden',
        }}
        allow="fullscreen"
        allowFullScreen
        title="Drive video"
      />
    </Box>
  )
}
