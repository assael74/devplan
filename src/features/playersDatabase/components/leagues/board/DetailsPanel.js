// src/features/playersDatabase/components/leagues/board/DetailsPanel.js

import React from 'react'
import {
  Box,
  Button,
  Input,
  Link,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import {
  getLeagueLevelLabel,
  getLeagueRegionLabel,
  getLeagueSeasonRows,
} from '../leagueUtils.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { detailSx as sx } from './sx/detail.sx.js'

const getLeagueTeamsCount = league => {
  const primarySeason = getLeagueSeasonRows(league)[0] || {}
  const clubsCount = Number(primarySeason.clubsCount)
  const loadedClubsCount = Number(primarySeason.loadedClubsCount)
  const indexedTeamsCount = Object.keys(league?.teamsIndex || {}).length

  if (Number.isInteger(clubsCount) && clubsCount > 0) return clubsCount
  if (Number.isInteger(loadedClubsCount) && loadedClubsCount > 0) {
    return loadedClubsCount
  }

  return indexedTeamsCount || ''
}

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

function InfoLink({ label, value }) {
  const url = String(value ?? '').trim()

  return (
    <Box sx={sx.infoItem}>
      <Typography level="body-xs" sx={sx.label}>
        {label}
      </Typography>

      {url ? (
        <Link
          href={url}
          target="_blank"
          rel="noreferrer"
          referrerPolicy="no-referrer"
          level="body-sm"
          sx={sx.valueLink}
        >
          פתח קישור ליגה
        </Link>
      ) : (
        <Typography level="body-sm" sx={sx.value}>
          -
        </Typography>
      )}
    </Box>
  )
}

export default function DetailsPanel({
  league,
  form,
  editing,
  saving,
  error,
  children,
  onEdit,
  onCancel,
  onChange,
  onSave,
  onOpenLeague,
}) {
  const teamsCount = getLeagueTeamsCount(league)

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
          <Box sx={sx.actions}>
            <Button
              size="sm"
              variant="outlined"
              color="primary"
              disabled={!league}
              startDecorator={iconUi({ id: 'viewLaeague', size: 'small' })}
              sx={sx.openLeagueButton}
              onClick={onOpenLeague}
            >
              פתח טבלת ליגה
            </Button>

            <Button
              size="sm"
              variant="soft"
              color="neutral"
              disabled={!league}
              sx={sx.editButton}
              onClick={onEdit}
            >
              ערוך
            </Button>
          </Box>
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

          <Box>
            <Typography
              level="body-xs"
              sx={sx.label}
            >
              קישור ליגה
            </Typography>

            <Input
              size="sm"
              value={form.leagueUrl || ''}
              placeholder="https://www.football.org.il/..."
              disabled={saving}
              onChange={event =>
                onChange(
                  'leagueUrl',
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
            label="קבוצות"
            value={teamsCount}
          />

          <InfoValue
            label="רמה"
            value={getLeagueLevelLabel(league?.level)}
          />

          <InfoValue
            label="אזור"
            value={getLeagueRegionLabel(league?.region)}
          />

          <InfoLink
            label="קישור ליגה"
            value={league?.leagueUrl || league?.source?.leagueUrl}
          />
        </Box>
      )}

      {error && (
        <Typography sx={sx.error}>
          {error}
        </Typography>
      )}

      {children ? (
        <Box sx={sx.embeddedSection}>
          {children}
        </Box>
      ) : null}
    </Box>
  )
}
