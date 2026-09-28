// src/features/playersDatabase/domain/leagueV2/clear/clearLeagueTeamsPlan.builder.js

import { getTeamSeasonRosterState } from '../../rosterV2/clear/rosterAbsent.builder.js'
import { getTeamSeasonStatsState } from '../../statsV2/teamSeasonStatsState.js'
import { buildLeaguesMasterLeagueEntry, buildLeaguesMasterSummary } from '../../projections/leaguesMaster.projection.js'
import { buildClearedClubArrays, buildClearedClubsMaster } from './clearLeagueTeamsProjections.builder.js'
import {
  assertDocumentId, cloneValue, failClearLeague, sameSeason, sameValue,
  selectLeagueSeason, buildLeagueTeamsClearedState,
} from './leagueTeamsClearedState.builder.js'

export const CLEAR_LEAGUE_STEPS = [
  { id: 'league', label: 'טבלת הליגה' },
  { id: 'team', label: 'עונות הקבוצות והפניותיהן' },
  { id: 'teamIndex', label: 'אינדקסי הקבוצות' },
  { id: 'identity', label: 'שיוך קבוצות למועדונים' },
  { id: 'club', label: 'מועדונים' },
  { id: 'clubsMaster', label: 'מרכז המועדונים' },
  { id: 'leaguesMaster', label: 'מרכז הליגות' },
]

export const getClearLeaguePlanState = operations => (
  operations.some(operation => {
    if (operation.kind === 'team' || operation.patch === null) return true

    return !sameValue(
      operation.before,
      { ...operation.before, ...operation.patch }
    )
  })
    ? 'present'
    : 'absent'
)

export const resolveClearLeagueScope = (sources, target) => {
  assertDocumentId(target.leagueId)
  const league = sources.leagues.find(row => row.docId === target.leagueId)
  if (!league) failClearLeague('CLEAR_LEAGUE_IDENTITY', 'League missing')
  const selected = selectLeagueSeason(league.data, target.seasonKey)
  if (!selected.season.birthYear || !league.data.ageGroupId) {
    failClearLeague('CLEAR_LEAGUE_IDENTITY', 'Missing League age identity')
  }
  const identity = {
    leagueId: league.docId,
    seasonKey: selected.season.seasonKey,
    birthYear: selected.season.birthYear,
    ageGroupId: league.data.ageGroupId,
  }
  if ((league.data.id && league.data.id !== league.docId) ||
      (league.data.leagueId && league.data.leagueId !== league.docId)) {
    failClearLeague('CLEAR_LEAGUE_IDENTITY', 'League physical and stored identities conflict')
  }
  if (sources.identities.some(row => (row.data.entries || []).some(entry => entry.leagueId === identity.leagueId) &&
      (!row.data.seasonKey || !row.data.birthYear))) {
    failClearLeague('CLEAR_LEAGUE_IDENTITY', 'Identity projection has no complete season identity')
  }
  if ([...sources.teamSeasons, ...sources.indexes].some(row => row.data.leagueId === identity.leagueId && !row.data.seasonKey)) {
    failClearLeague('CLEAR_LEAGUE_IDENTITY', 'A League dependency has no season identity')
  }
  const tableIds = new Set((selected.season.tableRank || []).map(row => {
    const id = row.birthTeamDocumentId || row.teamId || row.birthTeamId
    return assertDocumentId(id)
  }))
  if (tableIds.size !== (selected.season.tableRank || []).length) {
    failClearLeague('CLEAR_LEAGUE_IDENTITY', 'Duplicate team identity in League table')
  }
  sources.roots.filter(row => tableIds.has(row.docId)).forEach(root => {
    ;(root.data.seasons || []).filter(entry => sameSeason(entry.seasonKey, identity.seasonKey)).forEach(entry => {
      const season = sources.teamSeasons.find(row => row.docId === entry.seasonDocumentId)
      if (!season || season.data.birthTeamDocumentId !== root.docId || season.data.leagueId !== identity.leagueId ||
          !sameSeason(season.data.seasonKey, identity.seasonKey)) {
        failClearLeague('CLEAR_LEAGUE_IDENTITY', 'Existing Root relation cannot be attributed safely')
      }
    })
  })
  const seasons = sources.teamSeasons.filter(row => (
    sameSeason(row.data.seasonKey, identity.seasonKey) &&
    (row.data.leagueId === identity.leagueId || tableIds.has(row.data.birthTeamDocumentId))
  ))
  const scopedIndexes = sources.indexes.filter(row => (
    sameSeason(row.data.seasonKey, identity.seasonKey) &&
    (row.data.leagueId === identity.leagueId || tableIds.has(row.data.birthTeamDocumentId || row.data.teamId))
  ))
  return { identity, league, selected, seasons, scopedIndexes }
}

