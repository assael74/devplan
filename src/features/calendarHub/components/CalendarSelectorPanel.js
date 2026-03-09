// src/features/calendar/components/CalendarSelectorPanel.js
import React, { useMemo } from 'react'
import { Box, Typography, List, ListItem, ListItemButton, ListItemContent, Chip, Divider } from '@mui/joy'

export default function CalendarSelectorPanel({ calendars, activeIds, onToggle, filters, onFilter }) {
  const groups = useMemo(() => {
    const team = calendars.filter((c) => c.type === 'team')
    const staff = calendars.filter((c) => c.type === 'staff')
    return { team, staff }
  }, [calendars])

  return (
    <Box sx={{ p: 0.75 }}>
      <Typography level="title-md">יומנים</Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 0.25 }}>
        הדלק/כבה כדי לייצר Overlay (קבוצה + אנליסט)
      </Typography>

      <Divider sx={{ my: 1 }} />

      <Typography level="title-sm" sx={{ mb: 0.5 }}>
        קבוצות
      </Typography>
      <List size="sm" sx={{ '--ListItem-paddingX': '0px', mb: 1 }}>
        {groups.team.map((c) => {
          const on = activeIds.includes(c.id)
          return (
            <ListItem key={c.id}>
              <ListItemButton
                variant={on ? 'soft' : 'plain'}
                onClick={() => onToggle(c.id)}
                sx={{ borderRadius: 12, gap: 1 }}
              >
                <Chip size="sm" color={c.color} variant={on ? 'solid' : 'soft'}>
                  {on ? 'ON' : 'OFF'}
                </Chip>
                <ListItemContent>
                  <Typography level="body-sm">{c.label}</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Typography level="title-sm" sx={{ mb: 0.5 }}>
        אנליסטים / צוות
      </Typography>
      <List size="sm" sx={{ '--ListItem-paddingX': '0px' }}>
        {groups.staff.map((c) => {
          const on = activeIds.includes(c.id)
          return (
            <ListItem key={c.id}>
              <ListItemButton
                variant={on ? 'soft' : 'plain'}
                onClick={() => onToggle(c.id)}
                sx={{ borderRadius: 12, gap: 1 }}
              >
                <Chip size="sm" color={c.color} variant={on ? 'solid' : 'soft'}>
                  {on ? 'ON' : 'OFF'}
                </Chip>
                <ListItemContent>
                  <Typography level="body-sm">{c.label}</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider sx={{ my: 1.25 }} />

      <Typography level="title-md">פילטרים</Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
        <Chip
          size="sm"
          variant={filters.onlyWeekend ? 'solid' : 'soft'}
          onClick={() => onFilter({ ...filters, onlyWeekend: !filters.onlyWeekend })}
        >
          רק סופ״ש
        </Chip>

        <Chip
          size="sm"
          variant={filters.onlyMatches ? 'solid' : 'soft'}
          onClick={() => onFilter({ ...filters, onlyMatches: !filters.onlyMatches })}
        >
          רק משחקים
        </Chip>

        <Chip
          size="sm"
          variant={filters.onlyMeetings ? 'solid' : 'soft'}
          onClick={() => onFilter({ ...filters, onlyMeetings: !filters.onlyMeetings })}
        >
          רק פגישות
        </Chip>
      </Box>
    </Box>
  )
}
