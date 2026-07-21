// features/playersDatabase/services/write/searchIndex/team/teamSeasonIndex.upsert.js

import { doc, writeBatch } from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { clean } from '../../leagues/leagueDoc.js'
import { resolveTeamLookupKey } from '../../../../model/teamIdentity.model.js'
import { buildSearchIndexWriteResult, SEARCH_INDEX_ENTITY_TYPES } from '../shared/searchIndexResult.model.js'
import { commitBatchWhenNeeded } from '../shared/searchIndexBatch.write.js'
import {
  buildRankMap,
  buildTeamSeasonIndexDoc,
  getRowGoalsAgainst,
  getRowGoalsFor,
} from './teamSeasonIndex.model.js'

export async function upsertTeamSeasonSearchIndexMany({
  league = {},
  season = {},
  target = 'current',
  rows = [],
} = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonId = clean(season.seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')

  const safeRows = Array.isArray(rows) ? rows : []
  const tableAttackRanks = buildRankMap({
    rows: safeRows,
    valueGetter: getRowGoalsFor,
    direction: 'desc',
  })
  const tableDefenseRanks = buildRankMap({
    rows: safeRows,
    valueGetter: getRowGoalsAgainst,
    direction: 'asc',
  })

  const batch = writeBatch(db)
  const docs = safeRows
    .map(row => {
      const rowKey = clean(resolveTeamLookupKey(row) || row.clubId)
      return buildTeamSeasonIndexDoc({
        league,
        season,
        target,
        row,
        tableAttackRank: tableAttackRanks[rowKey],
        tableDefenseRank: tableDefenseRanks[rowKey],
      })
    })
    .filter(row => row.id && row.leagueId && row.seasonId && (row.teamId || row.clubId))

  docs.forEach(indexDoc => {
    batch.set(
      doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, indexDoc.id),
      indexDoc,
      { merge: true }
    )
  })

  await commitBatchWhenNeeded({ batch, operationsCount: docs.length })

  return buildSearchIndexWriteResult({
    entityType: SEARCH_INDEX_ENTITY_TYPES.teamSeason,
    operation: 'upsertMany',
    rowsCount: docs.length,
  })
}
