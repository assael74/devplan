// ui/fields/selectUi/trainings/ui/TrainingSelectValue.js

import React from 'react'
import { Typography } from '@mui/joy'
import { iconUi } from '../../../../core/icons/iconUi.js'

export default function TrainingSelectValue({
  opt,
  placeholder = '',
}) {
  if (!opt) {
    return (
      <Typography
        level="body-sm"
        sx={{ fontSize: 12, color: 'text.tertiary' }}
        noWrap
      >
        {placeholder}
      </Typography>
    )
  }

  return (
    <Typography
      level="body-sm"
      noWrap
      startDecorator={iconUi({ id: opt.idIcon })}
      sx={{ fontSize: 12, fontWeight: 600 }}
    >
      {opt.labelH || opt.label || ''}
    </Typography>
  )
}
