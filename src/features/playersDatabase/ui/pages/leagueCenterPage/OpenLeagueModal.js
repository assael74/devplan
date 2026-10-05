// src/features/playersDatabase/ui/pages/leagueCenterPage/OpenLeagueModal.js

import * as React from 'react'
import {
  Alert,
  Box,
  FormControl,
  FormLabel,
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/joy'

import RegularModal from '../../components/modals/RegularModal.js'
import {
  getSeasonCatalogOptions,
  PLAYERS_DATABASE_CURRENT_SEASON_KEY,
} from '../../../catalog/seasons.catalog.js'
import { resolvePlayersDatabaseLeagueGameTime } from '../../../catalog/leagues.catalog.js'
import { resolveSeasonBirthYear } from '../../../model/shared/season.model.js'

export default function OpenLeagueModal({
  open,
  options = [],
  busy = false,
  waitingForCenter = false,
  error = '',
  onClose,
  onConfirm,
}) {
  const [ageGroupId, setAgeGroupId] = React.useState('')
  const [leagueId, setLeagueId] = React.useState('')
  const [seasonKey, setSeasonKey] = React.useState(PLAYERS_DATABASE_CURRENT_SEASON_KEY)
  const [gameDurationMinutes, setGameDurationMinutes] = React.useState(90)
  const seasonOptions = getSeasonCatalogOptions()
  const ageGroupOptions = Array.from(new Map(options.map(option => [
    option.ageGroupId,
    {
      value: option.ageGroupId,
      label: option.ageGroupLabel,
    },
  ])).values()).filter(option => option.value && option.label)
  const leagueOptions = options.filter(option => option.ageGroupId === ageGroupId)
  const selectedLeague = options.find(option => option.value === leagueId) || null
  const selectedSeason = seasonOptions.find(option => option.seasonKey === seasonKey) || null
  const birthYear = selectedSeason && ageGroupId
    ? resolveSeasonBirthYear({ seasonKey, ageGroupId })
    : null
  const seasonAlreadyExists = Boolean(
    selectedLeague
    && selectedSeason
    && selectedLeague.existingSeasonIds.includes(selectedSeason.seasonId)
  )

  React.useEffect(() => {
    if (!open) return
    setAgeGroupId('')
    setLeagueId('')
    setSeasonKey(PLAYERS_DATABASE_CURRENT_SEASON_KEY)
    setGameDurationMinutes(90)
  }, [open])

  const handleConfirm = () => {
    const selected = options.find(option => option.value === leagueId)
    if (selected && selectedSeason && onConfirm) {
      onConfirm({
        ...selected,
        seasonId: selectedSeason.seasonId,
        seasonKey,
        birthYear,
        gameDurationMinutes: Number(gameDurationMinutes),
      })
    }
  }

  return (
    <RegularModal
      open={open}
      title='פתיחת ליגה'
      description='בחר קבוצת גיל, ליגה ועונה ליצירת עונה חדשה ללא קבוצות.'
      iconId='addSeason'
      confirmLabel={waitingForCenter
        ? 'ממתין למרכז הליגות'
        : busy
          ? 'פותח ליגה'
          : 'פתיחת ליגה'}
      confirmIconId='addSeason'
      busy={busy}
      disabled={
        !leagueId
        || !selectedSeason
        || seasonAlreadyExists
        || !Number.isFinite(Number(gameDurationMinutes))
        || Number(gameDurationMinutes) <= 0
      }
      onConfirm={handleConfirm}
      onClose={onClose}
    >
      <Stack spacing={1.5}>
        {error ? (
          <Alert color='danger' variant='soft'>{error}</Alert>
        ) : null}

        {waitingForCenter ? (
          <Alert color='primary' variant='soft'>
            הכתיבה וה־Audit הושלמו. ממתין שהעונה תופיע בעדכון בזמן אמת של מרכז הליגות.
          </Alert>
        ) : busy ? (
          <Alert color='primary' variant='soft'>
            הקבלה נפתחה. מקור האמת והתוצרים מתעדכנים לפי הסדר.
          </Alert>
        ) : null}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(10rem, 0.8fr) minmax(14rem, 1.2fr)' }, gap: 1.5 }}>
          <FormControl required disabled={busy}>
            <FormLabel>קבוצת גיל</FormLabel>
            <Select
              value={ageGroupId || null}
              placeholder='בחר קבוצת גיל'
              onChange={(event, value) => {
                const nextAgeGroupId = value || ''
                setAgeGroupId(nextAgeGroupId)
                setLeagueId('')
                setSeasonKey(PLAYERS_DATABASE_CURRENT_SEASON_KEY)
                setGameDurationMinutes(resolvePlayersDatabaseLeagueGameTime(nextAgeGroupId))
              }}
            >
              {ageGroupOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl required disabled={busy || !ageGroupId}>
            <FormLabel>ליגה</FormLabel>
            <Select
              value={leagueId || null}
              placeholder='בחר ליגה'
              onChange={(event, value) => {
                const nextLeagueId = value || ''
                const nextLeague = options.find(option => option.value === nextLeagueId)
                const currentSeason = seasonOptions.find(option => (
                  option.seasonKey === PLAYERS_DATABASE_CURRENT_SEASON_KEY
                ))
                const currentSeasonExists = Boolean(
                  nextLeague
                  && currentSeason
                  && nextLeague.existingSeasonIds.includes(currentSeason.seasonId)
                )

                setLeagueId(nextLeagueId)
                setSeasonKey(currentSeasonExists ? '' : PLAYERS_DATABASE_CURRENT_SEASON_KEY)
              }}
            >
              {leagueOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Box>

        <FormControl required disabled={busy || !leagueId}>
          <FormLabel>עונה</FormLabel>
          <Select
            value={seasonKey || null}
            placeholder='בחר עונה'
            onChange={(event, value) => setSeasonKey(value || '')}
          >
            {seasonOptions.map(option => (
              <Option
                key={option.seasonKey}
                value={option.seasonKey}
                disabled={Boolean(
                  selectedLeague
                  && selectedLeague.existingSeasonIds.includes(option.seasonId)
                )}
              >
                {option.label}
              </Option>
            ))}
          </Select>
        </FormControl>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 1,
            p: 1.25,
            borderRadius: 'md',
            bgcolor: 'background.level1',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography level='body-xs' color='neutral'>שנתון מחושב</Typography>
            <Typography level='title-md'>{birthYear || '—'}</Typography>
          </Box>
          <Box>
            <Typography level='body-xs' color='neutral'>זמן משחק</Typography>
            <Typography level='title-md'>{ageGroupId ? `${gameDurationMinutes} דקות` : '—'}</Typography>
          </Box>
          <Typography level='body-xs' color='neutral' sx={{ gridColumn: '1 / -1' }}>
            הנתונים נקבעים אוטומטית לפי קבוצת הגיל והעונה ואינם ניתנים לשינוי.
          </Typography>
        </Box>

        <Typography level='body-sm' color='neutral'>
          הפעולה תיצור ליגה ועונה במצב `NOT_LOADED`, ללא קבוצות. החלון ייסגר
          רק לאחר שהעונה תופיע במרכז הליגות, וניתן יהיה לטעון קבוצות מאוחר יותר.
        </Typography>
      </Stack>
    </RegularModal>
  )
}
