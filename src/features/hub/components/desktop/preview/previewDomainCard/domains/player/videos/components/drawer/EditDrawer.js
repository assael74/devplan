// previewDomainCard/domains/player/videos/components/drawer/EditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'

import playerImage from '../../../../../../../../../../../ui/core/images/playerImage.jpg'

import DrawerShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { useVideoUpdate } from '../../../../../../../../../hooks/videoAnalysis/useVideoUpdate.js'

import VideoAnalysisEditFields from '../../../../../../../../../../../ui/forms/ui/videoAnalysis/VideoAnalysisEditFields.js'

import {
  buildVideoAnalysisEditInitial,
  buildVideoAnalysisEditPatch,
  buildVideoAnalysisMeta,
  getVideoAnalysisEditFieldErrors,
  getIsVideoAnalysisEditValid,
  isVideoAnalysisEditDirty,
} from '../../../../../../../../../editLogic/videoAnalysis/index.js'

export default function EditDrawer({
  open,
  video,
  onClose,
  onSaved,
  context,
}) {
  const player = context?.player || {}
  const initial = useMemo(() => {
    return buildVideoAnalysisEditInitial(video, {
      ...context,
      entityType: 'videoAnalysis',
      objectType: 'player',
    })
  }, [video, context])

  const [draft, setDraft] = useState(initial)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
    setIsSaving(false)
  }, [open, initial])

  const liveVideo = useMemo(() => {
    return {
      ...initial?.raw,
      ...draft,
      player,
      metaLabel: buildVideoAnalysisMeta({ ...initial?.raw, ...draft, player, }),
    }
  }, [initial?.raw, draft, player])

  const fieldErrors = useMemo(() => {
    return getVideoAnalysisEditFieldErrors(draft)
  }, [draft])

  const isValid = useMemo(() => {
    return getIsVideoAnalysisEditValid(draft)
  }, [draft])

  const isDirty = useMemo(() => {
    return isVideoAnalysisEditDirty(draft, initial)
  }, [draft, initial])

  const patch = useMemo(() => {
    return buildVideoAnalysisEditPatch(draft, initial)
  }, [draft, initial])

  const { run, pending } = useVideoUpdate(initial?.raw)

  const saving = isSaving || pending
  const canSave = !!initial?.id && isDirty && isValid && !saving

  const handleSave = useCallback(async () => {
    if (!canSave) return

    try {
      setIsSaving(true)

      await run('videoQuickEdit', patch, {
        section: 'playerVideoQuickEdit',
        videoId: initial.id,
        createIfMissing: false,
      })

      onSaved(patch, { ...initial.raw, ...patch })
      onClose()
    } catch (error) {
      console.error('EditDrawer save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }, [canSave, run, patch, initial.id, initial.raw, onSaved, onClose])

  const handleReset = useCallback(() => {
    if (saving) return
    setDraft(initial)
  }, [saving, initial])

  const headerAvatar = player?.photo || playerImage
  const headerTitle = player?.playerFullName || liveVideo?.name || 'וידאו'
  const headerMeta = liveVideo?.metaLabel || 'פרטי וידאו'

  const status = saving
    ? { text: 'שומר עדכון...', color: 'warning' }
    : !isValid
    ? { text: 'יש להזין קישור וידאו', color: 'warning' }
    : isDirty
    ? { text: 'יש שינויים שלא נשמרו', color: 'danger' }
    : { text: 'אין שינויים', color: 'neutral' }

  return (
    <DrawerShell
      entity="player"
      open={open}
      onClose={onClose}
      saving={saving}
      isDirty={isDirty}
      canSave={canSave}
      actions={{
        onSave: handleSave,
        onReset: handleReset,
      }}
      texts={{
        save: 'שמירה',
        saving: 'שומר...',
        cancel: 'ביטול',
      }}
      tooltips={{
        reset: 'איפוס טופס',
      }}
      status={status}
      header={
        <DrawerHeaderShell
          entity="player"
          title={headerTitle}
          avatar={headerAvatar}
          meta={headerMeta}
          metaIconId="videos"
        />
      }
    >
      <VideoAnalysisEditFields
        draft={draft}
        onDraft={setDraft}
        context={context}
        fieldErrors={fieldErrors}
      />
    </DrawerShell>
  )
}
