// src/features/playersDatabase/domain/rosterV2/clear/clearRosterPlan.builder.js

import { getTeamSeasonStatsState } from '../../statsV2/teamSeasonStatsState.js'
import { buildClubTransferSummary } from '../../projections/club/clubTransfers.projection.js'
import { buildRosterAbsentState, ROSTER_CLEAR_FIELDS } from './rosterAbsent.builder.js'
import { buildClearRosterIds, assertClearRosterDocumentId, sameClearRosterSeason } from './clearRosterIdentity.js'

export const sameClearRosterValue = (left, right) => {
  const normalize = value => {
    if (Array.isArray(value)) return value.map(normalize)
    if (!value || typeof value !== 'object') return value
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, normalize(value[key])]))
  }

  return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right))
}

export const cloneClearRosterValue = value => {
  if (Array.isArray(value)) return value.map(cloneClearRosterValue)
  if (!value || typeof value !== 'object') return value
  // Preserve Firestore Timestamp values while detaching their instances.
  if (typeof value.toDate === 'function' && typeof value.seconds === 'number') {
    return new value.constructor(value.seconds, value.nanoseconds)
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneClearRosterValue(item)]))
}

const requireOne = (rows, matches, label) => {
  const indexes = rows.map((row, index) => matches(row) ? index : -1).filter(index => index >= 0)
  if (indexes.length !== 1) throw new Error(`Missing or ambiguous Clear Roster target: ${label}`)
  return indexes[0]
}

const list = value => Array.isArray(value) ? value : []
const key = row => row?.seasonKey || row?.seasonId

