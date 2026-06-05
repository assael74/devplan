// src/ui/forms/gameStatsForm/steps/parts/EntryPlayerHeader.js

import React from 'react'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Typography,
} from '@mui/joy'

import { entryStepSx as sx } from '../sx/entryStep.sx.js'
import playerImage from '../../../../core/images/playerImage.jpg'
import { iconUi } from '../../../../core/icons/iconUi.js'

// אחריות:
// Header של השחקן הפעיל בשלב מילוי הסטטיסטיקה.

export function EntryPlayerHeader({
  activePlayer,
  progress,
  onReset,
  onRestore,
  canRestore,
  locked,
}) {
  const photo = activePlayer && activePlayer.photo
    ? activePlayer.photo
    : playerImage

  const isStarting = activePlayer && activePlayer.isStarting
  const icon = isStarting ? 'isStart' : 'isSquad'
  const timePlayed = activePlayer && activePlayer.timePlayed
    ? activePlayer.timePlayed
    : 0

  return (
    <Box sx={sx.entryHeader}>
      <Box>
        <Box sx={sx.entryPlayerTitle}>
          <Avatar src={photo} sx={{ width: 22, height: 22 }} />

          <Typography level="title-sm">
            {activePlayer && activePlayer.name ? activePlayer.name : 'שחקן'}
          </Typography>
        </Box>

        <Typography level="body-xs" color="neutral" startDecorator={iconUi({ id: icon })}>
          {isStarting ? 'הרכב' : 'ספסל'} · {timePlayed} דק׳
        </Typography>
      </Box>

      <Box sx={sx.entryHeaderActions}>
        {locked ? (
          <Chip size="sm" variant="soft" color="warning">
            נעול לעריכה
          </Chip>
        ) : null}

        {canRestore && !locked ? (
          <Button size="sm" variant="soft" color="neutral" onClick={onRestore}>
            שחזור שחקן
          </Button>
        ) : null}

        {!locked ? (
          <Button size="sm" variant="soft" color="neutral" onClick={onReset}>
            איפוס שחקן
          </Button>
        ) : null}

        <Chip size="sm" variant="soft" color="neutral">
          {progress.filled || 0}/{progress.total || 0} שדות
        </Chip>
      </Box>
    </Box>
  )
}
