// src/features/playersDatabase/components/leagues/board/SeasonsPanel.js

import React from 'react'
import {
  Box,
  Button,
  Chip,
  Input,
  Typography,
} from '@mui/joy'

import { seasonSx as sx } from './sx/season.sx.js'

function SeasonRow({ season }) {
  return (
    <Box sx={sx.item}>
      <Box>
        <Typography
          level="body-sm"
          sx={sx.title}
        >
          {season.seasonId}
        </Typography>

        <Typography
          level="body-xs"
          sx={sx.meta}
        >
          שנתון:{' '}
          {season.primaryBirthYear ||
            season.birthYears?.join(', ') ||
            '-'}
          {' | '}
          מספר מועדונים: {season.clubsCount ?? '-'}
          {' | '}
          צילום אחרון: {season.latestSnapshotAt || '-'}
        </Typography>
      </Box>

      <Box sx={sx.stats}>
        <Chip size="sm" variant="soft" color="neutral">
          נטענו: {season.loadedClubsCount ?? 0}
        </Chip>

        <Chip size="sm" variant="soft" color="neutral">
          צילומים: {season.snapshotsCount ?? 0}
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
  return (
    <Box sx={sx.panel}>
      <Box sx={sx.header}>
        <Typography
          level="title-md"
          sx={sx.title}
        >
          עונות
        </Typography>

        <Button
          size="sm"
          variant={adding ? 'soft' : 'solid'}
          color={adding ? 'neutral' : 'primary'}
          disabled={saving}
          onClick={onToggle}
        >
          {adding ? 'ביטול' : 'הוסף עונה'}
        </Button>
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
