// features/playersDatabase/components/summary/leagueList/toolbar/Toolbar.js

import React from 'react'
import {
  Box,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { toolbarSx as sx } from './toolbar.sx.js'

export default function Toolbar({
  birthYearFilter,
  levelFilter,
  birthYearOptions,
  levelOptions,
  onBirthYearChange,
  onLevelChange,
}) {
  return (
    <Box sx={sx.toolbar}>
      <Typography level="title-sm" sx={sx.title}>
        ליגות המאגר
      </Typography>

      <Box sx={sx.filters}>
        <Select
          size="sm"
          value={birthYearFilter}
          sx={sx.filterSelect}
          onChange={(event, value) => onBirthYearChange(value || 'all')}
        >
          {birthYearOptions.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={levelFilter}
          sx={sx.filterSelect}
          onChange={(event, value) => onLevelChange(value || 'all')}
        >
          {levelOptions.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </Box>
    </Box>
  )
}
