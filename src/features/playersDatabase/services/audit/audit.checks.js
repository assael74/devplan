import { buildAuditResult } from './audit.contract.js'
import { reconcileActiveAuditFindings } from './audit.activeFindings.js'
import { readPlayerDatabaseAuditSnapshot } from './audit.read.js'
import { normalizeAuditScope, AUDIT_SCOPE_TYPE } from './audit.scope.js'
import {
  auditHelpers,
  auditDomainsForScope,
  attachFindingTimeline,
  clean,
  inScope,
  keyOf,
  seasonKeyOf,
  teamIdOf,
  uniqueFindings,
} from './audit.helpers.js'
import { appendLeagueAuditFindings } from './checks/auditLeague.checks.js'
import { appendClubAuditFindings } from './checks/auditClub.checks.js'
import {
  appendTeamLifecycleAuditFindings,
  appendTeamSeasonAuditFindings,
} from './checks/auditTeamLifecycle.checks.js'
import {
  appendPlayerSeasonAuditFindings,
  appendPlayerDocumentAuditFindings,
} from './checks/auditPlayer.checks.js'
import { appendSearchIndexAuditFindings } from './checks/auditSearchIndex.checks.js'
import { appendWriteRecoveryAuditFindings } from './checks/auditWriteRecovery.checks.js'
import { appendTeamSeasonMovementAuditFindings } from './checks/auditMovement.checks.js'

export async function runPlayerDatabaseAuditChecks({ scope, includeWriteRecovery = true } = {}) {
  const normalizedScope = normalizeAuditScope(scope)
  const snapshot = await readPlayerDatabaseAuditSnapshot({
    scope: normalizedScope,
    includeWriteRecovery,
  })
  const { leagues, leaguesMaster, clubs, clubsMaster, teams, teamSeasons, players, favorites, searchIndexes, writeActions } = snapshot.rows
  const rootsById = new Map(teams.map(row => [row.id, row.data]))
  const teamSeasonsByTeamSeasonKey = new Map(teamSeasons.map(row => [keyOf(row.data), row.data]))
  const playerDocsById = new Map(players.map(row => [row.id, row.data]))
  const findings = []
  const lifecycle = []
  const scopedSeasons = teamSeasons.filter(row => inScope({ scope: normalizedScope, row: row.data }))
  const teamIndexes = searchIndexes.filter(row => row.data?.entityType === 'birthTeamSeason')
  const playerIndexes = searchIndexes.filter(row => row.data?.entityType === 'playerSeason')
  const favoriteIds = new Set((favorites.find(row => row.id === 'players')?.data?.items || []).map(item => clean(item?.entityId)).filter(Boolean))
  const clubScopedAudit = normalizedScope.type === AUDIT_SCOPE_TYPE.CLUB_TEAM_SEASON
  const masterChecked = normalizedScope.type === AUDIT_SCOPE_TYPE.FULL_SYSTEM
  const masterAvailable = leaguesMaster.some(row => row.id === 'all')

  const context = {
    normalizedScope,
    snapshot,
    leagues,
    leaguesMaster,
    clubs,
    clubsMaster,
    teams,
    teamSeasons,
    players,
    rootsById,
    teamSeasonsByTeamSeasonKey,
    playerDocsById,
    scopedSeasons,
    teamIndexes,
    playerIndexes,
    favoriteIds,
    writeActions,
    findings,
    lifecycle,
    helpers: auditHelpers,
  }

  appendLeagueAuditFindings(context)
  appendClubAuditFindings(context)
  appendTeamLifecycleAuditFindings(context)

  scopedSeasons.forEach(({ id, data: season }) => {
    const teamId = teamIdOf(season)
    const seasonKey = seasonKeyOf(season)
    const root = rootsById.get(teamId)
    const seasonContext = {
      ...context,
      id,
      season,
      teamId,
      seasonKey,
      root,
    }

    appendTeamSeasonAuditFindings(seasonContext)
    appendTeamSeasonMovementAuditFindings(seasonContext)
    appendPlayerSeasonAuditFindings(seasonContext)
  })

  appendPlayerDocumentAuditFindings(context)
  appendSearchIndexAuditFindings(context)
  appendWriteRecoveryAuditFindings(context)
  const detectedAt = snapshot.generatedAt
  const timelineFindings = attachFindingTimeline({
    findings: uniqueFindings(findings),
    snapshot,
    detectedAt,
  })
  let activeFindings = timelineFindings
  let auditMetadata = {
    completed: true,
    createdCount: 0,
    deletedCount: 0,
    unchangedCount: 0,
    error: null,
  }
  try {
    const reconciliation = await reconcileActiveAuditFindings({
      findings: timelineFindings,
      scope: normalizedScope,
      auditDomains: auditDomainsForScope(normalizedScope),
      detectedAt,
    })
    activeFindings = reconciliation.findings
    auditMetadata = {
      completed: true,
      createdCount: reconciliation.createdCount,
      deletedCount: reconciliation.deletedCount,
      unchangedCount: reconciliation.unchangedCount,
      error: null,
    }
  } catch (error) {
    // Metadata failure must never mutate, repair, or hide business findings.
    auditMetadata = {
      completed: false,
      createdCount: 0,
      deletedCount: 0,
      unchangedCount: 0,
      error: String(error?.message || 'Audit metadata synchronization failed'),
    }
  }

  return buildAuditResult({
    scope: normalizedScope,
    generatedAt: snapshot.generatedAt,
    readsUsed: snapshot.readsUsed,
    checked: scopedSeasons.length + leaguesMaster.length + clubs.length + clubsMaster.length + players.length + teamIndexes.length + playerIndexes.length,
    findings: activeFindings,
    lifecycle,
    coverage: {
      leaguesMaster: {
        checked: masterChecked,
        available: masterAvailable,
        label: 'מאסטר הליגות מול מסמכי הליגה',
      },
      clubs: {
        checked: normalizedScope.type === AUDIT_SCOPE_TYPE.FULL_SYSTEM || clubScopedAudit,
        documents: clubs.length,
        masterAvailable: clubsMaster.some(row => row.id === 'all'),
        label: 'מסמכי מועדון ו-Clubs Master מול Team/League',
      },
    },
    auditMetadata,
  })
  }
