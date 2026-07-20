// features/playersDatabase/services/write/leagues/leagueDoc.js

import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

export const clean = value => String(value ?? '').trim()

export const buildSeasonKey = seasonId =>
  clean(seasonId).replace(/[^0-9a-zA-Z]+/g, '_')

export const toNumberOrZero = value => {
  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : 0
}

export const cleanTeamStatsComputedFields = (teamStats = {}) => {
  const {
    attackPerformance,
    defensePerformance,
    attackNormalPerformance,
    defenseNormalPerformance,
    scoutPerformance,
    ...truthStats
  } = teamStats || {}

  return truthStats
}

export const cleanTableRankComputedFields = tableRank =>
  (Array.isArray(tableRank) ? tableRank : []).map(row => ({
    ...row,
    teamStats: cleanTeamStatsComputedFields(row?.teamStats),
  }))

export const cleanSeasonComputedFields = (season = {}) => {
  const {
    goalsEnvironment,
    scoutEnvironment,
    ...seasonDoc
  } = season || {}

  return {
    ...seasonDoc,
    tableRank: cleanTableRankComputedFields(seasonDoc.tableRank),
  }
}

export const leagueDocRef = leagueId =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.leagues, clean(leagueId))

export const buildLeagueBaseDoc = (league = {}, currentData = {}) => ({
  id: clean(league.id),
  leagueId: clean(league.id),
  leagueName: clean(league.name || currentData.leagueName),
  region: clean(league.region || currentData.region),
  ageGroupId: clean(league.ageGroupId || currentData.ageGroupId),
  ageGroupLabel: clean(league.ageGroupLabel || currentData.ageGroupLabel),
  level: league.level ?? currentData.level ?? null,
  current: currentData.current ? cleanSeasonComputedFields(currentData.current) : null,
  history: Array.isArray(currentData.history)
    ? currentData.history.map(cleanSeasonComputedFields)
    : [],
  createdAt: currentData.createdAt || serverTimestamp(),
  updatedAt: serverTimestamp(),
})

export async function ensureLeagueDoc(league = {}) {
  const leagueId = clean(league.id)
  if (!leagueId) throw new Error('Missing league id')

  const ref = leagueDocRef(leagueId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const docData = buildLeagueBaseDoc(league, currentData)

    transaction.set(ref, docData, { merge: true })

    return {
      leagueId,
      created: !snapshot.exists(),
    }
  })
}
