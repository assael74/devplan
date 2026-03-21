import { safeArr } from './calendar.hub.utils.js'
import { normalizeGameEvent } from './calendar.hub.games.js'
import { normalizeTrainingEvent, collectTeamTrainings } from './calendar.hub.trainings.js'
import {
  normalizeTeamMeetingEvent,
  normalizePlayerMeetingEvent,
} from './calendar.hub.meetings.js'

export function buildCalendarEventsFromTeams({ teams = [] }) {
  const events = []

  for (const team of safeArr(teams)) {
    for (const game of safeArr(team?.teamGames)) {
      const normalized = normalizeGameEvent(game, team)
      if (normalized) events.push(normalized)
    }

    for (const training of collectTeamTrainings(team)) {
      const normalized = normalizeTrainingEvent(training, team)
      if (normalized) events.push(normalized)
    }

    for (const meeting of safeArr(team?.teamMeetings || team?.meetings)) {
      const normalized = normalizeTeamMeetingEvent(meeting, team)
      if (normalized) events.push(normalized)
    }
  }

  return events
}

export function buildCalendarEventsFromPlayers({ players = [] }) {
  const events = []

  for (const player of safeArr(players)) {
    for (const meeting of safeArr(player?.meetings || player?.playerMeetings)) {
      const normalized = normalizePlayerMeetingEvent(meeting, player)
      if (normalized) events.push(normalized)
    }
  }

  return events
}

export function dedupeCalendarEvents(events = []) {
  const map = new Map()

  for (const event of safeArr(events)) {
    if (!event?.eventKey) continue
    if (!map.has(event.eventKey)) {
      map.set(event.eventKey, event)
    }
  }

  return Array.from(map.values())
}
