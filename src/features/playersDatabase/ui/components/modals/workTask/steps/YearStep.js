// src/features/playersDatabase/ui/components/modals/workTask/steps/YearStep.js

import * as React from 'react'
import {
  Box,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { workTaskStepsSx as sx } from '../sx/workTaskSteps.sx.js'

export default function YearStep({ model, actions }) {
  return (
    <Box sx={sx.stepContent}>
      <Typography level='title-lg' sx={sx.sectionTitle}>
        מאיזה שנתון מתחילים לעבוד?
      </Typography>
      <Typography level='body-sm' sx={sx.sectionCaption}>
        שנתון הוא נקודת הכניסה הקבועה לעבודה.
      </Typography>

      <Box sx={sx.fieldWrap}>
        <Typography level='body-xs' sx={sx.fieldLabel}>
          שנתון
        </Typography>
        <Select
          value={model.birthYear || null}
          placeholder='בחר שנתון'
          sx={sx.select}
          onChange={(event, value) => actions.onBirthYearChange(value || '')}
        >
          {model.birthYearOptions.map(year => (
            <Option key={year} value={String(year)}>
              {year}
            </Option>
          ))}
        </Select>
      </Box>
    </Box>
  )
}
