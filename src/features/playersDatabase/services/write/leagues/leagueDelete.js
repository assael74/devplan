// features/playersDatabase/services/write/leagues/leagueDelete.js

import {
  collection,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  buildLeagueBaseDoc,
  buildSeasonKey,
  clean,
  cleanSeasonComputedFields,
  leagueDocRef,
} from './leagueDoc.js'
import {
  buildSeasonDoc,
  isSameSeason,
} from './leagueSeason.js'
import { syncLeaguesMasterDocument } from './leaguesMaster.js'


import {
  trackedGetDoc,
  trackedGetDocs,
  trackedRunTransaction,
} from '../../../../../services/firestore/usage/index.js'
const getLeagueSeasonRow = ({ leagueData = {}, season = {}, target = 'current' } = {}) => {
  const isHistory = clean(target) === 'history'

  if (isHistory) {
    return (Array.isArray(leagueData.history) ? leagueData.history : [])
      .find(row => isSameSeason(row, season)) || null
  }

  return isSameSeason(leagueData.current, season)
    ? leagueData.current
    : null
}

export async function getLeagueSeasonDeleteDependencies({
  league = {},
  season = {},
  target = 'current',
} = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')

  const leagueSnapshot = await trackedGetDoc(leagueDocRef(leagueId), {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.leagues,
    action: 'league-delete-dependencies',
    operationSubtype: 'maintenance-getDoc',
  })
  const leagueData = leagueSnapshot.exists() ? leagueSnapshot.data() || {} : {}
  const seasonRow = getLeagueSeasonRow({
    leagueData,
    season: {
      seasonId,
      seasonKey,
    },
    target,
  })
  const tableRank = Array.isArray(seasonRow?.tableRank) ? seasonRow.tableRank : []
  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('leagueId', '==', leagueId),
    where('seasonKey', '==', seasonKey)
  )
  const searchSnapshot = await trackedGetDocs(rowsQuery, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    action: 'league-delete-dependencies',
    operationSubtype: 'maintenance-query',
  })
  let teamIndexesCount = 0
  let playerIndexesCount = 0

  searchSnapshot.docs.forEach(indexDoc => {
    const entityType = clean(indexDoc.data()?.entityType)

    if (entityType === 'teamSeason') teamIndexesCount += 1
    if (entityType === 'playerSeason') playerIndexesCount += 1
  })

  const dependencies = {
    tableTeamsCount: tableRank.length,
    teamIndexesCount,
    playerIndexesCount,
    searchIndexesCount: searchSnapshot.size,
  }

  return {
    leagueId,
    seasonId,
    seasonKey,
    target: clean(target) === 'history' ? 'history' : 'current',
    leagueExists: leagueSnapshot.exists(),
    seasonExists: Boolean(seasonRow),
    canDelete: Object.values(dependencies).every(count => Number(count) === 0),
    dependencies,
  }
}

const removeHistorySeason = ({ history = [], season = {} } = {}) =>
  (Array.isArray(history) ? history : [])
    .filter(row => !isSameSeason(row, season))
    .map(cleanSeasonComputedFields)

export async function removeLeagueSeason({
  league = {},
  season = {},
  target = 'current',
} = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = leagueDocRef(leagueId)

  const result = await trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      return {
        leagueId,
        seasonId,
        seasonKey,
        removed: false,
        reason: 'leagueDocMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const baseDoc = buildLeagueBaseDoc({
      ...league,
      id: leagueId,
    }, currentData)
    const isHistory = clean(target) === 'history'
    const nextData = isHistory
      ? {
          ...baseDoc,
          history: removeHistorySeason({
            history: baseDoc.history,
            season: {
              seasonId,
              seasonKey,
            },
          }),
        }
      : {
          ...baseDoc,
          current: isSameSeason(baseDoc.current, {
            seasonId,
            seasonKey,
          }) ? null : baseDoc.current,
        }

    transaction.set(ref, nextData, { merge: true })

    return {
      leagueId,
      seasonId,
      seasonKey,
      target: isHistory ? 'history' : 'current',
      removed: true,
    }
  })

  await syncLeaguesMasterDocument({
    leagues: [league],
  })

  return result
}

const removeTeamFromTableRank = ({
  tableRank = [],
  team = {},
} = {}) => {
  const teamId = clean(team.teamId)
  const clubId = clean(team.clubId)

  return (Array.isArray(tableRank) ? tableRank : []).filter(row => {
    const rowTeamId = clean(row.teamId || row.teamSlotId)
    const rowClubId = clean(row.clubId)
    const sameTeam = teamId && rowTeamId === teamId
    const sameClubFallback = !teamId && clubId && rowClubId === clubId

    return !sameTeam && !sameClubFallback
  })
}

