/// ui/fields/dateUi/DateInputField.js
import React, { useEffect, useMemo, useState } from 'react'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import Input from '@mui/joy/Input'
import FormHelperText from '@mui/joy/FormHelperText'

import { iconUi } from '../../core/icons/iconUi.js'
import { normalizeFullDate, ymdToDmy } from '../../../shared/format/dateUtiles.js'

export default function DateInputField({
  label = 'תאריך',
  value,           // stored as YMD: "YYYY-MM-DD"
  onChange,        // (ymd) => void
  required = false,
  disabled = false,
  helperText = '',
  sx,
}) {
  const dmyFromValue = useMemo(() => ymdToDmy(value), [value])
  const [text, setText] = useState(dmyFromValue)

  useEffect(() => {
    // keep in sync if parent changes
    setText(dmyFromValue)
  }, [dmyFromValue])

  const commit = (raw) => {
    const { ymd, dmy } = normalizeFullDate(raw)
    setText(dmy || raw)
    onChange(ymd || '')
  }

  return (
    <FormControl required={required} disabled={disabled}>
      <FormLabel sx={{ fontSize: 12, textAlign: 'right' }}>{label}</FormLabel>
      <Input
        value={text}
        endDecorator={iconUi({id: 'date'})}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => commit(text)}
        placeholder="dd-mm-yyyy"
        size="sm"
      />
      {!!helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}
