// features/playersDatabase/ui/components/actions/InlineSelectConfirm.js

import * as React from 'react'
import {
  Box,
  IconButton,
  Option,
  Select,
  Tooltip,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { inlineSelectConfirmSx as sx } from './InlineSelectConfirm.sx.js'

export default function InlineSelectConfirm({
  value = '',
  options = [],
  placeholder = 'לא עודכן',
  disabled = false,
  busy = false,
  fontSize = 12,
  onConfirm,
}) {
  const [draftValue, setDraftValue] = React.useState(value || '')

  React.useEffect(() => {
    setDraftValue(value || '')
  }, [value])

  const changed = draftValue !== (value || '')

  return (
    <Box sx={sx.root}>
      <Select
        size='sm'
        value={draftValue}
        disabled={disabled || busy}
        placeholder={placeholder}
        onChange={(_, nextValue) => setDraftValue(nextValue || '')}
        sx={sx.select(fontSize)}
      >
        <Option value=''>ללא</Option>

        {options.map(option => (
          <Option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </Option>
        ))}
      </Select>

      {changed ? (
        <Tooltip title='אישור שינוי'>
          <IconButton
            size='sm'
            variant='solid'
            disabled={disabled || busy}
            aria-label='אישור שינוי'
            onClick={() => onConfirm?.(draftValue)}
            sx={sx.confirmButton}
          >
            {iconUi({
              id: 'save',
              size: 'sm',
            })}
          </IconButton>
        </Tooltip>
      ) : null}
    </Box>
  )
}
