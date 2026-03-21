// playerProfile/modules/videos/components/drawer/EditDrawer.js

import React, { useEffect, useMemo, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Drawer,
  Typography,
  Sheet,
  DialogContent,
  DialogTitle,
  ModalClose,
  Tooltip,
  IconButton,
} from '@mui/joy'

import VideoAttachDrawerBody from '../../../../../../../ui/domains/video/videoAnalysis/attachDrawer/VideoAttachDrawerBody.js'
import VideoEditDrawerBody from '../../../../../../../ui/domains/video/videoAnalysis/editDrawer/VideoEditDrawerBody.js'

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi'
import { useVideoUpdate } from '../../../../../hooks/videoAnalysis/useVideoUpdate.js'
import playerImage from '../../../../../../../ui/core/images/playerImage.jpg'

import { editDrawerSx as sx } from './sx/editDrawer.sx.js'
import {
  safeArr,
  buildInitialDraft,
  buildPatch,
  getIsDirty,
} from './logic/playerVideoEdit.logic.js'

const c = getEntityColors('videoAnalysis')

export default function EditDrawer({
  open,
  video,
  context,
  onClose,
  onSaved,
}) {
  const initial = useMemo(() => buildInitialDraft(video), [video])
  const [draft, setDraft] = useState(initial)
  const player = context?.player

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])
  const patch = useMemo(() => buildPatch(draft, initial), [draft, initial])

  const { run, pending } = useVideoUpdate(video)
  const canSave = !!initial.id && isDirty && !pending

  const handleSave = async () => {
    if (!canSave) return

    await run('playerVideoEdit', patch, {
      section: 'playerVideoEdit',
      videoId: initial.id,
    })

    onSaved(patch, { ...initial.raw, ...patch })
    onClose()
  }

  const handleReset = () => {
    setDraft({
      ...initial,
    })
  }

  return (
    <Drawer
      size="md"
      variant="plain"
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ content: { sx: sx.drawerSx } }}
    >
      <Sheet sx={sx.drawerSheet}>
        <DialogTitle sx={{ bgcolor: c.bg, borderRadius: 'sm', p: 1, boxShadow: 'sm' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Avatar src={player?.photo || playerImage} />

            <Box sx={{ ml: 2 }}>
              <Typography level="title-md" sx={sx.formNameSx}>
                {player?.playerFullName || 'שחקן'}
              </Typography>

              <Typography level="body-sm" sx={sx.formNameSx} startDecorator={iconUi({ id: 'videoAnalysis' })}>
                עריכת פרטי וידאו: "{video?.name || 'וידאו'}"
              </Typography>
            </Box>
          </Box>

          <ModalClose sx={{ mr: 0.5, mt: 0.5 }} />
        </DialogTitle>

        <DialogContent sx={{ gap: 2 }}>
          <Box sx={sx.content} className="dpScrollThin">
            <VideoEditDrawerBody
              draft={draft}
              setDraft={setDraft}
              disabled={pending}
              context={context}
              sx={sx}
            />
          </Box>
        </DialogContent>

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
                  disabled={!isDirty}
                  size="sm"
                  variant="soft"
                  sx={sx.icoRes}
                  onClick={handleReset}
                >
                  {iconUi({ id: 'reset' })}
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          <Typography level="body-xs" color={isDirty ? 'danger' : 'neutral'}>
            {isDirty ? 'יש שינויים שלא נשמרו' : 'אין שינויים'}
          </Typography>
        </Box>
      </Sheet>
    </Drawer>
  )
}
