// src/features/calendar/components/EventDrawer.js
import React, { useMemo } from 'react'
import { Drawer, Sheet, Box, Typography, Button, FormControl, FormLabel, Input, Select, Option } from '@mui/joy'
import { EVENT_TYPES } from '../calendar.mock'

export default function EventDrawer({
  open,
  onClose,
  draft,
  onDraft,
  calendars,
  mode = 'create',
  onSave,
}) {
  const typeOptions = useMemo(() => Object.entries(EVENT_TYPES), [])

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      size="md"
      sx={{ '--Drawer-horizontalSize': '420px' }}
    >
      <Sheet sx={{ height: '100%', p: 1.25, display: 'grid', gridTemplateRows: 'auto 1fr auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box>
            <Typography level="title-lg">{mode === 'edit' ? 'עריכת אירוע' : 'אירוע חדש'}</Typography>
            <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
              בשלב זה UI בלבד (חיבור דטה בהמשך)
            </Typography>
          </Box>
          <Button variant="soft" color="neutral" onClick={onClose}>
            סגור
          </Button>
        </Box>

        <Box sx={{ mt: 1.25, display: 'grid', gap: 1 }}>
          <FormControl size="sm">
            <FormLabel>סוג אירוע</FormLabel>
            <Select value={draft.type || 'meeting_player'} onChange={(e, v) => onDraft({ ...draft, type: v })}>
              {typeOptions.map(([k, v]) => (
                <Option key={k} value={k}>
                  {v.icon} {v.label}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl size="sm">
            <FormLabel>יומן</FormLabel>
            <Select value={draft.calendarId || ''} onChange={(e, v) => onDraft({ ...draft, calendarId: v })}>
              {calendars.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.label}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl size="sm">
            <FormLabel>כותרת</FormLabel>
            <Input value={draft.title || ''} onChange={(e) => onDraft({ ...draft, title: e.target.value })} />
          </FormControl>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <FormControl size="sm">
              <FormLabel>תאריך</FormLabel>
              <Input
                type="date"
                value={draft.date || ''}
                onChange={(e) => onDraft({ ...draft, date: e.target.value })}
              />
            </FormControl>

            <FormControl size="sm">
              <FormLabel>שעה (חובה למשחק)</FormLabel>
              <Input
                type="time"
                value={draft.time || ''}
                onChange={(e) => onDraft({ ...draft, time: e.target.value })}
              />
            </FormControl>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <FormControl size="sm">
              <FormLabel>משך (דקות)</FormLabel>
              <Input
                type="number"
                value={draft.durationMin ?? 45}
                onChange={(e) => onDraft({ ...draft, durationMin: Number(e.target.value || 0) })}
              />
            </FormControl>

            <FormControl size="sm">
              <FormLabel>סטטוס</FormLabel>
              <Select value={draft.status || 'planned'} onChange={(e, v) => onDraft({ ...draft, status: v })}>
                <Option value="planned">מתוכנן</Option>
                <Option value="done">בוצע</Option>
                <Option value="canceled">בוטל</Option>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1.25 }}>
          <Button variant="soft" color="neutral" onClick={onClose}>
            ביטול
          </Button>
          <Button onClick={onSave}>שמור</Button>
        </Box>
      </Sheet>
    </Drawer>
  )
}
