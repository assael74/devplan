// C:\projects\devplan\src\ui\forms\ui\trainings\TrainingWeekDefaultsBar.js
import React, { useMemo } from 'react'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Typography from '@mui/joy/Typography'
import Sheet from '@mui/joy/Sheet'

import HourInputField from '../../../fields/dateUi/HourInputField.js'
import DurationField from '../../../fields/inputUi/trainings/DurationField.js'
import TrainingsTypeSelectField from '../../../fields/selectUi/trainings/TrainingsTypeSelectField.js'
import TrainingLocationField from '../../../fields/inputUi/trainings/TrainingLocationField.js'

import { trainingWeekSx as sx } from '../../sx/trainingWeekForm.sx'
import { DEFAULT_TRAINING_DAY } from '../../../../shared/trainings/trainingsWeek.model.js'

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
          <Button size="sm" variant="outlined" onClick={onApplyToEnabled} sx={{ px: 1, py: 0.25, fontSize: 10 }}>
            החל על המסומנים
          </Button>

          <Button size="sm" variant="solid" onClick={onApplyToAll} sx={{ px: 1, py: 0.25, fontSize: 10 }}>
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

        <TrainingsTypeSelectField
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
