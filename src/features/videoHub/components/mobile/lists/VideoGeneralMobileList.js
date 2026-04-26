// src/features/videoHub/components/mobile/lists/VideoGeneralMobileList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import VideoGeneralMobileCard from '../../../../../ui/domains/video/videoGeneral/mobile/videoCard/VideoGeneralMobileCard.js'

export default function VideoGeneralMobileList({
  items = [],
  onWatch,
  onEdit,
  onShare,
  onDelete,
}) {
  if (!items.length) {
    return (
      <Box
        sx={{
          minHeight: 180,
          borderRadius: 22,
          border: '1px dashed',
          borderColor: 'divider',
          bgcolor: 'background.surface',
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
          p: 2,
        }}
      >
        <Box sx={{ maxWidth: 280 }}>
          <Typography level="title-md" sx={{ fontWeight: 900 }}>
            אין סרטונים להצגה
          </Typography>

          <Typography level="body-sm" sx={{ mt: 0.75, color: 'text.secondary' }}>
            לאחר חיבור הפילטרים והמיון, יוצגו כאן הסרטונים הכלליים.
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1,
        alignContent: 'start',
        width: '100%',
      }}
    >
      {items.map((video) => (
        <VideoGeneralMobileCard
          key={video?.id || video?.docId || video?.link || video?.videoLink}
          video={video}
          onWatch={onWatch}
          onEdit={onEdit}
          onShare={onShare}
          onDelete={onDelete}
        />
      ))}
    </Box>
  )
}
