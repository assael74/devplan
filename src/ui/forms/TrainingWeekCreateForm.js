// C:\projects\devplan\src\ui\forms\TrainingWeekCreateForm.js
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import Divider from '@mui/joy/Divider'

import TeamSelectField from '../fields/selectUi/teams/TeamSelectField'
import DateInputField from '../fields/dateUi/DateInputField.js'

import TrainingWeekDefaultsBar from './ui/trainings/TrainingWeekDefaultsBar'
import TrainingWeekDayCard from './ui/trainings/TrainingWeekDayCard'

import { DEFAULT_TRAINING_DAY } from '../../shared/trainings/trainingsWeek.model.js'

import {
  safeStr,
  clean,
  DAY_KEYS,
  DAY_LABELS,
  todayDateStr,
  startOfWeekSunday,
  dateStrFromDate,
  buildEmptyDays,
  buildWeekDates,
  calcValidity,
  applyDefaultsToEnabledDays,
  updateDayInDays,
  calcPreviewCount,
} from './helpers/trainings/trainingsWeekForm.helpers'

import { trainingWeekSx as sx } from './sx/trainingWeekForm.sx'

const toWeekStartObj = (ymd) => {
  const s = safeStr(ymd || todayDateStr())
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return startOfWeekSunday(new Date())
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  d.setHours(0, 0, 0, 0)
  return d
}

const initDraft = (d) => {
  const hasDays = d?.days && typeof d.days === 'object'
  const hasDefaults = d?.defaults && typeof d.defaults === 'object'
  const hasWeekStart = !!clean(d?.weekStartDate)

  return {
    ...d,
    weekStartDate: hasWeekStart ? d.weekStartDate : dateStrFromDate(startOfWeekSunday(new Date())),
    days: hasDays ? d.days : buildEmptyDays(),
    defaults: hasDefaults ? d.defaults : DEFAULT_TRAINING_DAY,
    isDirty: !!d?.isDirty,
  }
}

export default function TrainingWeekCreateForm({
  draft,
  onDraft,
  onValidChange,
  context,
  team,
  mode = 'modal',
}) {
  const [isDirty, setIsDirty] = useState(!!draft?.isDirty)
  const d = useMemo(() => initDraft(draft || {}), [draft])
  const teamId = team?.id
  const clubId = team?.club?.id

  useEffect(() => {
    if (draft && (draft.weekStartDate || draft.days || draft.defaults)) return
    onDraft(d)
  }, [])

  const patch = useCallback(
    (next, { silent } = {}) => {
      const nextDraft = { ...d, ...(next || {}) }
      const mark = !silent && !isDirty ? true : isDirty
      if (mark) {
        setIsDirty(true)
        nextDraft.isDirty = true
      } else {
        nextDraft.isDirty = !!nextDraft.isDirty
      }
      onDraft(nextDraft)
    },
    [d, onDraft, isDirty]
  )

  const weekStartDate = safeStr(d?.weekStartDate || todayDateStr())
  const days = d?.days || buildEmptyDays()
  const defaults = d?.defaults || DEFAULT_TRAINING_DAY

  const weekDates = useMemo(() => buildWeekDates(toWeekStartObj(weekStartDate)), [weekStartDate])

  const validity = useMemo(() => calcValidity({ teamId, weekStartDate, days }), [teamId, weekStartDate, days])
  useEffect(() => onValidChange(!!validity.isValid), [validity.isValid, onValidChange])

  const previewCount = useMemo(() => calcPreviewCount(days), [days])

  const onApplyDefaultsToEnabled = useCallback(
    () => patch({ days: applyDefaultsToEnabledDays({ days, defaults }) }),
    [patch, days, defaults]
  )

  const applyDefaultsToAllDaysAndEnable = ({ days, defaults }) => {
    const src = days && typeof days === 'object' ? days : {}
    const d = defaults && typeof defaults === 'object' ? defaults : {}

    const next = { ...src }
    for (const k of DAY_KEYS) {
      const row = src[k] || {}
      next[k] = {
        ...row,
        enabled: true,
        hour: d.hour || '00:00',
        duration: d.duration ?? 90,
        type: d.type || 'technical',
        location: d.location || '',
      }
    }
    return next
  }

  const onApplyDefaultsToAll = useCallback(
    () => patch({ days: applyDefaultsToAllDaysAndEnable({ days, defaults }) }),
    [patch, days, defaults]
  )

  const onUpdateDay = useCallback(
    (dayKey, partial) => patch({ days: updateDayInDays({ days, dayKey, partial }) }),
    [patch, days]
  )

  return (
    <Box sx={sx.root}>
      <Box sx={sx.topGrid}>
        <TeamSelectField
          required
          value={team?.id}
          clubId={clubId}
          options={Array.isArray(context?.teams) ? context.teams : []}
          onChange={() => {}}
          size="sm"
          disabled
        />

        <DateInputField
          label="שבוע (תאריך התחלה - יום א׳)"
          value={weekStartDate}
          onChange={(ymd) => patch({ weekStartDate: ymd })}
          required
        />
      </Box>

      <TrainingWeekDefaultsBar
        defaults={defaults}
        onChangeDefaults={(next) => patch({ defaults: next })}
        onApplyToEnabled={onApplyDefaultsToEnabled}
        onApplyToAll={onApplyDefaultsToAll}
      />

      <Divider />

      <Box sx={sx.daysGrid}>
        {DAY_KEYS.map((k) => (
          <TrainingWeekDayCard
            key={k}
            dayLabel={DAY_LABELS[k]}
            dateLabel={weekDates[k] ? dateStrFromDate(weekDates[k]) : ''}
            row={days[k] || {}}
            defaults={defaults}
            onToggle={(enabled) => onUpdateDay(k, { enabled })}
            onChange={(partial) => onUpdateDay(k, partial)}
          />
        ))}
      </Box>

      <Box sx={sx.footerRow}>
        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
          תצוגה מקדימה: {previewCount} אימונים ייווצרו השבוע
        </Typography>

        <Typography level="body-xs" sx={{ color: isDirty ? 'warning.600' : 'text.tertiary' }}>
          {isDirty ? 'בוצעו שינויים' : 'ללא שינויים'}
        </Typography>
      </Box>
    </Box>
  )
}
