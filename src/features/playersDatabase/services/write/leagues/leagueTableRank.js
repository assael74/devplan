// src/features/playersDatabase/services/write/leagues/leagueTableRank.js

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import {
  buildLeagueBaseDoc,
  buildSeasonKey,
  clean,
  cleanSeasonComputedFields,
  leagueDocRef,
  toNumberOrZero,
} from './leagueDoc.js'
import { buildSeasonDoc } from './leagueSeason.js'
import { syncLeaguesMasterDocument } from './leaguesMaster.sync.js'
import { resolveLeagueScheduleProjection } from '../../../domain/projections/leagueSchedule.projection.js'
import { normalizeCompetitionRules } from '../../../domain/projections/club/clubCompetition.projection.js'
import { buildCanonicalLeagueTeamScoutContexts } from '../shared/leagueTeamScoutContext.js'
import {
  isSameSeason,
  normalizeSeasonIdentity,
  normalizeSeasonStatus,
} from '../../../model/shared/season.model.js'
import {
  buildTableRank,
  isSameLeagueSeasonPersistedState,
  updateHistorySeasonTableRank,
} from './leagueTableRank.model.js'

export async function updateLeagueSeasonTableRank({
  league = {},
  season = {},
  target = 'current',
  rows = [],
  syncMaster = true,
} = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonId = clean(season.seasonId)
  const resolvedSeasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId && !resolvedSeasonKey) throw new Error('Missing season id')

  const ref = leagueDocRef(leagueId)

  const result = await trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const baseDoc = buildLeagueBaseDoc({
      ...league,
      id: leagueId,
    }, currentData)
    const { seasonKey } = normalizeSeasonIdentity({ season: {
      ...season,
      seasonId,
    } })
    // Completion is a user-controlled lifecycle decision. A completed
    // season must be persisted in history even if a caller passed `current`.
    const isHistory = (
      clean(target) === 'history' ||
      normalizeSeasonStatus(season.seasonStatus) === 'completed'
    )
    const currentMatchesSeason = isSameSeason(baseDoc.current, {
      seasonId,
      seasonKey,
    })
    const existingSeason = isHistory
      ? (Array.isArray(baseDoc.history) ? baseDoc.history : [])
          .find(row => isSameSeason(row, {
            seasonId,
            seasonKey,
          })) || (currentMatchesSeason ? baseDoc.current : null)
      : isSameSeason(baseDoc.current, {
          seasonId,
          seasonKey,
        })
        ? baseDoc.current
        : null
    const tableRank = buildTableRank({
      rows,
      existingTableRank: existingSeason?.tableRank || [],
    })
    const canonicalLeagueTotalRound = toNumberOrZero(
      existingSeason?.leagueTotalRound
    ) || toNumberOrZero(season?.leagueTotalRound)
    const scheduleProjection = resolveLeagueScheduleProjection({
      teamsCount: tableRank.length,
      leagueTotalRound: canonicalLeagueTotalRound,
    })
    const resolvedLeagueTotalRound = scheduleProjection.leagueTotalRound
    const { teamPerformanceContext } = buildCanonicalLeagueTeamScoutContexts({
      league: baseDoc,
      season: {
        ...season,
        seasonId,
        seasonKey,
        leagueTotalRound: resolvedLeagueTotalRound,
      },
      target: isHistory ? 'history' : 'current',
      rows: tableRank,
      // A League table import is the calculation boundary.  A previous
      // context must not freeze normalization after the official rows change.
      reusePersistedContext: false,
    })
    const competitionRules = normalizeCompetitionRules(
      season?.competitionRules || existingSeason?.competitionRules || {}
    )
    const nextData = isHistory
      ? {
          ...baseDoc,
          current: currentMatchesSeason ? null : baseDoc.current,
          history: updateHistorySeasonTableRank({
            history: baseDoc.history,
            season: {
              ...season,
              seasonId,
              seasonKey,
              leagueTotalRound: resolvedLeagueTotalRound,
              competitionRules,
            },
            tableRank,
            teamPerformanceContext,
          }),
        }
      : {
        ...baseDoc,
        current: {
          ...cleanSeasonComputedFields(baseDoc.current || buildSeasonDoc({
            ...season,
            seasonId,
            seasonKey,
          })),
          seasonId,
          seasonKey,
          birthYear: toNumberOrZero(season.birthYear),
          leagueTotalRound: resolvedLeagueTotalRound,
          competitionRules,
          seasonStatus: normalizeSeasonStatus(
            season.seasonStatus,
            clean(season.seasonStatus) === 'completed' ? 'completed' : 'active'
          ),
          tableRank,
          teamPerformanceContext,
          updatedAt: new Date().toISOString(),
        },
      }

    const nextSeason = isHistory
      ? (Array.isArray(nextData.history) ? nextData.history : [])
          .find(row => isSameSeason(row, { seasonId, seasonKey })) || null
      : nextData.current || null
    const writeSkipped = Boolean(
      existingSeason &&
      nextSeason &&
      isSameLeagueSeasonPersistedState(existingSeason, nextSeason)
    )

    if (!writeSkipped) {
      transaction.set(ref, nextData, { merge: true })
    }

    return {
      leagueId,
      seasonId,
      seasonKey,
      target: isHistory ? 'history' : 'current',
      rowsCount: tableRank.length,
      updated: true,
      changed: !writeSkipped,
      writeSkipped,
      seasonDocument: nextSeason,
      leagueTotalRound: resolvedLeagueTotalRound,
      expectedGamesPerTeam: scheduleProjection.expectedGamesPerTeam,
    }
  })

  if (syncMaster && !result.writeSkipped) {
    await syncLeaguesMasterDocument({
      leagues: [league],
    })
  }

  return result
}
