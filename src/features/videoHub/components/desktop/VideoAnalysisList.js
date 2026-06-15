// videoHub/components/desktop/VideoAnalysisList.js

import React, { useMemo } from 'react'
import { Box } from '@mui/joy'

import VideoAnalysisCard from '../../../../ui/domains/video/videoAnalysis/desktop/videoCard/VideoAnalysisCard.js'
import VideoAnalysisMiniCard from '../../../../ui/domains/video/videoAnalysis/desktop/videoCard/VideoAnalysisMiniCard.js'

export default function VideoAnalysisList({
  items,
  context,
  onShare,
  onWatch,
  onEdit,
  onLink,
  cardView = 'full',
}) {
  const list = useMemo(() => (Array.isArray(items) ? items : []), [items])
  const isMini = cardView === 'mini'
  const CardComponent = isMini ? VideoAnalysisMiniCard : VideoAnalysisCard

  return (
    <Box
      sx={{
        display: 'grid',
        gap: isMini ? 0.9 : 1.25,
        width: '100%',
        mx: 0,
        px: 2,
        pb: 2,
        alignContent: 'start',
        gridTemplateColumns: isMini
          ? 'repeat(auto-fill, minmax(164px, 164px))'
          : 'repeat(auto-fill, minmax(214px, 214px))',
      }}
    >
      {list.map(video => (
        <CardComponent
          key={video?.id || video?.videoId || video?.docId || video?.link}
          video={video}
          preset="videoHub"
          from="videoHub"
          onShare={onShare}
          onWatch={onWatch}
          onEdit={onEdit}
          onLink={onLink}
          context={context}
        />
      ))}
    </Box>
  )
}
