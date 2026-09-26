import {
  deleteField,
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import {
  buildLeagueTeamSearchIndexProjections,
} from '../../../../domain/projections/teamSeasonSearchIndex.projection.js'
import { cleanValue } from '../../../../model/shared/value.model.js'
import { buildTeamSeasonDocumentId } from '../../../../model/team/teamIdentity.model.js'

const LEAGUE_SEARCH_INDEX_OWNED_FIELDS = [
  'displayName', 'normalizedDisplayName', 'leagueId', 'seasonId', 'seasonKey',
  'clubId', 'clubLevel', 'clubStrengthLevel', 'birthTeamId', 'birthTeamDocumentId',
  'birthTeamSlot', 'teamId', 'teamDocumentId', 'seasonUrl', 'ageGroupId', 'ageGroupLabel',
  'birthYear', 'leagueTotalRound', 'leagueLevel', 'expectedLevelDelta', 'region',
  'seasonDataStatus', 'seasonDataCompleteness', 'tableRank', 'tableAttackRank',
  'tableDefenseRank', 'teamGamePlayed', 'goalsFor', 'goalsAgainst', 'goalsForPerGame',
  'goalsAgainstPerGame', 'points', 'seasonStatus', 'normalizationStatus',
  'normalizationVersion', 'projectedPointsRaw', 'projectedPoints',
  'projectedGoalsForRaw', 'projectedGoalsFor', 'projectedGoalsAgainstRaw',
  'projectedGoalsAgainst', 'projectedTeamGamePlayedRaw', 'projectedTeamGamePlayed',
  'remainingTeamGames',
  'teamPerformanceSchemaVersion', 'attackScoutPriorityScore', 'attackPriorityLevel',
  'attackOpportunityType', 'defenseScoutPriorityScore', 'defensePriorityLevel',
  'defenseOpportunityType', 'teamScoutEngineVersion', 'scoutCompetitionRelation',
  'scoutCompetitionGap', 'attackingNeedLevel', 'defensiveNeedLevel',
  'balanceProblemLevel', 'recruitmentWindow', 'sourceCollection', 'sourceDocumentId',
  'sourceTarget',
]

const TEAM_SEARCH_INDEX_TEAM_OWNED_FIELDS = new Set([
  'playersCount',
  'scoutProfilesSummary',
  'teamSeasonDocumentId',
  'teamUrl',
])

const stripTeamOwnedFields = document => Object.fromEntries(
  Object.entries(document || {}).filter(([key]) => (
    !TEAM_SEARCH_INDEX_TEAM_OWNED_FIELDS.has(key)
  ))
)

const buildTeamSeasonPatch = ({
  league = {},
  season = {},
  performance = {},
  points = 0,
  attackPriorityLevel = '',
  defensePriorityLevel = '',
} = {}) => ({
  leagueId: cleanValue(league.id || league.leagueId || season.leagueId),
  leagueLevel: Number(league.level) || 0,
  leagueTotalRound: Number(season.leagueTotalRound) || 0,
  ...(cleanValue(season.seasonStatus)
    ? { seasonStatus: cleanValue(season.seasonStatus) }
    : {}),
  tableRank: performance.tableRank,
  tableAttackRank: performance.tableAttackRank,
  tableDefenseRank: performance.tableDefenseRank,
  goalsForPerGame: performance.goalsForPerGame,
  goalsAgainstPerGame: performance.goalsAgainstPerGame,
  teamAttackPerformance: cleanValue(attackPriorityLevel) && cleanValue(attackPriorityLevel) !== 'unavailable'
    ? { priorityLevel: cleanValue(attackPriorityLevel) }
    : null,
  teamDefensePerformance: cleanValue(defensePriorityLevel) && cleanValue(defensePriorityLevel) !== 'unavailable'
    ? { priorityLevel: cleanValue(defensePriorityLevel) }
    : null,
  teamStats: {
    points: Number(points) || 0,
    teamGamePlayed: performance.teamGamePlayed,
    goalsFor: performance.goalsFor,
    goalsAgainst: performance.goalsAgainst,
  },
  updatedAt: serverTimestamp(),
})

export async function syncLeagueTeamsV2({
  league = {},
  season = {},
  target = 'current',
  rows = [],
  removedLeagueEntries = [],
} = {}) {
  const leagueId = cleanValue(league.id || league.leagueId || season.leagueId)
  const seasonKey = cleanValue(season.seasonKey || season.seasonId)

  if (!leagueId) throw new Error('Missing league id')
  if (!seasonKey) throw new Error('Missing season key')
  if (!Array.isArray(rows)) throw new Error('League rows must be an array')
  if (!Array.isArray(removedLeagueEntries)) throw new Error('Removed league entries must be an array')

  const projections = buildLeagueTeamSearchIndexProjections({
    league: { ...league, id: leagueId },
    season,
    target,
    rows,
  })

  return trackedRunTransaction(db, async transaction => {
    const targets = projections.map(item => ({
      ...item,
      teamSeasonRef: doc(
        db,
        PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
        item.teamSeasonDocumentId
      ),
      searchIndexRef: doc(
        db,
        PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
        item.id
      ),
    }))
    const removedTargets = removedLeagueEntries.map(entry => {
      const teamId = cleanValue(entry?.teamId || entry?.birthTeamId)
      const teamSeasonDocumentId = buildTeamSeasonDocumentId(teamId, seasonKey)
      const searchIndexId = [
        'birthTeamSeason',
        leagueId,
        seasonKey.replace(/[^0-9a-zA-Z]+/g, '_'),
        teamId,
      ].filter(Boolean).join('__')
      return {
        teamId,
        teamSeasonRef: teamSeasonDocumentId
          ? doc(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons, teamSeasonDocumentId)
          : null,
        searchIndexRef: searchIndexId
          ? doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, searchIndexId)
          : null,
      }
    }).filter(item => item.teamId)

    const teamSeasonSnapshots = []
    for (const targetItem of targets) {
      teamSeasonSnapshots.push(await transaction.get(targetItem.teamSeasonRef))
    }
    const removedSnapshots = []
    for (const removedTarget of removedTargets) {
      removedSnapshots.push({
        teamSeason: removedTarget.teamSeasonRef
          ? await transaction.get(removedTarget.teamSeasonRef)
          : null,
        searchIndex: removedTarget.searchIndexRef
          ? await transaction.get(removedTarget.searchIndexRef)
          : null,
      })
    }

    let updatedTeamSeasons = 0
    let updatedSearchIndexes = 0
    let createdLeagueOnlySearchIndexes = 0

    targets.forEach((targetItem, index) => {
      const teamSeasonSnapshot = teamSeasonSnapshots[index]
      const points = targetItem.document.points

      if (teamSeasonSnapshot.exists()) {
        transaction.set(
          targetItem.teamSeasonRef,
          buildTeamSeasonPatch({
            league,
            season,
            performance: targetItem.performance,
            points,
            attackPriorityLevel: targetItem.document.attackPriorityLevel,
            defensePriorityLevel: targetItem.document.defensePriorityLevel,
          }),
          { merge: true }
        )
        updatedTeamSeasons += 1
      }

      const leagueProjection = stripTeamOwnedFields(targetItem.document)
      const relationPatch = teamSeasonSnapshot.exists()
        ? { teamSeasonDocumentId: targetItem.teamSeasonDocumentId }
        : { teamSeasonDocumentId: deleteField() }

      transaction.set(
        targetItem.searchIndexRef,
        {
          ...leagueProjection,
          ...relationPatch,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
      updatedSearchIndexes += 1

      if (!teamSeasonSnapshot.exists()) {
        createdLeagueOnlySearchIndexes += 1
      }
    })

    let cleanedRemovedTeamSeasons = 0
    let cleanedRemovedSearchIndexes = 0

    removedTargets.forEach((removedTarget, removedIndex) => {
      const removedSeasonSnapshot = removedSnapshots[removedIndex]?.teamSeason
      if (removedTarget.teamSeasonRef && removedSeasonSnapshot?.exists()) {
          transaction.update(removedTarget.teamSeasonRef, {
            leagueId: deleteField(),
            leagueLevel: deleteField(),
            leagueTotalRound: deleteField(),
            tableRank: deleteField(),
            tableAttackRank: deleteField(),
            tableDefenseRank: deleteField(),
            goalsForPerGame: deleteField(),
            goalsAgainstPerGame: deleteField(),
            teamAttackPerformance: deleteField(),
            teamDefensePerformance: deleteField(),
            'teamStats.points': deleteField(),
            'teamStats.teamGamePlayed': deleteField(),
            'teamStats.goalsFor': deleteField(),
            'teamStats.goalsAgainst': deleteField(),
            updatedAt: serverTimestamp(),
          })
          cleanedRemovedTeamSeasons += 1
      }

      const removedIndexSnapshot = removedSnapshots[removedIndex]?.searchIndex
      if (removedTarget.searchIndexRef && removedIndexSnapshot?.exists()) {
          const cleanupPatch = Object.fromEntries(
            LEAGUE_SEARCH_INDEX_OWNED_FIELDS.map(field => [field, deleteField()])
          )
          transaction.set(removedTarget.searchIndexRef, {
            ...cleanupPatch,
            ...(removedSeasonSnapshot?.exists()
              ? {}
              : { teamSeasonDocumentId: deleteField() }),
            updatedAt: serverTimestamp(),
          }, { merge: true })
          cleanedRemovedSearchIndexes += 1
      }
    })

    return {
      leagueId,
      seasonKey,
      rowsCount: projections.length,
      updatedTeamSeasons,
      updatedSearchIndexes,
      createdLeagueOnlySearchIndexes,
      skippedMissingTeamSeasons: projections.length - updatedTeamSeasons,
      cleanedRemovedTeamSeasons,
      cleanedRemovedSearchIndexes,
    }
  }, {
    feature: 'playersDatabase',
    action: 'league-v2-sync-teams',
    collection: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
  })
}

