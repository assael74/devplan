// src/features/videoHub/sharedUi/VideoHubDrawersLayer.js

import React from 'react'

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

  return (
    <>
      <EditDrawer
        mode={VIDEO_EDIT_DRAWER_MODE.ATTACH}
        entityType="analysis"
        open={modal.attachOpen}
        onClose={onCloseAttach}
        video={active}
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
        video={active}
        context={context}
        anchor={anchor}
        onSave={onSaveEditAnalysis}
      />

      <EditDrawer
        mode={VIDEO_EDIT_DRAWER_MODE.GENERAL_EDIT}
        entityType="general"
        open={modal.editGeneralOpen}
        onClose={onCloseEditGeneral}
        video={active}
        context={context}
        anchor={anchor}
        onSaved={onSavedEditGeneral}
      />
    </>
  )
}
