// src/features/playersDatabase/services/audit/playerScoutShadow.audit.js

import { buildPlayerScoutShadowAudit } from '../../domain/orchestration/buildPlayerScoutShadowAudit.js'
import { buildDbPlayerScoutLegacyResult } from '../../domain/orchestration/buildDbPlayerScoutLegacyResult.js'
import { buildPlayerScoutCalculationContract } from '../../domain/contracts/playerScoutInput.contract.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const unique = values => Array.from(new Set(
  (Array.isArray(values) ? values : [])
    .map(clean)
    .filter(Boolean)
))

const buildScopeKey = row => [
  clean(row?.teamDocumentId || row?.birthTeamDocumentId),
  clean(row?.seasonKey || row?.seasonId),
].filter(Boolean).join('::')

const buildPlayerFromAuditRow = row => ({
  playerId: clean(row.playerId),
  playerDocumentId: clean(row.playerDocumentId),
  externalPlayerId: clean(row.externalPlayerId),
  fullName: clean(row.fullName),
  primaryPosition: clean(row.primaryPosition || row.position),
  position: clean(row.primaryPosition || row.position),
  playerStats: {
    games: Number(row.stats?.games) || 0,
    goals: Number(row.stats?.goals) || 0,
    yellowCards: Number(row.stats?.yellowCards) || 0,
    minutes: Number(row.stats?.minutes) || 0,
    starts: Number(row.stats?.starts) || 0,
    substituteIn: Number(row.stats?.substituteIn) || 0,
    substitutedOut: Number(row.stats?.substitutedOut) || 0,
    teamGames: Number(row.stats?.teamGames) || 0,
  },
})

const buildLegacyPlayerFromAuditRow = ({ row, team, season }) => {
  const player = buildPlayerFromAuditRow(row)
  const contract = buildPlayerScoutCalculationContract({
    player,
    team,
    season,
  })
  const legacyResult = buildDbPlayerScoutLegacyResult({
    player: contract.player,
    team: contract.team,
    season: contract.season,
    perspective: 'players_database_legacy_benchmark',
  })

  return {
    ...player,
    scoutProfiles: Array.isArray(legacyResult?.signals)
      ? legacyResult.signals
      : [],
  }
}

const buildTeamFromAuditRow = row => ({
  teamDocumentId: clean(row.teamDocumentId || row.birthTeamDocumentId),
  birthTeamDocumentId: clean(row.birthTeamDocumentId || row.teamDocumentId),
  teamId: clean(row.teamId || row.birthTeamId),
  birthTeamId: clean(row.birthTeamId || row.teamId),
  clubId: clean(row.clubId),
  displayName: clean(row.teamName),
  teamName: clean(row.teamName),
  clubLevel: row.teamContext?.clubLevel,
  clubStrengthLevel: row.teamContext?.clubStrengthLevel,
  leagueLevel: row.teamContext?.leagueLevel,
  teamGamePlayed: Number(row.teamContext?.teamGamePlayed) || 0,
  goalsFor: Number(row.teamContext?.goalsFor) || 0,
  goalsAgainst: Number(row.teamContext?.goalsAgainst) || 0,
  attackPriorityLevel: clean(row.teamContext?.attackPriorityLevel),
  defensePriorityLevel: clean(row.teamContext?.defensePriorityLevel),
  ageGroupId: clean(row.teamContext?.ageGroupId),
})

const buildSeasonFromAuditRow = row => ({
  seasonId: clean(row.seasonId),
  seasonKey: clean(row.seasonKey || row.seasonId),
  leagueLevel: row.teamContext?.leagueLevel,
  seasonStatus: row.sourceTarget === 'history'
    ? 'completed'
    : 'active',
})

const buildScopeRows = recalculatedRows => {
  const scopes = new Map()

  ;(Array.isArray(recalculatedRows) ? recalculatedRows : []).forEach(row => {
    const scopeKey = buildScopeKey(row)
    if (!scopeKey) return

    if (!scopes.has(scopeKey)) scopes.set(scopeKey, [])
    scopes.get(scopeKey).push(row)
  })

  return [...scopes.entries()]
}