export const assertClearLeagueDependencies = scope => {
  const teamIds = new Set()
  scope.seasons.forEach(row => {
    const teamId = assertDocumentId(row.data.birthTeamDocumentId)
    if (row.data.leagueId !== scope.identity.leagueId || teamIds.has(teamId)) {
      failClearLeague('CLEAR_LEAGUE_IDENTITY', 'Conflicting Team Season')
    }
    teamIds.add(teamId)
  })

  const statsBlocker = scope.seasons.find(row => (
    getTeamSeasonStatsState(row.data) !== 'absent'
  ))
  if (statsBlocker) {
    failClearLeague('CLEAR_LEAGUE_STATS_PRESENT', 'Stats is not absent', {
      nextAction: 'stats',
      birthTeamDocumentId: statsBlocker.data.birthTeamDocumentId,
    })
  }

  const rosterBlocker = scope.seasons.find(row => (
    getTeamSeasonRosterState(row.data) !== 'absent'
  ))
  if (rosterBlocker) {
    failClearLeague('CLEAR_LEAGUE_ROSTER_PRESENT', 'Roster is not absent', {
      nextAction: 'roster',
      birthTeamDocumentId: rosterBlocker.data.birthTeamDocumentId,
    })
  }

  const playerIndexBlocker = scope.scopedIndexes.find(row => (
    row.data.entityType === 'playerSeason'
  ))
  if (playerIndexBlocker) {
    failClearLeague('CLEAR_LEAGUE_PLAYER_INDEX', 'Clear Roster must remove Player SearchIndexes first', {
      nextAction: 'roster',
      birthTeamDocumentId: playerIndexBlocker.data.birthTeamDocumentId || playerIndexBlocker.data.teamId || '',
    })
  }
  if (scope.scopedIndexes.some(row => row.data.entityType !== 'birthTeamSeason' || row.data.leagueId !== scope.identity.leagueId)) {
    failClearLeague('CLEAR_LEAGUE_IDENTITY', 'Unexpected or conflicting SearchIndex')
  }
}

