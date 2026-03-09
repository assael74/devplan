// features/hub/hooks/useVideoHubModal.js
import { useState, useCallback } from 'react'

const emptyState = {
  shareOpen: false,
  watchOpen: false,
  attachOpen: false,
  editAnalysisOpen: false,
  editGeneralOpen: false,
  active: null,     // video object only
  payload: null,    // { video, entity, context }
}

const normalizePayload = (p) => {
  if (!p) return { video: null, entity: null, context: null }
  if (p?.video) return { video: p.video || null, entity: p.entity || null, context: p.context || null }
  // if someone sent raw video by mistake:
  return { video: p || null, entity: null, context: null }
}

export function useVideoModal(tab = 'analysis') {
  const [modal, setModal] = useState(emptyState)

  const closeAll = useCallback(() => setModal(emptyState), [])

  const open = useCallback((key, payloadInput) => {
    const payload = normalizePayload(payloadInput)
    setModal({
      ...emptyState,
      [key]: true,
      active: payload.video,
      payload,
    })
  }, [])

  const openWatch = useCallback((payload) => open('watchOpen', payload), [open])
  const openShare = useCallback((payload) => open('shareOpen', payload), [open])
  const openAttach = useCallback((payload) => open('attachOpen', payload), [open])

  const openEdit = useCallback((payload) => {
    // לפי ההודעה שלך: כאן תמיד analysis
    const key = tab === 'analysis' ? 'editAnalysisOpen' : 'editGeneralOpen'
    open(key, payload)
  }, [open, tab])

  return {
    modal,
    setModal,
    closeAll,
    open,
    openWatch,
    openShare,
    openAttach,
    openEdit,
  }
}
