// features/playersDatabase/services/write/searchIndex/shared/searchIndexNormalization.bulk.js

import {
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { clean, toNumberOrZero } from '../../leagues/leagueDoc.js'
import {
  buildPlayerSeasonSearchMetrics,
  buildTeamSeasonSearchMetrics,
} from './searchIndexNormalization.model.js'
import { buildTeamScoutPrioritySearchIds } from './teamScoutPrioritySearch.model.js'
import {
  resolveTeamScoutAnomalyLevel,
  resolveTeamScoutPriorityLevel,
} from '../../../../../../shared/teams/scout/index.js'

const SEARCH_INDEX_NORMALIZATION_BATCH_SIZE = 450


const roundOptionalWholeNumber = value => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.round(number) : null
}


const SEARCH_INDEX_ENTITY_TYPES = {
  player: 'playerSeason',
  team: 'birthTeamSeason',
}

const resolveTarget = data => (
  clean(data?.sourceTarget) === 'history' ? 'history' : 'current'
)

const buildPlayerNormalizationPatch = data => buildPlayerSeasonSearchMetrics({
  target: resolveTarget(data),
  ageGroupId: data.ageGroupId,
  leagueTotalRound: toNumberOrZero(data.leagueTotalRound),
  teamGamePlayed: toNumberOrZero(
    data.teamGamePlayed || data.teamGames
  ),
  stats: {
    games: toNumberOrZero(data.games),
    goals: toNumberOrZero(data.goals),
    minutes: toNumberOrZero(data.minutes),
    starts: toNumberOrZero(data.starts),
    teamGames: toNumberOrZero(data.teamGames),
  },
})

const buildTeamNormalizationPatch = data => {
  const attackPerformance = roundOptionalWholeNumber(data.attackPerformance)
  const attackPerformanceRate = roundOptionalWholeNumber(data.attackPerformanceRate)
  const attackRankingRate = roundOptionalWholeNumber(data.attackRankingRate)
  const attackCombinedRate = roundOptionalWholeNumber(data.attackCombinedRate)
  const attackQualityRate = roundOptionalWholeNumber(data.attackQualityRate)
  const attackScoutPriorityRate = roundOptionalWholeNumber(data.attackScoutPriorityRate)
  const attackPriorityRate = roundOptionalWholeNumber(data.attackPriorityRate)

  const defensePerformance = roundOptionalWholeNumber(data.defensePerformance)
  const defensePerformanceRate = roundOptionalWholeNumber(data.defensePerformanceRate)
  const defenseRankingRate = roundOptionalWholeNumber(data.defenseRankingRate)
  const defenseCombinedRate = roundOptionalWholeNumber(data.defenseCombinedRate)
  const defenseQualityRate = roundOptionalWholeNumber(data.defenseQualityRate)
  const defenseScoutPriorityRate = roundOptionalWholeNumber(data.defenseScoutPriorityRate)
  const defensePriorityRate = roundOptionalWholeNumber(data.defensePriorityRate)

  return {
    ...buildTeamSeasonSearchMetrics({
      target: resolveTarget(data),
      leagueTotalRound: toNumberOrZero(data.leagueTotalRound),
      teamGamePlayed: toNumberOrZero(data.teamGamePlayed),
      points: toNumberOrZero(data.points),
      goalsFor: toNumberOrZero(data.goalsFor),
      goalsAgainst: toNumberOrZero(data.goalsAgainst),
    }),

    attackPerformance,
    attackPerformanceRate,
    attackPerformanceLevel: resolveTeamScoutPriorityLevel(
      attackPerformanceRate
    ),
    attackRankingRate,
    attackRankingLevel: resolveTeamScoutPriorityLevel(
      attackRankingRate
    ),
    attackCombinedRate,
    attackCombinedLevel: resolveTeamScoutPriorityLevel(
      attackCombinedRate
    ),
    attackQualityRate,
    attackScoutPriorityRate,
    attackPriorityRate,
    attackPriorityLevel: resolveTeamScoutPriorityLevel(
      attackPriorityRate
    ),
    attackAnomalyLevel: resolveTeamScoutAnomalyLevel(
      attackCombinedRate
    ),

    defensePerformance,
    defensePerformanceRate,
    defensePerformanceLevel: resolveTeamScoutPriorityLevel(
      defensePerformanceRate
    ),
    defenseRankingRate,
    defenseRankingLevel: resolveTeamScoutPriorityLevel(
      defenseRankingRate
    ),
    defenseCombinedRate,
    defenseCombinedLevel: resolveTeamScoutPriorityLevel(
      defenseCombinedRate
    ),
    defenseQualityRate,
    defenseScoutPriorityRate,
    defensePriorityRate,
    defensePriorityLevel: resolveTeamScoutPriorityLevel(
      defensePriorityRate
    ),
    defenseAnomalyLevel: resolveTeamScoutAnomalyLevel(
      defenseCombinedRate
    ),

    teamScoutPriorityLevels: buildTeamScoutPrioritySearchIds([
      resolveTeamScoutPriorityLevel(attackPriorityRate),
      resolveTeamScoutPriorityLevel(defensePriorityRate),
    ]),
  }
}

