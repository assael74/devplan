// src/features/videoHub/components/general/VideoCardGeneral.js
import React from 'react'
import { Box } from '@mui/joy'

import VideoCardBase from '../base/VideoCardBase'
import { videoComponentsSx as sx } from '../components.sx'

import VideoCardMediaBase from '../base/VideoCardMediaBase.js'
import VideoCardHeaderBase from '../base/VideoCardHeaderBase.js'
import VideoTagsBarBase from '../base/VideoTagsBarBase.js'

export default function VideoCardGeneral({ video, onShare, onWatch, onEdit, context }) {
  return (
    <VideoCardBase
      variantKey="videoGeneral"
      sx={sx}
      video={video}
      Media={({ video }) => (
        <VideoCardMediaBase
          sx={sx}
          video={video}
          entityType="videoGeneral"
          onWatch={onWatch}
          menuItems={[
            { id:'share', label:'שיתוף', icon:'share', onClick: () => onShare(video) },
            { id:'edit', label:'עריכת תגים והערות', icon:'tags', onClick: () => onEdit(video) },
            { divider:true },
            { id:'delete', label:'מחיקה', icon:'delete', color:'danger' },
          ]}
        />
      )}
      Header={({ video }) => <VideoCardHeaderBase video={video} />}
      afterHeader={<Box sx={sx.cardTitleDivider} />}
      Tags={
        <VideoTagsBarBase video={video} tagsById={context?.tagsById} iconId="videoGeneral" />
      }
      wrapTags={(node) => <Box sx={sx.tagsZone}>{node}</Box>}
    />
  )
}
