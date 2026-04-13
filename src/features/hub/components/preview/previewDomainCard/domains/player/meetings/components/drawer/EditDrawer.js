// previewDomainCard/domains/player/meetings/components/drawer/EditDrawer.js

import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { Box } from '@mui/joy'

import playerImage from '../../../../../../../../../../ui/core/images/playerImage.jpg'

import DrawerShell from '../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import MeetingCreateFields from '../../../../../../../../../../ui/forms/ui/meetings/MeetingCreateFields.js'

import { useMeetingHubUpdate } from '../../../../../../../../hooks/meetings/useMeetingHubUpdate.js'
import { useVideoUpdate } from '../../../../../../../../hooks/videoAnalysis/useVideoUpdate.js'
import { useLifecycle } from '../../../../../../../../../../ui/domains/entityLifecycle/LifecycleProvider'

import {
  buildInitialDraft,
  buildPatch,
  getFieldErrors,
  getIsDirty,
  getIsValid,
} from './editDrawer.utils.js'

const layout = {
  topCols: { xs: '1fr', md: '1fr 1fr' },
  mainCols: { xs: '1fr', md: '1fr 1fr' },
  metaCols: { xs: '1fr', md: '1fr' },
}

export default function EditDrawer({
  open,
  meeting,
  onClose,
  onSaved,
  context,
}) {
  const initial = useMemo(() => buildInitialDraft(meeting), [meeting])
  const lifecycle = useLifecycle()
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const liveMeeting = useMemo(() => {
    return {
      ...initial?.raw,
      ...draft,
    }
  }, [initial?.raw, draft])

  const validity = useMemo(() => getFieldErrors(draft), [draft])
  const isValid = useMemo(() => getIsValid(draft), [draft])
  const isDirty = useMemo(() => getIsDirty(initial, draft), [initial, draft])

  const { meetingPatch, videoPlan } = useMemo(() => buildPatch(initial, draft), [initial, draft])

  const videoRuntimeId =
    videoPlan?.unlinkPrev?.videoId ||
    videoPlan?.linkNext?.videoId ||
    draft?.videoId ||
    ''

  const { run: runMeetingUpdate, pending: meetingPending } = useMeetingHubUpdate(initial?.raw)
  const { run: runVideoUpdate, pending: videoPending } = useVideoUpdate(
    initial?.rawVideo || null,
    videoRuntimeId
  )

  const pending = meetingPending || videoPending
  const canSave = !!initial?.id && isDirty && isValid && !pending

  const handleSave = useCallback(async () => {
    if (!canSave) return

    if (Object.keys(meetingPatch).length > 0) {
      await runMeetingUpdate('meetingQuickEdit', meetingPatch, {
        section: 'playerMeetingsQuickEdit',
        id: initial.id,
        meetingId: initial.id,
      })
    }

    if (videoPlan?.unlinkPrev) {
      await runVideoUpdate('meetingVideoUnlink', videoPlan.unlinkPrev.patch, {
        section: 'meetingVideoUnlink',
        videoId: videoPlan.unlinkPrev.videoId,
      })
    }

    if (videoPlan?.linkNext) {
      await runVideoUpdate('meetingVideoLink', videoPlan.linkNext.patch, {
        section: 'meetingVideoLink',
        videoId: videoPlan.linkNext.videoId,
      })
    }

    onSaved(
      { meetingPatch, videoPlan },
      { ...initial.raw, ...meetingPatch }
    )

    onClose()
  }, [
    canSave,
    meetingPatch,
    videoPlan,
    runMeetingUpdate,
    runVideoUpdate,
    initial.id,
    initial.raw,
    onSaved,
    onClose,
  ])

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft(initial)
  }, [initial, pending])

  const handleDelete = useCallback(() => {
    if (!meeting?.id) return

    lifecycle.openLifecycle(
      {
        entityType: 'meeting',
        id: meeting.id,
        name: meeting?.meetingDate || meeting?.title || 'פגישה',
      },
      {
        onAfterSuccess: ({ action, entityType, id }) => {
          if (action !== 'delete') return
          if (entityType !== 'meeting') return
          if (id !== meeting.id) return

          onClose?.()
          onSaved?.(null, null, { deletedId: meeting.id })
        },
      }
    )
  }, [lifecycle, meeting, onClose, onSaved])

  const player = liveMeeting?.player || context?.player || {}
  const headerAvatar = player?.photo || playerImage
  const headerTitle = player?.playerFullName || 'פגישה'
  const headerMeta = liveMeeting?.metaLabel || draft?.metaLabel || 'פרטי פגישה'

  const status = !isValid
    ? { text: 'יש להשלים נתונים תקינים', color: 'warning' }
    : isDirty
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
        onDelete: handleDelete,
      }}
      texts={{
        save: 'שמירה',
        saving: 'שומר...',
        cancel: 'ביטול',
      }}
      tooltips={{
        reset: 'איפוס השינויים',
        delete: 'מחיקת פגישה',
      }}
      status={status}
      header={
        <DrawerHeaderShell
          entity="player"
          title={headerTitle}
          avatar={headerAvatar}
          meta={headerMeta}
          metaIconId="meetings"
        />
      }
    >
      <Box className="dpScrollThin" sx={{ display: 'grid', gap: 1, minHeight: 0 }}>
        <MeetingCreateFields
          draft={draft}
          onDraft={setDraft}
          context={context}
          validity={validity}
          layout={layout}
        />
      </Box>
    </DrawerShell>
  )
}
