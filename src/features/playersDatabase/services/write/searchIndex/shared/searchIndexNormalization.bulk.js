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
import { rebuildTeamSeasonSearchIndexesFromLeagues } from '../team/teamSeasonIndex.rebuild.js'
import { buildPlayerSeasonSearchMetrics } from './searchIndexNormalization.model.js'

const SEARCH_INDEX_NORMALIZATION_BATCH_SIZE = 450

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

const rebuildPlayerRows = async ({ dryRun = false } = {}) => {
  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('entityType', '==', SEARCH_INDEX_ENTITY_TYPES.player)
  )
  const snapshot = await getDocs(rowsQuery)
  const rows = snapshot.docs.map(indexDoc => ({
    ref: indexDoc.ref,
    patch: buildPlayerNormalizationPatch(indexDoc.data() || {}),
  }))
  const updatedRowsCount = !dryRun && rows.length > 0
    ? await commitNormalizationRows(rows)
    : 0

  return {
    scannedRowsCount: snapshot.docs.length,
    playerRowsCount: rows.length,
    updatedRowsCount,
  }
}

export async function rebuildSearchIndexNormalization({
  entityType = '',
  dryRun = false,
} = {}) {
  const normalizedEntityType = clean(entityType)
  const includePlayers = !normalizedEntityType || (
    normalizedEntityType === SEARCH_INDEX_ENTITY_TYPES.player
  )
  const includeTeams = !normalizedEntityType || (
    normalizedEntityType === SEARCH_INDEX_ENTITY_TYPES.team
  )
  const playerResult = includePlayers
    ? await rebuildPlayerRows({ dryRun })
    : {
      scannedRowsCount: 0,
      playerRowsCount: 0,
      updatedRowsCount: 0,
    }
  const teamResult = includeTeams
    ? await rebuildTeamSeasonSearchIndexesFromLeagues({ dryRun })
    : {
      scannedLeaguesCount: 0,
      scannedSeasonsCount: 0,
      skippedSeasonsCount: 0,
      teamRowsCount: 0,
      updatedRowsCount: 0,
    }

  return {
    scannedRowsCount:
      playerResult.scannedRowsCount + teamResult.teamRowsCount,
    playerRowsCount: playerResult.playerRowsCount,
    teamRowsCount: teamResult.teamRowsCount,
    skippedRowsCount: teamResult.skippedSeasonsCount,
    updatedRowsCount:
      playerResult.updatedRowsCount + teamResult.updatedRowsCount,
    scannedLeaguesCount: teamResult.scannedLeaguesCount,
    scannedSeasonsCount: teamResult.scannedSeasonsCount,
    skippedSeasonsCount: teamResult.skippedSeasonsCount,
    dryRun: Boolean(dryRun),
    entityType: normalizedEntityType || 'all',
  }
}
