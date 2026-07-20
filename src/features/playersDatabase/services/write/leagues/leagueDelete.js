// features/playersDatabase/services/write/leagues/leagueDelete.js

import { runTransaction } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import {
  buildLeagueBaseDoc,
  buildSeasonKey,
  clean,
  cleanSeasonComputedFields,
  leagueDocRef,
} from './leagueDoc.js'
import { buildSeasonDoc, isSameSeason } from './leagueSeason.js'

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

  return runTransaction(db, async transaction => {
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
    const baseDoc = buildLeagueBaseDoc({ ...league, id: leagueId }, currentData)
    const isHistory = clean(target) === 'history'
    const nextData = isHistory
      ? {
          ...baseDoc,
          history: removeHistorySeason({
            history: baseDoc.history,
            season: { seasonId, seasonKey },
          }),
        }
      : {
          ...baseDoc,
          current: isSameSeason(baseDoc.current, { seasonId, seasonKey }) ? null : baseDoc.current,
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

  return runTransaction(db, async transaction => {
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
    const baseDoc = buildLeagueBaseDoc({ ...league, id: leagueId }, currentData)
    const isHistory = clean(target) === 'history'
    const nextHistory = isHistory
      ? (Array.isArray(baseDoc.history) ? baseDoc.history : []).map(row => (
          isSameSeason(row, { seasonId, seasonKey })
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
    const nextCurrent = !isHistory && isSameSeason(baseDoc.current, { seasonId, seasonKey })
      ? {
          ...cleanSeasonComputedFields(baseDoc.current || buildSeasonDoc({ ...season, seasonId, seasonKey })),
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
}
