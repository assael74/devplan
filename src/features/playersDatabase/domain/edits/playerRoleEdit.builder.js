// src/features/playersDatabase/domain/edits/playerRoleEdit.builder.js

import { buildPlayerLineClassificationState } from '../orchestration/buildPlayerLineClassificationState.js'
import { buildTeamBalanceFromTeamSeason } from '../stats/teamBalance.builder.js'
import { buildStatsLeagueContext } from '../stats/validation.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})

export const buildPlayerRoleEditState = ({
  teamSeason = {},
  league = {},
  playerId = '',
  primaryPosition = '',
  positionLayer = '',
  updatedAt = null,
} = {}) => {
  const id = clean(playerId)
  const primary = clean(primaryPosition)
  const layer = clean(positionLayer)
  const identity = object(teamSeason.identity)
  const rosterPlayer = object(object(object(teamSeason.roster).playersById)[id])
  const currentStatsPlayer = object(object(object(teamSeason.stats).playersById)[id])
  const currentScoutingPlayer = object(object(object(teamSeason.scouting).playersById)[id])
  const hasStats = clean(currentStatsPlayer.statsStatus) === 'loaded'
  const hasScouting = Object.keys(currentScoutingPlayer).length > 0
  const nextScoutingPlayer = hasStats || hasScouting
    ? {
        ...currentScoutingPlayer,
        primaryPosition: primary,
        positionLayer: layer,
        updatedAt,
      }
    : null

  if (!hasStats) {
    return {
      statsChanged: false,
      scoutingPlayer: nextScoutingPlayer,
    }
  }

  const playerStats = object(currentStatsPlayer.playerStats)
  const classification = buildPlayerLineClassificationState({
    player: {
      ...rosterPlayer,
      ...playerStats,
      playerId: id,
      playerStats: { ...playerStats },
      statsStatus: 'loaded',
      primaryPosition: primary,
      positionLayer: layer,
    },
  })
  const nextStatsPlayer = {
    ...currentStatsPlayer,
    lineClassification: {
      line: clean(classification && classification.line),
    },
    updatedAt,
  }
  const nextStatsPlayers = {
    ...object(object(teamSeason.stats).playersById),
    [id]: nextStatsPlayer,
  }
  const nextScoutingPlayers = {
    ...object(object(teamSeason.scouting).playersById),
    [id]: nextScoutingPlayer,
  }
  const leagueContext = buildStatsLeagueContext({
    league,
    seasonId: clean(identity.seasonId),
    teamId: clean(identity.teamId),
  })
  const teamBalance = buildTeamBalanceFromTeamSeason({
    teamSeason,
    statsPlayersById: nextStatsPlayers,
    scoutingPlayersById: nextScoutingPlayers,
    leagueContext,
    updatedAt,
  })
  const scoutInterpretation = object(teamBalance && teamBalance.scoutInterpretation)
  const teamTaskSignals = {
    offense: Boolean(teamBalance && teamBalance.teamTaskSignals && teamBalance.teamTaskSignals.offense),
    defense: Boolean(teamBalance && teamBalance.teamTaskSignals && teamBalance.teamTaskSignals.defense),
    updatedAt,
  }
  const teamTaskAvailability = {
    availability: clean(scoutInterpretation.availability) || (
      leagueContext.teamGamePlayed < 8 ? 'unavailable' : 'available'
    ),
    reason: clean(scoutInterpretation.availabilityReason) || (
      leagueContext.teamGamePlayed < 8 ? 'season_sample_insufficient' : ''
    ),
  }

  return {
    statsChanged: true,
    statsPlayer: nextStatsPlayer,
    scoutingPlayer: nextScoutingPlayer,
    teamBalance,
    teamTaskSignals,
    teamTaskAvailability,
    leagueContext,
  }
}

