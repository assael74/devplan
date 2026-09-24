import { getLeagueById } from '../../read/entities/league.js'
import { readLeaguesMasterDocument } from '../../read/masters/leaguesMaster.read.js'
import { buildSeasonKey } from '../../../model/shared/season.model.js'
import { normalizeTeamIdentity } from '../../../model/team/teamIdentity.model.js'
import { buildRosterSourceFingerprint } from '../teams/rosterSourceFingerprint.js'
import {
  areScoutProfilesSummariesEqual,
  areTeamTaskSignalsEqual,
  normalizeScoutProfilesSummary,
  normalizeTeamTaskSignals,
} from '../../../domain/projections/teamScoutSummary.projection.js'
import {
  buildLeaguesMasterLeagueEntry,
  buildLeaguesMasterLeagueMap,
  buildLeaguesMasterSummary,
  sortLeaguesMasterEntries,
} from '../../../domain/projections/leaguesMaster.projection.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const withoutReaderMetadata = value => {
  if (!value || typeof value !== 'object') return {}
  const { id, documentExists, ...document } = value
  return document
}

const hasOwn = (source, key) => (
  Boolean(source) && Object.prototype.hasOwnProperty.call(source, key)
)

const hasFiniteNumberValue = value => clean(value) !== '' && Number.isFinite(Number(value))

const toNumberOrZero = value => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const isSameSeason = (left = {}, right = {}) => {
  const leftSeasonId = clean(left?.seasonId)
  const rightSeasonId = clean(right?.seasonId)
  const leftSeasonKey = clean(left?.seasonKey)
  const rightSeasonKey = clean(right?.seasonKey)

  return Boolean(
    (leftSeasonId && rightSeasonId && leftSeasonId === rightSeasonId) ||
    (leftSeasonKey && rightSeasonKey && leftSeasonKey === rightSeasonKey)
  )
}

const sumTableRankPlayersCount = tableRank =>
  (Array.isArray(tableRank) ? tableRank : []).reduce(
    (total, row) => total + toNumberOrZero(row?.playersCount),
    0
  )

const hasTableRankPlayersCount = tableRank =>
  (Array.isArray(tableRank) ? tableRank : []).some(row =>
    hasFiniteNumberValue(row?.playersCount)
  )

const resolveSeasonTarget = ({ leagueDocument = {}, season = {}, target = 'current' } = {}) => {
  const currentSeason = leagueDocument.current || null
  const history = Array.isArray(leagueDocument.history) ? leagueDocument.history : []
  const requestedSeason = {
    seasonId: clean(season?.seasonId),
    seasonKey: clean(season?.seasonKey) || buildSeasonKey(clean(season?.seasonId)),
  }
  const currentMatches = isSameSeason(currentSeason, requestedSeason)
  const historyIndex = history.findIndex(row => isSameSeason(row, requestedSeason))
  const preferHistory = clean(target) === 'history'
  const sourceTarget = preferHistory
    ? historyIndex >= 0 ? 'history' : ''
    : currentMatches ? 'current' : historyIndex >= 0 ? 'history' : ''

  return {
    currentSeason,
    history,
    historyIndex,
    sourceTarget,
    seasonRow: sourceTarget === 'current'
      ? currentSeason
      : sourceTarget === 'history' && historyIndex >= 0
        ? history[historyIndex]
        : null,
  }
}

const buildMasterOperation = ({
  leagueDocument = {},
  projectedLeagueDocument = {},
  leaguesMasterDocument = {},
  sourceRevision = '',
} = {}) => {
  const leagueId = clean(leagueDocument?.id || leagueDocument?.leagueId)
  const leagueMap = buildLeaguesMasterLeagueMap(leaguesMasterDocument?.leagues)
  const currentEntry = leagueMap.get(leagueId) || {}
  const projectedEntry = buildLeaguesMasterLeagueEntry(
    projectedLeagueDocument,
    currentEntry
  )

  leagueMap.set(leagueId, projectedEntry)

  const projectedLeagues = sortLeaguesMasterEntries(Array.from(leagueMap.values()))

  return {
    operationType: 'leagueMetadataLeaguesMaster',
    operationId: `leagueMetadataLeaguesMaster__${leagueId}__${clean(sourceRevision)}`,
    sourceRevision: clean(sourceRevision),
    target: {
      documentId: 'all',
      leagueId,
    },
    expected: {
      targetExists: leaguesMasterDocument?.documentExists === true,
      targetFingerprint: buildRosterSourceFingerprint(
        leaguesMasterDocument?.documentExists === true
          ? withoutReaderMetadata(leaguesMasterDocument)
          : null
      ),
    },
    patch: {
      id: 'all',
      docType: 'leagues_master',
      leagues: projectedLeagues,
      summary: buildLeaguesMasterSummary(projectedLeagues),
    },
  }
}

