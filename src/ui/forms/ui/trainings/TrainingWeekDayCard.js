// ui/forms/ui/trainings/TrainingWeekDayCard.js

import React, { useMemo } from 'react'
import Box from '@mui/joy/Box'
import Chip from '@mui/joy/Chip'
import Typography from '@mui/joy/Typography'
import Switch from '@mui/joy/Switch'
import Sheet from '@mui/joy/Sheet'

import HourInputField from '../../../fields/dateUi/HourInputField.js'
import DurationField from '../../../fields/inputUi/trainings/DurationField.js'
import TrainingsTypeSelectField from '../../../fields/selectUi/trainings/TrainingsTypeSelectField.js'
import TrainingLocationField from '../../../fields/inputUi/trainings/TrainingLocationField.js'

import { trainingWeekSx as sx } from '../../sx/trainingWeekForm.sx'
import { safeStr } from '../../helpers/trainings/trainingsWeekForm.helpers'
import { getFullDateIl } from '../../../../shared/format/dateUtiles.js'
import { DEFAULT_TRAINING_DAY } from '../../../../shared/trainings/trainingsWeek.model.js'

const numOr = (v, fallback) => (Number(v) || fallback)

export default function TrainingWeekDayCard({ dayLabel, dateLabel, row, defaults, onToggle, onChange }) {
  const enabled = !!row?.enabled
  const base = useMemo(() => ({ ...DEFAULT_TRAINING_DAY, ...(defaults || {}) }), [defaults])

  const view = useMemo(
    () => ({
      hour: safeStr(row?.hour || base.hour || '00:00'),
      duration: numOr(row?.duration ?? base.duration, 90),
      type: safeStr(row?.type || base.type || 'technical'),
      location: safeStr(row?.location || base.location || ''),
    }),
    [row, base]
  )

  const patch = (next) => onChange({ ...(next || {}) })

  const variant = enabled ? 'outlined' : 'soft'
  const color = enabled ? 'success' : 'neutral'
  const colorDay = enabled ? 'success' : 'danger'

  return (
    <Sheet variant={variant} color={color} sx={sx.sheet(enabled)}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1, minWidth: 0 }}>
          <Chip size="sm" variant="solid" color={colorDay}>
            יום {dayLabel}
          </Chip>
          <Typography level="body-sm" sx={{ opacity: 0.85 }}>
            {getFullDateIl(dateLabel)}
          </Typography>

          {!enabled ? (
            <Typography color="danger" level="body-xs" sx={{ whiteSpace: 'nowrap' }}>
              אין אימון ביום זה
            </Typography>
          ) : null}
        </Box>

        <Switch
          size="sm"
          checked={enabled}
          onChange={(e) => {
            const v = e.target.checked
            onChange({
              enabled: v,
              ...(v
                ? {
                    // stamp defaults only when enabling
                    hour: row?.hour || defaults?.hour || '00:00',
                    duration: row?.duration ?? defaults?.duration ?? 90,
                    type: row?.type || defaults?.type || 'technical',
                    location: row?.location || defaults?.location || '',
                  }
                : {}),
            })
          }}
        />
      </Box>

      <Box sx={{ display: 'grid', gap: 1, minWidth: 0 }}>
        <Box sx={sx.dayFieldsRow}>
          <HourInputField
            label="שעה"
            value={view.hour}
            onChange={(hour) => patch({ hour })}
            required
            disabled={!enabled}
          />

          <DurationField
            label="משך"
            value={view.duration}
            disabled={!enabled}
            onChange={(v) => patch({ duration: numOr(v, 90) })}
          />

          <TrainingsTypeSelectField
            value={view.type}
            onChange={(type) => patch({ type })}
            disabled={!enabled}
          />

          <TrainingLocationField
            value={view.location}
            placeholder="לדוגמה: מגרש סינטטי"
            onChange={(location) => patch({ location })}
            disabled={!enabled}
           />
        </Box>
      </Box>
    </Sheet>
  )
}
