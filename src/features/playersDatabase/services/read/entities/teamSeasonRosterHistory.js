// src/features/playersDatabase/services/read/entities/teamSeasonRosterHistory.js

import { getTeamById } from './team.js'
import { getTeamSeasonByDocumentId } from './teamSeason.js'
import { previousRosterSeasonRef } from '../../../domain/roster/rosterHistory.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {}

const toRosterReadModel = teamSeason => {
  if (!teamSeason) return null
  const roster = object(teamSeason.roster)
  const movement = object(teamSeason.movement)
  return {
    ...teamSeason,
    seasonId: clean(teamSeason.identity?.seasonId),
    seasonKey: clean(teamSeason.identity?.seasonKey),
    teamPlayers: Object.entries(object(roster.playersById)).map(([playerId, player]) => ({
      ...player,
      playerUrl: clean(teamSeason.manual?.playersById?.[playerId]?.playerUrl || player.playerUrl),
    })),
    rosterImport: object(roster.rosterImport),
    transfersIn: Object.values(object(movement.transfersInById)),
    transfersOut: Object.values(object(movement.transfersOutById)),
    pendingPlayers: Object.values(object(movement.pendingById)),
  }
}

export async function readTeamSeasonRosterHistory({
  birthTeamDocumentId = '',
  seasonId = '',
  seasonKey = '',
  bypassCache = false,
} = {}) {
  const teamId = clean(birthTeamDocumentId)
  const targetSeasonId = clean(seasonId)
  const targetSeasonKey = clean(seasonKey)
  if (!teamId || (!targetSeasonId && !targetSeasonKey)) {
    return { currentSeason: null, previousSeason: null, seasons: [] }
  }

  const teamRoot = await getTeamById(teamId, { bypassCache })
  const refs = Object.entries(object(teamRoot?.seasonRefsById)).map(([seasonId, ref]) => ({ seasonId, ...object(ref) }))
  const currentRef = refs.find(ref => (
    (targetSeasonId && clean(ref.seasonId) === targetSeasonId) ||
    (!targetSeasonId && clean(ref.seasonKey) === targetSeasonKey)
  )) || null
  const previousRef = previousRosterSeasonRef({
    teamRoot,
    seasonId: targetSeasonId || currentRef?.seasonId || '\uffff',
  })
  const [currentSeason, previousSeason] = await Promise.all([
    currentRef?.teamSeasonDocumentId ? getTeamSeasonByDocumentId(currentRef.teamSeasonDocumentId) : Promise.resolve(null),
    previousRef?.teamSeasonDocumentId ? getTeamSeasonByDocumentId(previousRef.teamSeasonDocumentId) : Promise.resolve(null),
  ])

  return {
    teamRoot: teamRoot || null,
    currentSeason: toRosterReadModel(currentSeason),
    previousSeason: toRosterReadModel(previousSeason),
    previousSeasonKey: clean(previousRef?.seasonKey),
    seasons: [currentRef?.seasonId, previousRef?.seasonId].filter(Boolean),
  }
}
