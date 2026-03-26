import { useState, useCallback } from 'react'
import { VIDEO_TAB } from '../logic/videoHub.model'

export function useVideoHubModal(tab) {
  const [modal, setModal] = useState({
    shareOpen: false,
    watchOpen: false,
    attachOpen: false,
    editAnalysisOpen: false,
    editGeneralOpen: false,
    active: null,
  })

  const closeAll = useCallback(() => {
    setModal((m) => ({
      ...m,
      shareOpen: false,
      watchOpen: false,
      attachOpen: false,
      editAnalysisOpen: false,
      editGeneralOpen: false,
      active: null,
    }))
  }, [])

  const open = (key, video) =>
    setModal({
      shareOpen: false,
      watchOpen: false,
      attachOpen: false,
      editAnalysisOpen: false,
      editGeneralOpen: false,
      [key]: true,
      active: video,
    })

  const openEdit = (video) =>
    open(tab === VIDEO_TAB.ANALYSIS ? 'editAnalysisOpen' : 'editGeneralOpen', video)

  return {
    modal,
    open,
    openEdit,
    closeAll,
    setModal,
  }
}
