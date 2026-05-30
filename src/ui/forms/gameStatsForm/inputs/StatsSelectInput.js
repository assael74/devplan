// src/ui/forms/gameStatsForm/inputs/StatsSelectInput.js

import React from 'react'
import {
  FormControl,
  FormLabel,
  Option,
  Select,
} from '@mui/joy'

import { inputsSx as sx } from './sx/inputs.sx.js'

const positionOptions = [
  { value: '', label: 'לא נבחר' },
  { value: 'GK', label: 'שוער' },
  { value: 'CB', label: 'בלם' },
  { value: 'RB', label: 'מגן ימין' },
  { value: 'LB', label: 'מגן שמאל' },
  { value: 'CM', label: 'קשר' },
  { value: 'AM', label: 'קשר התקפי' },
  { value: 'RW', label: 'כנף ימין' },
  { value: 'LW', label: 'כנף שמאל' },
  { value: 'ST', label: 'חלוץ' },
]

export default function StatsSelectInput({ label, value, onChange, options = positionOptions }) {
  return (
    <FormControl size="sm" sx={sx.compactField}>
      <FormLabel>{label}</FormLabel>

      <Select
        value={value ?? ''}
        onChange={(_, nextValue) => onChange?.(nextValue)}
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
