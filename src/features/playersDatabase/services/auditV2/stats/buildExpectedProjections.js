// src/features/playersDatabase/services/auditV2/stats/buildExpectedProjections.js

import { buildPlayerDocumentId } from '../../../model/player/playerIdentity.model.js'
import { buildPlayerStatsSnapshot } from '../../../model/player/playerStatsSnapshot.model.js'
import { buildTeamSeasonDocumentId } from '../../../model/team/teamIdentity.model.js'
import { buildPlayerSeasonIndexDoc } from '../../../domain/rosterV2/support/searchIndex/player/playerSeasonIndex.model.js'
import { buildTeamBalanceSearchIndexProjection } from '../../../domain/projections/teamBalanceSearchIndex.projection.js'
import { buildTeamSeasonSearchIndexId } from '../../../domain/projections/teamSeasonSearchIndex.projection.js'
import {
  resolveLeagueSeasonStatus,
} from '../../../domain/projections/teamPerformance.projection.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const PLAYER_STATS_AUDIT_FIELDS = [
  'playerDocumentId',
  'primaryPosition',
  'positionLayer',
  'lineClassificationLine',
  'lineClassificationPosition',
  'lineClassificationSource',
  'lineClassificationEvidenceLevel',
  'lineClassificationModelVersion',
  'numShirt',
  'statsStatus',
  'teamTableRank',
  'teamTableAttackRank',
  'teamTableDefenseRank',
  'teamGoalsFor',
  'teamGoalsAgainst',
  'teamGoalsForPerGame',
  'teamGamePlayed',
  'games',
  'goals',
  'yellowCards',
  'minutes',
  'starts',
  'substituteIn',
  'substitutedOut',
  'teamMinutes',
  'teamGames',
  'minutesPerGame',
  'goalsPer90',
  'goalsPerGameDuration',
  'gameMinutes',
  'seasonStatus',
  'normalizationStatus',
  'normalizationVersion',
  'remainingTeamGames',
  'teamMinutesPlayed',
  'minutesShareRate',
  'projectedRemainingMinutes',
  'projectedMinutesRaw',
  'projectedMinutes',
  'projectedGoalsRaw',
  'projectedGoals',
  'projectedGamesRaw',
  'projectedGames',
  'projectedStartsRaw',
  'projectedStarts',
  'primaryScoutProfileId',
  'primaryScoutProfileStrengthDepthPct',
  'primaryScoutWarnings',
  'primaryScoutScore',
  'primaryScoutTeamGateMode',
  'nearScoutProfileId',
  'nearScoutProfileDistancePct',
  'nearScoutProfileTrend',
  'scoutEffectiveImmediacyStatus',
  'scoutPlayerInterestLevel',
  'scoutEngineVersion',
  'secondaryScoutProfileId',
  'secondaryScoutProfileStrengthDepthPct',
  'secondaryScoutWarnings',
  'secondaryScoutScore',
  'scoutProfileIds',
  'scoutPreliminaryProfileIds',
  'scoutCombinationIds',
  'scoutProfileSearchIds',
  'sourceCollection',
  'sourceDocumentId',
  'sourceTarget',
]

const pick = (value = {}, keys = []) => Object.fromEntries(
  keys
    .filter(key => value[key] !== undefined)
    .map(key => [key, value[key]])
)

const resolveExpectedPlayerDocumentId = (
  player,
  existingPlayerDocumentIds
) => {
  const candidateId = clean(
    player?.playerDocumentId || buildPlayerDocumentId(player)
  )
  if (!candidateId) return ''

  const exists = existingPlayerDocumentIds.has(candidateId)
  const requiredByScouting = (
    Array.isArray(player?.scoutProfiles) && player.scoutProfiles.length > 0
  )

  return exists || requiredByScouting ? candidateId : ''
}

const buildExpectedPlayerIndexes = ({
  canonical,
  season,
  team,
  existingPlayerDocumentIds,
}) => (
  (Array.isArray(canonical.teamSeason?.teamPlayers)
    ? canonical.teamSeason.teamPlayers
    : []).map(player => {
    const projected = buildPlayerSeasonIndexDoc({
      league: canonical.league,
      season,
      team,
      target: season.seasonStatus === 'completed' ? 'history' : 'current',
      player: {
        ...player,
        ...(player?.playerStats || {}),
        playerDocumentId: resolveExpectedPlayerDocumentId(
          player,
          existingPlayerDocumentIds
        ),
      },
    })
    const currentSnapshot = buildPlayerStatsSnapshot({
      source: projected,
      capturedAt: '',
    })
    const { capturedAt, ...currentSnapshotFields } = currentSnapshot

    return {
      docId: clean(projected.id),
      fields: {
        ...pick(projected, PLAYER_STATS_AUDIT_FIELDS),
        statsSnapshots: {
          current: currentSnapshotFields,
        },
      },
    }
  }).filter(row => row.docId)
)

const buildExpectedTeamIndex = ({ canonical, season, team }) => ({
  docId: buildTeamSeasonSearchIndexId({
    leagueId: canonical.leagueId,
    seasonKey: canonical.seasonKey,
    teamId: canonical.birthTeamDocumentId,
  }),
  fields: {
    teamSeasonDocumentId: buildTeamSeasonDocumentId(
      canonical.birthTeamDocumentId,
      canonical.seasonKey
    ),
    playersCount: canonical.teamSeason?.playersCount,
    scoutProfilesSummary: canonical.teamSeason?.scoutProfilesSummary,
    ...buildTeamBalanceSearchIndexProjection(
      canonical.teamSeason?.teamBalance
    ),
  },
})

const buildExpectedLeagueMetadata = ({ canonical, seasonStatus }) => ({
  leagueId: clean(canonical.leagueId),
  seasonKey: clean(canonical.seasonKey),
  birthTeamDocumentId: clean(canonical.birthTeamDocumentId),
  sourceTarget: seasonStatus === 'completed' ? 'history' : 'current',
  fields: {
    playersCount: canonical.teamSeason?.playersCount,
    hasPlayers: Number(canonical.teamSeason?.playersCount || 0) > 0,
    hasStats: (Array.isArray(canonical.teamSeason?.teamPlayers)
      ? canonical.teamSeason.teamPlayers
      : []).some(player => clean(player?.statsStatus) === 'loaded'),
    statsComplete: true,
    scoutProfilesSummary: canonical.teamSeason?.scoutProfilesSummary,
    teamTaskSignals: canonical.teamSeason?.teamBalance?.teamTaskSignals || null,
  },
})

export function buildExpectedStatsProjectionsV2({
  canonical = {},
  existingPlayerDocumentIds = new Set(),
} = {}) {
  const teamRoot = canonical.teamRoot || {}
  const teamSeason = canonical.teamSeason || {}
  const league = canonical.league || {}
  const seasonStatus = resolveLeagueSeasonStatus({
    league,
    season: {
      seasonKey: canonical.seasonKey,
    },
  })
  const season = {
    ...teamSeason,
    seasonKey: clean(canonical.seasonKey),
    seasonStatus,
    leagueId: clean(canonical.leagueId),
  }
  const team = {
    ...teamRoot,
    ...teamSeason,
    birthTeamDocumentId: clean(canonical.birthTeamDocumentId),
  }

  return {
    playerSearchIndexes: buildExpectedPlayerIndexes({
      canonical,
      season,
      team,
      existingPlayerDocumentIds,
    }),
    teamSearchIndex: buildExpectedTeamIndex({
      canonical,
      season,
      team,
    }),
    leagueMetadata: buildExpectedLeagueMetadata({
      canonical,
      seasonStatus,
    }),
  }
}
