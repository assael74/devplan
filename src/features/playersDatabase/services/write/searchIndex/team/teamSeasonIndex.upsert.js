// src/features/playersDatabase/services/write/searchIndex/team/teamSeasonIndex.upsert.js

import { doc } from 'firebase/firestore'
import { createTrackedWriteBatch } from '../../../../../../services/firestore/usage/index.js'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { clean } from '../../leagues/leagueDoc.js'
import { buildTeamScoutShadowAudit } from '../../../../domain/orchestration/buildTeamScoutShadowAudit.js'
import {
  buildSearchIndexWriteResult,
  SEARCH_INDEX_ENTITY_TYPES,
} from '../shared/searchIndexResult.model.js'
import { commitBatchWhenNeeded } from '../shared/searchIndexBatch.write.js'
import {
  buildTeamSeasonIndexDoc,
} from './teamSeasonIndex.model.js'
import {
  buildCanonicalLeagueTeamScoutContexts,
} from '../../shared/leagueTeamScoutContext.js'

const TEAM_SEARCH_INDEX_TEAM_OWNED_FIELDS = new Set([
  'playersCount',
  'scoutProfilesSummary',
  'teamSeasonDocumentId',
  'teamUrl',
])

const stripTeamOwnedFieldsFromLeagueProjection = indexDoc => (
  Object.fromEntries(
    Object.entries(indexDoc || {}).filter(([key]) => (
      !TEAM_SEARCH_INDEX_TEAM_OWNED_FIELDS.has(key)
    ))
  )
)

export const buildTeamSeasonSearchIndexDocuments = ({ league = {}, season = {}, target = 'current', rows = [] } = {}) => {
  const { scoutRows, contexts } = buildCanonicalLeagueTeamScoutContexts({
    league,
    season,
    target,
    rows,
  })
  const documents = contexts
    .map(({ row, teamPerformance, scoutResult }) => {

      return buildTeamSeasonIndexDoc({
        league,
        season,
        target,
        row,
        teamPerformance,
        scoutResult,
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
