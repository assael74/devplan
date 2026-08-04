// ui/forms/players/edit/PlayerBirthFields.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  DateInputField,
  MonthNumberPicker,
  MonthYearPicker,
  YearPicker,
} from '../../../fields'

export default function PlayerBirthFields({
  draft,
  onField,
  disabled = false,
  layout,
  mode = 'split',
  size = 'sm',
}) {
  const splitBirth = mode === 'split'

  return (
    <Box sx={layout}>
      <DateInputField
        label="תאריך לידה"
        size={size}
        value={draft?.birthDay || ''}
        onChange={(value) => onField('birthDay', value)}
        disabled={disabled}
      />

      {splitBirth ? (
        <>
          <MonthNumberPicker
            label="חודש"
            icon={false}
            value={draft?.month || ''}
            onChange={(value) => onField('month', value)}
            disabled={disabled}
          />

          <YearPicker
            label="שנתון"
            icon={false}
            value={draft?.year || ''}
            onChange={(value) => onField('year', value)}
            disabled={disabled}
          />
        </>
      ) : (
        <MonthYearPicker
          value={draft?.birth || ''}
          onChange={(value) => onField('birth', value)}
          disabled={disabled}
        />
      )}
    </Box>
  )
}
