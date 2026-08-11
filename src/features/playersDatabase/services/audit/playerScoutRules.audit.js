// src/features/playersDatabase/services/audit/playerScoutRules.audit.js

import {
  collection,
  doc,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import {
  trackedGetDoc,
  trackedGetDocs,
} from '../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { buildPlayerScoutState } from '../../domain/orchestration/buildPlayerScoutState.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const unique = values => [
  ...new Set(
    (Array.isArray(values) ? values : [])
      .map(clean)
      .filter(Boolean)
  ),
]

const sorted = values => unique(values).sort()

const firstDefined = (...values) => values.find(value => (
  value !== undefined &&
  value !== null &&
  value !== ''
))

const toNumber = (...values) => {
  const number = Number(firstDefined(...values))

  return Number.isFinite(number) ? number : 0
}

const toNullableNumber = (...values) => {
  const value = firstDefined(...values)
  if (value === undefined) return null

  const number = Number(value)

  return Number.isFinite(number) ? number : null
}

const toAuditTimestamp = value => {
  if (!value) return null

  if (typeof value?.toDate === 'function') {
    return value.toDate().toISOString()
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (Number.isFinite(Number(value?.seconds))) {
    return new Date(Number(value.seconds) * 1000).toISOString()
  }

  const parsed = new Date(value)

  return Number.isNaN(parsed.getTime())
    ? clean(value) || null
    : parsed.toISOString()
}

const getProfiles = source => (
  Array.isArray(source?.scoutProfiles)
    ? source.scoutProfiles
    : Array.isArray(source?.scoutSignals)
      ? source.scoutSignals
      : []
)

const getProfileIds = source => sorted(
  getProfiles(source).map(profile => profile?.profileId)
)

const getProfileReliability = source => getProfiles(source).reduce((result, profile) => {
  const profileId = clean(profile?.profileId)
  if (!profileId) return result

  result[profileId] = {
    level: clean(
      profile?.reliability?.level ||
      profile?.reliabilityLevel
    ),
    score: toNullableNumber(
      profile?.reliability?.score,
      profile?.reliabilityScore
    ),
    warnings: sorted(
      Array.isArray(profile?.warnings)
        ? profile.warnings
        : profile?.reliability?.warnings
    ),
  }

  return result
}, {})

const getSearchReliability = source => {
  const result = {}
  const addProfile = ({ profileId, level, warnings }) => {
    const id = clean(profileId)
    if (!id) return

    result[id] = {
      level: clean(level),
      warnings: sorted(warnings),
    }
  }

  addProfile({
    profileId: source?.primaryScoutProfileId,
    level: source?.primaryScoutReliabilityLevel,
    warnings: source?.primaryScoutWarnings,
  })
  addProfile({
    profileId: source?.secondaryScoutProfileId,
    level: source?.secondaryScoutReliabilityLevel,
    warnings: source?.secondaryScoutWarnings,
  })

  return result
}

const normalizeReliabilityMap = source => Object.keys(source || {})
  .sort()
  .reduce((result, profileId) => {
    const reliability = source[profileId] || {}

    result[profileId] = {
      level: clean(reliability.level),
      score: toNullableNumber(reliability.score),
      warnings: sorted(reliability.warnings),
    }

    return result
  }, {})

const sameReliability = (left = {}, right = {}) => (
  JSON.stringify(normalizeReliabilityMap(left)) ===
  JSON.stringify(normalizeReliabilityMap(right))
)

const normalizeSearchReliabilityMap = source => Object.keys(source || {})
  .sort()
  .reduce((result, profileId) => {
    const reliability = source[profileId] || {}

    result[profileId] = {
      level: clean(reliability.level),
      warnings: sorted(reliability.warnings),
    }

    return result
  }, {})

const pickReliabilityProfiles = ({ source = {}, profileIds = [] }) => (
  unique(profileIds).reduce((result, profileId) => {
    if (!source[profileId]) return result

    result[profileId] = source[profileId]
    return result
  }, {})
)

const sameSearchReliability = ({ expected = {}, actual = {} }) => {
  const profileIds = Object.keys(actual || {})
  const expectedSearchReliability = pickReliabilityProfiles({
    source: expected,
    profileIds,
  })

  return (
    JSON.stringify(normalizeSearchReliabilityMap(expectedSearchReliability)) ===
    JSON.stringify(normalizeSearchReliabilityMap(actual))
  )
}

const getCombinationIds = source => sorted(
  (Array.isArray(source?.scoutCombinations)
    ? source.scoutCombinations
    : []
  ).map(combination => combination?.id || combination?.combinationId)
)

const getSearchProfileIds = source => sorted(
  Array.isArray(source?.scoutProfileIds)
    ? source.scoutProfileIds
    : getProfileIds(source)
)

const getSearchCombinationIds = source => sorted(
  Array.isArray(source?.scoutCombinationIds)
    ? source.scoutCombinationIds
    : getCombinationIds(source)
)

const sameValues = (left = [], right = []) => (
  left.length === right.length &&
  left.every((value, index) => value === right[index])
)

const difference = (left = [], right = []) => left.filter(
  value => !right.includes(value)
)

const seasonIds = row => unique([
  row?.seasonId,
  row?.seasonKey,
])

const teamIds = row => unique([
  row?.birthTeamDocumentId,
  row?.teamDocumentId,
  row?.birthTeamId,
  row?.teamId,
  row?.sourceDocumentId,
])

const playerIds = row => unique([
  row?.playerId,
  row?.playerDocumentId,
  row?.externalPlayerId,
])

const buildTeamKeys = row => teamIds(row).flatMap(teamId => (
  seasonIds(row).map(seasonId => `${teamId}::${seasonId}`)
))

const buildPlayerKeys = row => playerIds(row).flatMap(playerId => (
  seasonIds(row).flatMap(seasonId => (
    teamIds(row).map(teamId => `${playerId}::${seasonId}::${teamId}`)
  ))
))

const buildIndex = ({ rows = [], keyBuilder }) => {
  const index = new Map()

  rows.forEach(row => {
    unique(keyBuilder(row)).forEach(key => {
      if (!index.has(key)) index.set(key, [])
      index.get(key).push(row)
    })
  })

  return index
}

const findIndexed = ({ index, row, keyBuilder }) => {
  const keys = unique(keyBuilder(row))

  for (const key of keys) {
    const matches = index.get(key) || []
    if (matches.length) return matches[0]
  }

  return null
}

const flattenPlayerDocs = docs => docs.flatMap(snapshot => {
  const data = snapshot.data() || {}
  const rows = []

  ;['current', 'history'].forEach(sourceTarget => {
    const seasons = Array.isArray(data[sourceTarget])
      ? data[sourceTarget]
      : []

    seasons.forEach(season => {
      rows.push({
        ...season,
        source: 'dbPlayers',
        sourceDocumentId: snapshot.id,
        sourceTarget,
        playerId: clean(data.playerId || season.playerId),
        playerDocumentId: snapshot.id,
        fullName: clean(data.fullName || season.fullName),
        playerDocumentCreatedAt: toAuditTimestamp(data.createdAt),
        playerDocumentUpdatedAt: toAuditTimestamp(data.updatedAt),
        playerSeasonUpdatedAt: toAuditTimestamp(season.updatedAt),
        profileIds: getProfileIds(season),
        combinationIds: getCombinationIds(season),
        reliabilityByProfile: getProfileReliability(season),
      })
    })
  })

  return rows
})

const flattenSearchPlayerDocs = docs => docs.map(snapshot => {
  const data = snapshot.data() || {}

  return {
    ...data,
    source: 'dbSearchIndexes',
    sourceDocumentId: snapshot.id,
    fullName: clean(data.displayName || data.fullName),
    searchIndexUpdatedAt: toAuditTimestamp(data.updatedAt),
    profileIds: getSearchProfileIds(data),
    combinationIds: getSearchCombinationIds(data),
    reliabilityByProfile: getSearchReliability(data),
  }
})

const flattenTeamIndexDocs = docs => docs.map(snapshot => ({
  ...(snapshot.data() || {}),
  sourceDocumentId: snapshot.id,
}))

const hasTeamPerformance = teamIndex => Boolean(
  clean(teamIndex?.attackPriorityLevel) ||
  clean(teamIndex?.defensePriorityLevel)
)

const buildTeamContext = ({ teamDoc, season, teamIndex }) => {
  const teamGamePlayed = toNumber(
    teamIndex.teamGamePlayed,
    season.teamStats?.teamGamePlayed
  )
  const goalsFor = toNumber(
    teamIndex.goalsFor,
    season.teamStats?.goalsFor
  )
  const goalsAgainst = toNumber(
    teamIndex.goalsAgainst,
    season.teamStats?.goalsAgainst
  )

  return {
    ...teamDoc,
    ...season,
    clubId: clean(teamIndex.clubId || teamDoc.clubId),
    clubLevel: teamIndex.clubLevel,
    birthTeamId: clean(
      teamIndex.birthTeamId ||
      teamDoc.birthTeamId ||
      teamDoc.teamId
    ),
    birthTeamDocumentId: clean(
      teamIndex.birthTeamDocumentId ||
      teamIndex.teamDocumentId ||
      teamDoc.sourceDocumentId
    ),
    birthTeamSlot: toNumber(
      teamIndex.birthTeamSlot,
      teamDoc.birthTeamSlot,
      1
    ),
    ageGroupId: clean(teamIndex.ageGroupId || season.ageGroupId),
    birthYear: toNullableNumber(
      teamIndex.birthYear,
      season.birthYear
    ),
    leagueTotalRound: toNumber(
      teamIndex.leagueTotalRound,
      season.leagueTotalRound
    ),
    teamGamePlayed,
    goalsFor,
    goalsAgainst,
    teamStats: {
      ...(season.teamStats || {}),
      teamGamePlayed,
      goalsFor,
      goalsAgainst,
    },
    offense: {
      priorityLevel: clean(teamIndex.attackPriorityLevel),
    },
    defense: {
      priorityLevel: clean(teamIndex.defensePriorityLevel),
    },
  }
}

const buildSeasonContext = ({ season, teamIndex, sourceTarget }) => ({
  ...season,
  seasonId: clean(season.seasonId || teamIndex.seasonId),
  seasonKey: clean(season.seasonKey || teamIndex.seasonKey),
  ageGroupId: clean(teamIndex.ageGroupId || season.ageGroupId),
  birthYear: toNullableNumber(
    teamIndex.birthYear,
    season.birthYear
  ),
  leagueTotalRound: toNumber(
    teamIndex.leagueTotalRound,
    season.leagueTotalRound
  ),
  seasonStatus: sourceTarget === 'history'
    ? 'completed'
    : clean(season.seasonStatus) || 'active',
})

const buildRecalculatedRows = ({
  teamDocs,
  teamIndexRows,
  includeRepairData = false,
}) => {
  const teamIndex = buildIndex({
    rows: teamIndexRows,
    keyBuilder: buildTeamKeys,
  })
  const rows = []
  const skipped = []

  teamDocs.forEach(snapshot => {
    const data = snapshot.data() || {}
    const teamDoc = {
      ...data,
      sourceDocumentId: snapshot.id,
    }

    ;['current', 'history'].forEach(sourceTarget => {
      const seasons = Array.isArray(data[sourceTarget])
        ? data[sourceTarget]
        : []

      seasons.forEach(season => {
        const scope = {
          ...season,
          sourceDocumentId: snapshot.id,
          birthTeamDocumentId: snapshot.id,
          birthTeamId: clean(data.birthTeamId || data.teamId),
        }
        const teamIndexRow = findIndexed({
          index: teamIndex,
          row: scope,
          keyBuilder: buildTeamKeys,
        })
        const players = Array.isArray(season.teamPlayers)
          ? season.teamPlayers
          : []

        if (!teamIndexRow || !hasTeamPerformance(teamIndexRow)) {
          players.forEach(player => {
            skipped.push({
              type: 'missing_team_performance_context',
              severity: 'warning',
              source: 'dbBirthTeams',
              playerId: clean(player.playerId),
              playerDocumentId: clean(player.playerDocumentId),
              externalPlayerId: clean(player.externalPlayerId),
              fullName: clean(player.fullName),
              seasonId: clean(season.seasonId),
              seasonKey: clean(season.seasonKey),
              teamDocumentId: snapshot.id,
              teamName: clean(
                teamIndexRow?.displayName ||
                data.displayName ||
                data.teamName ||
                data.name
              ),
            })
          })
          return
        }

        const team = buildTeamContext({
          teamDoc,
          season,
          teamIndex: teamIndexRow,
        })
        const seasonContext = buildSeasonContext({
          season,
          teamIndex: teamIndexRow,
          sourceTarget,
        })

        players.forEach(player => {
          const calculated = buildPlayerScoutState({
            player,
            team,
            season: seasonContext,
            perspective: 'players_database_scout_rules_audit',
          })

          rows.push({
            source: 'dbBirthTeams',
            sourceDocumentId: snapshot.id,
            sourceTarget,
            playerId: clean(player.playerId),
            playerDocumentId: clean(player.playerDocumentId),
            externalPlayerId: clean(player.externalPlayerId),
            fullName: clean(player.fullName),
            seasonId: clean(seasonContext.seasonId),
            seasonKey: clean(seasonContext.seasonKey),
            birthTeamId: clean(team.birthTeamId),
            birthTeamDocumentId: snapshot.id,
            teamId: clean(team.birthTeamId),
            teamDocumentId: snapshot.id,
            teamName: clean(
              teamIndexRow.displayName ||
              data.displayName ||
              data.teamName ||
              data.name
            ),
            teamDocumentCreatedAt: toAuditTimestamp(data.createdAt),
            teamDocumentUpdatedAt: toAuditTimestamp(data.updatedAt),
            teamSeasonUpdatedAt: toAuditTimestamp(season.updatedAt),
            teamPlayerUpdatedAt: toAuditTimestamp(player.updatedAt),
            teamIndexUpdatedAt: toAuditTimestamp(teamIndexRow.updatedAt),
            stats: {
              games: Number(player.playerStats?.games) || 0,
              goals: Number(player.playerStats?.goals) || 0,
              yellowCards: Number(player.playerStats?.yellowCards) || 0,
              minutes: Number(player.playerStats?.minutes) || 0,
              starts: Number(player.playerStats?.starts) || 0,
              substituteIn: Number(player.playerStats?.substituteIn) || 0,
              substitutedOut: Number(player.playerStats?.substitutedOut) || 0,
              teamGames: Number(player.playerStats?.teamGames) || 0,
            },
            teamContext: {
              attackPriorityLevel: clean(teamIndexRow.attackPriorityLevel),
              defensePriorityLevel: clean(teamIndexRow.defensePriorityLevel),
              teamGamePlayed: toNumber(teamIndexRow.teamGamePlayed),
              goalsFor: toNumber(teamIndexRow.goalsFor),
              goalsAgainst: toNumber(teamIndexRow.goalsAgainst),
              ageGroupId: clean(teamIndexRow.ageGroupId),
              clubLevel: toNumber(teamIndexRow.clubLevel),
            },
            actualProfileIds: getProfileIds(player),
            actualCombinationIds: getCombinationIds(player),
            actualReliabilityByProfile: getProfileReliability(player),
            expectedProfileIds: getProfileIds(calculated),
            expectedCombinationIds: getCombinationIds(calculated),
            expectedReliabilityByProfile: getProfileReliability(calculated),
            ...(includeRepairData
              ? {
                expectedScoutProfiles: getProfiles(calculated),
                expectedScoutCombinations: Array.isArray(calculated?.scoutCombinations)
                  ? calculated.scoutCombinations
                  : [],
              }
              : {}),
            storedSeasonStatus: clean(season.seasonStatus),
          })
        })
      })
    })
  })

  return {
    rows,
    skipped,
  }
}

const buildIssueTimestamps = ({
  row,
  playerRow = null,
  searchRow = null,
}) => ({
  teamDocumentCreatedAt: row.teamDocumentCreatedAt,
  teamDocumentUpdatedAt: row.teamDocumentUpdatedAt,
  teamSeasonUpdatedAt: row.teamSeasonUpdatedAt,
  teamPlayerUpdatedAt: row.teamPlayerUpdatedAt,
  teamIndexUpdatedAt: row.teamIndexUpdatedAt,
  playerDocumentCreatedAt: playerRow?.playerDocumentCreatedAt || null,
  playerDocumentUpdatedAt: playerRow?.playerDocumentUpdatedAt || null,
  playerSeasonUpdatedAt: playerRow?.playerSeasonUpdatedAt || null,
  searchIndexUpdatedAt: searchRow?.searchIndexUpdatedAt || null,
})

const buildIssue = ({
  type,
  source,
  row,
  playerRow = null,
  searchRow = null,
  actualProfiles = [],
  actualCombinations = [],
}) => ({
  type,
  severity: 'high',
  source,
  playerId: row.playerId,
  playerDocumentId: row.playerDocumentId,
  externalPlayerId: row.externalPlayerId,
  fullName: row.fullName,
  seasonId: row.seasonId,
  seasonKey: row.seasonKey,
  teamDocumentId: row.teamDocumentId,
  teamName: row.teamName,
  expectedProfiles: row.expectedProfileIds,
  actualProfiles,
  missingProfiles: difference(row.expectedProfileIds, actualProfiles),
  extraProfiles: difference(actualProfiles, row.expectedProfileIds),
  expectedCombinations: row.expectedCombinationIds,
  actualCombinations,
  stats: row.stats,
  teamContext: row.teamContext,
  timestamps: buildIssueTimestamps({
    row,
    playerRow,
    searchRow,
  }),
})

const collectIssues = ({
  teamRows,
  skippedRows,
  playerRows,
  searchRows,
}) => {
  const issues = [...skippedRows]
  const playerIndex = buildIndex({
    rows: playerRows,
    keyBuilder: buildPlayerKeys,
  })
  const searchIndex = buildIndex({
    rows: searchRows,
    keyBuilder: buildPlayerKeys,
  })

  teamRows.forEach(row => {
    if (
      !sameValues(row.expectedProfileIds, row.actualProfileIds) ||
      !sameValues(row.expectedCombinationIds, row.actualCombinationIds)
    ) {
      const issue = buildIssue({
        type: 'birth_team_mismatch',
        source: 'dbBirthTeams',
        row,
        actualProfiles: row.actualProfileIds,
        actualCombinations: row.actualCombinationIds,
      })

      issue.severity = issue.missingProfiles.length
        ? 'high'
        : 'medium'
      issues.push(issue)
    }

    if (
      row.sourceTarget === 'history' &&
      row.storedSeasonStatus !== 'completed'
    ) {
      issues.push({
        type: 'history_season_status_invalid',
        severity: 'high',
        source: 'dbBirthTeams',
        playerId: row.playerId,
        playerDocumentId: row.playerDocumentId,
        fullName: row.fullName,
        seasonId: row.seasonId,
        seasonKey: row.seasonKey,
        teamDocumentId: row.teamDocumentId,
        teamName: row.teamName,
        actualSeasonStatus: row.storedSeasonStatus || 'missing',
        expectedSeasonStatus: 'completed',
      })
    }

    if (
      sameValues(row.expectedProfileIds, row.actualProfileIds) &&
      !sameReliability(
        row.expectedReliabilityByProfile,
        row.actualReliabilityByProfile
      )
    ) {
      issues.push({
        type: 'birth_team_reliability_mismatch',
        severity: 'medium',
        source: 'dbBirthTeams',
        playerId: row.playerId,
        playerDocumentId: row.playerDocumentId,
        fullName: row.fullName,
        seasonId: row.seasonId,
        seasonKey: row.seasonKey,
        teamDocumentId: row.teamDocumentId,
        teamName: row.teamName,
        expectedReliability: row.expectedReliabilityByProfile,
        actualReliability: row.actualReliabilityByProfile,
      })
    }

    const playerRow = findIndexed({
      index: playerIndex,
      row,
      keyBuilder: buildPlayerKeys,
    })
    const searchRow = findIndexed({
      index: searchIndex,
      row,
      keyBuilder: buildPlayerKeys,
    })

    if (row.expectedProfileIds.length && !playerRow) {
      issues.push(buildIssue({
        type: 'missing_player_document',
        source: 'dbPlayers',
        row,
        playerRow,
        searchRow,
      }))
    } else if (playerRow && (
      !sameValues(row.expectedProfileIds, playerRow.profileIds) ||
      !sameValues(row.expectedCombinationIds, playerRow.combinationIds)
    )) {
      issues.push(buildIssue({
        type: 'player_document_mismatch',
        source: 'dbPlayers',
        row,
        playerRow,
        searchRow,
        actualProfiles: playerRow.profileIds,
        actualCombinations: playerRow.combinationIds,
      }))
    }

    if (
      playerRow &&
      sameValues(row.expectedProfileIds, playerRow.profileIds) &&
      !sameReliability(
        row.expectedReliabilityByProfile,
        playerRow.reliabilityByProfile
      )
    ) {
      issues.push({
        type: 'player_document_reliability_mismatch',
        severity: 'medium',
        source: 'dbPlayers',
        playerId: row.playerId,
        playerDocumentId: row.playerDocumentId,
        fullName: row.fullName,
        seasonId: row.seasonId,
        seasonKey: row.seasonKey,
        teamDocumentId: row.teamDocumentId,
        teamName: row.teamName,
        expectedReliability: row.expectedReliabilityByProfile,
        actualReliability: playerRow.reliabilityByProfile,
      })
    }

    if (row.expectedProfileIds.length && !searchRow) {
      issues.push(buildIssue({
        type: 'missing_search_index',
        source: 'dbSearchIndexes',
        row,
        playerRow,
        searchRow,
      }))
    } else if (searchRow && (
      !sameValues(row.expectedProfileIds, searchRow.profileIds) ||
      !sameValues(row.expectedCombinationIds, searchRow.combinationIds)
    )) {
      issues.push(buildIssue({
        type: 'search_index_mismatch',
        source: 'dbSearchIndexes',
        row,
        playerRow,
        searchRow,
        actualProfiles: searchRow.profileIds,
        actualCombinations: searchRow.combinationIds,
      }))
    }

    if (
      searchRow &&
      sameValues(row.expectedProfileIds, searchRow.profileIds) &&
      !sameSearchReliability({
        expected: row.expectedReliabilityByProfile,
        actual: searchRow.reliabilityByProfile,
      })
    ) {
      issues.push({
        type: 'search_index_reliability_mismatch',
        severity: 'medium',
        source: 'dbSearchIndexes',
        playerId: row.playerId,
        playerDocumentId: row.playerDocumentId,
        fullName: row.fullName,
        seasonId: row.seasonId,
        seasonKey: row.seasonKey,
        teamDocumentId: row.teamDocumentId,
        teamName: row.teamName,
        expectedReliability: row.expectedReliabilityByProfile,
        actualReliability: searchRow.reliabilityByProfile,
      })
    }
  })

  return issues
}

const countValues = values => values.reduce((result, value) => {
  const key = clean(value) || 'unknown'
  result[key] = (result[key] || 0) + 1
  return result
}, {})

const buildSummary = ({
  teamRows,
  skippedRows,
  playerRows,
  searchRows,
  teamIndexRows,
  issues,
}) => {
  const birthTeamIssues = issues.filter(issue => (
    issue.type === 'birth_team_mismatch'
  ))
  const syncIssues = issues.filter(issue => [
    'missing_player_document',
    'player_document_mismatch',
    'missing_search_index',
    'search_index_mismatch',
  ].includes(issue.type))
  const reliabilityIssues = issues.filter(issue => (
    issue.type.includes('reliability_mismatch')
  ))
  const historyStatusIssues = issues.filter(issue => (
    issue.type === 'history_season_status_invalid'
  ))

  return {
    checkedTeamPlayerRows: teamRows.length,
    skippedRows: skippedRows.length,
    playerSeasonRows: playerRows.length,
    searchPlayerDocuments: searchRows.length,
    teamSeasonIndexes: teamIndexRows.length,
    rowsWithProfileDiff: birthTeamIssues.length,
    missingProfilesCount: birthTeamIssues.reduce(
      (sum, issue) => sum + issue.missingProfiles.length,
      0
    ),
    extraProfilesCount: birthTeamIssues.reduce(
      (sum, issue) => sum + issue.extraProfiles.length,
      0
    ),
    syncIssuesCount: syncIssues.length,
    reliabilityIssuesCount: reliabilityIssues.length,
    historyStatusIssuesCount: historyStatusIssues.length,
    totalIssues: issues.length,
    missingProfilesById: countValues(
      birthTeamIssues.flatMap(issue => issue.missingProfiles)
    ),
    extraProfilesById: countValues(
      birthTeamIssues.flatMap(issue => issue.extraProfiles)
    ),
    issuesByType: countValues(issues.map(issue => issue.type)),
    issuesBySource: countValues(issues.map(issue => issue.source)),
  }
}

const readAuditData = async ({ includeRepairData = false } = {}) => {
  const [
    teamSnapshot,
    playerSnapshot,
    playerSearchSnapshot,
    teamSearchSnapshot,
  ] = await Promise.all([
    trackedGetDocs(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.teams),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.teams,
        action: 'playerScoutRules-audit',
        operationSubtype: 'audit-read',
      }
    ),
    trackedGetDocs(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.players),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.players,
        action: 'playerScoutRules-audit',
        operationSubtype: 'audit-read',
      }
    ),
    trackedGetDocs(
      query(
        collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
        where('entityType', '==', 'playerSeason')
      ),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
        action: 'playerScoutRules-audit',
        operationSubtype: 'player-index-query',
      }
    ),
    trackedGetDocs(
      query(
        collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
        where('entityType', '==', 'birthTeamSeason')
      ),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
        action: 'playerScoutRules-audit',
        operationSubtype: 'team-index-query',
      }
    ),
  ])

  const teamIndexRows = flattenTeamIndexDocs(teamSearchSnapshot.docs)
  const recalculated = buildRecalculatedRows({
    teamDocs: teamSnapshot.docs,
    teamIndexRows,
    includeRepairData,
  })

  return {
    teamRows: recalculated.rows,
    skippedRows: recalculated.skipped,
    playerRows: flattenPlayerDocs(playerSnapshot.docs),
    searchRows: flattenSearchPlayerDocs(playerSearchSnapshot.docs),
    teamIndexRows,
  }
}


