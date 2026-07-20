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
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        minWidth: 0,
      }}
    >
      <Select
        size='sm'
        value={draftValue}
        disabled={disabled || busy}
        placeholder={placeholder}
        onChange={(_, nextValue) => setDraftValue(nextValue || '')}
        sx={{
          minHeight: 28,
          minWidth: 82,
          maxWidth: 118,
          fontSize,
          borderRadius: 7,
          '--Select-decoratorChildHeight': '26px',
        }}
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
            sx={{
              width: 28,
              minWidth: 28,
              height: 28,
              minHeight: 28,
              borderRadius: 7,
            }}
          >
            {iconUi({ id: 'save', size: 'sm' })}
          </IconButton>
        </Tooltip>
      ) : null}
    </Box>
  )
}
