// src/features/playersDatabase/domain/leagueV2/deleteSeason/deleteLeagueSeason.builder.js

import { normalizeSeasonLookupKey } from '../../../model/shared/season.model.js'
import { sameSeason, sameValue, cloneValue, assertDocumentId } from '../clear/leagueTeamsClearedState.builder.js'
import { buildLeaguesMasterLeagueEntry, buildLeaguesMasterSummary, sortLeaguesMasterEntries } from '../../projections/leaguesMaster.projection.js'

export const failDeleteSeason = (code, message) => {
  const error = new Error(message)
  error.code = code
  throw error
}

// Temporary compatibility window for deleting legacy 24/25 history records.
// Remove after those seasons have been deleted; every other season requires null.
const isTemporaryLegacyEmptyTable = (season, identity) => (
  sameSeason(identity.seasonKey, '24/25') &&
  Array.isArray(season?.tableRank) &&
  season.tableRank.length === 0
)

export const resolveDeleteSeason = (sources, target) => {
  assertDocumentId(target.leagueId)
  const seasonKey = normalizeSeasonLookupKey(target.seasonKey)
  if (!seasonKey) failDeleteSeason('DELETE_SEASON_IDENTITY', 'Season identity required')
  const league = sources.leagues.find(row => row.docId === target.leagueId)
  if (!league) failDeleteSeason('DELETE_SEASON_LEAGUE_MISSING', 'League identity must remain')
  if ((league.data.id && league.data.id !== league.docId) ||
      (league.data.leagueId && league.data.leagueId !== league.docId)) {
    failDeleteSeason('DELETE_SEASON_IDENTITY', 'Conflicting league identity')
  }
  const matches = []
  const inspect = (season, field, index) => {
    if (!season) return
    if (!season.seasonKey) failDeleteSeason('DELETE_SEASON_IDENTITY', 'Season has no key')
    if (sameSeason(season.seasonKey, seasonKey)) matches.push({ season, field, index })
  }
  inspect(league.data.current, 'current', null)
  ;(league.data.history || []).forEach((season, index) => inspect(season, 'history', index))
  if (matches.length > 1) failDeleteSeason('DELETE_SEASON_IDENTITY', 'Equivalent season keys match multiple seasons')
  return { league, selected: matches[0] || null, identity: { leagueId: league.docId, seasonKey } }
}

// Projection rows are blockers only; they never authorize cascade writes.
export const assertSeasonDependenciesAbsent = (sources, identity) => {
  const inScope = row => {
    const leagueId = row?.leagueId || row?.league?.leagueId
    if (leagueId !== identity.leagueId) return false
    if (!row.seasonKey) failDeleteSeason('DELETE_SEASON_IDENTITY', 'Dependency has no season identity')
    return sameSeason(row.seasonKey, identity.seasonKey)
  }
  if (sources.teamSeasons.some(row => inScope(row.data))) {
    failDeleteSeason('DELETE_SEASON_DEPENDENCIES', 'Team Seasons remain')
  }
  if (sources.indexes.some(row => inScope(row.data))) {
    failDeleteSeason('DELETE_SEASON_PROJECTIONS', 'SearchIndexes remain')
  }
  for (const root of sources.roots) {
    for (const relation of root.data.seasons || []) {
      if (!sameSeason(relation.seasonKey, identity.seasonKey)) continue
      const season = sources.teamSeasons.find(row => row.docId === relation.seasonDocumentId)
      if (!season || season.data.birthTeamDocumentId !== root.docId ||
          !sameSeason(season.data.seasonKey, relation.seasonKey)) {
        failDeleteSeason('DELETE_SEASON_RELATION', 'Unresolved Root relation; league ownership cannot be proved')
      }
    }
  }
  for (const row of sources.identities) {
    const owned = (row.data.entries || []).some(entry => entry.leagueId === identity.leagueId)
    if (owned && (!row.data.seasonKey || sameSeason(row.data.seasonKey, identity.seasonKey))) {
      failDeleteSeason('DELETE_SEASON_PROJECTIONS', 'Identity entries remain')
    }
  }
  const clubRows = sources.clubs.flatMap(row => [
    ...(row.data.ageGroups || []).flatMap(group => group.seasons || []),
    ...(row.data.competitionPaths || []).flatMap(path => path.seasons || []),
  ])
  const masterRows = (sources.clubsMaster?.clubs || []).flatMap(club =>
    (club.ageGroups || []).flatMap(group => [...(group.current || []), ...(group.previous || [])])
  )
  if ([...clubRows, ...masterRows].some(inScope)) {
    failDeleteSeason('DELETE_SEASON_PROJECTIONS', 'Club projections remain')
  }
}

