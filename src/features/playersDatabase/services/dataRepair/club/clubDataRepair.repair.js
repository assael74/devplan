import {
  syncClubProjectionFromTeamSeason,
  syncClubProjectionsFromLeagueTable,
  rebuildAllClubsMasterDocument as rebuildAllClubsMasterProjection,
  syncLeagueClubSeasonIdentityIndex,
  syncClubsMasterDocument,
  recoverClubProjectionPersistence,
  removeClubDocumentOrphanedCompetitionPathSeasons,
} from '../../write/clubs/index.js'
import { readPlayerDatabaseAuditSnapshot } from '../../audit/audit.read.js'
import { AUDIT_REPAIR_TYPE, normalizeLegacyAuditRepairType } from '../../audit/audit.contract.js'
import { resolvePlayersDatabaseWriteActionFailures } from '../../audit/audit.writeJournal.js'
import { buildLeagueRowsWithScoutPerformance } from '../../write/shared/leagueTeamScoutContext.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const MASTER_SYNC_CHUNK_SIZE = 100

const leagueSeasons = league => {
  const current = league?.current && typeof league.current === 'object'
    ? [{ season: league.current, target: 'current' }]
    : []
  const history = (Array.isArray(league?.history) ? league.history : [])
    .filter(season => season && typeof season === 'object')
    .map(season => ({
      season: {
        ...season,
        seasonStatus: clean(season?.seasonStatus) || 'completed',
      },
      target: 'history',
    }))

  return [...current, ...history]
}

