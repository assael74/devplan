// src/features/playersDatabase/domain/statsV2/approvedStatsState.builder.js

import { resolveLeagueSeasonStatus } from '../projections/teamPerformance.projection.js'
import {
  resolveStatsPlayerIdentityKey,
  STATS_RELOAD_DECISION,
} from './statsReloadDecision.builder.js'

export const APPROVED_STATS_STATE_VERSION = 1

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const requireValue = (value, code, message) => {
  const normalized = clean(value)

  if (normalized) return normalized

  const error = new Error(message)
  error.code = code
  throw error
}

const requireObject = (value, code, message) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value

  const error = new Error(message)
  error.code = code
  throw error
}

const requireExistingCanonical = ({ teamRoot, teamSeason, league } = {}) => {
  requireObject(teamRoot, 'STATS_TEAM_ROOT_NOT_FOUND', 'Canonical Team Root is required for Stats V2')
  requireObject(teamSeason, 'STATS_TEAM_SEASON_NOT_FOUND', 'Canonical Team Season is required for Stats V2')
  requireObject(league, 'STATS_LEAGUE_NOT_FOUND', 'Canonical League is required for Stats V2')

  requireValue(teamRoot.id, 'STATS_TEAM_ROOT_NOT_FOUND', 'Canonical Team Root identity is required for Stats V2')
  requireValue(teamSeason.id, 'STATS_TEAM_SEASON_NOT_FOUND', 'Canonical Team Season identity is required for Stats V2')
  requireValue(league.id, 'STATS_LEAGUE_NOT_FOUND', 'Canonical League identity is required for Stats V2')
}

const sameValue = (left, right) => JSON.stringify(left ?? null) === JSON.stringify(right ?? null)

const hasMeaningfulStats = stats => {
  if (!stats || typeof stats !== 'object' || Array.isArray(stats)) return false

  return Object.values(stats).some(value => {
    if (value === null || value === undefined || value === '') return false
    if (typeof value === 'number') return value !== 0
    if (typeof value === 'boolean') return value
    return true
  })
}

const validateReloadDecisionState = state => {
  const source = requireObject(
    state,
    'STATS_RELOAD_DECISIONS_INCOMPLETE',
    'Stats reload decision state is required before approval'
  )

  const missingPlayers = Array.isArray(source.missingPlayers) ? source.missingPlayers : []
  const resolved = Array.isArray(source.resolved) ? source.resolved : []
  const unresolved = Array.isArray(source.unresolved) ? source.unresolved : []
  const allowed = new Set(Object.values(STATS_RELOAD_DECISION))
  const missingKeys = missingPlayers.map(row => clean(row?.playerKey)).filter(Boolean)
  const resolvedKeys = resolved.map(row => clean(row?.playerKey)).filter(Boolean)
  const uniqueResolvedKeys = new Set(resolvedKeys)
  const invalid = resolved.find(row => (
    !clean(row?.playerKey) || !allowed.has(clean(row?.decision))
  ))
  const coverageInvalid = (
    source.isComplete !== true ||
    unresolved.length > 0 ||
    missingKeys.length !== resolvedKeys.length ||
    uniqueResolvedKeys.size !== resolvedKeys.length ||
    missingKeys.some(key => !uniqueResolvedKeys.has(key))
  )

  if (invalid || coverageInvalid) {
    const error = new Error('Stats reload decisions are incomplete')
    error.code = 'STATS_RELOAD_DECISIONS_INCOMPLETE'
    throw error
  }

  return resolved.map(row => ({
    playerKey: clean(row.playerKey),
    decision: clean(row.decision),
    previousPlayer: row.player || missingPlayers.find(entry => clean(entry?.playerKey) === clean(row.playerKey))?.player || null,
  }))
}

const validatePlayerDocumentPlans = plans => {
  const source = Array.isArray(plans) ? plans : []
  const allowed = new Set(['create', 'update', 'retain'])
  const seenIds = new Set()

  return source.map(plan => {
    const action = clean(plan?.action)
    const playerDocumentId = clean(plan?.playerDocumentId)

    if (!allowed.has(action)) {
      const error = new Error(`Unsupported Stats V2 Player Document action: ${action || 'missing'}`)
      error.code = action === 'delete'
        ? 'STATS_PLAYER_DOCUMENT_DELETE_FORBIDDEN'
        : 'STATS_PLAYER_DOCUMENT_ACTION_INVALID'
      throw error
    }

    if (!playerDocumentId || seenIds.has(playerDocumentId)) {
      const error = new Error('Player Document plan identity must be unique and complete')
      error.code = 'STATS_PLAYER_DOCUMENT_PLAN_IDENTITY_INVALID'
      throw error
    }
    seenIds.add(playerDocumentId)

    if (action !== 'retain') {
      requireObject(
        plan?.ownedPatch,
        'STATS_PLAYER_DOCUMENT_PATCH_REQUIRED',
        'Player Document owned patch is required before approval'
      )
    }

    return {
      action,
      playerDocumentId,
      ownedPatch: action === 'retain' ? null : plan.ownedPatch,
    }
  })
}