export const buildClearRosterPlan = sources => {
  const { identity, teamRoot, teamSeason, league, teamSearchIndex, club, clubsMaster, leaguesMaster } = sources
  const ids = buildClearRosterIds(identity)
  if (!teamRoot || !teamSeason || !league || !teamSearchIndex || !club || !clubsMaster || !leaguesMaster) {
    throw new Error('Required canonical document or shared projection is missing')
  }
  if (
    teamRoot.id !== identity.birthTeamDocumentId ||
    teamSeason.id !== ids.teamSeasonDocumentId ||
    teamSeason.birthTeamDocumentId !== identity.birthTeamDocumentId ||
    teamSeason.seasonKey !== identity.seasonKey || teamSeason.leagueId !== identity.leagueId ||
    !teamRoot.clubId || club.id !== teamRoot.clubId ||
    (teamSeason.scoutIdentityContext?.clubId && teamSeason.scoutIdentityContext.clubId !== teamRoot.clubId)
  ) throw new Error('Canonical Clear Roster identity mismatch')
  if (getTeamSeasonStatsState(teamSeason) !== 'absent') {
    const error = new Error('יש למחוק תחילה את הסטטיסטיקה ולהשלים את הביקורת שלה.')
    error.code = 'CLEAR_ROSTER_STATS_PRESENT'
    throw error
  }

  const teamId = teamRoot.birthTeamId
  const slot = teamRoot.birthTeamSlot
  if (!teamId || !Number.isInteger(slot) || slot < 1) throw new Error('Missing canonical team identity')
  const seasonCandidates = [
    ...(league.current ? [{ path: ['current'], season: league.current }] : []),
    ...list(league.history).map((season, index) => ({ path: ['history', index], season })),
  ]
  const selected = seasonCandidates[requireOne(seasonCandidates, row => key(row.season) === identity.seasonKey, 'league season')]
  const matchesTeam = row => (
    (row.birthTeamId || row.teamId) === teamId &&
    (row.birthTeamSlot || row.teamSlot) === slot
  )
  const table = list(selected.season.tableRank)
  const tableIndex = requireOne(table, matchesTeam, 'league team')
  if (table[tableIndex].clubId !== teamRoot.clubId) throw new Error('League club identity mismatch')

  if (
    teamSearchIndex.id !== ids.teamSearchIndexId ||
    teamSearchIndex.birthTeamDocumentId !== identity.birthTeamDocumentId ||
    teamSearchIndex.seasonKey !== identity.seasonKey || teamSearchIndex.leagueId !== identity.leagueId ||
    teamSearchIndex.clubId !== teamRoot.clubId ||
    teamSearchIndex.teamSeasonDocumentId !== ids.teamSeasonDocumentId
  ) throw new Error('Team SearchIndex identity or canonical relation mismatch')
  const sourceTargets = {
    leagues: identity.leagueId,
    birthTeamSeasons: ids.teamSeasonDocumentId,
  }
  if (
    !sourceTargets[teamSearchIndex.sourceCollection] ||
    teamSearchIndex.sourceDocumentId !== sourceTargets[teamSearchIndex.sourceCollection] ||
    teamSearchIndex.sourceTarget !== selected.path[0]
  ) throw new Error('Team SearchIndex source relation requires repair before Clear Roster')

  const finalSeason = buildRosterAbsentState(teamSeason)
  const transfers = buildClubTransferSummary({
    transfersIn: finalSeason.transfersIn,
    transfersOut: finalSeason.transfersOut,
    pendingPlayers: finalSeason.pendingPlayers,
    clubId: teamRoot.clubId,
    coverageStatus: 'NOT_LOADED',
  })
  const operations = []
  const add = (kind, docId, source, changes) => {
    assertClearRosterDocumentId(docId)
    operations.push({ kind, docId, source, changes })
  }
  add('teamSeason', ids.teamSeasonDocumentId, teamSeason, ROSTER_CLEAR_FIELDS.map(field => ({
    path: [field], value: finalSeason[field],
  })))
  add('teamSearchIndex', ids.teamSearchIndexId, teamSearchIndex, [
    { path: ['playersCount'], value: finalSeason.playersCount },
    { path: ['playerSeasonIndexCount'], value: finalSeason.playersCount },
  ])
  add('league', identity.leagueId, league, [
    { path: [...selected.path, 'tableRank', tableIndex, 'playersCount'], value: finalSeason.playersCount },
    { path: [...selected.path, 'tableRank', tableIndex, 'hasPlayers'], value: false },
  ])

  const clubGroup = requireOne(list(club.ageGroups), row => row.ageGroupId === teamSeason.ageGroupId, 'club age group')
  const clubRow = requireOne(list(club.ageGroups[clubGroup].seasons), row => (
    key(row) === identity.seasonKey && row.teamId === teamId && row.teamSlot === slot
  ), 'club season')
  const clubChanges = [
    { path: ['ageGroups', clubGroup, 'seasons', clubRow, 'playersCount'], value: finalSeason.playersCount },
    { path: ['ageGroups', clubGroup, 'seasons', clubRow, 'transfers'], value: transfers },
  ]
  add('club', teamRoot.clubId, club, clubChanges)

  const masterClub = requireOne(list(clubsMaster.clubs), row => row.clubId === teamRoot.clubId, 'master club')
  const masterGroups = list(clubsMaster.clubs[masterClub].ageGroups)
  const masterGroup = requireOne(masterGroups, row => row.ageGroupId === teamSeason.ageGroupId, 'master age group')
  const masterCandidates = ['current', 'previous'].flatMap(side => (
    list(masterGroups[masterGroup][side]).map((row, index) => ({ side, index, row }))
  ))
  const masterRow = masterCandidates[requireOne(masterCandidates, item => (
    key(item.row) === identity.seasonKey && item.row.teamId === teamId && item.row.teamSlot === slot
  ), 'master season')]
  const masterPath = ['clubs', masterClub, 'ageGroups', masterGroup, masterRow.side, masterRow.index]
  add('clubsMaster', 'all', clubsMaster, [
    { path: [...masterPath, 'playersCount'], value: finalSeason.playersCount },
    { path: [...masterPath, 'transfers'], value: transfers },
  ])

  // A dependent aggregate must not retain the removed team's old count.
  const masterLeague = requireOne(list(leaguesMaster.leagues), row => row.leagueId === identity.leagueId, 'master league')
  const masterSeason = requireOne(list(leaguesMaster.leagues[masterLeague].seasons), row => key(row) === identity.seasonKey, 'master league season')
  const seasonCount = table.reduce((sum, row, index) => sum + (index === tableIndex ? 0 : Number(row.playersCount) || 0), 0)
  // Preserve the existing optional seasonal aggregate without introducing it
  // into documents that do not carry it.
  if (Object.prototype.hasOwnProperty.call(selected.season, 'playersCount')) {
    operations.find(operation => operation.kind === 'league').changes.push({
      path: [...selected.path, 'playersCount'], value: seasonCount,
    })
  }
  if (!Array.isArray(sources.leagues) || !sources.leagues.some(row => row.id === identity.leagueId)) {
    throw new Error('Canonical League collection is required for the aggregate')
  }
  const totalCount = sources.leagues.reduce((total, document) => (
    total + [document.current, ...list(document.history)].filter(Boolean).reduce((sum, season) => (
      sum + (document.id === identity.leagueId && key(season) === identity.seasonKey
        ? seasonCount
        : list(season.tableRank).reduce((count, row) => count + (Number(row.playersCount) || 0), 0))
    ), 0)
  ), 0)
  add('leaguesMaster', 'all', leaguesMaster, [
    { path: ['leagues', masterLeague, 'seasons', masterSeason, 'playersCount'], value: seasonCount },
    { path: ['summary', 'playersCount'], value: totalCount },
  ])

  const deletions = list(sources.playerIndexes).map(index => {
    assertClearRosterDocumentId(index.id)
    if (
      index.entityType !== 'playerSeason' || index.birthTeamDocumentId !== identity.birthTeamDocumentId ||
      !sameClearRosterSeason(index.seasonKey || index.seasonId, identity.seasonKey) || index.leagueId !== identity.leagueId
    ) throw new Error('Foreign player index in Clear Roster scope')
    return { docId: index.id, source: index }
  })

  return {
    identity: { ...identity, clubId: teamRoot.clubId, ...ids },
    sources,
    operations,
    deletions,
    impact: {
      players: teamSeason.teamPlayers.length,
      transfers: list(teamSeason.transfersIn).length + list(teamSeason.transfersOut).length,
      playerDocuments: 0,
      playerIndexes: deletions.length,
    },
  }
}

export const applyClearRosterChanges = (source, changes) => {
  const next = cloneClearRosterValue(source)
  changes.forEach(({ path, value }) => {
    let parent = next
    path.slice(0, -1).forEach(segment => {
      if (!parent || !Object.prototype.hasOwnProperty.call(parent, segment)) throw new Error('Missing approved patch parent')
      parent = parent[segment]
    })
    parent[path[path.length - 1]] = cloneClearRosterValue(value)
  })
  return next
}
