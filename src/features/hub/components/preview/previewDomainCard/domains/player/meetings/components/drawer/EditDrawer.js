// previewDomainCard/domains/player/meetings/components/drawer/EditDrawer.js

import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { Drawer, Sheet, Box, Typography, Button, IconButton, Tooltip } from '@mui/joy'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { useMeetingHubUpdate } from '../../../../../../../../hooks/meetings/useMeetingHubUpdate.js'
import { useVideoUpdate } from '../../../../../../../../hooks/videoAnalysis/useVideoUpdate.js'
import { useLifecycle } from '../../../../../../../../../../ui/domains/entityLifecycle/LifecycleProvider'

import EditDrawerHeader from './EditDrawerHeader.js'
import EditFormDrawer from './EditFormDrawer.js'

import { buildInitialDraft, buildPatch, getIsDirty } from './editDrawer.utils.js'
import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

export default function EditDrawer({ open, meeting, onClose, onSaved, context }) {
  const initial = useMemo(() => buildInitialDraft(meeting), [meeting])
  const lifecycle = useLifecycle()
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    setDraft(initial)
  }, [initial])

  const liveMeeting = useMemo(() => {
    return {
      ...initial?.raw,
      ...draft,
    }
  }, [initial?.raw, draft])

  const isDirty = useMemo(() => getIsDirty(initial, draft), [initial, draft])
  const { meetingPatch, videoPlan } = useMemo(() => buildPatch(initial, draft), [initial, draft])
  const videoRuntimeId = videoPlan?.unlinkPrev?.videoId || videoPlan?.linkNext?.videoId || draft?.videoId || ''

  const { run: runMeetingUpdate, pending: meetingPending } = useMeetingHubUpdate(initial?.raw)
  const { run: runVideoUpdate, pending: videoPending } = useVideoUpdate(initial?.rawVideo || null, videoRuntimeId)

  const pending = meetingPending || videoPending
  const canSave = !!initial?.id && isDirty && !pending

  const handleSave = async () => {
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

    onSaved({ meetingPatch, videoPlan, }, { ...initial.raw, ...meetingPatch, })

    onClose()
  }

  const handleReset = () => setDraft(initial)

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

          onClose()
          onSaved(null, null, { deletedId: meeting.id })
        },
      }
    )
  }, [lifecycle, meeting, onClose, onSaved])

  return (
    <Drawer
      open={!!open}
      size="md"
      anchor="right"
      onClose={pending ? undefined : onClose}
      slotProps={{
        content: {
          sx: {
            bgcolor: 'transparent',
            p: { xs: 0, md: 2 },
            boxShadow: 'none',
          },
        },
      }}
    >
      <Sheet sx={sx.drawerSheetSx}>
        <Box sx={sx.drawerRootSx}>
          <EditDrawerHeader meeting={liveMeeting} />

          <EditFormDrawer
            draft={draft}
            setDraft={setDraft}
            context={context}
            liveMeeting={liveMeeting}
          />

          <Box sx={sx.footerSx}>
            <Box sx={sx.footerActionsSx}>
              <Button
                loading={pending}
                disabled={!canSave}
                startDecorator={iconUi({ id: 'save' })}
                onClick={handleSave}
                sx={sx.conBut}
              >
                שמירה
              </Button>

              <Button
                color="neutral"
                variant="outlined"
                onClick={onClose}
                disabled={pending}
              >
                ביטול
              </Button>

              <Tooltip title="איפוס השינויים">
                <span>
                  <IconButton
                    disabled={!isDirty || pending}
                    size="sm"
                    variant="soft"
                    sx={sx.icoRes}
                    onClick={handleReset}
                  >
                    {iconUi({ id: 'reset' })}
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="מחיקת פגישה">
                <span>
                  <IconButton
                    size="sm"
                    color="danger"
                    variant="solid"
                    onClick={handleDelete}
                    disabled={pending || !meeting?.id}
                  >
                    {iconUi({ id: 'delete' })}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            <Typography level="body-xs" color={isDirty ? 'danger' : 'neutral'}>
              {isDirty ? 'יש שינויים שלא נשמרו' : 'אין שינויים'}
            </Typography>
          </Box>
        </Box>
      </Sheet>
    </Drawer>
  )
}
