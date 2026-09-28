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

      const setFields = patch?.setFields

      if (!patch || !setFields || typeof setFields !== 'object' || Array.isArray(setFields) ||
          clean(setFields.statsStatus) !== 'missing' || hasMeaningfulStats(setFields.playerStats)) {
        const error = new Error(`removeStats is not reflected in final Team Season for ${row.playerKey}`)
        error.code = 'STATS_REMOVE_DECISION_NOT_APPLIED'
        throw error
      }

      if (Object.prototype.hasOwnProperty.call(setFields, 'rosterStatus') ||
          Object.prototype.hasOwnProperty.call(setFields, 'movement')) {
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

    const action = clean(state?.action)
    if (!['create', 'update'].includes(action)) {
      const error = new Error(
        'Player SearchIndex action must be create or update before approval'
      )
      error.code = 'STATS_PLAYER_INDEX_ACTION_INVALID'
      throw error
    }

    return {
      docId,
      action,
      fields: requireObject(
        state?.fields,
        'STATS_PLAYER_INDEX_PATCH_REQUIRED',
        'Player SearchIndex owned fields are required before approval'
      ),
    }
  })
}

const validateTeamSearchIndexPatch = patch => ({
  action: (() => {
    const action = clean(patch?.action)
    if (['create', 'update'].includes(action)) return action
    const error = new Error('Team SearchIndex action is required before approval')
    error.code = 'STATS_TEAM_INDEX_ACTION_INVALID'
    throw error
  })(),
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



const STATS_LEAGUE_TEAM_ROW_OWNED_FIELDS = new Set([
  'playersCount',
  'hasPlayers',
  'hasStats',
  'statsComplete',
  'scoutProfilesSummary',
  'teamTaskSignals',
])

const withoutOwnedLeagueTeamFields = row => Object.fromEntries(
  Object.entries(row || {}).filter(([key]) => !STATS_LEAGUE_TEAM_ROW_OWNED_FIELDS.has(key))
)

const assertAtomicTeamTablePreserved = ({ approvedRows, canonicalRows, identity } = {}) => {
  if (!Array.isArray(approvedRows) || !Array.isArray(canonicalRows) || approvedRows.length !== canonicalRows.length) {
    const error = new Error('Approved League tableRank must preserve the complete canonical array')
    error.code = 'STATS_LEAGUE_PATCH_ATOMIC_ARRAY_INVALID'
    throw error
  }

  const teamId = clean(identity?.birthTeamDocumentId)
  const rowIdentity = row => [row?.teamId, row?.birthTeamId, row?.birthTeamDocumentId, row?.teamDocumentId]
    .map(clean)
    .find(Boolean) || ''

  for (let index = 0; index < canonicalRows.length; index += 1) {
    const canonicalRow = canonicalRows[index]
    const approvedRow = approvedRows[index]
    const canonicalIdentity = rowIdentity(canonicalRow)
    const approvedIdentity = rowIdentity(approvedRow)

    if (canonicalIdentity !== approvedIdentity) {
      const error = new Error('Approved League tableRank changed canonical row identity or order')
      error.code = 'STATS_LEAGUE_PATCH_ATOMIC_ARRAY_INVALID'
      throw error
    }

    const isApprovedTeam = [canonicalRow?.teamId, canonicalRow?.birthTeamId, canonicalRow?.birthTeamDocumentId, canonicalRow?.teamDocumentId]
      .map(clean)
      .includes(teamId)
    const left = isApprovedTeam ? withoutOwnedLeagueTeamFields(approvedRow) : approvedRow
    const right = isApprovedTeam ? withoutOwnedLeagueTeamFields(canonicalRow) : canonicalRow

    if (!sameValue(left, right)) {
      const error = new Error('Approved League tableRank changed data outside Stats ownership')
      error.code = 'STATS_LEAGUE_PATCH_ATOMIC_ARRAY_INVALID'
      throw error
    }
  }
}

const validateLeaguePatch = ({ patch, identity, canonical } = {}) => {
  const source = requireObject(
    patch,
    'STATS_LEAGUE_PATCH_REQUIRED',
    'League write payload is required before approval'
  )
  const leagueId = requireValue(
    source.leagueId,
    'STATS_LEAGUE_PATCH_IDENTITY_INVALID',
    'League write payload identity is required before approval'
  )
  const seasonKey = requireValue(
    source.seasonKey,
    'STATS_LEAGUE_PATCH_IDENTITY_INVALID',
    'League write payload season identity is required before approval'
  )
  const target = requireValue(
    source.target,
    'STATS_LEAGUE_PATCH_TARGET_INVALID',
    'League write payload target is required before approval'
  )

  if (leagueId !== clean(identity?.leagueId) || seasonKey !== clean(identity?.seasonKey)) {
    const error = new Error('League write payload identity does not match Approved Stats identity')
    error.code = 'STATS_LEAGUE_PATCH_IDENTITY_INVALID'
    throw error
  }

  const league = requireObject(
    canonical?.league,
    'STATS_LEAGUE_NOT_FOUND',
    'Canonical League is required for League write validation'
  )
  const canonicalTarget = clean(league?.current?.seasonKey) === seasonKey
    ? 'current'
    : (Array.isArray(league?.history) && league.history.some(row => clean(row?.seasonKey) === seasonKey)
      ? 'history'
      : '')

  if (!canonicalTarget || target !== canonicalTarget) {
    const error = new Error('League write payload target does not match canonical season status')
    error.code = 'STATS_LEAGUE_PATCH_TARGET_INVALID'
    throw error
  }

  const matchesTeam = row => [
    row?.teamId,
    row?.birthTeamId,
    row?.birthTeamDocumentId,
    row?.teamDocumentId,
  ].map(clean).includes(clean(identity?.birthTeamDocumentId))

  if (target === 'current') {
    if (!Array.isArray(source.tableRank) || !source.tableRank.some(matchesTeam)) {
      const error = new Error('Approved current League tableRank must include the approved Team row')
      error.code = 'STATS_LEAGUE_PATCH_TEAM_ROW_MISSING'
      throw error
    }
    assertAtomicTeamTablePreserved({
      approvedRows: source.tableRank,
      canonicalRows: Array.isArray(league?.current?.tableRank) ? league.current.tableRank : [],
      identity,
    })
    return { leagueId, seasonKey, target, tableRank: source.tableRank }
  }

  if (!Array.isArray(source.history)) {
    const error = new Error('Approved historical League payload must include history')
    error.code = 'STATS_LEAGUE_PATCH_REQUIRED'
    throw error
  }
  const approvedSeason = source.history.find(row => clean(row?.seasonKey) === seasonKey)
  if (!approvedSeason) {
    const error = new Error('Approved League history must include the approved season')
    error.code = 'STATS_LEAGUE_PATCH_SEASON_MISSING'
    throw error
  }
  if (!Array.isArray(approvedSeason.tableRank) || !approvedSeason.tableRank.some(matchesTeam)) {
    const error = new Error('Approved historical League tableRank must include the approved Team row')
    error.code = 'STATS_LEAGUE_PATCH_TEAM_ROW_MISSING'
    throw error
  }

  if (!Array.isArray(league.history) || source.history.length !== league.history.length) {
    const error = new Error('Approved League history must preserve the complete canonical array')
    error.code = 'STATS_LEAGUE_PATCH_ATOMIC_ARRAY_INVALID'
    throw error
  }
  source.history.forEach((approvedRow, index) => {
    const canonicalRow = league.history[index]
    if (clean(approvedRow?.seasonKey) !== clean(canonicalRow?.seasonKey)) {
      const error = new Error('Approved League history changed canonical season identity or order')
      error.code = 'STATS_LEAGUE_PATCH_ATOMIC_ARRAY_INVALID'
      throw error
    }
    if (clean(approvedRow?.seasonKey) !== seasonKey) {
      if (!sameValue(approvedRow, canonicalRow)) {
        const error = new Error('Approved League history changed a season outside Stats ownership')
        error.code = 'STATS_LEAGUE_PATCH_ATOMIC_ARRAY_INVALID'
        throw error
      }
      return
    }
    const { tableRank: approvedTableRank, ...approvedRest } = approvedRow || {}
    const { tableRank: canonicalTableRank, ...canonicalRest } = canonicalRow || {}
    if (!sameValue(approvedRest, canonicalRest)) {
      const error = new Error('Approved League history changed season fields outside Stats ownership')
      error.code = 'STATS_LEAGUE_PATCH_ATOMIC_ARRAY_INVALID'
      throw error
    }
    assertAtomicTeamTablePreserved({
      approvedRows: approvedTableRank,
      canonicalRows: canonicalTableRank,
      identity,
    })
  })

  return { leagueId, seasonKey, target, history: source.history }
}

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
const STATS_CLUBS_MASTER_APPROVED_FIELDS = new Set(['ageGroups', 'competitionPaths'])

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

const clubSeasonIdentity = ({ ageGroupId = '', season = {} } = {}) => [
  clean(ageGroupId || season?.ageGroupId),
  clean(season?.seasonKey || season?.seasonId),
  clean(season?.teamId),
].join('::')

const assertUniqueRequiredIdentities = ({ items = [], getIdentity, code, label }) => {
  const seen = new Set()

  for (const item of items) {
    const identity = clean(getIdentity(item))
    if (!identity || seen.has(identity)) {
      const error = new Error(`${label} identity must be present and unique`)
      error.code = code
      throw error
    }
    seen.add(identity)
  }
}

const assertUniqueClubAtomicIdentities = ({ ageGroups = [], competitionPaths = [] } = {}) => {
  assertUniqueRequiredIdentities({
    items: ageGroups,
    getIdentity: group => group?.ageGroupId,
    code: 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID',
    label: 'Club age group',
  })

  for (const group of ageGroups) {
    assertUniqueRequiredIdentities({
      items: Array.isArray(group?.seasons) ? group.seasons : [],
      getIdentity: season => {
        const ageGroupId = clean(group?.ageGroupId || season?.ageGroupId)
        const seasonKey = clean(season?.seasonKey || season?.seasonId)
        const teamId = clean(season?.teamId)
        return ageGroupId && seasonKey && teamId
          ? clubSeasonIdentity({ ageGroupId, season })
          : ''
      },
      code: 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID',
      label: 'Club age-group season',
    })
  }

  assertUniqueRequiredIdentities({
    items: competitionPaths,
    getIdentity: path => Number(path?.birthYear) > 0 ? path.birthYear : '',
    code: 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID',
    label: 'Club competition path',
  })

  for (const path of competitionPaths) {
    assertUniqueRequiredIdentities({
      items: Array.isArray(path?.seasons) ? path.seasons : [],
      getIdentity: season => {
        const ageGroupId = clean(season?.ageGroupId)
        const seasonKey = clean(season?.seasonKey || season?.seasonId)
        const teamId = clean(season?.teamId)
        return ageGroupId && seasonKey && teamId
          ? clubSeasonIdentity({ ageGroupId, season })
          : ''
      },
      code: 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID',
      label: 'Club competition-path season',
    })
  }
}

const withoutKey = (value, key) => Object.fromEntries(
  Object.entries(value || {}).filter(([field]) => field !== key)
)

const assertClubAtomicArraysPreserved = patch => {
  const baseline = patch?.baselineFields && typeof patch.baselineFields === 'object'
    ? patch.baselineFields
    : {}
  const fields = patch?.fields && typeof patch.fields === 'object' ? patch.fields : {}
  const touched = new Set((Array.isArray(patch?.touchedTargets) ? patch.touchedTargets : []).map(target => (
    [clean(target?.ageGroupId), clean(target?.seasonKey), clean(target?.teamId)].join('::')
  )))

  assertUniqueClubAtomicIdentities({
    ageGroups: Array.isArray(baseline.ageGroups) ? baseline.ageGroups : [],
    competitionPaths: Array.isArray(baseline.competitionPaths) ? baseline.competitionPaths : [],
  })
  assertUniqueClubAtomicIdentities({
    ageGroups: Array.isArray(fields.ageGroups) ? fields.ageGroups : [],
    competitionPaths: Array.isArray(fields.competitionPaths) ? fields.competitionPaths : [],
  })

  const baselineAgeGroups = new Map((Array.isArray(baseline.ageGroups) ? baseline.ageGroups : []).map(group => [clean(group?.ageGroupId), group]))
  const approvedAgeGroups = new Map((Array.isArray(fields.ageGroups) ? fields.ageGroups : []).map(group => [clean(group?.ageGroupId), group]))

  for (const [ageGroupId, baselineGroup] of baselineAgeGroups) {
    const approvedGroup = approvedAgeGroups.get(ageGroupId)
    if (!approvedGroup) {
      const error = new Error('Approved Club ageGroups removed a canonical age group')
      error.code = 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID'
      throw error
    }
    if (!sameValue(withoutKey(approvedGroup, 'seasons'), withoutKey(baselineGroup, 'seasons'))) {
      const error = new Error('Approved Club changed age-group metadata outside Stats ownership')
      error.code = 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID'
      throw error
    }

    const baselineSeasons = new Map((Array.isArray(baselineGroup?.seasons) ? baselineGroup.seasons : []).map(season => [
      clubSeasonIdentity({ ageGroupId, season }), season,
    ]))
    const approvedSeasons = new Map((Array.isArray(approvedGroup?.seasons) ? approvedGroup.seasons : []).map(season => [
      clubSeasonIdentity({ ageGroupId, season }), season,
    ]))

    for (const [key, baselineSeason] of baselineSeasons) {
      if (touched.has(key)) continue
      if (!approvedSeasons.has(key) || !sameValue(approvedSeasons.get(key), baselineSeason)) {
        const error = new Error('Approved Club ageGroups changed data outside the Stats target')
        error.code = 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID'
        throw error
      }
    }
    for (const [key, approvedSeason] of approvedSeasons) {
      const baselineSeason = baselineSeasons.get(key)
      if ((!baselineSeason || !sameValue(approvedSeason, baselineSeason)) && !touched.has(key)) {
        const error = new Error('Approved Club ageGroups added or changed a season outside the Stats target')
        error.code = 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID'
        throw error
      }
    }
  }

  for (const [ageGroupId, approvedGroup] of approvedAgeGroups) {
    if (baselineAgeGroups.has(ageGroupId)) continue
    const seasons = Array.isArray(approvedGroup?.seasons) ? approvedGroup.seasons : []
    if (!seasons.length || seasons.some(season => !touched.has(clubSeasonIdentity({ ageGroupId, season })))) {
      const error = new Error('Approved Club added an age group outside the Stats target')
      error.code = 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID'
      throw error
    }
  }

  const baselinePaths = new Map((Array.isArray(baseline.competitionPaths) ? baseline.competitionPaths : []).map(path => [String(path?.birthYear || ''), path]))
  const approvedPaths = new Map((Array.isArray(fields.competitionPaths) ? fields.competitionPaths : []).map(path => [String(path?.birthYear || ''), path]))

  for (const [birthYear, baselinePath] of baselinePaths) {
    const approvedPath = approvedPaths.get(birthYear)
    if (!approvedPath) {
      const error = new Error('Approved Club competitionPaths removed a canonical path')
      error.code = 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID'
      throw error
    }
    const baselineSeasons = new Map((Array.isArray(baselinePath?.seasons) ? baselinePath.seasons : []).map(season => [
      clubSeasonIdentity({ ageGroupId: season?.ageGroupId, season }), season,
    ]))
    const approvedSeasons = new Map((Array.isArray(approvedPath?.seasons) ? approvedPath.seasons : []).map(season => [
      clubSeasonIdentity({ ageGroupId: season?.ageGroupId, season }), season,
    ]))
    const pathTouchesTarget = [...approvedSeasons.keys(), ...baselineSeasons.keys()].some(key => touched.has(key))

    const baselineMetadata = withoutKey(withoutKey(baselinePath, 'seasons'), 'nextCompetitionPath')
    const approvedMetadata = withoutKey(withoutKey(approvedPath, 'seasons'), 'nextCompetitionPath')
    if (!sameValue(approvedMetadata, baselineMetadata)) {
      const error = new Error('Approved Club changed competition-path metadata outside Stats ownership')
      error.code = 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID'
      throw error
    }
    if (!pathTouchesTarget && !sameValue(approvedPath?.nextCompetitionPath, baselinePath?.nextCompetitionPath)) {
      const error = new Error('Approved Club changed nextCompetitionPath outside the Stats target')
      error.code = 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID'
      throw error
    }
    for (const [key, baselineSeason] of baselineSeasons) {
      if (touched.has(key)) continue
      if (!approvedSeasons.has(key) || !sameValue(approvedSeasons.get(key), baselineSeason)) {
        const error = new Error('Approved Club competitionPaths changed data outside the Stats target')
        error.code = 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID'
        throw error
      }
    }
    for (const [key, approvedSeason] of approvedSeasons) {
      const baselineSeason = baselineSeasons.get(key)
      if ((!baselineSeason || !sameValue(approvedSeason, baselineSeason)) && !touched.has(key)) {
        const error = new Error('Approved Club competitionPaths added or changed a season outside the Stats target')
        error.code = 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID'
        throw error
      }
    }
  }

  for (const [birthYear, approvedPath] of approvedPaths) {
    if (baselinePaths.has(birthYear)) continue
    const seasons = Array.isArray(approvedPath?.seasons) ? approvedPath.seasons : []
    if (!seasons.length || seasons.some(season => !touched.has(clubSeasonIdentity({ ageGroupId: season?.ageGroupId, season })))) {
      const error = new Error('Approved Club added a competition path outside the Stats target')
      error.code = 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID'
      throw error
    }
  }
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
    assertClubAtomicArraysPreserved(patch)

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

const withoutOwnedMasterEntryFields = entry => Object.fromEntries(
  Object.entries(entry || {}).filter(([key]) => !STATS_CLUBS_MASTER_APPROVED_FIELDS.has(key))
)

const CLUBS_MASTER_ENTRY_FIELDS = new Set([
  'clubId',
  'externalClubId',
  'clubUrl',
  'name',
  'shortName',
  'clubLevel',
  'clubStrengthLevel',
  'ageGroups',
  'competitionPaths',
  'updatedAt',
])

const assertCompleteClubsMasterEntry = entry => {
  const source = entry && typeof entry === 'object' && !Array.isArray(entry) ? entry : {}
  const keys = Object.keys(source)
  const missing = [...CLUBS_MASTER_ENTRY_FIELDS].find(key => !Object.prototype.hasOwnProperty.call(source, key))
  const invalid = keys.find(key => !CLUBS_MASTER_ENTRY_FIELDS.has(key))

  if (missing || invalid || !clean(source.clubId)) {
    const error = new Error('New Clubs Master entry must match the Catalog contract')
    error.code = 'STATS_CLUBS_MASTER_CREATE_INVALID'
    throw error
  }
}

const validateClubsMasterPatch = ({ patch, clubProjectionPatches = [] } = {}) => {
  const source = requireObject(
    patch,
    'STATS_CLUBS_MASTER_STATE_REQUIRED',
    'Clubs Master approved patch is required before approval'
  )
  const baseline = Array.isArray(source.baselineClubs) ? source.baselineClubs : []
  const clubs = Array.isArray(source.clubs) ? source.clubs : []
  const touched = new Set((Array.isArray(source.touchedClubIds) ? source.touchedClubIds : []).map(clean).filter(Boolean))
  const approvedById = new Map(clubs.map(entry => [clean(entry?.clubId), entry]))

  if (approvedById.size !== clubs.length) {
    const error = new Error('Duplicate Clubs Master entry')
    error.code = 'STATS_CLUBS_MASTER_DUPLICATE_ENTRY'
    throw error
  }

  const baselineIds = new Set(baseline.map(entry => clean(entry?.clubId)).filter(Boolean))
  const projectedClubIds = new Set((Array.isArray(clubProjectionPatches) ? clubProjectionPatches : [])
    .map(item => clean(item?.clubId))
    .filter(Boolean))

  if (touched.size !== projectedClubIds.size || [...touched].some(clubId => !projectedClubIds.has(clubId))) {
    const error = new Error('Clubs Master touched Clubs must exactly match Club projection patches')
    error.code = 'STATS_CLUBS_MASTER_TARGETS_MISMATCH'
    throw error
  }

  for (const approvedEntry of clubs) {
    const clubId = clean(approvedEntry?.clubId)
    if (!baselineIds.has(clubId)) assertCompleteClubsMasterEntry(approvedEntry)
    if (!baselineIds.has(clubId) && (!touched.has(clubId) || !projectedClubIds.has(clubId))) {
      const error = new Error('Approved Clubs Master added a Club outside the Stats targets')
      error.code = 'STATS_CLUBS_MASTER_ATOMIC_ARRAY_INVALID'
      throw error
    }
  }

  for (const baselineEntry of baseline) {
    const clubId = clean(baselineEntry?.clubId)
    const approvedEntry = approvedById.get(clubId)
    if (!clubId || !approvedEntry) {
      const error = new Error('Approved Clubs Master removed a canonical Club entry')
      error.code = 'STATS_CLUBS_MASTER_ATOMIC_ARRAY_INVALID'
      throw error
    }
    const left = touched.has(clubId) ? withoutOwnedMasterEntryFields(approvedEntry) : approvedEntry
    const right = touched.has(clubId) ? withoutOwnedMasterEntryFields(baselineEntry) : baselineEntry
    if (!sameValue(left, right)) {
      const error = new Error('Approved Clubs Master changed data outside Stats ownership')
      error.code = 'STATS_CLUBS_MASTER_ATOMIC_ARRAY_INVALID'
      throw error
    }
  }

  return {
    id: clean(source.id) || 'all',
    clubs,
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
  leaguePatch = null,
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

  const validatedClubProjectionPatches = validateClubProjectionPatches(clubProjectionPatches)

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
    leaguePatch: validateLeaguePatch({
      patch: leaguePatch,
      identity: { birthTeamDocumentId, seasonKey, leagueId },
      canonical,
    }),
    leaguesMasterPatch: validateLeaguesMasterPatch(leaguesMasterPatch),
    clubProjectionPatches: validatedClubProjectionPatches,
    clubsMasterPatch: validateClubsMasterPatch({
      patch: clubsMasterPatch,
      clubProjectionPatches: validatedClubProjectionPatches,
    }),
  }
}
