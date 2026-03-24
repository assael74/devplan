// ui/forms/ui/trainings/TrainingCreateFields.js

import React, { useEffect, useMemo, useCallback } from 'react'
import { Box, Typography, Divider } from '@mui/joy'

import TeamSelectField from '../../../fields/selectUi/teams/TeamSelectField'
import DateInputField from '../../../fields/dateUi/DateInputField.js'

import TrainingWeekDefaultsBar from './TrainingWeekDefaultsBar'
import TrainingWeekDayCard from './TrainingWeekDayCard'

import { trainingWeekSx as sx } from '../../sx/trainingWeekForm.sx'

import {
  clean,
  DAY_KEYS,
  DAY_LABELS,
  startOfWeekSunday,
  dateStrFromDate,
  buildEmptyDays,
  buildWeekDates,
  calcValidity,
  applyDefaultsToEnabledDays,
  updateDayInDays,
  calcPreviewCount,
} from '../../helpers/trainings/trainingsWeekForm.helpers'

const DEFAULT_DAY = {
  enabled: false,
  hour: '',
  duration: 90,
  type: 'technical',
  location: '',
  notes: '',
}

const DEFAULT_DEFAULTS = {
  hour: '18:00',
  duration: 90,
  type: 'technical',
  location: '',
}

function normalizeDefaults(defaults) {
  return {
    hour: clean(defaults?.hour || DEFAULT_DEFAULTS.hour),
    duration: Number(defaults?.duration ?? DEFAULT_DEFAULTS.duration) || DEFAULT_DEFAULTS.duration,
    type: clean(defaults?.type || DEFAULT_DEFAULTS.type),
    location: clean(defaults?.location || DEFAULT_DEFAULTS.location),
  }
}

function normalizeDays(days) {
  const base = buildEmptyDays()
  const src = days && typeof days === 'object' ? days : {}

  DAY_KEYS.forEach((key) => {
    const row = src[key] || {}
    base[key] = {
      ...base[key],
      ...row,
      enabled: row?.enabled === true,
      hour: clean(row?.hour || base[key].hour),
      duration: Number(row?.duration ?? base[key].duration) || base[key].duration,
      type: clean(row?.type || base[key].type),
      location: clean(row?.location || base[key].location),
      notes: clean(row?.notes || base[key].notes || ''),
    }
  })

  return base
}

function parseDateStr(value) {
  const safe = clean(value)
  if (!safe) return null

  const [y, m, d] = safe.split('-').map(Number)
  if (!y || !m || !d) return null

  const parsed = new Date(y, m - 1, d)
  if (Number.isNaN(parsed.getTime())) return null

  return parsed
}

export default function TrainingCreateFields({
  draft,
  onDraft,
  onValidChange,
  context,
  team,
}) {
  const teamId = clean(draft?.teamId || team?.id || team?.teamId)
  const clubId = clean(draft?.clubId || team?.clubId || team?.club?.id)
  const weekStartDate = clean(draft?.weekStartDate || draft?.weekId)
  const defaults = useMemo(() => normalizeDefaults(draft?.defaults), [draft?.defaults])
  const days = useMemo(() => normalizeDays(draft?.days), [draft?.days])

  const patchDraft = useCallback((partial) => {
    onDraft((prev) => ({
      ...(prev || {}),
      ...(partial || {}),
    }))
  }, [onDraft])

  const updateDay = useCallback((dayKey, partial) => {
    onDraft((prev) => ({
      ...(prev || {}),
      days: updateDayInDays({
        days: normalizeDays(prev?.days),
        dayKey,
        partial,
      }),
    }))
  }, [onDraft])

  const applyDefaultsToEnabled = useCallback(() => {
    onDraft((prev) => ({
      ...(prev || {}),
      days: applyDefaultsToEnabledDays({
        days: normalizeDays(prev?.days),
        defaults: normalizeDefaults(prev?.defaults),
      }),
    }))
  }, [onDraft])

  const applyDefaultsToAll = useCallback(() => {
    onDraft((prev) => {
      const prevDays = normalizeDays(prev?.days)
      const nextDefaults = normalizeDefaults(prev?.defaults)
      const nextDays = { ...prevDays }

      DAY_KEYS.forEach((key) => {
        nextDays[key] = {
          ...nextDays[key],
          ...nextDefaults,
          enabled: true,
        }
      })

      return {
        ...(prev || {}),
        days: nextDays,
      }
    })
  }, [onDraft])

  const weekDates = useMemo(() => {
    const parsed = parseDateStr(weekStartDate)
    if (!parsed) return {}

    const sunday = startOfWeekSunday(parsed)
    const rawWeekDates = buildWeekDates(sunday)

    return DAY_KEYS.reduce((acc, key) => {
      acc[key] = rawWeekDates[key] ? dateStrFromDate(rawWeekDates[key]) : ''
      return acc
    }, {})
  }, [weekStartDate])

  const previewCount = useMemo(() => calcPreviewCount(days), [days])

  const validity = useMemo(() => {
    return calcValidity({
      teamId,
      weekStartDate,
      days,
    })
  }, [teamId, weekStartDate, days])

  useEffect(() => {
    onValidChange(validity.isValid)
  }, [validity.isValid, onValidChange])

  return (
    <Box sx={sx.root}>
      <Box sx={sx.topGrid}>
        <TeamSelectField
          required
          value={teamId}
          clubId={clubId}
          options={Array.isArray(context?.teams) ? context.teams : []}
          onChange={() => {}}
          size="sm"
          disabled
        />

        <DateInputField
          label="שבוע (תאריך התחלה - יום א׳)"
          value={weekStartDate}
          onChange={(ymd) => {
            patchDraft({
              teamId,
              weekId: ymd || '',
              weekStartDate: ymd || '',
            })
          }}
          required
        />
      </Box>

      <TrainingWeekDefaultsBar
        defaults={defaults}
        onChangeDefaults={(next) => {
          patchDraft({ defaults: normalizeDefaults(next) })
        }}
        onApplyToEnabled={applyDefaultsToEnabled}
        onApplyToAll={applyDefaultsToAll}
      />

      <Divider />

      <Box sx={sx.daysGrid}>
        {DAY_KEYS.map((key) => (
          <TrainingWeekDayCard
            key={key}
            dayLabel={DAY_LABELS[key]}
            dateLabel={weekDates[key] || ''}
            row={days[key] || DEFAULT_DAY}
            defaults={defaults}
            onChange={(partial) => updateDay(key, partial)}
          />
        ))}
      </Box>

      <Box sx={sx.footerRow}>
        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
          תצוגה מקדימה: {previewCount} אימונים יישמרו השבוע
        </Typography>

        <Typography
          level="body-xs"
          sx={{ color: validity.isValid ? 'success.600' : 'warning.600' }}
        >
          {validity.isValid
            ? 'הטופס תקין לשמירה'
            : 'יש לבחור שבוע ולמלא לפחות יום אימון פעיל עם שעה'}
        </Typography>
      </Box>
    </Box>
  )
}
