import React, { useEffect, useMemo, useState, useCallback } from 'react'

import DrawerShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { resolveEntityAvatar } from '../../../../../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { useVideoUpdate } from '../../../../../../../../../hooks/videoAnalysis/useVideoUpdate.js'

import VideoAnalysisEditFields from '../../../../../../../../../../../ui/forms/ui/videoAnalysis/VideoAnalysisEditFields.js'

import {
  buildInitialDraft,
  buildPatch,
  getIsDirty,
  buildVideoMeta,
} from './editDrawer.utils.js'

export default function EditDrawer({
  open,
  video,
  onClose,
  onSaved,
  context,
}) {
  const initial = useMemo(() => buildInitialDraft(video), [video])
  const [draft, setDraft] = useState(initial)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
    setIsSaving(false)
  }, [open, initial])

  const liveVideo = useMemo(() => {
    const teamId =
      initial?.raw?.teamId ||
      initial?.raw?.team?.id ||
      ''

    const team =
      initial?.raw?.team ||
      (context?.teams || []).find((item) => item?.id === teamId) ||
      context?.team ||
      null

    return {
      ...initial?.raw,
      ...draft,
      teamId,
      team,
      metaLabel: buildVideoMeta({
        ...initial?.raw,
        ...draft,
        team,
      }),
    }
  }, [initial?.raw, draft, context?.teams, context?.team])

  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])
  const patch = useMemo(() => buildPatch(draft, initial), [draft, initial])

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

      onSaved?.(patch, { ...initial.raw, ...patch })
      onClose?.()
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

  const team = liveVideo?.team || context?.team || null

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
        setDraft={setDraft}
        context={context}
      />
    </DrawerShell>
  )
}
