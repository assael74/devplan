// src/features/playersDatabase/domain/leagueV2/clear/clearLeagueTeamsProjections.builder.js

import { sameSeason, failClearLeague, sameValue } from './leagueTeamsClearedState.builder.js'
import { buildClubsMasterCompetitionPathEntry } from '../../projections/club/clubsMaster.projection.js'

export const belongsToLeague = (row, identity) => (
  (row.leagueId || row.league?.leagueId) === identity.leagueId &&
  sameSeason(row.seasonKey, identity.seasonKey)
)

const emptyNextPath = () => ({
  sourceBirthYear: 0,
  sourceTeamId: '',
  sourceTeamSlot: null,
  projectedNextLeagueLevel: null,
  status: 'UNKNOWN',
  source: 'AUTOMATIC',
  reason: null,
  updatedAt: null,
})

export const buildClearedClubArrays = (club, identity) => {
  const rows = [
    ...(club.ageGroups || []).flatMap(group => group.seasons || []),
    ...(club.competitionPaths || []).flatMap(path => path.seasons || []),
  ]
  if (rows.some(row => (row.leagueId || row.league?.leagueId) === identity.leagueId && !row.seasonKey)) {
    failClearLeague('CLEAR_LEAGUE_IDENTITY', 'Club row has no season identity')
  }
  const ageGroups = (club.ageGroups || []).map(group => ({
    ...group,
    seasons: (group.seasons || []).filter(row => !belongsToLeague(row, identity)),
  }))
  const competitionPaths = (club.competitionPaths || []).map(path => {
    const removed = (path.seasons || []).filter(row => belongsToLeague(row, identity))
    const retained = (path.seasons || []).filter(row => !belongsToLeague(row, identity))
    const sourceId = path.nextCompetitionPath?.sourceTeamId
    if (removed.length && !sourceId && path.nextCompetitionPath?.projectedNextLeagueLevel !== null &&
        path.nextCompetitionPath?.projectedNextLeagueLevel !== undefined) {
      failClearLeague('CLEAR_LEAGUE_FORECAST_AMBIGUOUS', 'Forecast has no source identity')
    }
    const removesSource = removed.some(row => row.teamId === sourceId)
    if (removesSource && retained.some(row => row.teamId === sourceId)) {
      failClearLeague('CLEAR_LEAGUE_FORECAST_AMBIGUOUS', 'Forecast source season is ambiguous')
    }
    return {
      ...path,
      seasons: retained,
      ...(removesSource ? { nextCompetitionPath: emptyNextPath() } : {}),
    }
  })
  return { ageGroups, competitionPaths }
}

// Preserve all other master fields. Only scoped rows and proven path removals change.
export const buildClearedClubsMaster = (master, identity, clubs) => ({
  clubs: (master.clubs || []).map(entry => {
    const club = clubs.find(row => row.docId === entry.clubId)
    const ageGroups = (entry.ageGroups || []).map(group => ({
      ...group,
      current: (group.current || []).filter(row => !belongsToLeague(row, identity)),
      previous: (group.previous || []).filter(row => !belongsToLeague(row, identity)),
    }))
    const competitionPaths = (entry.competitionPaths || []).map(path => {
      if (!club) {
        if ((entry.ageGroups || []).some(group => [...(group.current || []), ...(group.previous || [])]
          .some(row => belongsToLeague(row, identity))) && path.sourceTeamId) {
          failClearLeague('CLEAR_LEAGUE_FORECAST_AMBIGUOUS', 'Missing Club forecast source')
        }
        return path
      }
      const sourcePath = (club.after.competitionPaths || []).find(item => item.birthYear === path.birthYear)
      const beforePath = (club.before.competitionPaths || []).find(item => item.birthYear === path.birthYear)
      const scopedSource = (entry.ageGroups || []).some(group => [...(group.current || []), ...(group.previous || [])]
        .some(row => belongsToLeague(row, identity) && row.teamId === path.sourceTeamId))
      if (sourcePath && path.birthYear === identity.birthYear && path.sourceTeamId &&
          !sourcePath.nextCompetitionPath?.sourceTeamId && !scopedSource && sameValue(beforePath, sourcePath)) {
        failClearLeague('CLEAR_LEAGUE_FORECAST_AMBIGUOUS', 'Master forecast lost its season evidence')
      }
      if (beforePath && sourcePath && (!sameValue(beforePath, sourcePath) || scopedSource)) {
        return { ...path, ...buildClubsMasterCompetitionPathEntry(sourcePath) }
      }
      return path
    })
    if (sameValue(entry.ageGroups || [], ageGroups) && sameValue(entry.competitionPaths || [], competitionPaths)) return entry
    return { ...entry, ageGroups, competitionPaths }
  }),
})