const validateCounterpartMovementPatches = patches => {
  const source = Array.isArray(patches) ? patches : []
  const seenTargets = new Set()

  return source.map(patch => {
    const birthTeamDocumentId = requireValue(
      patch?.birthTeamDocumentId,
      'STATS_COUNTERPART_IDENTITY_INVALID',
      'Counterpart Team identity is required before approval'
    )
    const seasonKey = requireValue(
      patch?.seasonKey,
      'STATS_COUNTERPART_IDENTITY_INVALID',
      'Counterpart season identity is required before approval'
    )
    const targetKey = `${birthTeamDocumentId}::${seasonKey}`

    if (seenTargets.has(targetKey)) {
      const error = new Error('Duplicate counterpart Movement target')
      error.code = 'STATS_COUNTERPART_DUPLICATE_TARGET'
      throw error
    }
    seenTargets.add(targetKey)

    return {
      birthTeamDocumentId,
      seasonKey,
      transfersIn: Array.isArray(patch?.transfersIn) ? patch.transfersIn : [],
      transfersOut: Array.isArray(patch?.transfersOut) ? patch.transfersOut : [],
      pendingPlayers: Array.isArray(patch?.pendingPlayers) ? patch.pendingPlayers : [],
    }
  })
}

const validateFinalTeamSeasonState = ({ teamSeason = {}, reloadDecisions = [], canonical = {}, identity = {} } = {}) => {
  const playerOwnedPatches = Array.isArray(teamSeason.playerOwnedPatches)
    ? teamSeason.playerOwnedPatches
    : []

  const seasonStatus = resolveLeagueSeasonStatus({
    league: canonical.league,
    season: { seasonKey: identity.seasonKey },
  })

  if (seasonStatus !== 'active' && seasonStatus !== 'completed') {
    const error = new Error('League season lifecycle could not be resolved')
    error.code = 'STATS_SEASON_STATUS_UNRESOLVED'
    throw error
  }

  if (clean(teamSeason.seasonStatus) !== seasonStatus) {
    const error = new Error('Final Team Season seasonStatus does not match canonical League')
    error.code = 'STATS_SEASON_STATUS_MISMATCH'
    throw error
  }
  if (!Number.isInteger(teamSeason.playersCount) || teamSeason.playersCount < 0) {
    const error = new Error('Final Team Season playersCount is required before Stats approval')
    error.code = 'STATS_PLAYERS_COUNT_MISSING'
    throw error
  }

  requireObject(teamSeason.teamBalance, 'STATS_TEAM_BALANCE_MISSING', 'Team Balance is required before Stats approval')
  requireObject(teamSeason.teamScout, 'STATS_TEAM_SCOUT_MISSING', 'Team Scout is required before Stats approval')
  requireObject(
    teamSeason.scoutProfilesSummary,
    'STATS_SCOUT_SUMMARY_MISSING',
    'Scout profiles summary is required before Stats approval'
  )
  requireObject(teamSeason.statsLoadState, 'STATS_LOAD_STATE_MISSING', 'Stats load state is required before Stats approval')
  requireObject(
    teamSeason.finalTeamSeasonPreview,
    'STATS_FINAL_TEAM_SEASON_MISSING',
    'Final Team Season state is required before Stats approval'
  )

  reloadDecisions
    .filter(row => row.decision === STATS_RELOAD_DECISION.REMOVE_STATS)
    .forEach(row => {
      const patch = playerOwnedPatches.find(candidate => clean(candidate?.playerKey) === row.playerKey)

      if (!patch || clean(patch.statsStatus) !== 'missing' || hasMeaningfulStats(patch.playerStats)) {
        const error = new Error(`removeStats is not reflected in final Team Season for ${row.playerKey}`)
        error.code = 'STATS_REMOVE_DECISION_NOT_APPLIED'
        throw error
      }

      if (Object.prototype.hasOwnProperty.call(patch, 'rosterStatus') ||
          Object.prototype.hasOwnProperty.call(patch, 'movement')) {
        const error = new Error(`removeStats cannot change roster or Movement for ${row.playerKey}`)
        error.code = 'STATS_REMOVE_DECISION_SCOPE_INVALID'
        throw error
      }
  })

  reloadDecisions
    .filter(row => row.decision === STATS_RELOAD_DECISION.PRESERVE_STATS)
    .forEach(row => {
      const previousPlayer = row.previousPlayer
      const previewPlayers = Array.isArray(teamSeason.finalTeamSeasonPreview?.teamPlayers)
        ? teamSeason.finalTeamSeasonPreview.teamPlayers
        : []
      const previewPlayer = previewPlayers.find(candidate => (
        resolveStatsPlayerIdentityKey(candidate) === row.playerKey
      ))

      if (!previousPlayer || !previewPlayer ||
          clean(previewPlayer.statsStatus) !== clean(previousPlayer.statsStatus) ||
          !sameValue(previewPlayer.playerStats, previousPlayer.playerStats)) {
        const error = new Error(`preserveStats is not reflected in final Team Season for ${row.playerKey}`)
        error.code = 'STATS_PRESERVE_DECISION_NOT_APPLIED'
        throw error
      }
    })

  return {
    seasonStatus,
    playersCount: teamSeason.playersCount,
    playerOwnedPatches,
    approvedNewParticipants: Array.isArray(teamSeason.approvedNewParticipants)
      ? teamSeason.approvedNewParticipants
      : [],
    localMovementPatch: teamSeason.localMovementPatch || null,
    teamBalance: teamSeason.teamBalance,
    teamScout: teamSeason.teamScout,
    scoutProfilesSummary: teamSeason.scoutProfilesSummary,
    statsLoadState: teamSeason.statsLoadState,
    finalTeamSeasonPreview: teamSeason.finalTeamSeasonPreview,
  }
}


