// src/features/playersDatabase/ui/components/modals/CreateSeasonModal.js

import * as React from 'react'
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/joy'

import RegularModal from './RegularModal.js'
import {
  getSeasonCatalogOptions,
  getSeasonCatalogEntry,
  getSeasonCatalogTarget,
  PLAYERS_DATABASE_CURRENT_SEASON_KEY,
} from '../../../catalog/seasons.catalog.js'
import { createSeasonModalSx as sx } from './sx/createSeasonModal.sx.js'

const TARGET_OPTIONS = [
  {
    value: 'current',
    label: 'פעילה',
  },
  {
    value: 'history',
    label: 'היסטוריה',
  },
]

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const toNumberOrZero = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const getInitialState = ({ league, defaultSeasonKey }) => {
  const requestedSeasonKey = clean(defaultSeasonKey)
  const seasonKey = getSeasonCatalogEntry(requestedSeasonKey)?.seasonKey ||
    PLAYERS_DATABASE_CURRENT_SEASON_KEY

  return {
    target: getSeasonCatalogTarget(seasonKey, 'current'),
    seasonKey,
    birthYear: '',
    leagueTotalRound: '',
    seasonUrl: '',
    leagueId: clean(league?.leagueId || league?.id),
  }
}

export default function CreateSeasonModal({
  open,
  league,
  defaultSeasonKey,
  lockSeason = false,
  lockTarget = false,
  busy = false,
  onClose,
  onConfirm,
}) {
  const [form, setForm] = React.useState(() => (
    getInitialState({
      league,
      defaultSeasonKey,
    })
  ))

  React.useEffect(() => {
    if (!open) return

    setForm(getInitialState({
      league,
      defaultSeasonKey,
    }))
  }, [defaultSeasonKey, league, open])

  const updateField = (field, value) => {
    if (field === 'seasonKey') {
      setForm(current => ({
        ...current,
        seasonKey: value,
        target: getSeasonCatalogTarget(value, current.target),
      }))
      return
    }

    setForm(current => ({
      ...current,
      [field]: value,
    }))
  }

  const handleConfirm = () => {
    if (typeof onConfirm !== 'function') return

    onConfirm({
      league,
      season: {
        target: form.target,
        seasonKey: clean(form.seasonKey),
        seasonId: clean(form.seasonKey),
        seasonStatus: form.target === 'history' ? 'completed' : 'active',
        birthYear: toNumberOrZero(form.birthYear),
        leagueTotalRound: toNumberOrZero(form.leagueTotalRound),
        seasonUrl: clean(form.seasonUrl),
      },
    })
  }

  const disabled = !clean(form.seasonKey) || !clean(form.birthYear)
  const leagueName = clean(league?.name || league?.leagueName) || '-'

  return (
    <RegularModal
      open={open}
      title='יצירת עונה'
      description='פתיחת עונה לליגה שנבחרה והגדרת נתוני בסיס לעונה.'
      iconId='addSeason'
      confirmLabel='יצירת עונה'
      cancelLabel='ביטול'
      confirmIconId='addSeason'
      size='md'
      busy={busy}
      disabled={disabled}
      onConfirm={handleConfirm}
      onClose={onClose}
    >
      <Stack sx={sx.root}>
        <Box sx={sx.leagueContext}>
          <Typography
            level='body-xs'
            sx={sx.contextLabel}
          >
            ליגה
          </Typography>

          <Typography
            level='title-md'
            sx={sx.contextTitle}
          >
            {leagueName}
          </Typography>

          <Typography
            level='body-sm'
            sx={sx.contextMeta}
          >
            מזהה: {clean(league?.leagueId || league?.id) || '-'}
          </Typography>
        </Box>

        <Box sx={sx.formGrid}>
          <FormControl required>
            <FormLabel sx={sx.label}>
              סוג עונה
            </FormLabel>

            <Select
              value={form.target}
              disabled={lockTarget}
              onChange={(event, value) => {
                updateField('target', value)
              }}
              sx={sx.control}
            >
              {TARGET_OPTIONS.map(option => (
                <Option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl required>
            <FormLabel sx={sx.label}>
              עונה
            </FormLabel>

            <Select
              value={form.seasonKey}
              disabled={lockSeason}
              onChange={(event, value) => {
                updateField('seasonKey', value)
              }}
              sx={sx.control}
            >
              {getSeasonCatalogOptions().map(option => (
                <Option
                  key={option.seasonKey}
                  value={option.seasonKey}
                >
                  {option.label}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl required>
            <FormLabel sx={sx.label}>
              שנתון
            </FormLabel>

            <Input
              value={form.birthYear}
              type='number'
              placeholder='לדוגמה 2010'
              onChange={event => {
                updateField('birthYear', event.target.value)
              }}
              sx={sx.control}
            />
          </FormControl>

          <FormControl>
            <FormLabel sx={sx.label}>
              משחקי עונה (אופציונלי)
            </FormLabel>

            <Input
              value={form.leagueTotalRound}
              type='number'
              placeholder='הזן רק אם המספר ידוע'
              onChange={event => {
                updateField('leagueTotalRound', event.target.value)
              }}
              sx={sx.control}
            />
          </FormControl>

          <FormControl sx={sx.fullRow}>
            <FormLabel sx={sx.label}>
              קישור עונה
            </FormLabel>

            <Input
              value={form.seasonUrl}
              placeholder='קישור לעמוד העונה באתר ההתאחדות'
              onChange={event => {
                updateField('seasonUrl', event.target.value)
              }}
              sx={sx.control}
            />
          </FormControl>
        </Box>

        <Box sx={sx.note}>
          <Typography
            level='body-sm'
            sx={sx.noteText}
          >
            סוג העונה נשמר לפי הבחירה כאן. ניתן להחזיק עונה פעילה אחת בלבד לכל ליגה; עונות היסטוריות נשמרות בנפרד.
          </Typography>
        </Box>
      </Stack>
    </RegularModal>
  )
}
