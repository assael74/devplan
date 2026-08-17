// src/features/playersDatabase/model/playerStatsSnapshot.model.js

import { normalizePlayerStats } from './playerStats.model.js'
import { hasValue, toNumberOrZero } from './value.model.js'

const clean = value => String(value || '').trim()

const resolveTeamGamePlayed = source => {
  if (hasValue(source.teamGamePlayed)) return toNumberOrZero(source.teamGamePlayed)
  if (hasValue(source.teamGames)) return toNumberOrZero(source.teamGames)

  return toNumberOrZero(source.playerStats?.teamGames)
}

export const buildPlayerStatsSnapshotKey = snapshot => [
  snapshot.teamGamePlayed,
  snapshot.games,
  snapshot.goals,
  snapshot.minutes,
  snapshot.starts,
  snapshot.substituteIn,
  snapshot.substitutedOut,
].join('|')

export const buildPlayerStatsSnapshot = ({ source = {}, capturedAt = '' } = {}) => {
  const stats = normalizePlayerStats(source)
  const snapshot = {
    capturedAt: clean(capturedAt),
    teamGamePlayed: resolveTeamGamePlayed(source),
    games: stats.games,
    goals: stats.goals,
    minutes: stats.minutes,
    starts: stats.starts,
    substituteIn: stats.substituteIn,
    substitutedOut: stats.substitutedOut,
  }

  return {
    ...snapshot,
    snapshotKey: buildPlayerStatsSnapshotKey(snapshot),
  }
}

export const hasPlayerStatsSnapshotData = snapshot => Boolean(
  snapshot?.teamGamePlayed ||
  snapshot?.games ||
  snapshot?.goals ||
  snapshot?.minutes ||
  snapshot?.starts ||
  snapshot?.substituteIn ||
  snapshot?.substitutedOut
)
