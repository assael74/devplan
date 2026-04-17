// previewDomainCard/domains/player/videos/components/drawer\EditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'

import playerImage from '../../../../../../../../../../../ui/core/images/playerImage.jpg'

import DrawerShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

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
    const playerId = initial?.raw?.playerId || initial?.raw?.player?.id || ''

    const player = initial?.raw?.player || (context?.players || []).find((item) => item?.id === playerId) || null

    return {
      ...initial?.raw,
      ...draft,
      playerId,
      player,
      metaLabel: buildVideoMeta({ ...initial?.raw, ...draft, player, }),
    }
  }, [initial?.raw, draft, context?.players])

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

  const player = liveVideo?.player || null
  const headerAvatar = player?.photo || playerImage
  const headerTitle = player?.playerFullName || liveVideo?.name || 'וידאו'
  const headerMeta = liveVideo?.metaLabel || 'פרטי וידאו'

  const status = saving
    ? { text: 'שומר עדכון...', color: 'warning' }
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
        setDraft={setDraft}
        context={context}
      />
    </DrawerShell>
  )
}