const validatePlayerSearchIndexStates = states => {
  const source = Array.isArray(states) ? states : []
  const seen = new Set()

  return source.map(state => {
    const docId = requireValue(
      state?.docId,
      'STATS_PLAYER_INDEX_IDENTITY_INVALID',
      'Player SearchIndex identity is required before approval'
    )
    if (seen.has(docId)) {
      const error = new Error('Duplicate Player SearchIndex target')
      error.code = 'STATS_PLAYER_INDEX_DUPLICATE_TARGET'
      throw error
    }
    seen.add(docId)

    return {
      docId,
      fields: requireObject(
        state?.fields,
        'STATS_PLAYER_INDEX_PATCH_REQUIRED',
        'Player SearchIndex owned fields are required before approval'
      ),
    }
  })
}

const validateTeamSearchIndexPatch = patch => ({
  docId: requireValue(
    patch?.docId,
    'STATS_TEAM_INDEX_IDENTITY_INVALID',
    'Team SearchIndex identity is required before approval'
  ),
  fields: requireObject(
    patch?.fields,
    'STATS_TEAM_INDEX_PATCH_REQUIRED',
    'Team SearchIndex patch is required before approval'
  ),
})

const validateLeagueMetadataPatch = ({ patch, identity } = {}) => ({
  seasonKey: requireValue(
    patch?.seasonKey || identity?.seasonKey,
    'STATS_LEAGUE_PATCH_IDENTITY_INVALID',
    'League metadata season identity is required before approval'
  ),
  birthTeamDocumentId: requireValue(
    patch?.birthTeamDocumentId || identity?.birthTeamDocumentId,
    'STATS_LEAGUE_PATCH_IDENTITY_INVALID',
    'League metadata Team identity is required before approval'
  ),
  fields: requireObject(
    patch?.fields,
    'STATS_LEAGUE_PATCH_REQUIRED',
    'League metadata patch is required before approval'
  ),
})

const validateLeaguesMasterPatch = patch => {
  const source = requireObject(
    patch,
    'STATS_LEAGUES_MASTER_STATE_REQUIRED',
    'Leagues Master approved state is required before approval'
  )
  const id = requireValue(
    source.id,
    'STATS_LEAGUES_MASTER_IDENTITY_INVALID',
    'Leagues Master identity is required before approval'
  )
  if (!Array.isArray(source.leagues)) {
    const error = new Error('Leagues Master leagues are required before approval')
    error.code = 'STATS_LEAGUES_MASTER_STATE_REQUIRED'
    throw error
  }

  return {
    id,
    docType: clean(source.docType) || 'leagues_master',
    leagues: source.leagues,
    summary: requireObject(
      source.summary,
      'STATS_LEAGUES_MASTER_STATE_REQUIRED',
      'Leagues Master summary is required before approval'
    ),
  }
}



const STATS_CLUB_APPROVED_FIELDS = new Set(['ageGroups', 'competitionPaths'])
const STATS_CLUBS_MASTER_APPROVED_FIELDS = new Set([
  'name', 'clubLevel', 'ageGroups', 'competitionPaths', 'currentSeason', 'previousSeason',
])

const assertOwnedFields = ({ fields, allowed, code }) => {
  const source = requireObject(fields, code, 'Stats V2 approved patch fields are required')
  const invalid = Object.keys(source).find(key => !allowed.has(clean(key)))
  if (invalid) {
    const error = new Error(`Stats V2 approved patch contains field outside ownership: ${invalid}`)
    error.code = code
    throw error
  }
  return source
}

