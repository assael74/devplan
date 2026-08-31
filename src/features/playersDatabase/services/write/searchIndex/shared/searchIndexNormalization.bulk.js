// features/playersDatabase/services/write/searchIndex/shared/searchIndexNormalization.bulk.js

import {
  collection,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import {
  createTrackedWriteBatch,
  trackedGetDocs,
} from '../../../../../../services/firestore/usage/index.js'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import {
  clean,
  toNumberOrZero,
} from '../../leagues/leagueDoc.js'
import { rebuildTeamSeasonSearchIndexesFromLeagues } from '../team/teamSeasonIndex.rebuild.js'
import { buildExpectedLevelKey } from './expectedLevelDelta.model.js'
import { buildPlayerSeasonSearchMetrics } from './searchIndexNormalization.model.js'

const readSearchIndexes = queryRef => trackedGetDocs(queryRef, {
  feature: 'playersDatabase',
  collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
  action: 'searchIndexNormalization-bulk',
  operationSubtype: 'maintenance-query',
})

const SEARCH_INDEX_NORMALIZATION_BATCH_SIZE = 450

const SEARCH_INDEX_ENTITY_TYPES = {
  player: 'playerSeason',
  team: 'birthTeamSeason',
}

const resolveTarget = data => {
  if (clean(data?.sourceCollection) === 'birthTeamSeasons') {
    return clean(data?.seasonStatus).toLowerCase() === 'completed'
      ? 'history'
      : 'current'
  }

  return clean(data?.sourceTarget) === 'history' ? 'history' : 'current'
}

const buildPlayerNormalizationPatch = ({ data = {}, teamDeltaByKey = new Map() } = {}) => ({
  ...buildPlayerSeasonSearchMetrics({
    target: resolveTarget(data),
    ageGroupId: data.ageGroupId,
    leagueTotalRound: toNumberOrZero(data.leagueTotalRound),
    teamGamePlayed: toNumberOrZero(data.teamGamePlayed || data.teamGames),
    stats: {
      games: toNumberOrZero(data.games),
      goals: toNumberOrZero(data.goals),
      minutes: toNumberOrZero(data.minutes),
      starts: toNumberOrZero(data.starts),
      teamGames: toNumberOrZero(data.teamGames),
    },
  }),
  expectedLevelDelta: data.isYoungerAgeGroup
    ? null
    : teamDeltaByKey.has(buildExpectedLevelKey(data))
      ? teamDeltaByKey.get(buildExpectedLevelKey(data))
      : null,
})

const commitNormalizationRows = async rows => {
  let updatedRowsCount = 0

  for (let startIndex = 0; startIndex < rows.length; startIndex += SEARCH_INDEX_NORMALIZATION_BATCH_SIZE) {
    const rowsChunk = rows.slice(startIndex, startIndex + SEARCH_INDEX_NORMALIZATION_BATCH_SIZE)
    const batch = createTrackedWriteBatch(db, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    action: 'searchIndexNormalization-bulk',
    operationSubtype: 'maintenance-batch',
  })

    rowsChunk.forEach(({ ref, patch }) => {
      batch.set(ref, {
        ...patch,
        updatedAt: serverTimestamp(),
      }, { merge: true })
    })

    await batch.commit()
    updatedRowsCount += rowsChunk.length
  }

  return updatedRowsCount
}

const rebuildPlayerRows = async ({ dryRun = false, teamDeltaByKey = new Map() } = {}) => {
  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('entityType', '==', SEARCH_INDEX_ENTITY_TYPES.player)
  )
  const snapshot = await readSearchIndexes(rowsQuery)
  let playerDeltaMatchedCount = 0
  let playerDeltaUnknownCount = 0
  const rows = snapshot.docs.map(indexDoc => {
    const data = indexDoc.data() || {}
    const patch = buildPlayerNormalizationPatch({
      data,
      teamDeltaByKey,
    })

    if (patch.expectedLevelDelta === null) playerDeltaUnknownCount += 1
    else playerDeltaMatchedCount += 1

    return {
      ref: indexDoc.ref,
      patch,
    }
  })
  const updatedRowsCount = !dryRun && rows.length > 0
    ? await commitNormalizationRows(rows)
    : 0

  return {
    scannedRowsCount: snapshot.docs.length,
    playerRowsCount: rows.length,
    updatedRowsCount,
    playerDeltaMatchedCount,
    playerDeltaUnknownCount,
  }
}

const emptyPlayerResult = {
  scannedRowsCount: 0,
  playerRowsCount: 0,
  updatedRowsCount: 0,
  playerDeltaMatchedCount: 0,
  playerDeltaUnknownCount: 0,
}

const emptyTeamResult = {
  scannedLeaguesCount: 0,
  scannedSeasonsCount: 0,
  skippedSeasonsCount: 0,
  teamRowsCount: 0,
  updatedRowsCount: 0,
  teamDeltaCalculatedCount: 0,
  teamDeltaUnknownCount: 0,
  teamDeltaByKey: new Map(),
}

export async function rebuildSearchIndexNormalization({
  entityType = '',
  dryRun = false,
} = {}) {
  const normalizedEntityType = clean(entityType)
  const includePlayers = !normalizedEntityType || normalizedEntityType === SEARCH_INDEX_ENTITY_TYPES.player
  const includeTeams = !normalizedEntityType || normalizedEntityType === SEARCH_INDEX_ENTITY_TYPES.team

  const teamResult = includeTeams || includePlayers
    ? await rebuildTeamSeasonSearchIndexesFromLeagues({ dryRun: includeTeams ? dryRun : true })
    : emptyTeamResult
  const playerResult = includePlayers
    ? await rebuildPlayerRows({
      dryRun,
      teamDeltaByKey: teamResult.teamDeltaByKey,
    })
    : emptyPlayerResult

  return {
    scannedRowsCount: playerResult.scannedRowsCount + teamResult.teamRowsCount,
    playerRowsCount: playerResult.playerRowsCount,
    teamRowsCount: includeTeams ? teamResult.teamRowsCount : 0,
    skippedRowsCount: includeTeams ? teamResult.skippedSeasonsCount : 0,
    updatedRowsCount: playerResult.updatedRowsCount + (includeTeams ? teamResult.updatedRowsCount : 0),
    scannedLeaguesCount: includeTeams ? teamResult.scannedLeaguesCount : 0,
    scannedSeasonsCount: includeTeams ? teamResult.scannedSeasonsCount : 0,
    skippedSeasonsCount: includeTeams ? teamResult.skippedSeasonsCount : 0,
    teamDeltaCalculatedCount: includeTeams ? teamResult.teamDeltaCalculatedCount : 0,
    teamDeltaUnknownCount: includeTeams ? teamResult.teamDeltaUnknownCount : 0,
    playerDeltaMatchedCount: playerResult.playerDeltaMatchedCount,
    playerDeltaUnknownCount: playerResult.playerDeltaUnknownCount,
    dryRun: Boolean(dryRun),
    entityType: normalizedEntityType || 'all',
  }
}
