// src/features/playersDatabase/domain/stats/teamBalance.builder.js

import { buildTeamBalanceState } from '../orchestration/buildTeamBalanceState.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})
const array = value => (Array.isArray(value) ? value : [])

const resolveTeamGamePlayed = ({ teamSeason, leagueContext }) => {
  const contextValue = Number(leagueContext.teamGamePlayed)
  if (Number.isFinite(contextValue) && contextValue >= 0) return contextValue

  const officialTable = object(object(teamSeason.competitionSnapshot).officialTable)
  const snapshotValue = Number(officialTable.teamGamePlayed)
  return Number.isFinite(snapshotValue) && snapshotValue >= 0 ? snapshotValue : 0
}

export const buildTeamBalanceFromTeamSeason = ({
  teamSeason = {},
  statsPlayersById = null,
  scoutingPlayersById = null,
  leagueContext = {},
  updatedAt = null,
} = {}) => {
  const identity = object(teamSeason.identity)
  const rosterPlayers = object(object(teamSeason.roster).playersById)
  const statsPlayers = statsPlayersById && typeof statsPlayersById === 'object'
    ? statsPlayersById
    : object(object(teamSeason.stats).playersById)
  const scoutingPlayers = scoutingPlayersById && typeof scoutingPlayersById === 'object'
    ? scoutingPlayersById
    : object(object(teamSeason.scouting).playersById)
  const teamPlayers = Object.entries(rosterPlayers)
    .filter(([, rosterPlayer]) => clean(rosterPlayer && rosterPlayer.rosterStatus) === 'regular')
    .map(([playerId, rosterPlayer]) => {
      const statsPlayer = object(statsPlayers[playerId])
      const scoutingPlayer = object(scoutingPlayers[playerId])
      const playerStats = object(statsPlayer.playerStats)

      return {
        ...rosterPlayer,
        ...playerStats,
        playerId,
        playerStats: { ...playerStats },
        statsStatus: clean(statsPlayer.statsStatus),
        primaryPosition: clean(scoutingPlayer.primaryPosition),
        positionLayer: clean(scoutingPlayer.positionLayer),
        lineClassification: { ...object(statsPlayer.lineClassification) },
        professionalScoutProfileIds: array(scoutingPlayer.professionalProfileIds),
      }
    })
  const leagueTeam = object(leagueContext.team)

  return buildTeamBalanceState({
    teamDocument: { id: clean(identity.teamId) },
    seasonDocument: {
      seasonId: clean(identity.seasonId),
      seasonKey: clean(identity.seasonKey),
      seasonStatus: clean(identity.seasonStatus),
      teamStats: {
        teamGamePlayed: resolveTeamGamePlayed({ teamSeason, leagueContext }),
      },
      performance: { ...object(leagueTeam.performance) },
      teamPlayers,
      updatedAt,
    },
  })
}

