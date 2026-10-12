// src/features/playersDatabase/ui/pages/leagueCenterPage/OpenLeagueModal.js

import * as React from 'react'
import {
  Alert,
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
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
import { importModalChromeSx as chromeSx } from '../../components/modals/paste/sx/importModalChrome.sx.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const isValidSeasonUrl = value => {
  const url = clean(value)
  if (!url) return true

  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

export default function OpenLeagueModal({
  open,
  options = [],
  busy = false,
  waitingForCenter = false,
  error = '',
  repairContext = null,
  onClose,
  onConfirm,
}) {
  const [ageGroupId, setAgeGroupId] = React.useState('')
  const [leagueId, setLeagueId] = React.useState('')
  const [seasonKey, setSeasonKey] = React.useState(PLAYERS_DATABASE_CURRENT_SEASON_KEY)
  const [gameDurationMinutes, setGameDurationMinutes] = React.useState(90)
  const [seasonUrl, setSeasonUrl] = React.useState('')
  const seasonOptions = getSeasonCatalogOptions()
  const repairLeague = repairContext
    ? options.find(option => option.value === repairContext.leagueId)
    : null
  const repairSeason = repairContext
    ? seasonOptions.find(option => option.seasonId === repairContext.seasonId)
    : null
  const repairLeagueId = repairLeague ? repairLeague.value : ''
  const repairAgeGroupId = repairLeague ? repairLeague.ageGroupId : ''
  const repairSeasonKey = repairSeason ? repairSeason.seasonKey : ''
  const repairReload = Boolean(repairContext)
  const repairContextMissing = repairReload && (!repairLeague || !repairSeason)
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
    setAgeGroupId(repairAgeGroupId)
    setLeagueId(repairLeagueId)
    setSeasonKey(repairReload ? repairSeasonKey : PLAYERS_DATABASE_CURRENT_SEASON_KEY)
    setGameDurationMinutes(repairReload ? resolvePlayersDatabaseLeagueGameTime(repairAgeGroupId) : 90)
    setSeasonUrl('')
  }, [open, repairAgeGroupId, repairLeagueId, repairReload, repairSeasonKey])

  const handleConfirm = () => {
    if (!isValidSeasonUrl(seasonUrl) || repairContextMissing) return
    if (repairReload && (
      leagueId !== repairContext.leagueId
      || !selectedSeason
      || selectedSeason.seasonId !== repairContext.seasonId
    )) return

    const selected = options.find(option => option.value === leagueId)
    if (selected && selectedSeason && onConfirm) {
      onConfirm({
        ...selected,
        seasonId: selectedSeason.seasonId,
        seasonKey,
        birthYear,
        gameDurationMinutes: Number(gameDurationMinutes),
        seasonUrl: clean(seasonUrl),
      })
    }
  }

  return (
    <RegularModal
      open={open}
      title={repairReload ? 'השלמת מקור ליגה חסר' : 'פתיחת ליגה'}
      description={repairReload
        ? 'אשר את פרטי הליגה מהקטלוג לפתיחת העונה החסרה. לאחר מכן תוכל לטעון מחדש את טבלת הליגה.'
        : 'בחר קבוצת גיל, ליגה ועונה ליצירת עונה חדשה ללא קבוצות.'}
      iconId='addSeason'
      confirmLabel={waitingForCenter
        ? 'ממתין למרכז הליגות'
        : busy
          ? 'פותח ליגה'
          : repairReload ? 'אשר ופתח מקור ליגה' : 'פתיחת ליגה'}
      confirmIconId='addSeason'
      headerIconSx={chromeSx.modalHeaderIcon}
      hideCancel
      busy={busy}
      disabled={
        !leagueId
        || !selectedSeason
        || (seasonAlreadyExists && !repairReload)
        || repairContextMissing
        || !Number.isFinite(Number(gameDurationMinutes))
        || Number(gameDurationMinutes) <= 0
        || !isValidSeasonUrl(seasonUrl)
      }
      onConfirm={handleConfirm}
      onClose={onClose}
    >
      <Stack spacing={1.5}>
        {repairReload ? (
          <Alert color={repairContextMissing ? 'danger' : 'warning'} variant='soft'>
            {repairContextMissing
              ? `הליגה או העונה אינן זמינות בקטלוג. לא ניתן לפתוח מקור עבור ${repairContext.leagueId} בעונה ${repairContext.seasonId}.`
              : 'התיקון מיועד לליגה ולעונה שבממצא. הפרטים נעולים, והשמירה תבוצע לאחר אישורך.'}
          </Alert>
        ) : null}
        {error ? (
          <Alert color='danger' variant='soft'>{error}</Alert>
        ) : null}

        {waitingForCenter ? (
          <Alert color='primary' variant='soft'>
            הכתיבה וה־Audit הושלמו. ממתין שהעונה תופיע בעדכון בזמן אמת של מרכז הליגות.
          </Alert>
        ) : busy ? (
          <Alert color='primary' variant='soft'>
            {repairReload
              ? 'מקור הליגה והתוצרים מתעדכנים, ולאחר מכן תתבצע בדיקה חוזרת.'
              : 'הקבלה נפתחה. מקור האמת והתוצרים מתעדכנים לפי הסדר.'}
          </Alert>
        ) : null}

        <FormControl required disabled={busy || repairReload}>
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
                  !repairReload && selectedLeague
                  && selectedLeague.existingSeasonIds.includes(option.seasonId)
                )}
              >
                {option.label}
              </Option>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(10rem, 0.8fr) minmax(14rem, 1.2fr)' }, gap: 1.5 }}>
          <FormControl required disabled={busy || repairReload}>
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

          <FormControl required disabled={busy || repairReload || !ageGroupId}>
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
                const selectedSeasonExists = Boolean(
                  nextLeague
                  && selectedSeason
                  && nextLeague.existingSeasonIds.includes(selectedSeason.seasonId)
                )
                const nextSeasonKey = selectedSeasonExists
                  ? (currentSeasonExists ? '' : PLAYERS_DATABASE_CURRENT_SEASON_KEY)
                  : seasonKey

                setLeagueId(nextLeagueId)
                setSeasonKey(nextSeasonKey)
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

        <FormControl
          disabled={busy || !leagueId || !seasonKey}
          error={!isValidSeasonUrl(seasonUrl)}
        >
          <FormLabel>קישור לעונה</FormLabel>
          <Input
            type='url'
            value={seasonUrl}
            placeholder='https://...'
            onChange={event => setSeasonUrl(event.target.value)}
          />
          <FormHelperText>
            {isValidSeasonUrl(seasonUrl)
              ? 'אופציונלי — יוצג כמקור הליגה לאחר הפתיחה.'
              : 'יש להזין קישור תקין שמתחיל ב־http:// או https://'}
          </FormHelperText>
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
      </Stack>
    </RegularModal>
  )
}
