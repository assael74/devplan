// src/features/calendar/components/drawer/EventHeaderDrawer.js

import React, { useMemo } from 'react'
import { Box, FormControl, FormLabel, Input, Select, Option } from '@mui/joy'

import { CALENDAR_EVENT_TYPES } from '../../../logic/calendarHub.constants.js'

export default function EventContentDrawer({
  draft,
  onDraft,
  calendars = [],
}) {
  const typeOptions = useMemo(() => Object.entries(CALENDAR_EVENT_TYPES), [])

  function setField(key, value) {
    onDraft?.({
      ...draft,
      [key]: value,
    })
  }

  return (
    <Box sx={{ display: 'grid', gap: 1.25 }}>
      <FormControl size="sm">
        <FormLabel>סוג אירוע</FormLabel>
        <Select
          value={draft?.type || 'meeting_player'}
          onChange={(_, v) => setField('type', v || 'meeting_player')}
        >
          {typeOptions.map(([key, val]) => (
            <Option key={key} value={key}>
              {val.label}
            </Option>
          ))}
        </Select>
      </FormControl>

      <FormControl size="sm">
        <FormLabel>יומן</FormLabel>
        <Select
          value={draft?.calendarId || ''}
          onChange={(_, v) => setField('calendarId', v || '')}
        >
          {calendars.map((c) => (
            <Option key={c.id} value={c.id}>
              {c.label}
            </Option>
          ))}
        </Select>
      </FormControl>

      <FormControl size="sm">
        <FormLabel>כותרת</FormLabel>
        <Input
          value={draft?.title || ''}
          onChange={(e) => setField('title', e.target.value)}
        />
      </FormControl>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        <FormControl size="sm">
          <FormLabel>תאריך</FormLabel>
          <Input
            type="date"
            value={draft?.date || ''}
            onChange={(e) => setField('date', e.target.value)}
          />
        </FormControl>

        <FormControl size="sm">
          <FormLabel>שעה</FormLabel>
          <Input
            type="time"
            value={draft?.time || ''}
            onChange={(e) => setField('time', e.target.value)}
          />
        </FormControl>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        <FormControl size="sm">
          <FormLabel>משך (דקות)</FormLabel>
          <Input
            type="number"
            value={draft?.durationMin ?? 45}
            onChange={(e) => setField('durationMin', Number(e.target.value || 0))}
          />
        </FormControl>

        <FormControl size="sm">
          <FormLabel>סטטוס</FormLabel>
          <Select
            value={draft?.status || 'planned'}
            onChange={(_, v) => setField('status', v || 'planned')}
          >
            <Option value="planned">מתוכנן</Option>
            <Option value="done">בוצע</Option>
            <Option value="canceled">בוטל</Option>
          </Select>
        </FormControl>
      </Box>
    </Box>
  )
}
