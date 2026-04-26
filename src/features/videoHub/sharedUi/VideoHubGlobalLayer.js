// videoHub/sharedUi/VideoHubGlobalLayer.js

import React from 'react'

import { VIDEO_TAB } from '../logic/videoHub.model.js'

import VideoShareModal from '../components/modal/VideoShareModal.js'
import VideoHubFabMenu from './VideoHubFabMenu.js'
import DriveVideoPlayer from '../../../ui/domains/video/DriveVideoPlayer.js'

export default function VideoHubGlobalLayer({
  tab,
  modal,
  active,
  taskContext,
  onCloseShare,
  onCloseWatch,
  onCreateAnalysis,
  onCreateGeneral,
  onAddTask,
}) {
  return (
    <>
      <VideoShareModal
        open={modal.shareOpen}
        onClose={onCloseShare}
        video={active}
        onSave={onCloseShare}
      />

      <DriveVideoPlayer
        open={modal.watchOpen}
        onClose={onCloseWatch}
        videoLink={active?.link || active?.videoLink || ''}
        videoName={active?.name || active?.title || 'וידאו'}
        variant={tab === VIDEO_TAB.ANALYSIS ? 'analysis' : 'general'}
      />

      <VideoHubFabMenu
        tab={tab}
        taskContext={taskContext}
        onCreateAnalysis={onCreateAnalysis}
        onCreateGeneral={onCreateGeneral}
        onAddTask={onAddTask}
      />
    </>
  )
}
