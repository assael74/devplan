// playerProfile/mobile/modules/videos/components/drawer/EditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

import DrawerShell from '../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { useVideoUpdate } from '../../../../../../hooks/videoAnalysis/useVideoUpdate.js'

import VideoAnalysisEditFields from '../../../../../../../../ui/forms/ui/videoAnalysis/VideoAnalysisEditFields.js'

import {
  buildVideoAnalysisEditInitial,
  buildVideoAnalysisEditPatch,
  buildVideoAnalysisMeta,
  getVideoAnalysisEditFieldErrors,
  getIsVideoAnalysisEditValid,
  isVideoAnalysisEditDirty,
} from '../../../../../../editLogic/videoAnalysis/index.js'

const VIDEO_EDIT_LAYOUT = {
  topCols: { xs: '1fr' },
  mainCols: { xs: '1fr 1fr' },
  notesCols: { xs: '1fr' },
  tagsCols: { xs: '1fr' },
}

export default function EditDrawer({
  open,
  video,
  context,
  onClose,
  onSaved,
}) {
  const initial = useMemo(() => {
    return buildVideoAnalysisEditInitial(video, {
      ...context,
      entityType: 'videoAnalysis',
      objectType: 'player',
      player,
    })
  }, [video, context, player])
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const player = context?.player || null

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

  const { run, pending } = useVideoUpdate(video)
  const canSave = !!initial?.id && isDirty && !pending

  const handleSave = useCallback(async () => {
    if (!canSave) return

    await run('playerVideoEdit', patch, {
      section: 'playerVideoEdit',
      videoId: initial.id,
      createIfMissing: true,
    })

    onSaved(patch, { ...initial.raw, ...patch })
    onClose()
  }, [canSave, run, patch, initial.id, initial.raw, onSaved, onClose])

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft({
      ...initial,
    })
  }, [initial, pending])

  const headerAvatar = player?.photo || playerImage
  const headerTitle = player?.playerFullName || 'שחקן'
  const headerMeta = liveVideo?.metaLabel || `עריכת פרטי וידאו: "${video?.name || 'וידאו'}"`

  const status = isDirty
    ? { text: 'יש שינויים שלא נשמרו', color: 'danger' }
    : { text: 'אין שינויים', color: 'neutral' }

  return (
    <DrawerShell
      entity="player"
      open={open}
      onClose={onClose}
      saving={pending}
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
        reset: 'איפוס השינויים',
      }}
      status={status}
      header={
        <DrawerHeaderShell
          entity="player"
          title={headerTitle}
          avatar={headerAvatar}
          meta={headerMeta}
          metaIconId="videoAnalysis"
        />
      }
    >
      <VideoAnalysisEditFields
        draft={draft}
        onDraft={setDraft}
        context={context}
        fieldErrors={fieldErrors}
        layout={VIDEO_EDIT_LAYOUT}
      />
    </DrawerShell>
  )
}
