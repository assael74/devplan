// src/features/videoHub/components/general/VideoGeneralList.js
import React from 'react'
import VideoListBase from '../base/VideoListBase'
import VideoCardGeneral from './VideoCardGeneral'
import { videoComponentsSx as sx } from '../components.sx'

export default function VideoGeneralList({
  items,
  context,
  onShare,
  onWatch,
  onEdit,
}) {
  return (
    <VideoListBase
      items={items}
      sx={sx}
      gridKey="videoGeneral"
      emptyTitle="עדיין לא נוצרו קטעי וידאו"
      renderItem={(v) => (
        <VideoCardGeneral
          key={v.id}
          video={v}
          context={context}
          onShare={() => typeof onShare === 'function' && onShare(v)}
          onWatch={() => typeof onWatch === 'function' && onWatch(v)}
          onEdit={() => typeof onEdit === 'function' && onEdit(v)}
        />
      )}
    />
  )
}
