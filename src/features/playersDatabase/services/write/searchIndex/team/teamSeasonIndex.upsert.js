// src/features/playersDatabase/services/write/searchIndex/team/teamSeasonIndex.upsert.js

import { doc } from 'firebase/firestore'
import { createTrackedWriteBatch } from '../../../../../../services/firestore/usage/index.js'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { clean } from '../../leagues/leagueDoc.js'
import { resolveTeamLookupKey } from '../../../../model/teamIdentity.model.js'
import { buildTeamScoutShadowAudit } from '../../../../domain/orchestration/buildTeamScoutShadowAudit.js'
import {
  buildSearchIndexWriteResult,
  SEARCH_INDEX_ENTITY_TYPES,
} from '../shared/searchIndexResult.model.js'
import { commitBatchWhenNeeded } from '../shared/searchIndexBatch.write.js'
import {
  buildTeamScoutLeagueModel,
  TEAM_SCOUT_NORMALIZATION_MODE,
  TEAM_SCOUT_SORT_MODE,
} from '../../../../../../shared/scouting/teams/index.js'
import {
  buildRankMap,
  buildTeamSeasonIndexDoc,
  getRowGoalsAgainst,
  getRowGoalsFor,
  resolveClubLevel,
  resolveClubStrengthLevel,
} from './teamSeasonIndex.model.js'

const TEAM_SEARCH_INDEX_TEAM_OWNED_FIELDS = new Set([
  'playersCount',
  'scoutProfilesSummary',
  'teamUrl',
])

const stripTeamOwnedFieldsFromLeagueProjection = indexDoc => (
  Object.fromEntries(
    Object.entries(indexDoc || {}).filter(([key]) => (
      !TEAM_SEARCH_INDEX_TEAM_OWNED_FIELDS.has(key)
    ))
  )
)

const buildScoutRows = rows => (
  (Array.isArray(rows) ? rows : []).map(row => {
    const clubLevel = resolveClubLevel({
      clubId: row.clubId,
      clubLevel: row.clubLevel,
    })
    const clubStrengthLevel = resolveClubStrengthLevel({
      clubId: row.clubId,
      clubLevel,
      clubStrengthLevel: row.clubStrengthLevel,
    })

    return {
      ...row,
      clubLevel,
      clubStrengthLevel,
    }
  })
)

export const buildTeamSeasonSearchIndexDocuments = ({ league = {}, season = {}, target = 'current', rows = [] } = {}) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const scoutRows = buildScoutRows(safeRows)
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
  const scoutResultMap = new Map(
    buildTeamScoutLeagueModel({
      leagueLevel: league.level,
      leagueNumGames: season.leagueTotalRound || 30,
      rows: scoutRows,
      normalizationMode: TEAM_SCOUT_NORMALIZATION_MODE.AUTO,
      sortMode: TEAM_SCOUT_SORT_MODE.TABLE,
    }).rows.map(row => [
      clean(resolveTeamLookupKey(row) || row.clubId || row.rank),
      row,
    ])
  )
  const documents = safeRows
    .map(row => {
      const rowKey = clean(resolveTeamLookupKey(row) || row.clubId)

      return buildTeamSeasonIndexDoc({
        league,
        season,
        target,
        row,
        tableAttackRank: tableAttackRanks[rowKey],
        tableDefenseRank: tableDefenseRanks[rowKey],
        scoutResult: scoutResultMap.get(rowKey) || null,
      })
    })
    .filter(row => row.id && row.leagueId && row.seasonId && (row.teamId || row.clubId))

  return {
    documents,
    scoutRows,
  }
}

export async function upsertTeamSeasonSearchIndexMany({ league = {}, season = {}, target = 'current', rows = [] } = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonId = clean(season.seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')

  const {
    documents,
    scoutRows,
  } = buildTeamSeasonSearchIndexDocuments({
    league,
    season,
    target,
    rows,
  })
  const batch = createTrackedWriteBatch(db, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    action: 'teamSeasonIndex-upsert',
    operationSubtype: 'maintenance-batch',
  })

  documents.forEach(indexDoc => {
    const leagueProjection = stripTeamOwnedFieldsFromLeagueProjection(indexDoc)

    // Ownership contract: this upsert owns League/Performance fields only.
    // Team-owned roster/Scout/Balance fields share the document and are stripped
    // explicitly before merge so a League refresh cannot overwrite them.
    batch.set(
      doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, indexDoc.id),
      leagueProjection,
      { merge: true }
    )
  })

  await commitBatchWhenNeeded({
    batch,
    operationsCount: documents.length,
  })

  let shadowAudit = null

  try {
    shadowAudit = buildTeamScoutShadowAudit({
      league,
      season,
      rows: scoutRows,
    })
  } catch (error) {
    shadowAudit = {
      engineVersion: 'scouting-v2',
      mode: 'primary-diagnostics',
      status: 'failed',
      error: error?.message || 'Team shadow scout calculation failed',
    }
  }

  return buildSearchIndexWriteResult({
    entityType: SEARCH_INDEX_ENTITY_TYPES.teamSeason,
    operation: 'upsertMany',
    rowsCount: documents.length,
    shadowAudit,
  })
}
