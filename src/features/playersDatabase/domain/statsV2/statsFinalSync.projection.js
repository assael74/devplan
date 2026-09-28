// src/features/playersDatabase/domain/statsV2/statsFinalSync.projection.js

import { buildPlayerDocumentId } from '../../model/player/playerIdentity.model.js'
import {
  buildPlayerStatsSnapshot,
  hasPlayerStatsSnapshotData,
} from '../../model/player/playerStatsSnapshot.model.js'
import { buildTeamSeasonDocumentId } from '../../model/team/teamIdentity.model.js'
import { buildPlayerSeasonIndexDoc } from '../rosterV2/support/searchIndex/player/playerSeasonIndex.model.js'
import { buildTeamBalanceSearchIndexProjection } from '../projections/teamBalanceSearchIndex.projection.js'
import { buildTeamSeasonSearchIndexId } from '../projections/teamSeasonSearchIndex.projection.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()


const buildExistingStatsSnapshot = existingData => {
  const storedCurrent = existingData?.statsSnapshots?.current
  if (storedCurrent?.snapshotKey) return storedCurrent

  const fallback = buildPlayerStatsSnapshot({
    source: existingData,
    capturedAt: clean(existingData?.updatedAt),
  })

  return hasPlayerStatsSnapshotData(fallback) ? fallback : null
}

const buildStatsSnapshots = ({ existingData = {}, nextStats = {}, capturedAt = '' } = {}) => {
  const current = buildPlayerStatsSnapshot({ source: nextStats, capturedAt })
  const existingCurrent = buildExistingStatsSnapshot(existingData)
  const previous = existingData?.statsSnapshots?.previous || null

  if (existingCurrent?.snapshotKey === current.snapshotKey) {
    return { previous, current: existingCurrent }
  }

  return { previous: existingCurrent, current }
}

const STATS_PLAYER_INDEX_FIELDS = [
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
  'statsSnapshots',
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

const pickStatsPlayerIndexFields = value => Object.fromEntries(
  STATS_PLAYER_INDEX_FIELDS
    .filter(key => value[key] !== undefined)
    .map(key => [key, value[key]])
)

const stripWriteMetadata = value => {
  const { updatedAt, lastWriteAction, lastWriteAt, ...fields } = value || {}
  return fields
}

export const buildStatsPlayerSearchIndexCandidates = ({
  league = {},
  players = [],
  season = {},
  team = {},
  playerDocumentIds = [],
  existingById = {},
  capturedAt = '',
} = {}) => {
  const projectedPlayerDocumentIds = new Set(
    (Array.isArray(playerDocumentIds) ? playerDocumentIds : [])
      .map(clean)
      .filter(Boolean)
  )

  return (Array.isArray(players) ? players : []).map(player => {
    const candidatePlayerDocumentId = clean(
      player?.playerDocumentId || buildPlayerDocumentId(player)
    )
    const effectivePlayerDocumentId = projectedPlayerDocumentIds.has(candidatePlayerDocumentId)
      ? candidatePlayerDocumentId
      : ''
    const fullDocument = buildPlayerSeasonIndexDoc({
      league,
      season,
      team,
      target: clean(season.seasonStatus) === 'completed' ? 'history' : 'current',
      player: {
        ...player,
        ...(player?.playerStats || {}),
        playerDocumentId: effectivePlayerDocumentId,
      },
    })

    const existingData = existingById?.[clean(fullDocument.id)] || {}
    const statsSnapshots = buildStatsSnapshots({
      existingData,
      nextStats: fullDocument,
      capturedAt,
    })
    const projectedDocument = { ...fullDocument, statsSnapshots }

    return {
      docId: clean(projectedDocument.id),
      createFields: stripWriteMetadata(projectedDocument),
      updateFields: pickStatsPlayerIndexFields(projectedDocument),
    }
  }).filter(state => state.docId)
}

export const buildStatsPlayerSearchIndexStates = ({
  candidates = [],
  existingDocumentIds = [],
} = {}) => {
  const existingIds = new Set(
    (Array.isArray(existingDocumentIds) ? existingDocumentIds : [])
      .map(clean)
      .filter(Boolean)
  )

  return (Array.isArray(candidates) ? candidates : []).map(candidate => {
    const docId = clean(candidate?.docId)
    const action = existingIds.has(docId) ? 'update' : 'create'

    return {
      docId,
      action,
      fields: action === 'create'
        ? candidate.createFields
        : candidate.updateFields,
    }
  }).filter(state => state.docId)
}

export const buildStatsTeamSearchIndexPatch = ({
  leagueId = '',
  season = {},
  team = {},
  teamSeason = {},
} = {}) => ({
  docId: buildTeamSeasonSearchIndexId({
    leagueId,
    seasonKey: season.seasonKey,
    teamId: team.birthTeamDocumentId,
  }),
  fields: {
    teamSeasonDocumentId: buildTeamSeasonDocumentId(
      team.birthTeamDocumentId,
      season.seasonKey
    ),
    playersCount: teamSeason.playersCount,
    scoutProfilesSummary: teamSeason.scoutProfilesSummary,
    ...buildTeamBalanceSearchIndexProjection(teamSeason.teamBalance),
  },
})

export const buildStatsLeagueMetadataFields = ({
  teamSeason = {},
} = {}) => ({
  playersCount: teamSeason.playersCount,
  hasPlayers: Number(teamSeason.playersCount || 0) > 0,
  hasStats: (Array.isArray(teamSeason.teamPlayers)
    ? teamSeason.teamPlayers
    : []).some(player => clean(player?.statsStatus) === 'loaded'),
  statsComplete: true,
  scoutProfilesSummary: teamSeason.scoutProfilesSummary,
  teamTaskSignals: teamSeason.teamBalance?.teamTaskSignals || null,
})
