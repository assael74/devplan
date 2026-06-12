// src/features/videoHub/sharedUi/VideoHubDrawersLayer.js

import React, { useRef } from 'react'

import EditDrawer from './editDrawer/EditDrawer.js'
import { VIDEO_EDIT_DRAWER_MODE } from '../logic/drawer/editDrawer.logic.js'

export default function VideoHubDrawersLayer({
  modal,
  active,
  context,
  isMobile,

  onCloseAttach,
  onCloseEditAnalysis,
  onCloseEditGeneral,

  onSaveAttach,
  onSaveEditAnalysis,

  onSavedEditGeneral,

  attachLocks,
  objectTypeOptions,
  contextTypeOptions,
}) {
  const anchor = isMobile ? 'bottom' : 'right'
  const lastDrawerVideoRef = useRef(null)
  const drawerOpen = Boolean(
    modal?.attachOpen ||
    modal?.editAnalysisOpen ||
    modal?.editGeneralOpen
  )

  if (drawerOpen && active) {
    lastDrawerVideoRef.current = active
  }

  const drawerVideo = drawerOpen && active ? active : lastDrawerVideoRef.current

  return (
    <>
      <EditDrawer
        mode={VIDEO_EDIT_DRAWER_MODE.ATTACH}
        entityType="analysis"
        open={modal.attachOpen}
        onClose={onCloseAttach}
        video={drawerVideo}
        context={context}
        anchor={anchor}
        locks={attachLocks}
        objectTypeOptions={objectTypeOptions}
        contextTypeOptions={contextTypeOptions}
        onSave={onSaveAttach}
      />

      <EditDrawer
        mode={VIDEO_EDIT_DRAWER_MODE.ANALYSIS_EDIT}
        entityType="analysis"
        open={modal.editAnalysisOpen}
        onClose={onCloseEditAnalysis}
        video={drawerVideo}
        context={context}
        anchor={anchor}
        onSave={onSaveEditAnalysis}
      />

      <EditDrawer
        mode={VIDEO_EDIT_DRAWER_MODE.GENERAL_EDIT}
        entityType="general"
        open={modal.editGeneralOpen}
        onClose={onCloseEditGeneral}
        video={drawerVideo}
        context={context}
        anchor={anchor}
        onSaved={onSavedEditGeneral}
      />
    </>
  )
}