export async function prepareLeagueTeamMetadataStatsPlan({
  league = {},
  season = {},
  target = 'current',
  team = {},
  scoutProfilesSummary = {},
  teamTaskSignals = null,
  sourceRevision = '',
  trackedAt = '',
} = {}) {
  const leagueId = clean(league?.id || season?.leagueId || team?.leagueId)
  const seasonId = clean(season?.seasonId)
  const seasonKey = clean(season?.seasonKey) || buildSeasonKey(seasonId)
  const teamIdentity = normalizeTeamIdentity({ team })
  const birthTeamId = clean(
    teamIdentity.birthTeamId ||
    teamIdentity.teamId ||
    team?.birthTeamId ||
    team?.teamId ||
    team?.birthTeamDocumentId ||
    team?.teamDocumentId ||
    team?.id
  )
  const clubId = clean(teamIdentity.clubId || team?.clubId)
  const teamUrl = clean(team?.teamUrl)
  const effectiveTrackedAt = clean(trackedAt)
  const normalizedSummary = normalizeScoutProfilesSummary(scoutProfilesSummary)
  const hasTeamTaskSignals = Boolean(teamTaskSignals && typeof teamTaskSignals === 'object')
  const normalizedTaskSignals = normalizeTeamTaskSignals(teamTaskSignals)

  if (!leagueId) throw new Error('Missing league id for League metadata plan')
  if (!seasonId && !seasonKey) throw new Error('Missing season id for League metadata plan')
  if (!birthTeamId) throw new Error('Missing birth team id for League metadata plan')
  if (!sourceRevision) throw new Error('Missing source revision for League metadata plan')
  if (!effectiveTrackedAt) throw new Error('Missing trackedAt for League metadata plan')

  const [leagueDocument, leaguesMasterDocument] = await Promise.all([
    getLeagueById(leagueId, { bypassCache: true }),
    readLeaguesMasterDocument({ fresh: true }),
  ])

  if (!leagueDocument) {
    return {
      leagueId,
      seasonId,
      seasonKey,
      birthTeamId,
      operations: [],
      failures: [{ reason: 'leagueDocMissing', leagueId }],
    }
  }

  const resolvedTarget = resolveSeasonTarget({
    leagueDocument,
    season: { seasonId, seasonKey },
    target,
  })
  const seasonRow = resolvedTarget.seasonRow

  if (!seasonRow) {
    return {
      leagueId,
      seasonId,
      seasonKey,
      birthTeamId,
      operations: [],
      failures: [{ reason: 'leagueSeasonMissing', leagueId, seasonKey }],
    }
  }

  const tableRank = Array.isArray(seasonRow.tableRank) ? seasonRow.tableRank : []
  const teamRowIndex = tableRank.findIndex(row => {
    const rowIdentity = normalizeTeamIdentity({ team: row })
    const rowTeamId = clean(
      rowIdentity.birthTeamId ||
      rowIdentity.teamId ||
      row?.birthTeamId ||
      row?.teamId ||
      row?.birthTeamDocumentId ||
      row?.teamDocumentId ||
      row?.id
    )
    const rowClubId = clean(rowIdentity.clubId || row?.clubId)

    return rowTeamId === birthTeamId || (!rowTeamId && clubId && rowClubId === clubId)
  })

  if (teamRowIndex === -1) {
    return {
      leagueId,
      seasonId,
      seasonKey,
      birthTeamId,
      operations: [],
      failures: [{ reason: 'leagueTeamRowMissing', leagueId, seasonKey, birthTeamId }],
    }
  }

  const currentTeamRow = tableRank[teamRowIndex] || {}
  const effectiveTeamUrl = teamUrl || clean(currentTeamRow.teamUrl)
  const effectivePlayersCount = hasFiniteNumberValue(team?.playersCount)
    ? Number(team.playersCount)
    : hasFiniteNumberValue(currentTeamRow.playersCount)
      ? Number(currentTeamRow.playersCount)
      : undefined
  const effectiveHasPlayers = hasOwn(team, 'hasPlayers')
    ? Boolean(team.hasPlayers)
    : hasOwn(currentTeamRow, 'hasPlayers')
      ? Boolean(currentTeamRow.hasPlayers)
      : undefined
  const effectiveHasStats = hasOwn(team, 'hasStats')
    ? Boolean(team.hasStats)
    : hasOwn(currentTeamRow, 'hasStats')
      ? Boolean(currentTeamRow.hasStats)
      : undefined
  const effectiveStatsComplete = hasOwn(team, 'statsComplete')
    ? Boolean(team.statsComplete)
    : hasOwn(currentTeamRow, 'statsComplete')
      ? Boolean(currentTeamRow.statsComplete)
      : undefined

  const loadStatusUnchanged = (
    clean(currentTeamRow.teamUrl) === effectiveTeamUrl &&
    (!hasFiniteNumberValue(effectivePlayersCount) ||
      toNumberOrZero(currentTeamRow.playersCount) === Number(effectivePlayersCount)) &&
    (effectiveHasPlayers === undefined || Boolean(currentTeamRow.hasPlayers) === effectiveHasPlayers) &&
    (effectiveHasStats === undefined || Boolean(currentTeamRow.hasStats) === effectiveHasStats) &&
    (effectiveStatsComplete === undefined || Boolean(currentTeamRow.statsComplete) === effectiveStatsComplete)
  )
  const scoutSummaryUnchanged = areScoutProfilesSummariesEqual(
    currentTeamRow.scoutProfilesSummary,
    normalizedSummary
  )
  const taskSignalsUnchanged = !hasTeamTaskSignals || (
    hasOwn(currentTeamRow, 'teamTaskSignals') &&
    areTeamTaskSignalsEqual(currentTeamRow.teamTaskSignals, normalizedTaskSignals)
  )
  const playersCountChanged = (
    hasFiniteNumberValue(effectivePlayersCount) &&
    toNumberOrZero(currentTeamRow.playersCount) !== Number(effectivePlayersCount)
  )
  const changed = !(loadStatusUnchanged && scoutSummaryUnchanged && taskSignalsUnchanged)
  const masterSyncRequired = changed && (playersCountChanged || !scoutSummaryUnchanged)
  const plannedUpdatedAt = effectiveTrackedAt
  const nextTeamRow = changed
    ? {
        ...currentTeamRow,
        teamUrl: effectiveTeamUrl,
        ...(hasFiniteNumberValue(effectivePlayersCount)
          ? { playersCount: Number(effectivePlayersCount) }
          : {}),
        ...(effectiveHasPlayers !== undefined ? { hasPlayers: effectiveHasPlayers } : {}),
        ...(effectiveHasStats !== undefined ? { hasStats: effectiveHasStats } : {}),
        ...(effectiveStatsComplete !== undefined ? { statsComplete: effectiveStatsComplete } : {}),
        scoutProfilesSummary: normalizedSummary,
        ...(hasTeamTaskSignals
          ? {
              teamTaskSignals: {
                ...normalizedTaskSignals,
                updatedAt: plannedUpdatedAt,
              },
            }
          : {}),
        updatedAt: plannedUpdatedAt,
      }
    : currentTeamRow
  const nextTableRank = tableRank.map((row, index) => (
    index === teamRowIndex ? nextTeamRow : row
  ))
  const nextSeason = changed
    ? {
        ...seasonRow,
        tableRank: nextTableRank,
        updatedAt: plannedUpdatedAt,
      }
    : seasonRow
  const projectedLeagueDocument = resolvedTarget.sourceTarget === 'current'
    ? {
        ...leagueDocument,
        current: nextSeason,
      }
    : {
        ...leagueDocument,
        history: resolvedTarget.history.map((row, index) => (
          index === resolvedTarget.historyIndex ? nextSeason : row
        )),
      }

  const leagueDocumentPatch = resolvedTarget.sourceTarget === 'current'
    ? { current: projectedLeagueDocument.current }
    : { history: projectedLeagueDocument.history }

  const leagueOperation = {
    operationType: 'leagueTeamMetadata',
    operationId: `leagueTeamMetadata__${leagueId}__${seasonKey}__${birthTeamId}__${clean(sourceRevision)}`,
    sourceRevision: clean(sourceRevision),
    target: {
      leagueId,
      seasonId,
      seasonKey,
      sourceTarget: resolvedTarget.sourceTarget,
      birthTeamId,
    },
    expected: {
      targetExists: true,
      targetFingerprint: buildRosterSourceFingerprint(
        withoutReaderMetadata(leagueDocument)
      ),
    },
    changed,
    patch: {
      document: leagueDocumentPatch,
      seasonPlayersCount: hasTableRankPlayersCount(nextTableRank)
        ? sumTableRankPlayersCount(nextTableRank)
        : undefined,
    },
  }

  return {
    leagueId,
    seasonId,
    seasonKey,
    birthTeamId,
    sourceTarget: resolvedTarget.sourceTarget,
    changed,
    masterSyncRequired,
    operations: [leagueOperation],
    leaguesMasterOperations: masterSyncRequired
      ? [buildMasterOperation({
          leagueDocument,
          projectedLeagueDocument,
          leaguesMasterDocument,
          sourceRevision,
        })]
      : [],
    failures: [],
  }
}
