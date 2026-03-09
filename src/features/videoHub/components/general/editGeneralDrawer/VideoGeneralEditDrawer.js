import React from 'react'

import VideoEditDrawerBase from '../../base/drawer/VideoEditDrawerBase'
import VideoEditDrawerFooterBase from '../../base/drawer/VideoEditDrawerFooterBase.js'
import VideoEditDrawerHeaderBase from '../../base/drawer/VideoEditDrawerHeaderBase.js'

import VideoGeneralEditDrawerBody from './VideoGeneralEditDrawerBody'

import { buildOriginal, isDirty, buildPatch } from './videoGeneralEditDrawer.logic.js'
import { buildVideoEditDrawerSx } from '../../base/drawer/videoEditDrawerBase.sx'

const adapter = { buildOriginal, isDirty, buildPatch }
const sx = buildVideoEditDrawerSx('videoGeneral')

export default function VideoEditDrawer({ open, onClose, video, onSave, context }) {
  return (
    <VideoEditDrawerBase
      open={open}
      onClose={onClose}
      video={video}
      onSave={onSave}
      context={context}
      adapter={adapter}
      Header={(props) => <VideoEditDrawerHeaderBase {...props} sx={sx} />}
      Body={(props) => <VideoGeneralEditDrawerBody {...props} sx={sx} />}
      Footer={(props) => <VideoEditDrawerFooterBase {...props} sx={sx} />}
      sx={sx}
      titleFallback="עריכת וידאו"
    />
  )
}
