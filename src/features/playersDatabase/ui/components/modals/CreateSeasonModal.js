// features/playersDatabase/ui/components/modals/CreateSeasonModal.js

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

import PlayersDatabaseModal from './PlayersDatabaseModal.js'
import { createSeasonSx as sx } from './sx/createSeason.sx.js'

const CURRENT_SEASON_KEY = '26/27'
const SEASON_OPTIONS = ['26/27', '25/26', '24/25', '23/24', '22/23']
const TARGET_OPTIONS = [
  {
    value: 'current',
    label: 'נוכחי',
  },
  {
    value: 'history',
    label: 'היסטוריה',
  },
]

const clean = value => String(value ?? '').trim()

const toNumberOrZero = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const resolveSeasonTarget = seasonKey =>
  clean(seasonKey) === CURRENT_SEASON_KEY ? 'current' : 'history'

const getInitialState = ({ league, defaultSeasonKey }) => {
  const seasonKey = clean(defaultSeasonKey) || CURRENT_SEASON_KEY

  return {
    target: resolveSeasonTarget(seasonKey),
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
    getInitialState({ league, defaultSeasonKey })
  ))

  React.useEffect(() => {
    if (!open) return

    setForm(getInitialState({ league, defaultSeasonKey }))
  }, [defaultSeasonKey, league, open])

  const updateField = (field, value) => {
    if (field === 'seasonKey') {
      setForm(current => ({
        ...current,
        seasonKey: value,
        target: resolveSeasonTarget(value),
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
        target: resolveSeasonTarget(form.seasonKey),
        seasonKey: clean(form.seasonKey),
        seasonId: clean(form.seasonKey),
        birthYear: toNumberOrZero(form.birthYear),
        leagueTotalRound: toNumberOrZero(form.leagueTotalRound),
        seasonUrl: clean(form.seasonUrl),
      },
    })
  }

  const disabled = !clean(form.seasonKey) || !clean(form.birthYear)
  const leagueName = clean(league?.name || league?.leagueName) || '-'

  return (
    <PlayersDatabaseModal
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
              {SEASON_OPTIONS.map(option => (
                <Option
                  key={option}
                  value={option}
                >
                  {option}
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
              משחקי עונה
            </FormLabel>

            <Input
              value={form.leagueTotalRound}
              type='number'
              placeholder='ברירת מחדל 30'
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
            העונה וסוג העונה נקבעים לפי הפילטר במסך. 26/27 היא עונה נוכחית, וכל עונה אחרת נשמרת כהיסטוריה.
          </Typography>
        </Box>
      </Stack>
    </PlayersDatabaseModal>
  )
}