const buildNormalizationPatch = data => {
  const entityType = clean(data?.entityType)

  if (entityType === SEARCH_INDEX_ENTITY_TYPES.player) {
    return buildPlayerNormalizationPatch(data)
  }

  if (entityType === SEARCH_INDEX_ENTITY_TYPES.team) {
    return buildTeamNormalizationPatch(data)
  }

  return null
}

const commitNormalizationRows = async rows => {
  let updatedRowsCount = 0

  for (
    let startIndex = 0;
    startIndex < rows.length;
    startIndex += SEARCH_INDEX_NORMALIZATION_BATCH_SIZE
  ) {
    const rowsChunk = rows.slice(
      startIndex,
      startIndex + SEARCH_INDEX_NORMALIZATION_BATCH_SIZE
    )
    const batch = writeBatch(db)

    rowsChunk.forEach(({ ref, patch }) => {
      batch.set(
        ref,
        {
          ...patch,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    })

    await batch.commit()
    updatedRowsCount += rowsChunk.length
  }

  return updatedRowsCount
}

export async function rebuildSearchIndexNormalization({
  entityType = '',
  dryRun = false,
} = {}) {
  const normalizedEntityType = clean(entityType)
  const searchIndexesRef = collection(
    db,
    PLAYERS_DATABASE_COLLECTIONS.searchIndexes
  )
  const supportedEntityType = Object.values(SEARCH_INDEX_ENTITY_TYPES).includes(
    normalizedEntityType
  )
  const rowsQuery = supportedEntityType
    ? query(
      searchIndexesRef,
      where('entityType', '==', normalizedEntityType)
    )
    : query(searchIndexesRef)
  const snapshot = await getDocs(rowsQuery)
  const rows = []
  const counts = {
    scannedRowsCount: snapshot.docs.length,
    playerRowsCount: 0,
    teamRowsCount: 0,
    skippedRowsCount: 0,
    updatedRowsCount: 0,
  }

  snapshot.docs.forEach(indexDoc => {
    const data = indexDoc.data() || {}
    const patch = buildNormalizationPatch(data)

    if (!patch) {
      counts.skippedRowsCount += 1
      return
    }

    if (clean(data.entityType) === SEARCH_INDEX_ENTITY_TYPES.player) {
      counts.playerRowsCount += 1
    } else {
      counts.teamRowsCount += 1
    }

    rows.push({ ref: indexDoc.ref, patch })
  })

  if (!dryRun && rows.length > 0) {
    counts.updatedRowsCount = await commitNormalizationRows(rows)
  }

  return {
    ...counts,
    dryRun: Boolean(dryRun),
    entityType: supportedEntityType ? normalizedEntityType : 'all',
  }
}
