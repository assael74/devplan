// src/features/playersDatabase/services/audit/playerScoutAudit.readPlan.js

const toSafeCount = value => (
  Number.isFinite(Number(value))
    ? Math.max(0, Number(value))
    : 0
)

export const PLAYER_SCOUT_AUDIT_READ_BUDGETS = Object.freeze({
  PLAYER: 20,
  TEAM_SEASON: 150,
  FULL_SYSTEM: 49000,
})

export const PLAYER_SCOUT_AUDIT_READ_PLAN_MODE = Object.freeze({
  PLAYER: 'player',
  TEAM_SEASON: 'team-season',
  FULL_SYSTEM: 'full-system',
})

export const buildTeamSeasonScoutAuditReadPlan = ({
  teamPlayersCount = 0,
  requestedReadLimit = PLAYER_SCOUT_AUDIT_READ_BUDGETS.TEAM_SEASON,
} = {}) => {
  const players = toSafeCount(teamPlayersCount)
  const requestedLimit = Math.max(
    1,
    toSafeCount(requestedReadLimit) ||
    PLAYER_SCOUT_AUDIT_READ_BUDGETS.TEAM_SEASON
  )
  const budgetLimit = Math.min(
    requestedLimit,
    PLAYER_SCOUT_AUDIT_READ_BUDGETS.TEAM_SEASON
  )
  const estimated = {
    teamDocuments: 1,
    playerSearchIndexes: players,
    teamSearchIndexes: 1,
    playerDocuments: players,
  }
  const estimatedTotal = (
    estimated.teamDocuments +
    estimated.playerSearchIndexes +
    estimated.teamSearchIndexes +
    estimated.playerDocuments
  )
  const allowed = estimatedTotal <= budgetLimit

  return {
    mode: PLAYER_SCOUT_AUDIT_READ_PLAN_MODE.TEAM_SEASON,
    basis: 'team_document_preflight',
    teamPlayersCount: players,
    estimatedReads: {
      ...estimated,
      total: estimatedTotal,
    },
    budget: {
      defaultLimit: PLAYER_SCOUT_AUDIT_READ_BUDGETS.TEAM_SEASON,
      requestedLimit,
      effectiveLimit: budgetLimit,
    },
    decision: {
      allowed,
      status: allowed ? 'allowed' : 'blocked',
      reason: allowed
        ? ''
        : 'estimated_reads_exceed_team_season_budget',
    },
    assumptions: [
      'one_player_search_index_per_team_player',
      'one_player_document_lookup_per_team_player_maximum',
      'one_team_search_index',
      'team_document_preflight_read_included',
    ],
  }
}

export const assertTeamSeasonScoutAuditReadPlan = plan => {
  if (plan?.decision?.allowed) return plan

  const estimated = Number(plan?.estimatedReads?.total) || 0
  const limit = Number(plan?.budget?.effectiveLimit) || 0
  const error = new Error(
    `Scoped player scout audit blocked before expensive reads: ` +
    `estimated ${estimated} reads exceeds the ${limit}-read team-season budget.`
  )

  error.name = 'PlayerScoutAuditReadPlanBlocked'
  error.code = 'PLAYER_SCOUT_AUDIT_READ_PLAN_BLOCKED'
  error.readPlan = plan

  throw error
}
