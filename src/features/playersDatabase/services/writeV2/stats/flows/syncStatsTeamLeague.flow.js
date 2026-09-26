// src/features/playersDatabase/services/writeV2/stats/flows/syncStatsTeamLeague.flow.js

import {
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { APPROVED_STATS_STATE_VERSION } from '../../../../domain/statsV2/approvedStatsState.builder.js'
import {
  pickOwnedFields,
  STATS_LEAGUE_TEAM_OWNED_FIELDS,
  STATS_TEAM_INDEX_OWNED_FIELDS,
} from '../support/statsProjectionOwnership.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const sameValue = (left, right) => JSON.stringify(left ?? null) === JSON.stringify(right ?? null)

const assertApproved = approved => {
  if (approved?.planType !== 'approvedStatsState' || approved?.planVersion !== APPROVED_STATS_STATE_VERSION) {
    const error = new Error('Invalid Approved Stats State')
    error.code = 'STATS_APPROVED_STATE_INVALID'
    throw error
  }
}

const resolveLeagueSeason = ({ league = {}, seasonKey = '' } = {}) => {
  if (clean(league?.current?.seasonKey) === seasonKey) {
    return { target: 'current', season: league.current }
  }

  const history = Array.isArray(league?.history) ? league.history : []
  const index = history.findIndex(row => clean(row?.seasonKey) === seasonKey)
  if (index >= 0) return { target: 'history', index, season: history[index] }

  return null
}

const resolveTeamRowIndex = ({ tableRank = [], birthTeamDocumentId = '' } = {}) => (
  (Array.isArray(tableRank) ? tableRank : []).findIndex(row => clean(
    row?.birthTeamDocumentId || row?.birthTeamId || row?.teamDocumentId || row?.teamId
  ) === birthTeamDocumentId)
)

const applyLeagueMetadataPatch = ({ league = {}, approved = {} } = {}) => {
  const patchState = approved.leagueMetadataPatch || {}
  const seasonKey = clean(patchState.seasonKey || approved.identity?.seasonKey)
  const birthTeamDocumentId = clean(
    patchState.birthTeamDocumentId || approved.identity?.birthTeamDocumentId
  )
  const fields = pickOwnedFields({
    fields: patchState.fields,
    allowed: STATS_LEAGUE_TEAM_OWNED_FIELDS,
    code: 'STATS_LEAGUE_PATCH_SCOPE_INVALID',
  })
  const resolved = resolveLeagueSeason({ league, seasonKey })

  if (!resolved) {
    const error = new Error('Approved League season was not found')
    error.code = 'STATS_LEAGUE_SEASON_NOT_FOUND'
    throw error
  }

  const tableRank = Array.isArray(resolved.season?.tableRank) ? resolved.season.tableRank : []
  const rowIndex = resolveTeamRowIndex({ tableRank, birthTeamDocumentId })
  if (rowIndex < 0) {
    const error = new Error('Approved League team row was not found')
    error.code = 'STATS_LEAGUE_TEAM_ROW_NOT_FOUND'
    throw error
  }

  const nextTableRank = [...tableRank]
  nextTableRank[rowIndex] = {
    ...nextTableRank[rowIndex],
    ...fields,
  }

  if (resolved.target === 'current') {
    return {
      ...league,
      current: {
        ...league.current,
        tableRank: nextTableRank,
      },
    }
  }

  const nextHistory = [...(Array.isArray(league.history) ? league.history : [])]
  nextHistory[resolved.index] = {
    ...nextHistory[resolved.index],
    tableRank: nextTableRank,
  }

  return { ...league, history: nextHistory }
}

export async function syncStatsTeamLeagueV2({ approved } = {}) {
  assertApproved(approved)

  const teamIndex = approved.teamSearchIndexPatch || {}
  const leaguePatch = approved.leagueMetadataPatch || {}
  const master = approved.leaguesMasterPatch || {}
  const teamIndexDocId = clean(teamIndex.docId)
  const leagueId = clean(approved.identity?.leagueId)

  if (!teamIndexDocId || !teamIndex.fields) {
    const error = new Error('Missing approved Team SearchIndex patch')
    error.code = 'STATS_TEAM_INDEX_PATCH_MISSING'
    throw error
  }
  if (!leaguePatch.fields) {
    const error = new Error('Missing approved League metadata patch')
    error.code = 'STATS_LEAGUE_PATCH_MISSING'
    throw error
  }
  if (!master.id || !Array.isArray(master.leagues) || !master.summary) {
    const error = new Error('Missing approved Leagues Master state')
    error.code = 'STATS_LEAGUES_MASTER_STATE_MISSING'
    throw error
  }

  const teamFields = pickOwnedFields({
    fields: teamIndex.fields,
    allowed: STATS_TEAM_INDEX_OWNED_FIELDS,
    code: 'STATS_TEAM_INDEX_SCOPE_INVALID',
  })
  const teamIndexRef = doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, teamIndexDocId)
  const leagueRef = doc(db, PLAYERS_DATABASE_COLLECTIONS.leagues, leagueId)
  const masterRef = doc(db, PLAYERS_DATABASE_COLLECTIONS.leaguesMaster, clean(master.id))

  const [teamSnapshot, leagueSnapshot, masterSnapshot] = await Promise.all([
    getDoc(teamIndexRef),
    getDoc(leagueRef),
    getDoc(masterRef),
  ])

  if (!teamSnapshot.exists()) {
    const error = new Error('Team SearchIndex document was not found')
    error.code = 'STATS_TEAM_INDEX_NOT_FOUND'
    throw error
  }
  if (!leagueSnapshot.exists()) {
    const error = new Error('Canonical League document was not found')
    error.code = 'STATS_LEAGUE_NOT_FOUND'
    throw error
  }
  if (!masterSnapshot.exists()) {
    const error = new Error('Leagues Master document was not found')
    error.code = 'STATS_LEAGUES_MASTER_NOT_FOUND'
    throw error
  }

  const existingTeam = teamSnapshot.data() || {}
  const canonicalLeague = { id: leagueSnapshot.id, ...(leagueSnapshot.data() || {}) }
  const projectedLeague = applyLeagueMetadataPatch({ league: canonicalLeague, approved })
  const existingMaster = masterSnapshot.data() || {}

  const teamChanged = Object.entries(teamFields).some(([key, value]) => !sameValue(existingTeam[key], value))
  const leagueChanged = !sameValue(canonicalLeague, projectedLeague)
  const masterFields = {
    id: clean(master.id),
    docType: clean(master.docType) || 'leagues_master',
    leagues: master.leagues,
    summary: master.summary,
  }
  const masterChanged = Object.entries(masterFields).some(([key, value]) => !sameValue(existingMaster[key], value))

  if (teamChanged || leagueChanged || masterChanged) {
    const batch = writeBatch(db)

    if (teamChanged) {
      batch.set(teamIndexRef, { ...teamFields, updatedAt: serverTimestamp() }, { merge: true })
    }
    if (leagueChanged) {
      const { id, ...leagueData } = projectedLeague
      batch.set(leagueRef, { ...leagueData, updatedAt: serverTimestamp() })
    }
    if (masterChanged) {
      batch.set(masterRef, { ...masterFields, updatedAt: serverTimestamp() }, { merge: true })
    }

    await batch.commit()
  }

  return {
    teamSearchIndexUpdated: teamChanged,
    leagueUpdated: leagueChanged,
    leaguesMasterUpdated: masterChanged,
  }
}

export { applyLeagueMetadataPatch }
