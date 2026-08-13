import { safeArr } from './calendar.hub.utils.js'
import { normalizeGameEvent, normalizePlayerGameEvent } from './calendar.hub.games.js'
import { normalizeTrainingEvent, collectTeamTrainings } from './calendar.hub.trainings.js'
import {
  normalizeTeamMeetingEvent,
  normalizePlayerMeetingEvent,
} from './calendar.hub.meetings.js'

const isPrivatePlayer = (player) =>
  player?.isPrivatePlayer === true ||
  player?.privatePlayer === true ||
  player?.isPrivate === true ||
  ['private', 'privatePlayer', 'privatePlayers'].includes(String(player?.playerSource || ''))

const collectPrivatePlayerGames = (player) => [
  ...safeArr(player?.playerGames),
  ...safeArr(player?.externalGames),
]

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
    if (isPrivatePlayer(player)) {
      for (const game of collectPrivatePlayerGames(player)) {
        const normalized = normalizePlayerGameEvent(game, player)
        if (normalized) events.push(normalized)
      }
    }

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
