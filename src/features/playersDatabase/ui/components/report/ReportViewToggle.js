// features/playersDatabase/ui/components/report/ReportViewToggle.js

import {
  Box,
  Button,
} from '@mui/joy'

import { reportViewToggleSx as sx } from './sx/reportViewToggle.sx.js'

export default function ReportViewToggle({
  value,
  options = [],
  onChange,
  ariaLabel = 'בחירת תצוגה',
}) {
  return (
    <Box role='group' aria-label={ariaLabel} sx={sx.viewToggle}>
      {options.map(option => {
        const isActive = option.id === value

        return (
          <Button
            key={option.id}
            size='sm'
            variant='plain'
            aria-pressed={isActive}
            onClick={() => onChange?.(option.id)}
            sx={sx.viewToggleButton({ isActive })}
          >
            {option.label}
          </Button>
        )
      })}
    </Box>
  )
}
