// src/features/playersDatabase/components/leagues/board/DetailsPanel.js

import React from 'react'
import {
  Box,
  Button,
  Input,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import {
  getLeagueLevelLabel,
  getLeagueRegionLabel,
} from '../leagueUtils.js'
import { detailSx as sx } from './sx/detail.sx.js'

function InfoValue({ label, value }) {
  return (
    <Box sx={sx.infoItem}>
      <Typography level="body-xs" sx={sx.label}>
        {label}
      </Typography>

      <Typography level="body-sm" sx={sx.value}>
        {value || '-'}
      </Typography>
    </Box>
  )
}

export default function DetailsPanel({
  league,
  form,
  editing,
  saving,
  error,
  onEdit,
  onCancel,
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
          פרטי ליגה
        </Typography>

        {editing ? (
          <Box sx={sx.actions}>
            <Button
              size="sm"
              color="primary"
              loading={saving}
              onClick={onSave}
            >
              שמור
            </Button>

            <Button
              size="sm"
              variant="soft"
              color="neutral"
              disabled={saving}
              onClick={onCancel}
            >
              ביטול
            </Button>
          </Box>
        ) : (
          <Button
            size="sm"
            variant="soft"
            color="neutral"
            disabled={!league}
            onClick={onEdit}
          >
            ערוך
          </Button>
        )}
      </Box>

      {editing ? (
        <Box sx={sx.editGrid}>
          <Box>
            <Typography
              level="body-xs"
              sx={sx.label}
            >
              שם ליגה
            </Typography>

            <Input
              size="sm"
              value={form.leagueName}
              disabled={saving}
              onChange={event =>
                onChange(
                  'leagueName',
                  event.target.value
                )
              }
            />
          </Box>

          <Box>
            <Typography
              level="body-xs"
              sx={sx.label}
            >
              רמת ליגה
            </Typography>

            <Select
              size="sm"
              value={form.level || null}
              disabled={saving}
              onChange={(event, value) =>
                onChange('level', value || '')
              }
            >
              <Option value={1}>על</Option>
              <Option value={2}>לאומית</Option>
              <Option value={3}>ארצית</Option>
              <Option value={4}>מחוזית</Option>
            </Select>
          </Box>

          <Box>
            <Typography
              level="body-xs"
              sx={sx.label}
            >
              קבוצת גיל
            </Typography>

            <Input
              size="sm"
              value={form.ageGroupLabel}
              disabled={saving}
              onChange={event =>
                onChange(
                  'ageGroupLabel',
                  event.target.value
                )
              }
            />
          </Box>

          <Box>
            <Typography
              level="body-xs"
              sx={sx.label}
            >
              אזור
            </Typography>

            <Input
              size="sm"
              value={form.region}
              disabled={saving}
              onChange={event =>
                onChange(
                  'region',
                  event.target.value
                )
              }
            />
          </Box>

        </Box>
      ) : (
        <Box sx={sx.infoGrid}>
          <InfoValue
            label="שם ליגה"
            value={league?.leagueName}
          />

          <InfoValue
            label="קבוצת גיל"
            value={league?.ageGroupLabel}
          />

          <InfoValue
            label="רמה"
            value={getLeagueLevelLabel(league?.level)}
          />

          <InfoValue
            label="אזור"
            value={getLeagueRegionLabel(league?.region)}
          />

          <InfoValue
            label="מזהה ליגה"
            value={league?.id}
          />
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