const readScopedAuditData = async ({
  teamDocumentId,
  seasonKey,
  includeRepairData = false,
}) => {
  const safeTeamDocumentId = clean(teamDocumentId)
  const safeSeasonKey = clean(seasonKey)

  if (!safeTeamDocumentId) {
    throw new Error('Missing team document id for scoped scout audit')
  }
  if (!safeSeasonKey) {
    throw new Error('Missing season key for scoped scout audit')
  }

  const [teamSnapshot, playerSearchSnapshot, teamSearchSnapshot] = await Promise.all([
    trackedGetDoc(
      doc(
        db,
        PLAYERS_DATABASE_COLLECTIONS.teams,
        safeTeamDocumentId
      ),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.teams,
        action: 'playerScoutRules-scopedAudit',
        operationSubtype: 'team-read',
      }
    ),
    trackedGetDocs(
      query(
        collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
        where('entityType', '==', 'playerSeason'),
        where('teamDocumentId', '==', safeTeamDocumentId),
        where('seasonKey', '==', safeSeasonKey)
      ),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
        action: 'playerScoutRules-scopedAudit',
        operationSubtype: 'player-index-query',
      }
    ),
    trackedGetDocs(
      query(
        collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
        where('entityType', '==', 'birthTeamSeason'),
        where('teamDocumentId', '==', safeTeamDocumentId),
        where('seasonKey', '==', safeSeasonKey)
      ),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
        action: 'playerScoutRules-scopedAudit',
        operationSubtype: 'team-index-query',
      }
    ),
  ])

  if (!teamSnapshot.exists()) {
    throw new Error(`Team document not found: ${safeTeamDocumentId}`)
  }

  const teamIndexRows = flattenTeamIndexDocs(teamSearchSnapshot.docs)
  const recalculatedAll = buildRecalculatedRows({
    teamDocs: [teamSnapshot],
    teamIndexRows,
    includeRepairData,
  })
  const teamRows = recalculatedAll.rows.filter(row => (
    clean(row.seasonKey || row.seasonId) === safeSeasonKey
  ))
  const skippedRows = recalculatedAll.skipped.filter(row => (
    clean(row.seasonKey || row.seasonId) === safeSeasonKey
  ))
  const playerDocumentIds = unique(
    teamRows.map(row => row.playerDocumentId)
  )
  const playerSnapshots = await Promise.all(
    playerDocumentIds.map(playerDocumentId => trackedGetDoc(
      doc(
        db,
        PLAYERS_DATABASE_COLLECTIONS.players,
        playerDocumentId
      ),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.players,
        action: 'playerScoutRules-scopedAudit',
        operationSubtype: 'player-read',
      }
    ))
  )
  const existingPlayerSnapshots = playerSnapshots.filter(snapshot => (
    snapshot.exists()
  ))

  return {
    teamRows,
    skippedRows,
    playerRows: flattenPlayerDocs(existingPlayerSnapshots),
    searchRows: flattenSearchPlayerDocs(playerSearchSnapshot.docs),
    teamIndexRows,
  }
}

