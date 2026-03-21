// src/shared/calendar/calendar.hub.builders.js

import {
  buildCalendarEventsFromTeams,
  buildCalendarEventsFromPlayers,
  dedupeCalendarEvents,
} from './calendar.hub.collectors.js'

export function buildCalendarEventsDomain({
  teams = [],
  players = [],
}) {
  const teamEvents = buildCalendarEventsFromTeams({ teams })
  const playerEvents = buildCalendarEventsFromPlayers({ players })

  const merged = [...teamEvents, ...playerEvents]
  const deduped = dedupeCalendarEvents(merged)

  deduped.sort((a, b) => new Date(a.startAt) - new Date(b.startAt))

  return deduped
}
