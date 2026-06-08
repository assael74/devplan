// features/squadSimulator/ui/components/SelectField.js

import { FormControl, FormLabel, Option, Select } from '@mui/joy'

import { squadSimulatorSx as sx } from './sx/squadSimulator.sx.js'

export default function SelectField({
  label,
  value,
  options,
  onChange,
  startDecorator,
  sx: fieldSx,
  selectSx,
}) {
  return (
    <FormControl size="sm" sx={{ ...sx.control, ...fieldSx }}>
      <FormLabel>{label}</FormLabel>
      <Select
        value={value}
        startDecorator={startDecorator}
        sx={{ ...sx.rtlField, ...selectSx }}
        onChange={(event, nextValue) => onChange(nextValue)}
      >
        {options.map(option => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
    </FormControl>
  )
}
