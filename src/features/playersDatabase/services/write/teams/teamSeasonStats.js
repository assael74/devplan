// features/playersDatabase/services/write/teams/teamSeasonStats.js



import { db } from '../../../../../services/firebase/firebase.js'
import {
  buildSeasonKey,
  clean,
} from '../leagues/leagueDoc.js'
import { isSameSeason } from '../../../model/season.model.js'
import { resolveTeamLookupKey } from '../../../model/teamIdentity.model.js'
import {
  buildTeamBaseDoc,
  teamDocRef,
} from './teamDoc.js'
import {
  buildTeamSeasonDoc,
  mergeTeamPlayerStats,
  upsertSeasonRows,
} from './teamSeason.model.js'

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'

const hasNumberValue = value => (
  value !== undefined &&
  value !== null &&
  value !== '' &&
  Number.isFinite(Number(value))
)

export async function updateTeamSeasonPlayerStats({
  season = {},
  team = {},
  target = 'current',
  players = [],
  scoutSyncMode = 'replace',
} = {}) {
  const teamId = resolveTeamLookupKey(team)
  const seasonId = clean(season.seasonId)
  if (!teamId) throw new Error('Missing birth team id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = teamDocRef(teamId)

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const baseDoc = buildTeamBaseDoc({
      ...team,
      teamDocumentId: teamId,
    }, currentData)
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
    const isHistory = clean(target) === 'history'
    const rows = isHistory ? baseDoc.history : baseDoc.current
    const existingSeason = (Array.isArray(rows) ? rows : [])
      .find(row => isSameSeason(row, {
        seasonId,
        seasonKey,
      }))
    const baseSeasonDoc = existingSeason || buildTeamSeasonDoc({
      season: {
        ...season,
        seasonId,
        seasonKey,
      },
      team: {
        ...team,
        birthTeamDocumentId: teamId,
        teamDocumentId: teamId,
      },
      players: [],
    })
    const seasonDoc = {
      ...baseSeasonDoc,
      seasonStatus: clean(season.seasonStatus) === 'completed'
        ? 'completed'
        : 'active',
      leagueTotalRound: hasNumberValue(season.leagueTotalRound)
        ? Number(season.leagueTotalRound)
        : Number(baseSeasonDoc.leagueTotalRound) || 0,
      teamPlayers: mergeTeamPlayerStats({
        existingPlayers: baseSeasonDoc.teamPlayers,
        players,
        team,
        season,
        scoutSyncMode,
      }),
      updatedAt: new Date().toISOString(),
    }
    const nextData = isHistory
      ? {
          ...baseDoc,
          history: upsertSeasonRows({
            rows: baseDoc.history,
            season: {
              seasonId,
              seasonKey,
            },
            seasonDoc,
          }),
        }
      : {
          ...baseDoc,
          current: upsertSeasonRows({
            rows: baseDoc.current,
            season: {
              seasonId,
              seasonKey,
            },
            seasonDoc,
          }),
        }

    transaction.set(ref, nextData, { merge: true })

    return {
      birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
      seasonId,
      seasonKey,
      target: isHistory ? 'history' : 'current',
      rowsCount: (Array.isArray(players) ? players : []).length,
      playersCount: seasonDoc.teamPlayers.length,
      players: seasonDoc.teamPlayers,
    }
  })
}