export const buildSeasonRemovedLeague = (league, selected) => {
  const next = cloneValue(league)
  if (!selected) return next
  if (selected.field === 'current') next.current = null
  else next.history = next.history.filter((_season, index) => index !== selected.index)
  return next
}

export const buildCanonicalLeaguesMasterPatch = leagues => {
  const ids = new Set()
  const entries = leagues.map(row => {
    assertDocumentId(row.docId)
    if (ids.has(row.docId) || (row.data.id && row.data.id !== row.docId) ||
        (row.data.leagueId && row.data.leagueId !== row.docId)) {
      failDeleteSeason('DELETE_SEASON_IDENTITY', 'Conflicting canonical League identity')
    }
    ids.add(row.docId)
    const keys = new Set()
    for (const season of [row.data.current, ...(row.data.history || [])].filter(Boolean)) {
      const key = normalizeSeasonLookupKey(season.seasonKey)
      if (!key || keys.has(key)) failDeleteSeason('DELETE_SEASON_IDENTITY', 'Ambiguous canonical seasons')
      keys.add(key)
    }
    return buildLeaguesMasterLeagueEntry({ ...row.data, id: row.docId, leagueId: row.docId })
  })
  const sorted = sortLeaguesMasterEntries(entries)
  return { leagues: sorted, summary: buildLeaguesMasterSummary(sorted) }
}

export const buildDeleteLeagueSeasonPlan = (sources, target, preparedAt) => {
  const { league, selected, identity } = resolveDeleteSeason(sources, target)
  if (selected && selected.season.tableRank !== null &&
      !isTemporaryLegacyEmptyTable(selected.season, identity)) {
    failDeleteSeason('DELETE_SEASON_TABLE_LOADED', 'Clear League Teams first, including an empty loaded table')
  }
  if (selected && Object.prototype.hasOwnProperty.call(selected.season, 'teamPerformanceContext')) {
    failDeleteSeason('DELETE_SEASON_PROJECTIONS', 'Table calculation context remains; Clear League Teams first')
  }
  assertSeasonDependenciesAbsent(sources, identity)
  const nextLeague = buildSeasonRemovedLeague(league.data, selected)
  if (selected) {
    if (!preparedAt || !Number.isFinite(Date.parse(preparedAt))) throw new Error('Prepared time required')
    nextLeague.updatedAt = preparedAt
  }
  const nextLeagues = sources.leagues.map(row => row.docId === league.docId ? { ...row, data: nextLeague } : row)
  const masterPatch = buildCanonicalLeaguesMasterPatch(nextLeagues)
  const masterMatches = sources.leaguesMaster && Object.entries(masterPatch)
    .every(([key, value]) => sameValue(sources.leaguesMaster[key], value))
  const operations = []
  if (selected) operations.push({
    kind: 'league', docId: league.docId, before: league.data,
    patch: { [selected.field]: nextLeague[selected.field], updatedAt: preparedAt },
  })
  operations.push({ kind: 'leaguesMaster', docId: 'all', before: sources.leaguesMaster, patch: masterPatch })
  return {
    identity, sources, operations,
    retryState: selected ? 'season_present' : masterMatches ? 'season_absent_clean' : 'season_absent_master_stale',
    impact: { leagueWrites: selected ? 1 : 0, masterWrites: masterMatches ? 0 : 1 },
  }
}