const countRows = (rows, predicate) => rows.reduce(
  (count, row) => count + (predicate(row) ? 1 : 0),
  0
)

const mergeCounts = (target, source) => Object.entries(source || {}).reduce(
  (result, [key, value]) => ({
    ...result,
    [key]: Number(result[key] || 0) + Number(value || 0),
  }),
  target
)

export const buildPlayerScoutShadowComparison = ({ audit } = {}) => {
  const recalculatedRows = Array.isArray(audit?.recalculatedRows)
    ? audit.recalculatedRows
    : []
  const scopeEntries = buildScopeRows(recalculatedRows)
  const shadowRows = []
  let opportunityStatusCounts = {}
  let teamGateModeCounts = {}

  scopeEntries.forEach(([scopeKey, rows]) => {
    const firstRow = rows[0]
    if (!firstRow) return

    const team = buildTeamFromAuditRow(firstRow)
    const season = buildSeasonFromAuditRow(firstRow)
    const result = buildPlayerScoutShadowAudit({
      players: rows.map(row => buildLegacyPlayerFromAuditRow({
        row,
        team,
        season,
      })),
      team,
      season,
      league: {
        level: firstRow.teamContext?.leagueLevel,
      },
      snapshotRows: [],
    })

    opportunityStatusCounts = mergeCounts(
      opportunityStatusCounts,
      result.opportunityStatusCounts
    )
    teamGateModeCounts = mergeCounts(
      teamGateModeCounts,
      result.teamGateModeCounts
    )

    ;(Array.isArray(result.rows) ? result.rows : []).forEach(row => {
      shadowRows.push({
        ...row,
        scopeKey,
        teamDocumentId: clean(firstRow.teamDocumentId),
        teamName: clean(firstRow.teamName),
        seasonKey: clean(firstRow.seasonKey || firstRow.seasonId),
      })
    })
  })

  const changedRows = shadowRows.filter(row => !row.sameProfiles)
  const contractIssueRows = shadowRows.filter(row => row.contractValid === false)

  return {
    generatedAt: new Date().toISOString(),
    engineVersion: 'scouting-v2-primary-vs-legacy',
    mode: 'read-only-active-vs-legacy-comparison',
    writesFirestore: false,
    additionalFirestoreReads: 0,
    snapshotProgressionAvailable: false,
    summary: {
      scopes: scopeEntries.length,
      totalPlayers: shadowRows.length,
      v1ProfiledPlayers: countRows(
        shadowRows,
        row => row.v1ProfileIds.length > 0
      ),
      v2ProfiledPlayers: countRows(
        shadowRows,
        row => row.v2ProfileIds.length > 0
      ),
      sameProfilePlayers: shadowRows.length - changedRows.length,
      changedProfilePlayers: changedRows.length,
      v2AddedProfilePlayers: countRows(
        shadowRows,
        row => row.addedProfileIds.length > 0
      ),
      v2RemovedProfilePlayers: countRows(
        shadowRows,
        row => row.removedProfileIds.length > 0
      ),
      nearProfilePlayers: countRows(
        shadowRows,
        row => Array.isArray(row.candidateSignals) && row.candidateSignals.length > 0
      ),
      playersWithNextBestCheck: countRows(
        shadowRows,
        row => Boolean(row.nextBestCheckId)
      ),
      contractIssuePlayers: contractIssueRows.length,
      opportunityStatusCounts,
      teamGateModeCounts,
      addedProfilesById: changedRows.reduce((counts, row) => (
        mergeCounts(
          counts,
          Object.fromEntries(
            unique(row.addedProfileIds).map(profileId => [profileId, 1])
          )
        )
      ), {}),
      removedProfilesById: changedRows.reduce((counts, row) => (
        mergeCounts(
          counts,
          Object.fromEntries(
            unique(row.removedProfileIds).map(profileId => [profileId, 1])
          )
        )
      ), {}),
    },
    rows: shadowRows,
    changedRows,
    contractIssueRows,
  }
}