const validateClubProjectionPatches = patches => {
  const source = Array.isArray(patches) ? patches : []
  const seen = new Set()

  return source.map(patch => {
    const clubId = requireValue(
      patch?.clubId,
      'STATS_CLUB_PATCH_IDENTITY_INVALID',
      'Club projection identity is required before approval'
    )
    if (seen.has(clubId)) {
      const error = new Error('Duplicate Club projection target')
      error.code = 'STATS_CLUB_PATCH_DUPLICATE_TARGET'
      throw error
    }
    seen.add(clubId)

    return {
      clubId,
      fields: assertOwnedFields({
        fields: patch?.fields,
        allowed: STATS_CLUB_APPROVED_FIELDS,
        code: 'STATS_CLUB_PATCH_SCOPE_INVALID',
      }),
    }
  })
}

const validateClubsMasterPatch = patch => {
  const source = requireObject(
    patch,
    'STATS_CLUBS_MASTER_STATE_REQUIRED',
    'Clubs Master approved patch is required before approval'
  )
  const entries = Array.isArray(source.entries) ? source.entries : []
  const seen = new Set()

  entries.forEach(entry => {
    const clubId = requireValue(
      entry?.clubId,
      'STATS_CLUBS_MASTER_ENTRY_INVALID',
      'Clubs Master entry identity is required before approval'
    )
    if (seen.has(clubId)) {
      const error = new Error('Duplicate Clubs Master entry')
      error.code = 'STATS_CLUBS_MASTER_DUPLICATE_ENTRY'
      throw error
    }
    seen.add(clubId)
    assertOwnedFields({
      fields: entry?.fields,
      allowed: STATS_CLUBS_MASTER_APPROVED_FIELDS,
      code: 'STATS_CLUBS_MASTER_ENTRY_SCOPE_INVALID',
    })
  })

  return {
    id: clean(source.id) || 'all',
    entries: entries.map(entry => ({
      clubId: clean(entry.clubId),
      fields: entry.fields,
    })),
  }
}

export const buildApprovedStatsState = ({
  identity = {},
  approvedAt = '',
  canonical = {},
  reloadDecisionState = null,
  teamSeason = {},
  counterpartMovementPatches = [],
  playerDocumentPlans = [],
  playerSearchIndexStates = [],
  teamSearchIndexPatch = null,
  leagueMetadataPatch = null,
  leaguesMasterPatch = null,
  clubProjectionPatches = [],
  clubsMasterPatch = null,
} = {}) => {
  requireExistingCanonical(canonical)

  const birthTeamDocumentId = requireValue(identity.birthTeamDocumentId, 'STATS_TEAM_IDENTITY_MISSING', 'Missing Stats V2 Team identity')
  const seasonKey = requireValue(identity.seasonKey, 'STATS_SEASON_IDENTITY_MISSING', 'Missing Stats V2 season identity')
  const leagueId = requireValue(identity.leagueId, 'STATS_LEAGUE_IDENTITY_MISSING', 'Missing Stats V2 League identity')
  const effectiveApprovedAt = requireValue(approvedAt, 'STATS_APPROVED_AT_MISSING', 'Missing Stats V2 approval timestamp')
  const reloadDecisions = validateReloadDecisionState(reloadDecisionState)
  const finalTeamSeason = validateFinalTeamSeasonState({
    teamSeason,
    reloadDecisions,
    canonical,
    identity: { seasonKey },
  })

  return {
    planType: 'approvedStatsState',
    planVersion: APPROVED_STATS_STATE_VERSION,
    approvedAt: effectiveApprovedAt,
    identity: { birthTeamDocumentId, seasonKey, leagueId },
    reloadDecisions,
    teamSeason: finalTeamSeason,
    counterpartMovementPatches: validateCounterpartMovementPatches(counterpartMovementPatches),
    playerDocumentPlans: validatePlayerDocumentPlans(playerDocumentPlans),
    playerSearchIndexStates: validatePlayerSearchIndexStates(playerSearchIndexStates),
    teamSearchIndexPatch: validateTeamSearchIndexPatch(teamSearchIndexPatch),
    leagueMetadataPatch: validateLeagueMetadataPatch({
      patch: leagueMetadataPatch,
      identity: { birthTeamDocumentId, seasonKey },
    }),
    leaguesMasterPatch: validateLeaguesMasterPatch(leaguesMasterPatch),
    clubProjectionPatches: validateClubProjectionPatches(clubProjectionPatches),
    clubsMasterPatch: validateClubsMasterPatch(clubsMasterPatch),
  }
}
