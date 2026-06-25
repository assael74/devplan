// src/features/playersDatabase/components/leagues/board/SeasonsPanel.js

import React from 'react'
import {
  Box,
  Button,
  Chip,
  IconButton,
  Input,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { seasonSx as sx } from './sx/season.sx.js'

const getSeasonStatus = season => {
  const snapshotsCount = Number(season.snapshotsCount) || 0
  const loadedClubsCount = Number(season.loadedClubsCount) || 0
  const clubsCount = Number(season.clubsCount) || 0

  if (snapshotsCount > 0) {
    return { label: 'פעילה', color: 'success' }
  }

  if (loadedClubsCount > 0 || clubsCount > 0) {
    return { label: 'טיוטה', color: 'warning' }
  }

  return { label: 'אין צילום', color: 'neutral' }
}

function SeasonRow({ season }) {
  const status = getSeasonStatus(season)
  const birthYear =
    season.primaryBirthYear ||
    season.birthYears?.join(', ') ||
    '-'

  return (
    <Box sx={sx.item}>
      <Box sx={sx.text}>
        <Typography
          level="body-sm"
          sx={sx.title}
        >
          {season.seasonId}
        </Typography>

        <Box sx={sx.meta}>
          <span>שנתון {birthYear}</span>
          <span>{season.clubsCount ?? '-'} מועדונים</span>
          <span>{season.latestSnapshotAt || 'אין צילום אחרון'}</span>
        </Box>
      </Box>

      <Box sx={sx.stats}>
        <Chip size="sm" variant="soft" color={status.color}>
          {status.label}
        </Chip>

        <Chip size="sm" variant="soft" color="neutral">
          {season.loadedClubsCount ?? 0} נטענו
        </Chip>

        <Chip size="sm" variant="soft" color="neutral">
          {season.snapshotsCount ?? 0} צילומים
        </Chip>
      </Box>
    </Box>
  )
}

export default function SeasonsPanel({
  rows,
  form,
  adding,
  saving,
  error,
  onToggle,
  onChange,
  onSave,
}) {
  const addSeasonLabel = adding ? 'בטל הוספת עונה' : 'הוסף עונה'

  return (
    <Box sx={sx.panel}>
      <Box sx={sx.header}>
        <Typography
          level="title-md"
          sx={sx.title}
        >
          עונות
        </Typography>

        <Tooltip title={addSeasonLabel}>
          <IconButton
            size="sm"
            variant={adding ? 'soft' : 'solid'}
            color={adding ? 'neutral' : 'success'}
            disabled={saving}
            aria-label={addSeasonLabel}
            title={addSeasonLabel}
            sx={sx.addButton}
            onClick={onToggle}
          >
            {adding ? '×' : iconUi({ id: 'addSeason', size: 'small' })}
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={sx.list}>
        {rows.length ? (
          rows.map(season => (
            <SeasonRow
              key={season.key}
              season={season}
            />
          ))
        ) : (
          <Typography
            level="body-sm"
            sx={sx.empty}
          >
            אין עונות עדיין
          </Typography>
        )}
      </Box>

      {adding && (
        <Box sx={sx.add}>
          <Input
            size="sm"
            placeholder="2026-2027"
            value={form.seasonId}
            disabled={saving}
            onChange={event =>
              onChange(
                'seasonId',
                event.target.value
              )
            }
          />

          <Input
            type="number"
            size="sm"
            placeholder="שנתון"
            value={form.birthYear}
            disabled={saving}
            onChange={event =>
              onChange(
                'birthYear',
                event.target.value
              )
            }
          />

          <Input
            type="number"
            size="sm"
            placeholder="מספר מועדונים"
            value={form.clubsCount}
            disabled={saving}
            onChange={event =>
              onChange(
                'clubsCount',
                event.target.value
              )
            }
          />

          <Button
            size="sm"
            color="primary"
            loading={saving}
            sx={sx.saveButton}
            onClick={onSave}
          >
            שמור
          </Button>
        </Box>
      )}

      {error && (
        <Typography sx={sx.error}>
          {error}
        </Typography>
      )}
    </Box>
  )
}
