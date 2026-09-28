// src/features/playersDatabase/domain/statsV2/statsAbsence.builder.js

import {
  SCOUTING_MODEL_VERSION,
  TEAM_LINE_CLASSIFICATION_VERSION,
} from '../../../../shared/scouting/scouting.version.js'
import { buildTeamBalanceState } from '../orchestration/buildTeamBalanceState.js'
import {
  buildBalanceInputFingerprint,
  buildTeamBalanceDocumentSnapshot,
} from '../rosterV2/support/teams/teamBalanceSnapshot.js'

const clone = value => JSON.parse(JSON.stringify(value))

export const STATS_ABSENT_PLAYER_STATS = Object.freeze({
  games: 0,
  goals: 0,
  yellowCards: 0,
  minutes: 0,
  starts: 0,
  substituteIn: 0,
  substitutedOut: 0,
  teamMinutes: 0,
  teamGames: 0,
  teamRank: null,
  teamGoalsFor: 0,
  teamGoalsAgainst: 0,
  minutesPerGame: 0,
  goalsPer90: 0,
})

export const STATS_ABSENT_LINE_CLASSIFICATION = Object.freeze({
  line: '',
  position: null,
  source: '',
  evidenceLevel: '',
  modelVersion: TEAM_LINE_CLASSIFICATION_VERSION,
})

export const STATS_ABSENT_SCOUT_PROFILES_SUMMARY = Object.freeze({
  total: 0,
  profileCounts: {},
})

export const STATS_ABSENT_LOAD_STATE = Object.freeze({
  status: 'missing',
})

export const STATS_OWNED_RICH_SCOUT_FIELDS = Object.freeze([
  'scoutSignals',
  'scoutCombinations',
  'scoutProfiles',
  'scoutCombinationIds',
  'scoutEvidence',
  'scoutCandidateSignals',
  'scoutProfileCaseStrength',
  'scoutOpportunity',
  'scoutProfileHierarchy',
  'scoutPlayerInterest',
  'scoutProfileProgression',
  'hierarchy',
  'opportunity',
  'interest',
  'progression',
  'combinations',
])

const omitFields = (source, fields) => {
  const omittedFields = new Set(fields)

  return Object.keys(source || {}).reduce((result, key) => {
    if (!omittedFields.has(key)) {
      result[key] = source[key]
    }

    return result
  }, {})
}

export const buildStatsAbsentPlayerState = (player = {}) => ({
  ...omitFields(player, STATS_OWNED_RICH_SCOUT_FIELDS),
  statsStatus: 'missing',
  playerStats: clone(STATS_ABSENT_PLAYER_STATS),
  lineClassification: clone(STATS_ABSENT_LINE_CLASSIFICATION),
  primaryScoutProfileId: '',
  primaryScoutProfileStrengthDepthPct: null,
  professionalScoutProfileIds: [],
  preliminaryScoutProfileIds: [],
  scoutEffectiveImmediacyStatus: '',
  scoutPlayerInterestLevel: '',
  scoutEngineVersion: SCOUTING_MODEL_VERSION,
})

// A cleared Balance represents absence, not a measurement of the current roster.
// Use a fixed empty input so roster edits cannot turn cleared Stats into present.
export const buildStatsAbsentTeamBalance = () => {
  const balanceSeason = {
    teamPlayers: [],
    teamStats: {
      teamGamePlayed: 0,
    },
  }
  const inputHash = buildBalanceInputFingerprint(balanceSeason)
  const calculatedBalanceState = buildTeamBalanceState({
    seasonDocument: balanceSeason,
  })
  const balanceState = {
    ...calculatedBalanceState,
    balanceAvailability: {
      ...(calculatedBalanceState.balanceAvailability || {}),
      availability: 'unavailable',
      availabilityReason: 'stats_not_loaded',
    },
    lineupBenchmark: {
      ...(calculatedBalanceState.lineupBenchmark || {}),
      availability: 'unavailable',
      availabilityReason: 'stats_not_loaded',
    },
    classificationCoverageBenchmark: {
      ...(calculatedBalanceState.classificationCoverageBenchmark || {}),
      availability: 'unavailable',
      availabilityReason: 'stats_not_loaded',
    },
    scoutInterpretation: {
      ...(calculatedBalanceState.scoutInterpretation || {}),
      availability: 'unavailable',
      availabilityReason: 'stats_not_loaded',
    },
  }

  return buildTeamBalanceDocumentSnapshot({
    balanceState,
    inputHash,
    updatedAt: null,
  })
}

export const buildStatsAbsentTeamSeasonState = (teamSeason = {}) => {
  const absentTeamSeason = {
    ...teamSeason,
    teamPlayers: (Array.isArray(teamSeason.teamPlayers) ? teamSeason.teamPlayers : [])
      .map(buildStatsAbsentPlayerState),
    scoutProfilesSummary: clone(STATS_ABSENT_SCOUT_PROFILES_SUMMARY),
    statsLoadState: clone(STATS_ABSENT_LOAD_STATE),
  }

  return {
    ...absentTeamSeason,
    teamBalance: buildStatsAbsentTeamBalance(),
  }
}
