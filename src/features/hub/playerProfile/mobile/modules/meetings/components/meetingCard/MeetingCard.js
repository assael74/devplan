// playerProfile/mobile/modules/meetings/components/meetingCard/MeetingCard.js

import React from 'react'
import { Box, Card, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/joy'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import NotesRoundedIcon from '@mui/icons-material/NotesRounded'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { cardSx as sx } from '../sx/card.sx.js'

export default function MeetingCard({ meeting, active, onSelect, onQuickEdit }) {
  const date = meeting?.meetingDate || 'ללא תאריך'
  const time = meeting?.meetingHour || ''
  const hasVideo = Boolean(meeting?.videoId || meeting?.videoLink)
  const hasNotes = Boolean(String(meeting?.notes || '').trim())
  const tone = {
    tone: meeting?.tone || 'primary',
    statusBg: meeting?.statusBg || 'primary.softBg',
    statusColor: meeting?.statusColor || 'primary.softColor',
    glow: meeting?.glow || '0 10px 28px rgba(25, 118, 210, 0.16)',
    icon: meeting?.toneIcon || meeting?.statusIcon || 'meetings',
  }

  return (
    <Card sx={sx.root(active, tone)} variant="plain" onClick={() => onSelect(meeting)}>
      <Box sx={sx.topRow}>
        <Box sx={sx.titleWrap}>
          <Box sx={sx.titleRow}>
            <Box sx={sx.leadingIcon(tone)}> {iconUi({ id: meeting?.typeIcon })} </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={sx.boxType}>
                <Typography level="title-sm" sx={{ fontWeight: 700, minWidth: 0 }} noWrap>
                  {meeting?.typeLabel || 'מפגש'}
                </Typography>

                {meeting?.statusLabel ? (
                  <Chip size="sm" variant="soft" sx={sx.statusChip(tone)} startDecorator={iconUi({ id: meeting?.statusIcon })}>
                    {meeting.statusLabel}
                  </Chip>
                ) : null}
              </Box>

              <Box sx={sx.dateRow}>
                <Typography level="body-sm" sx={{ color: 'text.secondary', minWidth: 0 }}>
                  {date}{time ? ` · ${time}` : ''}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'flex-start', flexShrink: 0 }}>
          <Tooltip title="עריכה מהירה">
            <IconButton
              size="sm"
              variant="soft"
              color="neutral"
              onClick={(event) => {
                event.stopPropagation()
                onQuickEdit(meeting)
              }}
            >
              <EditRoundedIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box sx={sx.middleRow}>
        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
          <Chip
            size="sm"
            variant={hasVideo ? 'soft' : 'outlined'}
            startDecorator={iconUi({id: hasVideo ? 'video' : 'noVideo'})}
            sx={{ bgcolor: hasVideo ? '#16A34A' : '#FEF2F2' }}
          >
            {hasVideo ? 'וידאו מקושר' : 'ללא וידאו'}
          </Chip>

          <Chip
            size="sm"
            variant={hasNotes ? 'soft' : 'outlined'}
            startDecorator={<NotesRoundedIcon />}
            sx={{ bgcolor: hasNotes ? '#16A34A' : '#FEF2F2' }}
          >
            {hasNotes ? 'יש הערות' : 'ללא הערות'}
          </Chip>
        </Stack>
      </Box>

      <Box sx={sx.bottomRow}>
        {meeting?.timeLabel ? (
          <Typography level="body-xs" sx={sx.timeLabel(tone)}>
            {meeting.timeLabel}
          </Typography>
        ) : (
          <Typography level="body-xs" sx={{ opacity: 0.5 }}>
            ללא אינדיקציית זמן
          </Typography>
        )}
      </Box>
    </Card>
  )
}
