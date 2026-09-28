// src/features/playersDatabase/services/writeV2/stats/flows/syncStatsTeamLeague.flow.js

import {
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { SEARCHINDEX_BIRTH_TEAM_SEASON_GENERIC_OBJECT } from '../../../../catalog/firestoreDocuments/searchIndexBirthTeamSeason.catalog.js'
import { APPROVED_STATS_STATE_VERSION } from '../../../../domain/statsV2/approvedStatsState.builder.js'
import {
  pickOwnedFields,
  STATS_TEAM_INDEX_OWNED_FIELDS,
} from '../support/statsProjectionOwnership.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const TEAM_INDEX_CREATE_FIELDS = new Set(Object.keys(SEARCHINDEX_BIRTH_TEAM_SEASON_GENERIC_OBJECT))

const assertApproved = approved => {
  if (approved?.planType !== 'approvedStatsState' || approved?.planVersion !== APPROVED_STATS_STATE_VERSION) {
    const error = new Error('Invalid Approved Stats State')
    error.code = 'STATS_APPROVED_STATE_INVALID'
    throw error
  }
}

const validateTeamIndex = (teamIndex, approved) => {
  const action = clean(teamIndex?.action)
  if (!teamIndex?.docId || !teamIndex?.fields || !['create', 'update'].includes(action)) {
    const error = new Error('Missing approved Team SearchIndex patch')
    error.code = 'STATS_TEAM_INDEX_PATCH_MISSING'
    throw error
  }

  if (action === 'update') {
    return pickOwnedFields({
      fields: teamIndex.fields,
      allowed: STATS_TEAM_INDEX_OWNED_FIELDS,
      code: 'STATS_TEAM_INDEX_SCOPE_INVALID',
    })
  }

  const keys = Object.keys(teamIndex.fields)
  const forbidden = keys.find(key => !TEAM_INDEX_CREATE_FIELDS.has(key))
  const missing = [...TEAM_INDEX_CREATE_FIELDS].find(key => (
    key !== 'updatedAt' && !Object.prototype.hasOwnProperty.call(teamIndex.fields, key)
  ))
  if (forbidden || missing) {
    const error = new Error(`Invalid Team SearchIndex create payload: ${forbidden || missing}`)
    error.code = 'STATS_TEAM_INDEX_CREATE_INVALID'
    throw error
  }

  const identity = approved?.identity || {}
  const expectedIdentity = {
    id: clean(teamIndex.docId),
    entityId: clean(teamIndex.docId),
    entityType: 'birthTeamSeason',
    leagueId: clean(identity.leagueId),
    seasonKey: clean(identity.seasonKey),
    birthTeamDocumentId: clean(identity.birthTeamDocumentId),
  }
  const invalidIdentity = Object.entries(expectedIdentity).find(([key, expected]) => (
    clean(teamIndex.fields?.[key]) !== expected
  ))
  if (invalidIdentity) {
    const error = new Error(`Invalid Team SearchIndex create identity: ${invalidIdentity[0]}`)
    error.code = 'STATS_TEAM_INDEX_CREATE_IDENTITY_INVALID'
    throw error
  }

  return teamIndex.fields
}

export async function syncStatsTeamLeagueV2({ approved } = {}) {
  assertApproved(approved)

  const teamIndex = approved.teamSearchIndexPatch || {}
  const leaguePatch = approved.leaguePatch || {}
  const master = approved.leaguesMasterPatch || {}
  const teamFields = validateTeamIndex(teamIndex, approved)
  const teamIndexDocId = clean(teamIndex.docId)
  const leagueId = clean(leaguePatch.leagueId || approved.identity?.leagueId)
  const target = clean(leaguePatch.target)

  if (!leagueId || !['current', 'history'].includes(target)) {
    const error = new Error('Missing approved League write payload')
    error.code = 'STATS_LEAGUE_PATCH_MISSING'
    throw error
  }
  if (target === 'current' && !Array.isArray(leaguePatch.tableRank)) {
    const error = new Error('Missing approved current League tableRank')
    error.code = 'STATS_LEAGUE_PATCH_MISSING'
    throw error
  }
  if (target === 'history' && !Array.isArray(leaguePatch.history)) {
    const error = new Error('Missing approved League history')
    error.code = 'STATS_LEAGUE_PATCH_MISSING'
    throw error
  }
  if (!master.id || !Array.isArray(master.leagues) || !master.summary) {
    const error = new Error('Missing approved Leagues Master state')
    error.code = 'STATS_LEAGUES_MASTER_STATE_MISSING'
    throw error
  }

  const teamIndexRef = doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, teamIndexDocId)
  const leagueRef = doc(db, PLAYERS_DATABASE_COLLECTIONS.leagues, leagueId)
  const masterRef = doc(db, PLAYERS_DATABASE_COLLECTIONS.leaguesMaster, clean(master.id))
  const batch = writeBatch(db)

  batch.set(
    teamIndexRef,
    { ...teamFields, updatedAt: serverTimestamp() },
    { merge: teamIndex.action === 'update' }
  )

  if (target === 'current') {
    batch.update(leagueRef, {
      'current.tableRank': leaguePatch.tableRank,
      updatedAt: serverTimestamp(),
    })
  } else {
    batch.update(leagueRef, {
      history: leaguePatch.history,
      updatedAt: serverTimestamp(),
    })
  }

  batch.set(masterRef, {
    id: clean(master.id),
    docType: clean(master.docType) || 'leagues_master',
    leagues: master.leagues,
    summary: master.summary,
    updatedAt: serverTimestamp(),
  }, { merge: true })

  await batch.commit()

  return {
    teamSearchIndexUpdated: true,
    leagueUpdated: true,
    leaguesMasterUpdated: true,
  }
}
