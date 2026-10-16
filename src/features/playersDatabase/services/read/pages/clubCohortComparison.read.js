// src/features/playersDatabase/services/read/pages/clubCohortComparison.read.js

import { PLAYERS_DATABASE_SEASONS_CATALOG } from '../../../catalog/seasons.catalog.js'
import { buildTeamSeasonDocumentId } from '../../../domain/identity/index.js'
import { clubComparisonSeasonOrder } from '../../../../../shared/scouting/teams/clubComparison/index.js'
import { getLeagueById } from '../entities/league.js'
import { getTeamSeasonByDocumentId } from '../entities/teamSeason.js'
import { readClubsCenterSeasonDocument } from './clubs.read.js'

export const readClubCohortComparisonSources = async ({ clubId, seasonId, seasonIds = [] }) => {
  const selectedOrder = clubComparisonSeasonOrder(seasonId)
  const requestedIds = [...new Set([
    seasonId, ...seasonIds, ...PLAYERS_DATABASE_SEASONS_CATALOG.map(season => season.seasonId),
  ])].filter(id => clubComparisonSeasonOrder(id) !== null && clubComparisonSeasonOrder(id) <= selectedOrder)
  const results = await Promise.allSettled(requestedIds.map(id => readClubsCenterSeasonDocument({ seasonId: id })))
  const unavailableSeasonIds = []
  const sources = []
  results.forEach((result, index) => {
    const id = requestedIds[index]
    if (result.status === 'rejected') {
      if (id === seasonId) throw result.reason
      unavailableSeasonIds.push(id)
    } else if (result.value?.documentExists !== false) {
      sources.push({ seasonId: id, center: result.value })
    }
  })
  const teamsFor = source => Object.entries(source.center?.clubsById?.[clubId]?.teamsById || {})
  const leagueIds = [...new Set(sources.flatMap(source => teamsFor(source).map(([, team]) => team.leagueId)).filter(Boolean))]
  const [leagueResults, loadedSources] = await Promise.all([
    Promise.allSettled(leagueIds.map(id => getLeagueById(id))),
    Promise.all(sources.map(async source => {
      const teams = teamsFor(source).filter(([, team]) => Number(team.teamSlot) === 1)
      const documents = await Promise.allSettled(teams.map(([teamId]) => getTeamSeasonByDocumentId(
        buildTeamSeasonDocumentId({ teamId, seasonId: source.seasonId })
      )))
      if (documents.some(result => result.status === 'rejected')) unavailableSeasonIds.push(source.seasonId)
      return {
        ...source,
        teamSeasonsById: Object.fromEntries(teams.map(([teamId], index) => [
          teamId, documents[index].status === 'fulfilled' ? documents[index].value : null,
        ])),
      }
    })),
  ])
  const failedLeagueIds = new Set(leagueIds.filter((id, index) => leagueResults[index].status === 'rejected'))
  sources.forEach(source => {
    if (teamsFor(source).some(([, team]) => failedLeagueIds.has(team.leagueId))) unavailableSeasonIds.push(source.seasonId)
  })
  return {
    current: loadedSources.find(source => source.seasonId === seasonId) || { seasonId, center: null, teamSeasonsById: {} },
    history: loadedSources.filter(source => source.seasonId !== seasonId),
    leaguesById: Object.fromEntries(leagueIds.map((id, index) => [
      id, leagueResults[index].status === 'fulfilled' ? leagueResults[index].value : null,
    ])),
    unavailableSeasonIds: [...new Set(unavailableSeasonIds)].sort().reverse(),
  }
}
