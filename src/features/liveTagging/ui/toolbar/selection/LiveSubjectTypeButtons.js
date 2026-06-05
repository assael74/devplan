// src/features/liveTagging/ui/toolbar/selection/LiveSubjectTypeButtons.js

import React from 'react'
import { Box, Button } from '@mui/joy'

import {
  LIVE_SUBJECT_OPTIONS,
} from '../../../logic/index.js'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { subjectTypeButtonsSx as sx } from './sx/subjectTypeButtons.sx.js'

export function LiveSubjectTypeButtons({ value, disabled, onChange }) {
  return (
    <Box sx={sx.selectionTypeActions}>
      {LIVE_SUBJECT_OPTIONS.map(option => (
        <Button
          key={option.id}
          size="sm"
          startDecorator={option.idIcon ? iconUi({ id: option.idIcon }) : null}
          variant={value === option.id ? 'solid' : 'soft'}
          color={value === option.id ? 'primary' : 'neutral'}
          disabled={disabled || option.disabled}
          onClick={() => onChange(option.id)}
          sx={sx.subjectTypeButton(value === option.id)}
        >
          {option.label}
        </Button>
      ))}
    </Box>
  )
}
