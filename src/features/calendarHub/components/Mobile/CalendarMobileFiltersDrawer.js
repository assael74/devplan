import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import MobileFiltersDrawerShell from '../../../../ui/patterns/filters/MobileFiltersDrawerShell.js'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'

import {
  CALENDAR_FILTER_GROUPS,
} from '../../logic/calendarHub.constants.js'

import {
  toggleCalendarFilter,
} from '../../logic/calendarHub.helpers.js'

export default function CalendarMobileFiltersDrawer({
  open,
  onClose,
  filters = {},
  onFilter,
  onReset,
  resetDisabled = false,
  resultsText = '',
}) {
  const handleToggle = (key) => {
    onFilter?.(toggleCalendarFilter(filters, key))
  }

  return (
    <MobileFiltersDrawerShell
      open={open}
      onClose={onClose}
      entity="calendar"
      title="סינון יומן"
      subtitle="בחר אילו ימים ואילו סוגי אירועים להציג"
      resultsText={resultsText}
      onReset={onReset}
      resetDisabled={resetDisabled}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {CALENDAR_FILTER_GROUPS.map((group) => (
          <Box key={group.id}>
            <Typography level="title-sm" sx={{ mb: 0.75, color: 'text.secondary' }}>
              {group.label}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {group.options.map((option) => {
                const active = filters[option.id] !== false

                return (
                  <Chip
                    key={option.id}
                    size="sm"
                    color={active ? 'success' : 'neutral'}
                    variant={active ? 'solid' : 'outlined'}
                    startDecorator={iconUi({ id: option.idIcon })}
                    onClick={() => handleToggle(option.id)}
                    sx={{ cursor: 'pointer', borderRadius: 999 }}
                  >
                    {option.label}
                  </Chip>
                )
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </MobileFiltersDrawerShell>
  )
}
