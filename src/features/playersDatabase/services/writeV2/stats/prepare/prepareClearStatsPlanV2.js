// src/features/playersDatabase/services/writeV2/stats/prepare/prepareClearStatsPlanV2.js

import {
  STATS_OWNED_RICH_SCOUT_FIELDS,
  buildClearStatsProjectionPlanV2,
  buildStatsAbsentTeamSeasonState,
  getTeamSeasonStatsState,
  resolveStatsPlayerIdentityKey,
} from '../../../../domain/statsV2/index.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const clone = value => JSON.parse(JSON.stringify(value))

const hasScoutProfile = player => (
  clean(player?.primaryScoutProfileId) ||
  [
    player?.professionalScoutProfileIds,
    player?.preliminaryScoutProfileIds,
    player?.scoutProfiles,
    player?.scoutSignals,
  ].some(value => Array.isArray(value) && value.length > 0)
)

const buildIdentity = ({
  teamRoot,
  teamSeason,
  birthTeamDocumentId,
  seasonKey,
  leagueId,
}) => ({
  birthTeamDocumentId: clean(
    birthTeamDocumentId || teamRoot?.id || teamSeason?.birthTeamDocumentId
  ),
  seasonKey: clean(seasonKey || teamSeason?.seasonKey),
  leagueId: clean(leagueId || teamSeason?.leagueId),
  clubId: clean(
    teamRoot?.clubId ||
    teamSeason?.clubId ||
    teamSeason?.scoutIdentityContext?.clubId
  ),
})

const throwIdentityRequired = field => {
  const error = new Error(`CLEAR_STATS identity requires ${field}`)
  error.code = 'CLEAR_STATS_IDENTITY_REQUIRED'
  throw error
}

const throwIdentityMismatch = field => {
  const error = new Error(`CLEAR_STATS identity mismatch for ${field}`)
  error.code = 'CLEAR_STATS_IDENTITY_MISMATCH'
  throw error
}

const assertIdentityValueMatches = ({
  field,
  identityValue,
  canonicalValues,
}) => {
  canonicalValues
    .map(clean)
    .filter(Boolean)
    .forEach(canonicalValue => {
      if (canonicalValue !== identityValue) {
        throwIdentityMismatch(field)
      }
    })
}

const assertClearStatsIdentity = ({
  identity,
  teamRoot,
  teamSeason,
  league,
}) => {
  if (!identity.birthTeamDocumentId) {
    throwIdentityRequired('birthTeamDocumentId')
  }

  if (!identity.seasonKey) {
    throwIdentityRequired('seasonKey')
  }

  if (!identity.leagueId) {
    throwIdentityRequired('leagueId')
  }

  assertIdentityValueMatches({
    field: 'birthTeamDocumentId',
    identityValue: identity.birthTeamDocumentId,
    canonicalValues: [
      teamRoot?.id,
      teamSeason?.birthTeamDocumentId,
    ],
  })

  assertIdentityValueMatches({
    field: 'seasonKey',
    identityValue: identity.seasonKey,
    canonicalValues: [teamSeason?.seasonKey],
  })

  assertIdentityValueMatches({
    field: 'leagueId',
    identityValue: identity.leagueId,
    canonicalValues: [
      teamSeason?.leagueId,
      league?.id,
      league?.leagueId,
    ],
  })

  if (identity.clubId) {
    assertIdentityValueMatches({
      field: 'clubId',
      identityValue: identity.clubId,
      canonicalValues: [
        teamRoot?.clubId,
        teamSeason?.clubId,
        teamSeason?.scoutIdentityContext?.clubId,
      ],
    })
  }
}

const buildPlayerOwnedPatches = ({
  currentPlayers,
  finalPlayers,
}) => finalPlayers.map((player, index) => {
  const currentPlayer = currentPlayers[index] || {}
  const playerKey = resolveStatsPlayerIdentityKey(player)

  if (!playerKey) {
    const error = new Error('CLEAR_STATS requires resolved player identity')
    error.code = 'CLEAR_STATS_PLAYER_IDENTITY_REQUIRED'
    throw error
  }

  return {
    playerKey,
    setFields: {
      statsStatus: player.statsStatus,
      playerStats: clone(player.playerStats),
      lineClassification: clone(player.lineClassification),
      primaryScoutProfileId: player.primaryScoutProfileId,
      primaryScoutProfileStrengthDepthPct: player.primaryScoutProfileStrengthDepthPct,
      professionalScoutProfileIds: clone(player.professionalScoutProfileIds),
      preliminaryScoutProfileIds: clone(player.preliminaryScoutProfileIds),
      scoutEffectiveImmediacyStatus: player.scoutEffectiveImmediacyStatus,
      scoutPlayerInterestLevel: player.scoutPlayerInterestLevel,
      scoutEngineVersion: player.scoutEngineVersion,
    },
    unsetFields: STATS_OWNED_RICH_SCOUT_FIELDS.filter(field => (
      Object.prototype.hasOwnProperty.call(currentPlayer, field)
    )),
  }
})

