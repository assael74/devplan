// teamProfile/mobile/modules/videos/components/drawer/EditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'

import DrawerShell from '../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { useVideoUpdate } from '../../../../../../hooks/videoAnalysis/useVideoUpdate.js'

import VideoAnalysisEditFields from '../../../../../../../../ui/forms/ui/videoAnalysis/VideoAnalysisEditFields.js'

import {
  buildInitialDraft,
  buildPatch,
  getIsDirty,
  buildVideoMeta,
} from '../../../../../sharedLogic/videos'

export default function EditDrawer({
  open,
  video,
  context,
  onClose,
  onSaved,
}) {
  const initial = useMemo(() => buildInitialDraft(video), [video])
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const team = context?.team || null

  const liveVideo = useMemo(() => {
    return {
      ...initial?.raw,
      ...draft,
      team,
      metaLabel: buildVideoMeta({
        ...initial?.raw,
        ...draft,
        team,
      }),
    }
  }, [initial?.raw, draft, team])

  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])
  const patch = useMemo(() => buildPatch(draft, initial), [draft, initial])

  const { run, pending } = useVideoUpdate(video)
  const canSave = !!initial?.id && isDirty && !pending

  const handleSave = useCallback(async () => {
    if (!canSave) return

    await run('teamVideoEdit', patch, {
      section: 'teamVideoEdit',
      videoId: initial.id,
    })

    onSaved?.(patch, { ...initial.raw, ...patch })
    onClose?.()
  }, [canSave, run, patch, initial.id, initial.raw, onSaved, onClose])

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft({
      ...initial,
    })
  }, [initial, pending])

  const headerAvatar = resolveEntityAvatar({
    entityType: 'team',
    entity: team,
    parentEntity: team?.club,
    subline: team?.club?.name || team?.clubName || '',
  })

  const headerTitle = team?.teamName || 'קבוצה'
  const headerMeta = liveVideo?.metaLabel || `עריכת פרטי וידאו: "${video?.name || 'וידאו'}"`

  const status = isDirty
    ? { text: 'יש שינויים שלא נשמרו', color: 'danger' }
    : { text: 'אין שינויים', color: 'neutral' }

  return (
    <DrawerShell
      entity="team"
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
          entity="team"
          title={headerTitle}
          avatar={headerAvatar}
          meta={headerMeta}
          metaIconId="videoAnalysis"
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
