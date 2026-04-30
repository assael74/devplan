import React, { useEffect, useMemo, useState, useCallback } from 'react'

import DrawerShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { resolveEntityAvatar } from '../../../../../../../../../../../ui/core/avatars/fallbackAvatar.js'

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
  const team = context?.team || null

  const initial = useMemo(() => {
    return buildVideoAnalysisEditInitial(video, {
      ...context,
      entityType: 'videoAnalysis',
      objectType: 'team',
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
      team,
      metaLabel: buildVideoAnalysisMeta({ ...initial?.raw, ...draft, team, }),
    }
  }, [initial?.raw, draft, context?.team])

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
  const canSave = !!initial?.id && isDirty && !saving

  const handleSave = useCallback(async () => {
    if (!canSave) return

    try {
      setIsSaving(true)

      await run('videoQuickEdit', patch, {
        section: 'teamVideoQuickEdit',
        videoId: initial.id,
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

  const headerAvatar = resolveEntityAvatar({
    entityType: 'team',
    entity: team,
    parentEntity: team?.club,
    subline: team?.club?.name || team?.clubName || '',
  })

  const headerTitle =
    team?.teamName ||
    team?.name ||
    liveVideo?.name ||
    'וידאו'

  const headerMeta = liveVideo?.metaLabel || 'פרטי וידאו'

  const status = saving
    ? { text: 'שומר עדכון...', color: 'warning' }
    : isDirty
    ? { text: 'יש שינויים שלא נשמרו', color: 'danger' }
    : { text: 'אין שינויים', color: 'neutral' }

  return (
    <DrawerShell
      entity="team"
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
          entity="team"
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
