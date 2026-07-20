// features/playersDatabase/components/summary/seasonPreview/SeasonPreview.js

import React from 'react'
import {
  Box,
  Button,
  Chip,
  Input,
  Typography,
} from '@mui/joy'

import {
  getSummaryDisplayValue,
  getSummarySeasonStatus,
} from '../logic/index.js'
import { Toolbar } from './toolbar/index.js'
import { seasonPreviewSx as sx } from './seasonPreview.sx.js'

function SeasonRow({ season }) {
  const status = getSummarySeasonStatus(season)
  const birthYear =
    season.primaryBirthYear ||
    season.birthYears?.join(', ') ||
    '-'

  return (
    <Box sx={sx.item}>
      <Box sx={sx.text}>
        <Typography level="body-sm" sx={sx.itemTitle}>
          {season.seasonId}
        </Typography>

        <Box sx={sx.meta}>
          <span>שנתון {birthYear}</span>
          <span>{getSummaryDisplayValue(season.clubsCount)} מועדונים</span>
          <span>{season.latestSnapshotAt || 'אין צילום אחרון'}</span>
        </Box>
      </Box>

      <Box sx={sx.stats}>
        <Chip size="sm" variant="soft" color={status.color}>
          {status.label}
        </Chip>

        <Chip size="sm" variant="soft" color="neutral">
          {getSummaryDisplayValue(season.loadedClubsCount, 0)} נטענו
        </Chip>

        <Chip size="sm" variant="soft" color="neutral">
          {getSummaryDisplayValue(season.snapshotsCount, 0)} צילומים
        </Chip>
      </Box>
    </Box>
  )
}

function SeasonList({ rows }) {
  if (!rows.length) {
    return (
      <Typography level="body-sm" sx={sx.empty}>
        אין עונות עדיין
      </Typography>
    )
  }

  return rows.map(season => (
    <SeasonRow key={season.key} season={season} />
  ))
}

function AddSeasonForm({ form, saving, onChange, onSave }) {
  return (
    <Box sx={sx.add}>
      <Input
        size="sm"
        placeholder="2026-2027"
        value={form.seasonId}
        disabled={saving}
        onChange={event => onChange('seasonId', event.target.value)}
      />

      <Input
        type="number"
        size="sm"
        placeholder="שנתון"
        value={form.birthYear}
        disabled={saving}
        onChange={event => onChange('birthYear', event.target.value)}
      />

      <Input
        type="number"
        size="sm"
        placeholder="מספר מועדונים"
        value={form.clubsCount}
        disabled={saving}
        onChange={event => onChange('clubsCount', event.target.value)}
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
  )
}

export default function SeasonPreview({
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
      <Toolbar
        adding={adding}
        saving={saving}
        onToggle={onToggle}
      />

      <Box sx={sx.list}>
        <SeasonList rows={rows} />
      </Box>

      {adding && (
        <AddSeasonForm
          form={form}
          saving={saving}
          onChange={onChange}
          onSave={onSave}
        />
      )}

      {error && (
        <Typography sx={sx.error}>
          {error}
        </Typography>
      )}
    </Box>
  )
}