const buildCanonicalMutation = ({
  teamSeason,
  finalTeamSeasonPreview,
}) => ({
  playerOwnedPatches: buildPlayerOwnedPatches({
    currentPlayers: Array.isArray(teamSeason.teamPlayers)
      ? teamSeason.teamPlayers
      : [],
    finalPlayers: finalTeamSeasonPreview.teamPlayers,
  }),
  teamOwnedSetFields: {
    scoutProfilesSummary: clone(finalTeamSeasonPreview.scoutProfilesSummary),
    statsLoadState: clone(finalTeamSeasonPreview.statsLoadState),
    teamBalance: clone(finalTeamSeasonPreview.teamBalance),
  },
})

const buildImpact = ({ canonicalMutation, currentPlayers }) => ({
  playersAffected: canonicalMutation.playerOwnedPatches.length,
  scoutProfilePlayersAffected: (Array.isArray(currentPlayers) ? currentPlayers : [])
    .filter(hasScoutProfile)
    .length,
  scoutingFieldsRemoved: canonicalMutation.playerOwnedPatches.reduce(
    (total, patch) => total + patch.unsetFields.length,
    0
  ),
})

export const prepareClearStatsPlanV2 = ({
  teamRoot,
  teamSeason,
  league,
  birthTeamDocumentId,
  seasonKey,
  leagueId,
  projectionSources = {},
} = {}) => {
  if (!teamRoot) {
    const error = new Error('Canonical Team Root is required for CLEAR_STATS')
    error.code = 'CLEAR_STATS_TEAM_ROOT_NOT_FOUND'
    throw error
  }

  if (!teamSeason) {
    const error = new Error('Canonical Team Season is required for CLEAR_STATS')
    error.code = 'CLEAR_STATS_TEAM_SEASON_NOT_FOUND'
    throw error
  }

  const identity = buildIdentity({
    teamRoot,
    teamSeason,
    birthTeamDocumentId,
    seasonKey,
    leagueId: leagueId || league?.id || league?.leagueId,
  })

  assertClearStatsIdentity({
    identity,
    teamRoot,
    teamSeason,
    league,
  })

  const currentStatsState = getTeamSeasonStatsState(teamSeason)

  if (currentStatsState === 'absent') {
    const finalTeamSeasonPreview = clone(teamSeason)
    const projectionPlan = buildClearStatsProjectionPlanV2({
      identity,
      finalTeamSeasonPreview,
      projectionSources,
    })

    return {
      planType: 'clearStatsProposedPlan',
      planVersion: 1,
      flowType: 'stats',
      operationType: 'clear',
      label: 'CLEAR_STATS',
      identity,
      currentStatsState,
      isIdempotent: true,
      canonicalMutation: null,
      finalTeamSeasonPreview,
      projectionPlan,
      impact: {
        playersAffected: 0,
        scoutProfilePlayersAffected: 0,
        scoutingFieldsRemoved: 0,
      },
    }
  }

  const finalTeamSeasonPreview = buildStatsAbsentTeamSeasonState(teamSeason)
  const canonicalMutation = buildCanonicalMutation({
    teamSeason,
    finalTeamSeasonPreview,
  })
  const projectionPlan = buildClearStatsProjectionPlanV2({
    identity,
    finalTeamSeasonPreview,
    projectionSources,
  })

  return {
    planType: 'clearStatsProposedPlan',
    planVersion: 1,
    flowType: 'stats',
    operationType: 'clear',
    label: 'CLEAR_STATS',
    identity,
    currentStatsState,
    isIdempotent: false,
    canonicalMutation,
    finalTeamSeasonPreview,
    projectionPlan,
    impact: buildImpact({
      canonicalMutation,
      currentPlayers: teamSeason.teamPlayers,
    }),
  }
}
