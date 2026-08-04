// ui/forms/trainings/TrainingWeekDefaultsBar.js

import React, { useMemo } from 'react'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Typography from '@mui/joy/Typography'
import Sheet from '@mui/joy/Sheet'

import HourInputField from '../../fields/core/HourInputField.js'
import DurationField from '../../fields/trainings/DurationField.js'
import TrainingTypeSelectField from '../../fields/trainings/TrainingTypeSelectField.js'
import TrainingLocationField from '../../fields/trainings/TrainingLocationField.js'

import { trainingWeekSx as sx } from './sx/trainingWeekForm.sx'
import { DEFAULT_TRAINING_DAY } from '../../../shared/trainings/trainingsWeek.model.js'

const numOr = (v, fallback) => (Number(v) || fallback)

export default function TrainingWeekDefaultsBar({
  defaults,
  onChangeDefaults,
  onApplyToEnabled,
  onApplyToAll,
}) {
  const d = useMemo(() => ({ ...DEFAULT_TRAINING_DAY, ...(defaults || {}) }), [defaults])

  const patch = (next) => onChangeDefaults({ ...d, ...(next || {}) })

  return (
    <Sheet variant="soft" sx={sx.defaultsSheet}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Typography level="title-sm">ברירת מחדל לשבוע</Typography>
        <Box sx={{ display: 'flex', gap: 1,  }} >
          <Button
            size="sm"
            variant="plain"
            onClick={onApplyToEnabled}
            sx={sx.appToEnBtn}
          >
            החל על המסומנים
          </Button>

          <Button
            size="sm"
            variant="solid"
            onClick={onApplyToAll}
            sx={sx.appToAlBtn}
          >
            החל על כל הימים
          </Button>
        </Box>
      </Box>

      <Box sx={sx.defaultsRow1}>
        <HourInputField
          label="שעה"
          value={d.hour}
          onChange={(hour) => patch({ hour })}
        />

        <DurationField
          label="משך (דקות)"
          value={d.duration}
          onChange={(v) => patch({ duration: numOr(v, 90) })}
        />

        <TrainingTypeSelectField
          value={d.type}
          onChange={(type) => patch({ type })}
        />

        <TrainingLocationField
          value={d.location}
          onChange={(location) => patch({ location })}
          placeholder="לדוגמה: מגרש סינטטי"
        />
      </Box>
    </Sheet>
  )
}