export const buildClearLeagueTeamsPlan = (sources, target, preparedAt) => {
  const scope = resolveClearLeagueScope(sources, target)
  assertClearLeagueDependencies(scope)
  // After table deletion, birth year + season are the remaining conservative
  // relation-check scope. A missing source cannot prove former league ownership.
  sources.roots.filter(root => String(root.data.birthYear) === String(scope.identity.birthYear))
    .forEach(root => {
      ;(root.data.seasons || []).filter(entry => sameSeason(entry.seasonKey, scope.identity.seasonKey))
        .forEach(entry => {
          const source = sources.teamSeasons.find(row => row.docId === entry.seasonDocumentId)
          if (!source || source.data.birthTeamDocumentId !== root.docId ||
              !sameSeason(source.data.seasonKey, entry.seasonKey)) {
            failClearLeague('CLEAR_LEAGUE_ORPHAN_ROOT', 'Root relation has no provable Team Season source')
          }
        })
    })
  const { identity, league, selected } = scope
  const cleared = buildLeagueTeamsClearedState(selected.season)
  const nextLeague = cloneValue(league.data)
  if (selected.field === 'current') nextLeague.current = cleared
  else nextLeague.history[selected.index] = cleared
  const operations = [{
    kind: 'league', docId: league.docId, before: league.data,
    patch: { [selected.field]: nextLeague[selected.field] },
  }]
  scope.seasons.forEach(row => {
    const rootId = row.data.birthTeamDocumentId
    const root = sources.roots.find(item => item.docId === rootId)
    if (!root || !Array.isArray(root.data.seasons)) failClearLeague('CLEAR_LEAGUE_IDENTITY', 'Team Root missing')
    if (root.data.birthTeamDocumentId && root.data.birthTeamDocumentId !== rootId) {
      failClearLeague('CLEAR_LEAGUE_IDENTITY', 'Root physical and stored identities conflict')
    }
    const matches = root.data.seasons.filter(entry => sameSeason(entry.seasonKey, identity.seasonKey))
    if (matches.length !== 1 || matches[0].seasonDocumentId !== row.docId) {
      failClearLeague('CLEAR_LEAGUE_IDENTITY', 'Root relation is ambiguous')
    }
    operations.push({
      kind: 'team', docId: row.docId, before: row.data,
      rootId, rootBefore: root.data,
      rootPatch: { seasons: root.data.seasons.filter(entry => entry !== matches[0]) },
    })
  })
  scope.scopedIndexes.forEach(row => operations.push({ kind: 'teamIndex', docId: row.docId, before: row.data, patch: null }))
  sources.identities.filter(row => sameSeason(row.data.seasonKey, identity.seasonKey) && row.data.birthYear === identity.birthYear)
    .forEach(row => {
      const entries = row.data.entries
      if (!Array.isArray(entries)) failClearLeague('CLEAR_LEAGUE_IDENTITY', 'Malformed Identity entries')
      const next = entries.filter(entry => entry.leagueId !== identity.leagueId)
      operations.push({ kind: 'identity', docId: row.docId, before: row.data, patch: next.length ? { entries: next } : null })
    })
  const clubs = sources.clubs.map(row => ({
    docId: row.docId, before: row.data,
    after: buildClearedClubArrays(row.data, identity),
  }))
  clubs.forEach(row => {
    if (!sameValue(row.before.ageGroups || [], row.after.ageGroups) ||
        !sameValue(row.before.competitionPaths || [], row.after.competitionPaths)) {
      operations.push({ kind: 'club', docId: row.docId, before: row.before, patch: row.after })
    }
  })
  if (sources.clubsMaster) {
    operations.push({
      kind: 'clubsMaster', docId: 'all', before: sources.clubsMaster,
      patch: buildClearedClubsMaster(sources.clubsMaster, identity, clubs),
    })
  }
  if (!sources.leaguesMaster) failClearLeague('CLEAR_LEAGUE_IDENTITY', 'Leagues Master missing')
  const entries = sources.leaguesMaster.leagues || []
  if (entries.filter(entry => (entry.leagueId || entry.leagueDocumentId) === identity.leagueId).length !== 1) {
    failClearLeague('CLEAR_LEAGUE_IDENTITY', 'Leagues Master target missing or ambiguous')
  }
  const canonicalEntries = sources.leagues.map(row => buildLeaguesMasterLeagueEntry({
    ...(row.docId === league.docId ? nextLeague : row.data), id: row.docId,
  }))
  const canonicalTarget = canonicalEntries.find(entry => entry.leagueId === identity.leagueId)
  const nextEntries = entries.map(entry => {
    if ((entry.leagueId || entry.leagueDocumentId) !== identity.leagueId) return entry
    const matched = (entry.seasons || []).filter(row => sameSeason(row.seasonKey, identity.seasonKey))
    if (matched.length !== 1) failClearLeague('CLEAR_LEAGUE_IDENTITY', 'Master season missing or ambiguous')
    return {
      ...entry,
      seasons: entry.seasons.map(row => !sameSeason(row.seasonKey, identity.seasonKey) ? row : {
        ...row,
        ...canonicalTarget.seasons.find(item => sameSeason(item.seasonKey, identity.seasonKey)),
      }),
    }
  })
  operations.push({
    kind: 'leaguesMaster', docId: 'all', before: sources.leaguesMaster,
    patch: { leagues: nextEntries, summary: buildLeaguesMasterSummary(canonicalEntries) },
  })
  return {
    identity, preparedAt, sources, operations,
    state: getClearLeaguePlanState(operations),
    impact: {
      teams: (selected.season.tableRank || []).length,
      teamSeasons: scope.seasons.length,
      teamIndexes: scope.scopedIndexes.length,
      clubs: operations.filter(item => item.kind === 'club').length,
    },
  }
}