export async function buildScopedPlayerScoutRulesAudit({
  teamDocumentId,
  seasonKey,
  includeRepairData = false,
} = {}) {
  const rows = await readScopedAuditData({
    teamDocumentId,
    seasonKey,
    includeRepairData,
  })
  const issues = collectIssues({
    teamRows: rows.teamRows,
    skippedRows: rows.skippedRows,
    playerRows: rows.playerRows,
    searchRows: rows.searchRows,
  })

  return {
    generatedAt: new Date().toISOString(),
    mode: 'read-only-scoped',
    purpose: 'verify-player-scout-scope-after-write',
    scope: {
      teamDocumentId: clean(teamDocumentId),
      seasonKey: clean(seasonKey),
    },
    summary: buildSummary({
      ...rows,
      issues,
    }),
    issues,
    recalculatedRows: rows.teamRows,
  }
}

export async function buildPlayerScoutRulesAudit({
  includeRepairData = false,
} = {}) {
  const rows = await readAuditData({
    includeRepairData,
  })
  const issues = collectIssues({
    teamRows: rows.teamRows,
    skippedRows: rows.skippedRows,
    playerRows: rows.playerRows,
    searchRows: rows.searchRows,
  })

  return {
    generatedAt: new Date().toISOString(),
    mode: 'read-only',
    purpose: 'recalculate-player-scout-with-current-rules-and-compare-stored-state',
    summary: buildSummary({
      ...rows,
      issues,
    }),
    issues,
    recalculatedRows: rows.teamRows,
  }
}

export const downloadPlayerScoutRulesAudit = audit => {
  if (!audit) return

  const json = JSON.stringify(audit, null, 2)
  const blob = new Blob([json], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)

  link.href = url
  link.download = `player-scout-rules-audit-${date}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
