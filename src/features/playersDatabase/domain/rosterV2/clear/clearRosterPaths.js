// src/features/playersDatabase/domain/rosterV2/clear/clearRosterPaths.js

import { ROSTER_CLEAR_FIELDS } from './rosterAbsent.builder.js'
import { sameClearRosterSeason } from './clearRosterIdentity.js'

const rows = value => Array.isArray(value) ? value : []
const one = paths => {
  if (paths.length !== 1) throw new Error('Missing or ambiguous approved path target')
  return paths[0]
}

// Resolve exact ownership paths from source identities, not from submitted paths.
// This validates locations only; it never rebuilds business values.
export const getClearRosterAllowedPaths = ({ kind, source, identity, teamRoot, teamSeason }) => {
  const seasonMatches = row => sameClearRosterSeason(row?.seasonKey || row?.seasonId, identity.seasonKey)
  const teamMatches = row => (
    (row?.birthTeamId || row?.teamId) === teamRoot.birthTeamId &&
    (row?.birthTeamSlot || row?.teamSlot) === teamRoot.birthTeamSlot
  )
  const append = (path, fields) => fields.map(field => [...path, field])
  if (kind === 'teamSeason') return ROSTER_CLEAR_FIELDS.map(field => [field])
  if (kind === 'teamSearchIndex') return [['playersCount'], ['playerSeasonIndexCount']]
  if (kind === 'league') {
    const candidates = [
      ...(source.current ? [{ path: ['current'], row: source.current }] : []),
      ...rows(source.history).map((row, index) => ({ path: ['history', index], row })),
    ].filter(item => seasonMatches(item.row))
    const selected = one(candidates)
    const index = one(rows(selected.row.tableRank).map((row, i) => teamMatches(row) ? i : null).filter(i => i !== null))
    return [
      ...append([...selected.path, 'tableRank', index], ['playersCount', 'hasPlayers']),
      ...(Object.prototype.hasOwnProperty.call(selected.row, 'playersCount') ? [[...selected.path, 'playersCount']] : []),
    ]
  }
  if (kind === 'leaguesMaster') {
    const leagueIndex = one(rows(source.leagues).map((row, i) => row.leagueId === identity.leagueId ? i : null).filter(i => i !== null))
    const seasonIndex = one(rows(source.leagues[leagueIndex].seasons).map((row, i) => seasonMatches(row) ? i : null).filter(i => i !== null))
    return [['leagues', leagueIndex, 'seasons', seasonIndex, 'playersCount'], ['summary', 'playersCount']]
  }
  if (kind === 'club' || kind === 'clubsMaster') {
    const clubIndex = kind === 'clubsMaster'
      ? one(rows(source.clubs).map((row, i) => row.clubId === identity.clubId ? i : null).filter(i => i !== null))
      : null
    const club = clubIndex === null ? source : source.clubs[clubIndex]
    const prefix = clubIndex === null ? [] : ['clubs', clubIndex]
    const groupIndex = one(rows(club.ageGroups).map((row, i) => row.ageGroupId === teamSeason.ageGroupId ? i : null).filter(i => i !== null))
    const group = club.ageGroups[groupIndex]
    const sides = kind === 'club' ? ['seasons'] : ['current', 'previous']
    const path = one(sides.flatMap(side => rows(group[side]).flatMap((row, index) => (
      seasonMatches(row) && teamMatches(row)
        ? [[...prefix, 'ageGroups', groupIndex, side, index]]
        : []
    ))))
    return append(path, ['playersCount', 'transfers'])
  }
  throw new Error('Unknown approved operation kind')
}
