const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

export const STATS_RECONCILE_STAGE = Object.freeze({
  COUNTERPARTS: 'counterparts',
  PLAYER_DOCUMENTS: 'playerDocuments',
  PLAYER_INDEXES: 'playerIndexes',
  TEAM_LEAGUE: 'teamLeague',
  CLUBS: 'clubs',
})

const STATS_RECONCILE_STAGES = Object.freeze([
  STATS_RECONCILE_STAGE.COUNTERPARTS,
  STATS_RECONCILE_STAGE.PLAYER_DOCUMENTS,
  STATS_RECONCILE_STAGE.PLAYER_INDEXES,
  STATS_RECONCILE_STAGE.TEAM_LEAGUE,
  STATS_RECONCILE_STAGE.CLUBS,
])

export const STATS_RECONCILE_TARGETS_BY_STAGE = Object.freeze({
  [STATS_RECONCILE_STAGE.COUNTERPARTS]: Object.freeze(['counterpart']),
  [STATS_RECONCILE_STAGE.PLAYER_DOCUMENTS]: Object.freeze(['playerDocument']),
  [STATS_RECONCILE_STAGE.PLAYER_INDEXES]: Object.freeze(['playerSearchIndex']),
  [STATS_RECONCILE_STAGE.TEAM_LEAGUE]: Object.freeze([
    'teamSearchIndex',
    'leagueMetadata',
    'leaguesMaster',
  ]),
  [STATS_RECONCILE_STAGE.CLUBS]: Object.freeze(['club', 'clubsMaster']),
})

export const statsAuditHasTargetFindingV2 = (audit, targets) => {
  const allowed = new Set(targets)
  return (audit?.findings || []).some(row => allowed.has(clean(row?.target)))
}

export function buildStatsReconcileStageStateV2(audit = {}) {
  const counterpartsNeedSync = statsAuditHasTargetFindingV2(
    audit,
    STATS_RECONCILE_TARGETS_BY_STAGE[STATS_RECONCILE_STAGE.COUNTERPARTS]
  )

  return STATS_RECONCILE_STAGES.map(stage => {
    const needsSync = statsAuditHasTargetFindingV2(
      audit,
      STATS_RECONCILE_TARGETS_BY_STAGE[stage]
    )
    const blocked = (
      stage === STATS_RECONCILE_STAGE.CLUBS &&
      counterpartsNeedSync
    )

    return {
      stage,
      targets: STATS_RECONCILE_TARGETS_BY_STAGE[stage],
      status: blocked
        ? 'blocked'
        : needsSync
          ? 'needs_sync'
          : 'clean',
      blockedBy: blocked
        ? STATS_RECONCILE_STAGE.COUNTERPARTS
        : '',
    }
  })
}