const chunk = (items, size) => {
  const chunks = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

const clubLeagueTeamIdentity = ({ league = {}, season = {}, row = {} } = {}) => [
  clean(league?.ageGroupId),
  clean(season?.seasonKey || season?.seasonId),
  clean(row?.teamId || row?.birthTeamId),
].join('::')

const leagueRowKey = ({ league = {}, season = {}, row = {} } = {}) => [
  clean(league?.leagueId || league?.id),
  clean(season?.seasonKey || season?.seasonId),
  clean(row?.teamId || row?.birthTeamId),
].join('::')

const withLeagueScoutPerformance = ({ league, season, target = 'current', rows = [] } = {}) => {
  return buildLeagueRowsWithScoutPerformance({
    league,
    season,
    target,
    rows,
  })
}

export const rebuildClubProjectionFromTeamSeason = context => (
  syncClubProjectionFromTeamSeason({
    ...(context || {}),
    canonicalCommitted: true,
    lastWriteAction: context?.lastWriteAction || 'REPAIR_CLUB_FROM_TEAM_SEASON',
  })
)

export async function repairOrphanedClubCompetitionPathSeasons({
  findings = [],
  projectionVersion = 1,
  lastWriteAction = 'REPAIR_ORPHANED_CLUB_COMPETITION_PATHS',
} = {}) {
  const targetsByClubId = new Map()
  ;(Array.isArray(findings) ? findings : []).forEach(finding => {
    if (normalizeLegacyAuditRepairType(finding) !== AUDIT_REPAIR_TYPE.REBUILD_CLUB_COMPETITION_PATH) return

    const [ageGroupId = ''] = clean(finding?.relationKey).split('::')
    const clubId = clean(finding?.documentId)
    const seasonKey = clean(finding?.seasonKey)
    const teamId = clean(finding?.teamDocumentId || finding?.relatedDocumentId)
    if (!clubId || !ageGroupId || !seasonKey || !teamId) return

    const targets = targetsByClubId.get(clubId) || []
    targets.push({ ageGroupId, seasonKey, teamId })
    targetsByClubId.set(clubId, targets)
  })

  const results = []
  const failures = []
  for (const [clubId, targets] of targetsByClubId) {
    try {
      results.push(await removeClubDocumentOrphanedCompetitionPathSeasons({
        clubId,
        targets,
        projectionVersion,
        lastWriteAction,
      }))
    } catch (error) {
      failures.push({
        clubId,
        message: error?.message || 'ניקוי מסלולי ליגה יתומים נכשל',
      })
    }
  }

  const repairedClubIds = results.map(result => clean(result?.clubId)).filter(Boolean)
  const masterResult = failures.length || !repairedClubIds.length
    ? null
    : await rebuildClubsMasterFromClubIds({
        clubIds: repairedClubIds,
        projectionVersion,
        lastWriteAction,
      })

  return {
    completed: failures.length === 0,
    repairedClubIds,
    results,
    failures,
    masterResult,
  }
}

export const rebuildClubProjectionsFromLeagueTable = context => (
  syncClubProjectionsFromLeagueTable({
    ...(context || {}),
    canonicalCommitted: true,
    lastWriteAction: context?.lastWriteAction || 'REPAIR_CLUBS_FROM_LEAGUE_TABLE',
  })
)

export const resolveClubProjectionAuditTargets = findings => (
  [...new Map((Array.isArray(findings) ? findings : [])
    .map(finding => ({
      leagueId: clean(finding?.leagueId),
      seasonKey: clean(finding?.seasonKey),
      teamId: clean(finding?.teamDocumentId),
    }))
    .filter(target => target.seasonKey && target.teamId)
    .map(target => [[target.leagueId, target.seasonKey, target.teamId].join('::'), target])).values()]
)

export async function rebuildClubProjectionsFromAuditFindings({
  findings = [],
  lastWriteAction = 'REPAIR_CLUBS_FROM_AUDIT_FINDINGS',
} = {}) {
  const targets = resolveClubProjectionAuditTargets(findings)

  const snapshot = await readPlayerDatabaseAuditSnapshot()
  const teamSeasonsByKey = new Map(snapshot.rows.teamSeasons.flatMap(({ data }) => {
    const seasonKey = clean(data?.seasonKey || data?.seasonId)
    const keys = [
      data?.teamId,
      data?.birthTeamId,
      data?.birthTeamDocumentId,
      data?.teamDocumentId,
    ].map(clean).filter(Boolean)

    return keys.map(teamId => [`${teamId}::${seasonKey}`, data || {}])
  }))
  const repairedClubIds = new Set()
  const failures = []
  const results = []
  const scopes = new Map()

  for (const target of targets) {
    let leagueRow = target.leagueId
      ? snapshot.rows.leagues.find(({ id, data }) => clean(data?.leagueId || id) === target.leagueId)
      : null
    if (!target.leagueId) {
      const legacyMatches = snapshot.rows.leagues.filter(({ data }) => (
        leagueSeasons(data).some(({ season }) => (
          clean(season?.seasonKey || season?.seasonId) === target.seasonKey &&
          (Array.isArray(season?.tableRank) ? season.tableRank : []).some(row => (
            clean(row?.teamId || row?.birthTeamId) === target.teamId
          ))
        ))
      ))
      if (legacyMatches.length === 1) {
        leagueRow = legacyMatches[0]
      } else {
        failures.push({
          ...target,
          reason: legacyMatches.length ? 'AMBIGUOUS_AUDIT_TARGET' : 'AUDIT_TARGET_NOT_FOUND',
        })
        continue
      }
    }
    const league = leagueRow ? { ...(leagueRow.data || {}), id: clean(leagueRow.data?.leagueId || leagueRow.id) } : null
    const seasonEntry = league && leagueSeasons(league).find(({ season }) => clean(season?.seasonKey || season?.seasonId) === target.seasonKey)
    const row = seasonEntry?.season?.tableRank?.find(item => clean(item?.teamId || item?.birthTeamId) === target.teamId)
    if (!league || !seasonEntry || !row) {
      failures.push({ ...target, reason: 'AUDIT_TARGET_NOT_FOUND' })
      continue
    }

    const scopeKey = [
      clean(league?.leagueId || league?.id),
      clean(seasonEntry.season?.seasonKey || seasonEntry.season?.seasonId),
    ].join('::')
    const scope = scopes.get(scopeKey) || {
      league,
      seasonEntry,
      targets: [],
    }
    scope.targets.push(target)
    scopes.set(scopeKey, scope)
  }

  // Performance is relative to the whole League table. One source refresh per
  // League + Season repairs every affected Club row in that scope; doing this
  // once per Audit finding caused the same table to be written repeatedly.
  for (const scope of scopes.values()) {
    const { league, seasonEntry, targets: scopeTargets } = scope
    const canonicalRows = Array.isArray(seasonEntry.season?.tableRank)
      ? seasonEntry.season.tableRank
      : []
    const result = await syncClubProjectionsFromLeagueTable({
      league,
      season: seasonEntry.season,
      // Ranking and attack/defense performance are relative to the entire
      // league table. Supplying only the audited row recalculates it as if
      // it were the sole team in the league and leaves the mismatch intact.
      rows: withLeagueScoutPerformance({
        league,
        season: seasonEntry.season,
        target: seasonEntry.target,
        rows: canonicalRows,
      }),
      leagueSeasonDocument: {
        ...seasonEntry.season,
        seasonStatus: clean(seasonEntry.season?.seasonStatus) || (seasonEntry.target === 'history' ? 'completed' : ''),
      },
      canonicalCommitted: true,
      lastWriteAction,
      syncMaster: false,
      teamSeasonsByKey,
    })
    results.push(result)
    result.results.forEach(item => {
      if (clean(item?.clubId)) repairedClubIds.add(clean(item.clubId))
    })
    failures.push(...result.failures.map(failure => ({
      leagueId: clean(league?.leagueId || league?.id),
      seasonKey: clean(seasonEntry.season?.seasonKey || seasonEntry.season?.seasonId),
      targetTeamIds: scopeTargets.map(target => target.teamId),
      ...failure,
    })))
  }

  const masterResult = failures.length || !repairedClubIds.size
    ? null
    : await rebuildClubsMasterFromClubIds({ clubIds: [...repairedClubIds], lastWriteAction })

  // Only close a partial-write finding after every Club projection and the
  // dependent Clubs Master projection completed successfully.
  const writeActionIds = (Array.isArray(findings) ? findings : [])
    .filter(finding => clean(finding?.entityType) === 'writeAction')
    .map(finding => finding?.documentId)
  const recoveredWriteActionIds = failures.length || !masterResult || !writeActionIds.length
    ? []
    : await resolvePlayersDatabaseWriteActionFailures({
        writeActionIds,
        recoveryAction: lastWriteAction,
      })

  return {
    completed: failures.length === 0,
    targets,
    repairedClubIds: [...repairedClubIds],
    results,
    failures,
    masterResult,
    recoveredWriteActionIds,
  }
}

// A local League-page repair must still protect the Club contract from a team
// that was entered in two leagues for the same age group and season. Such a
// row has no unambiguous Club projection identity, so it is excluded rather
// than silently overwriting the other league's record.
export async function rebuildClubProjectionsForLeagueTable({
  league = {},
  season = {},
  rows = [],
  leagueSeasonDocument = {},
  lastWriteAction = 'REPAIR_CLUBS_FROM_LEAGUE_PAGE',
} = {}) {
  const leagueId = clean(league?.leagueId || league?.id)
  const seasonKey = clean(season?.seasonKey || season?.seasonId)
  const snapshot = await readPlayerDatabaseAuditSnapshot()
  const leagueIdsByIdentity = new Map()

  snapshot.rows.leagues.forEach(({ id, data }) => {
    const sourceLeague = { ...(data || {}), id: clean(data?.leagueId || id) }
    leagueSeasons(sourceLeague).forEach(({ season: sourceSeason }) => {
      ;(Array.isArray(sourceSeason?.tableRank) ? sourceSeason.tableRank : []).forEach(row => {
        const identity = clubLeagueTeamIdentity({ league: sourceLeague, season: sourceSeason, row })
        if (!clean(sourceLeague?.ageGroupId) || !clean(sourceSeason?.seasonKey || sourceSeason?.seasonId) || !clean(row?.teamId || row?.birthTeamId)) return
        const ids = leagueIdsByIdentity.get(identity) || new Set()
        ids.add(clean(sourceLeague?.leagueId || sourceLeague?.id))
        leagueIdsByIdentity.set(identity, ids)
      })
    })
  })

  const conflicts = (Array.isArray(rows) ? rows : []).flatMap(row => {
    const identity = clubLeagueTeamIdentity({ league, season, row })
    const leagueIds = [...(leagueIdsByIdentity.get(identity) || new Set([leagueId]))]
    return leagueIds.length > 1 ? [{
      teamId: clean(row?.teamId || row?.birthTeamId),
      identity,
      leagueIds,
    }] : []
  })
  const excludedTeamIds = conflicts.map(item => item.teamId).filter(Boolean)
  const result = await rebuildClubProjectionsFromLeagueTable({
    league,
    season,
    rows,
    leagueSeasonDocument,
    excludedTeamIds,
    lastWriteAction,
  })

  if (!conflicts.length) return result
  return {
    ...result,
    completed: false,
    projectionsCompleted: false,
    recoveryRequired: true,
    conflicts,
  }
}

export const rebuildClubsMasterFromClubIds = async ({
  clubIds = [],
  projectionVersion = 1,
  lastWriteAction = 'REPAIR_CLUBS_MASTER',
} = {}) => {
  const uniqueClubIds = [...new Set((Array.isArray(clubIds) ? clubIds : [])
    .map(clean)
    .filter(Boolean))]
  const results = []

  for (const clubIdChunk of chunk(uniqueClubIds, MASTER_SYNC_CHUNK_SIZE)) {
    results.push(await syncClubsMasterDocument({
      clubIds: clubIdChunk,
      projectionVersion,
      lastWriteAction,
    }))
  }

  return {
    clubIds: uniqueClubIds,
    chunksCount: results.length,
    updated: results.some(result => result?.updated),
    changed: results.some(result => result?.changed),
    writeSkipped: results.length > 0 && results.every(result => result?.writeSkipped),
    results,
  }
}

export const rebuildAllClubsMasterDocument = ({
  projectionVersion = 1,
  lastWriteAction = 'REPAIR_CLUBS_MASTER',
} = {}) => rebuildAllClubsMasterProjection({
  projectionVersion,
  lastWriteAction,
})

// Repairs Club projections from the canonical League Documents.  A Team Season
// is deliberately optional: league-only teams belong in Club Documents too.
// Master is synchronized once, only after every Club write has succeeded.
export async function rebuildClubProjectionsFromAllLeagueTables({
  lastWriteAction = 'REPAIR_CLUBS_FROM_ALL_LEAGUE_TABLES',
} = {}) {
  const snapshot = await readPlayerDatabaseAuditSnapshot()
  const repairedClubIds = new Set()
  const teamSeasonsByKey = new Map(snapshot.rows.teamSeasons.flatMap(({ data }) => {
    const seasonKey = clean(data?.seasonKey || data?.seasonId)
    const keys = [
      data?.teamId,
      data?.birthTeamId,
      data?.birthTeamDocumentId,
      data?.teamDocumentId,
    ].map(clean).filter(Boolean)

    return keys.map(teamId => [`${teamId}::${seasonKey}`, data || {}])
  }))
  const allLeagueRowsByIdentity = new Map()

  snapshot.rows.leagues.forEach(({ id, data }) => {
    const league = { ...(data || {}), id: clean(data?.leagueId || id) }
    leagueSeasons(league).forEach(({ season }) => {
      ;(Array.isArray(season?.tableRank) ? season.tableRank : []).forEach(row => {
        const identity = clubLeagueTeamIdentity({ league, season, row })
        if (!clean(league?.ageGroupId) || !clean(season?.seasonKey || season?.seasonId) || !clean(row?.teamId || row?.birthTeamId)) return
        const entries = allLeagueRowsByIdentity.get(identity) || []
        entries.push({ league, season, row })
        allLeagueRowsByIdentity.set(identity, entries)
      })
    })
  })

  const conflictedRowKeys = new Set()
  const failures = []
  allLeagueRowsByIdentity.forEach((entries, identity) => {
    const leagueIds = [...new Set(entries.map(entry => clean(entry.league?.leagueId || entry.league?.id)))]
    if (leagueIds.length < 2) return

    entries.forEach(entry => conflictedRowKeys.add(leagueRowKey(entry)))
    failures.push({
      reason: 'DUPLICATE_LEAGUE_TEAM_IDENTITY',
      identity,
      leagueIds,
      message: 'אותה קבוצה מופיעה ביותר מליגה אחת באותה קבוצת גיל ועונה',
    })
  })

  let processedLeagueSeasons = 0
  let processedTeams = 0
  const identityIndexResults = []

  for (const { id, data } of snapshot.rows.leagues) {
    const league = { ...(data || {}), id: clean(data?.leagueId || id) }

    for (const { season, target } of leagueSeasons(league)) {
      const rows = Array.isArray(season?.tableRank) ? season.tableRank : []
      if (!rows.length) continue

      processedLeagueSeasons += 1
      processedTeams += rows.length
      identityIndexResults.push(await syncLeagueClubSeasonIdentityIndex({
        league,
        season,
        rows,
        lastWriteAction,
      }))
      const excludedTeamIds = rows
        .filter(row => conflictedRowKeys.has(leagueRowKey({ league, season, row })))
        .map(row => clean(row?.teamId || row?.birthTeamId))
      const result = await syncClubProjectionsFromLeagueTable({
        league,
        season,
        rows: withLeagueScoutPerformance({ league, season, target, rows }),
        leagueSeasonDocument: {
          ...season,
          seasonStatus: clean(season?.seasonStatus) || (target === 'history' ? 'completed' : ''),
        },
        canonicalCommitted: true,
        lastWriteAction,
        syncMaster: false,
        excludedTeamIds,
        teamSeasonsByKey,
      })

      result.results.forEach(item => {
        if (clean(item?.clubId)) repairedClubIds.add(clean(item.clubId))
      })
      failures.push(...result.failures.map(failure => ({
        leagueId: clean(league?.leagueId || league?.id),
        seasonKey: clean(season?.seasonKey || season?.seasonId),
        ...failure,
      })))
    }
  }

  const hasClubWriteFailures = failures.some(failure => (
    failure?.reason !== 'DUPLICATE_LEAGUE_TEAM_IDENTITY'
  ))

  if (hasClubWriteFailures) {
    return {
      completed: false,
      canonicalCommitted: true,
      projectionsCompleted: false,
      recoveryRequired: true,
      processedLeagueSeasons,
      processedTeams,
      repairedClubIds: [...repairedClubIds],
      failures,
      masterResult: null,
      identityIndexResults,
    }
  }

  const masterResult = repairedClubIds.size
    ? await rebuildAllClubsMasterDocument({ lastWriteAction })
    : null

  return {
    completed: failures.length === 0,
    canonicalCommitted: true,
    projectionsCompleted: failures.length === 0,
    recoveryRequired: failures.length > 0,
    processedLeagueSeasons,
    processedTeams,
    repairedClubIds: [...repairedClubIds],
    failures: [],
    masterResult,
    identityIndexResults,
  }
}

export const recoverFailedClubProjection = context => (
  recoverClubProjectionPersistence({
    ...(context || {}),
    canonicalCommitted: true,
    lastWriteAction: context?.lastWriteAction || 'RECOVER_CLUB_PROJECTION',
  })
)
