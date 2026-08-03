import React from 'react'

import { VideoAnalysisMobileList } from '../../../../../../../ui/domains/video/videoAnalysis/mobile/index.js'

export default function PlayerVideosList({
  rows,
  onLinkVideo,
  onEditVideo,
  onWatchVideo,
}) {
  return (
    <VideoAnalysisMobileList
      rows={rows}
      onWatch={onWatchVideo}
      onEdit={onEditVideo}
      onLink={onLinkVideo}
    />
  )
}
