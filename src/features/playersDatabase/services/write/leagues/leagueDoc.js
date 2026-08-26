// features/playersDatabase/services/write/leagues/leagueDoc.js

import {
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  cleanValue,
  toNumberOrZero,
  pickDefinedValue,
} from '../../../model/value.model.js'
import { buildSeasonKey } from '../../../model/season.model.js'
import { syncLeaguesMasterDocument } from './leaguesMaster.js'

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
export { buildSeasonKey, toNumberOrZero }
export const clean = cleanValue

const normalizeLeagueLevel = value => {
  if (value === null || value === undefined || value === '') return null
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

export const cleanTeamStatsComputedFields = (teamStats = {}) => {
  const {
    attackPerformance,
    defensePerformance,
    attackNormalPerformance,
    defenseNormalPerformance,
    scoutPerformance,
    ...cleanTeamStats
  } = teamStats || {}

  return cleanTeamStats
}

export const cleanTableRankComputedFields = tableRank => {
  if (tableRank === null || tableRank === undefined) return null
  if (!Array.isArray(tableRank)) return tableRank

  return tableRank.map(row => ({
    ...row,
    teamStats: cleanTeamStatsComputedFields(row?.teamStats),
  }))
}

export const cleanSeasonComputedFields = (season = {}) => {
  const {
    goalsEnvironment,
    scoutEnvironment,
    teamsCount,
    tableRankCount,
    playersCount,
    playersWithScoutProfileCount,
    scoutProfilesCount,
    ...cleanSeason
  } = season || {}

  return {
    ...cleanSeason,
    tableRank: cleanTableRankComputedFields(season?.tableRank),
  }
}

const hasLeagueSeasonIdentity = season => Boolean(
  clean(season?.seasonId) || clean(season?.seasonKey)
)

export const leagueDocRef = leagueId =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.leagues, clean(leagueId))

export const buildLeagueBaseDoc = (league = {}, currentData = {}) => ({
  id: clean(league.id),
  leagueId: clean(league.id),
  leagueName: clean(league.name || currentData.leagueName),
  region: clean(league.region || currentData.region),
  ageGroupId: clean(league.ageGroupId || currentData.ageGroupId),
  ageGroupLabel: clean(league.ageGroupLabel || currentData.ageGroupLabel),
  level: normalizeLeagueLevel(
    pickDefinedValue(league.level, currentData.level, null)
  ),
  current: hasLeagueSeasonIdentity(currentData.current)
    ? cleanSeasonComputedFields(currentData.current)
    : null,
  history: Array.isArray(currentData.history)
    ? currentData.history.map(cleanSeasonComputedFields)
    : [],
  createdAt: currentData.createdAt || serverTimestamp(),
  updatedAt: serverTimestamp(),
})


const isSameLeagueRootState = (currentData = {}, nextData = {}) => {
  const current = {
    id: clean(currentData.id),
    leagueId: clean(currentData.leagueId),
    leagueName: clean(currentData.leagueName),
    region: clean(currentData.region),
    ageGroupId: clean(currentData.ageGroupId),
    ageGroupLabel: clean(currentData.ageGroupLabel),
    level: normalizeLeagueLevel(currentData.level),
  }
  const next = {
    id: clean(nextData.id),
    leagueId: clean(nextData.leagueId),
    leagueName: clean(nextData.leagueName),
    region: clean(nextData.region),
    ageGroupId: clean(nextData.ageGroupId),
    ageGroupLabel: clean(nextData.ageGroupLabel),
    level: normalizeLeagueLevel(nextData.level),
  }

  return JSON.stringify(current) === JSON.stringify(next)
}

export async function ensureLeagueDoc(league = {}, options = {}) {
  const leagueId = clean(league.id)
  if (!leagueId) throw new Error('Missing league id')

  const ref = leagueDocRef(leagueId)

  const result = await trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const docData = buildLeagueBaseDoc(league, currentData)
    const writeSkipped = Boolean(
      snapshot.exists() &&
      isSameLeagueRootState(currentData, docData)
    )

    if (!writeSkipped) {
      transaction.set(ref, docData, { merge: true })
    }

    return {
      leagueId,
      created: !snapshot.exists(),
      updated: true,
      changed: !writeSkipped,
      writeSkipped,
    }
  })

  if (options.syncMaster !== false && !result.writeSkipped) {
    await syncLeaguesMasterDocument({
      leagues: [league],
    })
  }

  return result
}
