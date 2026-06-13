// videoHub/sharedUi/VideoHubGlobalLayer.js

import React, { useState } from 'react'

import { VIDEO_TAB } from '../logic/videoHub.model.js'

import VideoShareModal from '../components/modal/VideoShareModal.js'
import VideoHubFabMenu from './VideoHubFabMenu.js'
import DriveVideoPlayer from '../../../ui/domains/video/DriveVideoPlayer.js'
import { BulkVideosImportDrawer } from '../../bulkActions/videos/import/index.js'

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
  const [importOpen, setImportOpen] = useState(false)

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

      <BulkVideosImportDrawer
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />

      <VideoHubFabMenu
        tab={tab}
        taskContext={taskContext}
        onCreateAnalysis={onCreateAnalysis}
        onCreateGeneral={onCreateGeneral}
        onImportVideos={() => setImportOpen(true)}
        onAddTask={onAddTask}
      />
    </>
  )
}