export async function removeLeagueSeasonTeam({
  league = {},
  season = {},
  target = 'current',
  team = {},
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = leagueDocRef(leagueId)

  const result = await trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      return {
        leagueId,
        seasonId,
        seasonKey,
        removed: false,
        reason: 'leagueDocMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const baseDoc = buildLeagueBaseDoc({
      ...league,
      id: leagueId,
    }, currentData)
    const isHistory = clean(target) === 'history'
    const nextHistory = isHistory
      ? (Array.isArray(baseDoc.history) ? baseDoc.history : []).map(row => (
          isSameSeason(row, {
            seasonId,
            seasonKey,
          })
            ? {
                ...cleanSeasonComputedFields(row),
                tableRank: removeTeamFromTableRank({
                  tableRank: row.tableRank,
                  team,
                }),
                updatedAt: new Date().toISOString(),
              }
            : cleanSeasonComputedFields(row)
        ))
      : baseDoc.history
    const nextCurrent = !isHistory && isSameSeason(baseDoc.current, {
      seasonId,
      seasonKey,
    })
      ? {
          ...cleanSeasonComputedFields(baseDoc.current || buildSeasonDoc({
            ...season,
            seasonId,
            seasonKey,
          })),
          tableRank: removeTeamFromTableRank({
            tableRank: baseDoc.current?.tableRank || [],
            team,
          }),
          updatedAt: new Date().toISOString(),
        }
      : baseDoc.current

    transaction.set(
      ref,
      {
        ...baseDoc,
        current: nextCurrent,
        history: nextHistory,
      },
      { merge: true }
    )

    return {
      leagueId,
      seasonId,
      seasonKey,
      target: isHistory ? 'history' : 'current',
      teamId: clean(team.teamId),
      removed: true,
    }
  })

  await syncLeaguesMasterDocument({
    leagues: [league],
  })

  return result
}

export async function getLeagueSeasonTeams({
  league = {},
  season = {},
  target = 'current',
} = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)

  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')

  const snapshot = await trackedGetDoc(
    leagueDocRef(leagueId),
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.leagues,
      action: 'league-season-teams',
      operationSubtype: 'maintenance-getDoc',
    }
  )

  if (!snapshot.exists()) {
    return {
      leagueId,
      seasonId,
      seasonKey,
      target: clean(target) === 'history'
        ? 'history'
        : 'current',
      seasonExists: false,
      teams: [],
    }
  }

  const seasonRow = getLeagueSeasonRow({
    leagueData: snapshot.data() || {},
    season: {
      seasonId,
      seasonKey,
    },
    target,
  })

  return {
    leagueId,
    seasonId,
    seasonKey,
    target: clean(target) === 'history'
      ? 'history'
      : 'current',
    seasonExists: Boolean(seasonRow),
    teams: Array.isArray(seasonRow?.tableRank)
      ? seasonRow.tableRank
      : [],
  }
}

export async function clearLeagueSeasonTeams({
  league = {},
  season = {},
  target = 'current',
} = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = leagueDocRef(leagueId)

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      return {
        leagueId,
        seasonId,
        seasonKey,
        updated: false,
        reason: 'leagueDocMissing',
        teams: [],
      }
    }

    const currentData = snapshot.data() || {}
    const baseDoc = buildLeagueBaseDoc({
      ...league,
      id: leagueId,
    }, currentData)
    const isHistory = clean(target) === 'history'
    const rows = isHistory
      ? (Array.isArray(baseDoc.history) ? baseDoc.history : [])
      : [baseDoc.current]
    const seasonRow = rows.find(row => isSameSeason(row, {
      seasonId,
      seasonKey,
    })) || null

    if (!seasonRow) {
      return {
        leagueId,
        seasonId,
        seasonKey,
        target: isHistory ? 'history' : 'current',
        updated: false,
        reason: 'leagueSeasonMissing',
        teams: [],
      }
    }

    const teams = Array.isArray(seasonRow.tableRank) ? seasonRow.tableRank : []
    const clearedSeason = {
      ...cleanSeasonComputedFields(seasonRow),
      tableRank: [],
      tableRankCount: 0,
      teamsCount: 0,
      playersCount: 0,
      playersWithScoutProfileCount: 0,
      scoutProfilesCount: 0,
      updatedAt: new Date().toISOString(),
    }

    if (isHistory) {
      const nextHistory = (Array.isArray(baseDoc.history) ? baseDoc.history : [])
        .map(row => (
          isSameSeason(row, {
            seasonId,
            seasonKey,
          })
            ? clearedSeason
            : cleanSeasonComputedFields(row)
        ))

      transaction.set(ref, {
        history: nextHistory,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
    } else {
      transaction.set(ref, {
        current: clearedSeason,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
    }

    return {
      leagueId,
      seasonId,
      seasonKey,
      target: isHistory ? 'history' : 'current',
      updated: true,
      removedTeamsCount: teams.length,
      teams,
    }
  })
}
