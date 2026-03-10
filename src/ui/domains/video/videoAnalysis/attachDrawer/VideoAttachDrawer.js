// videoHub/components/analysis/attachDrawer/VideoAttachDrawer.js
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { Drawer, Sheet } from '@mui/joy'
import {
  buildOriginal,
  useAttachDrawerModel,
  applyLocks,
  sanitizeByMode,
  isValidDraft,
  isDirty,
  buildPatch,
} from './videoAttachDrawer.logic'
import { VIDEOANALYSIS_CONTEXTTYPES } from '../../../../../shared/videoAnalysis/videoAnalysis.constants.js'
import VideoAttachDrawerHeader from './VideoAttachDrawerHeader'
import VideoAttachDrawerBody from './VideoAttachDrawerBody'
import VideoAttachDrawerFooter from './VideoAttachDrawerFooter'
import { videoAttachDrawerSx as sx } from '../sx/videoAttachDrawer.sx'

export default function VideoAttachDrawer({ open, onClose, video, context, onSave }) {
  // avoid `{}` identity churn when missing
  const locks = video?.__locks ?? null

  const original = useMemo(() => buildOriginal(video), [video])
  const [draft, setDraft] = useState(original)
  const [busy, setBusy] = useState(false)
  // prevents init-loop when `video` identity churns while drawer is open
  const lastInitRef = useRef({ open: false, videoId: null })

  useEffect(() => {
    if (!open) {
      lastInitRef.current = { open: false, videoId: null }
      return
    }

    const vid = video?.id || null
    const prev = lastInitRef.current || { open: false, videoId: null }
    if (prev.open && prev.videoId === vid) return

    lastInitRef.current = { open: true, videoId: vid }
    setDraft(original)
  }, [open, video?.id, original])

  useEffect(() => {
    if (!open) return
    const hasLocks = !!locks && Object.keys(locks).length > 0
    if (!hasLocks) return

    const { next, changed } = applyLocks(draft, locks)
    if (changed) setDraft(next)
  }, [draft, locks, open])

  const model = useAttachDrawerModel({ draft, context, locks: locks || {} })

  useEffect(() => {
    if (!open) return

    const next = sanitizeByMode(draft, model)

    // idempotent guard by fields (not by object reference)
    const same =
      (next?.contextType || '') === (draft?.contextType || '') &&
      (next?.objectType || '') === (draft?.objectType || '') &&
      (next?.meetingId || '') === (draft?.meetingId || '') &&
      (next?.teamId || '') === (draft?.teamId || '') &&
      (next?.playerId || '') === (draft?.playerId || '')

    if (!same) setDraft(next)
  }, [
    open,
    draft.contextType,
    draft.objectType,
    draft.meetingId,
    draft.teamId,
    draft.playerId,
    model.isMeetingMode,
    model.isEntityMode,
    model.isFloating,
  ])

  const dirty = useMemo(() => isDirty(draft, original), [draft, original])
  const valid = useMemo(() => isValidDraft(draft, model), [draft, model])
  const saveDisabled = !dirty || !valid || busy || !video?.id

  const reset = useCallback(() => setDraft(original), [original])

  const handleSave = useCallback(async () => {
    if (saveDisabled) return
    if (typeof onSave !== 'function') return

    try {
      setBusy(true)
      await onSave({ video, patch: buildPatch(draft) })
      onClose()
    } catch (e) {
      console.error('[VideoAttachDrawer] save failed', e)
    } finally {
      setBusy(false)
    }
  }, [saveDisabled, onSave, draft, video, onClose])

  const title = video?.name || 'שיוך וידאו'
  const contextTypeOptions = useMemo(() => VIDEOANALYSIS_CONTEXTTYPES, [])

  return (
    <Drawer open={!!open} onClose={onClose} anchor="right" slotProps={{ content: { sx: sx.content } }}>
      <Sheet variant="outlined" sx={sx.sheet}>
        <VideoAttachDrawerHeader title={title} onClose={onClose} />

        <VideoAttachDrawerBody
          draft={draft}
          setDraft={setDraft}
          context={context}
          locks={locks || {}}
          disabled={model.disabled}
          isMeetingMode={model.isMeetingMode}
          isEntityMode={model.isEntityMode}
          objectTypeOptions={model.objectTypeOptions}
          contextTypeOptions={contextTypeOptions}
        />

        <VideoAttachDrawerFooter
          dirty={dirty}
          busy={busy}
          saveDisabled={saveDisabled}
          onReset={reset}
          onSave={handleSave}
        />
      </Sheet>
    </Drawer>
  )
}
