// src/features/playersDatabase/services/write/flows/league/commitLeagueImport.js

import { db } from '../../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../../services/firestore/usage/index.js'

import {
  buildLeagueBaseDoc,
  clean,
  cleanSeasonComputedFields,
  leagueDocRef,
  toNumberOrZero,
} from '../../leagues/leagueDoc.js'
import { buildSeasonDoc } from '../../leagues/leagueSeason.js'
import {
  buildTableRank,
  isSameLeagueSeasonPersistedState,
  updateHistorySeasonTableRank,
} from '../../leagues/leagueTableRank.model.js'

import {
  resolveLeagueScheduleProjection,
} from '../../../../domain/projections/leagueSchedule.projection.js'
import {
  normalizeCompetitionRules,
} from '../../../../domain/projections/club/clubCompetition.projection.js'
import {
  buildCanonicalLeagueTeamScoutContexts,
} from '../../shared/leagueTeamScoutContext.js'
import {
  isSameSeason,
  normalizeSeasonIdentity,
  normalizeSeasonStatus,
} from '../../../../model/shared/season.model.js'

import {
  assertActiveOperationAvailable,
  createActiveOperation,
} from '../../operations/index.js'
import {
  buildQueuedPlayersDatabaseJob,
  createPlayersDatabaseJobId,
  queuePlayersDatabaseJobInTransaction,
} from '../../jobs/index.js'
import {
  buildLeagueProjectionActions,
} from './leagueProjectionActions.plan.js'

const createGeneration = () => (
  (typeof window !== 'undefined' && window.crypto?.randomUUID?.()) ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}`
)

const findSeason = ({
  history = [],
  seasonId = '',
  seasonKey = '',
} = {}) => (
  (Array.isArray(history) ? history : []).find(item => (
    isSameSeason(item, { seasonId, seasonKey })
  )) || null
)

export async function commitLeagueImport({
  league = {},
  season = {},
  target = 'current',
  rows = [],
  approvedPlan = {},
} = {}) {
  const leagueId = clean(league.id || league.leagueId || season.leagueId)
  const seasonId = clean(season.seasonId)

  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')

  /*
   * These values must remain identical if Firestore retries the
   * transaction callback because of a concurrent document update.
   */
  const generation = createGeneration()
  const jobId = createPlayersDatabaseJobId()

  return trackedRunTransaction(db, async transaction => {
    const reference = leagueDocRef(leagueId)
    const snapshot = await transaction.get(reference)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}

    const baseDoc = buildLeagueBaseDoc(
      { ...league, id: leagueId },
      currentData
    )

    const { seasonKey } = normalizeSeasonIdentity({
      season: {
        ...season,
        seasonId,
      },
    })

    const isHistory = (
      clean(target) === 'history' ||
      normalizeSeasonStatus(season.seasonStatus) === 'completed'
    )

    const currentMatchesSeason = isSameSeason(baseDoc.current, {
      seasonId,
      seasonKey,
    })

    const existingSeason = isHistory
      ? (
          findSeason({
            history: baseDoc.history,
            seasonId,
            seasonKey,
          }) ||
          (currentMatchesSeason ? baseDoc.current : null)
        )
      : currentMatchesSeason
        ? baseDoc.current
        : null

    const tableRank = buildTableRank({
      rows,
      existingTableRank: existingSeason?.tableRank || [],
    })

    const schedule = resolveLeagueScheduleProjection({
      teamsCount: tableRank.length,
      leagueTotalRound: (
        toNumberOrZero(existingSeason?.leagueTotalRound) ||
        toNumberOrZero(season.leagueTotalRound)
      ),
    })

    const competitionRules = normalizeCompetitionRules(
      season?.competitionRules ||
      existingSeason?.competitionRules ||
      {}
    )

    const { teamPerformanceContext } = buildCanonicalLeagueTeamScoutContexts({
      league: baseDoc,
      season: {
        ...season,
        seasonId,
        seasonKey,
        leagueTotalRound: schedule.leagueTotalRound,
      },
      target: isHistory ? 'history' : 'current',
      rows: tableRank,
      reusePersistedContext: false,
    })

    const nextHistory = isHistory
      ? updateHistorySeasonTableRank({
          history: baseDoc.history,
          season: {
            ...season,
            seasonId,
            seasonKey,
            leagueTotalRound: schedule.leagueTotalRound,
            competitionRules,
          },
          tableRank,
          teamPerformanceContext,
        }).map(item => (
          isSameSeason(item, { seasonId, seasonKey })
            ? {
                ...item,
                generation,
              }
            : item
        ))
      : baseDoc.history

    const nextData = isHistory
      ? {
          ...baseDoc,
          current: currentMatchesSeason ? null : baseDoc.current,
          history: nextHistory,
        }
      : {
          ...baseDoc,
          current: {
            ...cleanSeasonComputedFields(
              baseDoc.current ||
              buildSeasonDoc({
                ...season,
                seasonId,
                seasonKey,
              })
            ),
            seasonId,
            seasonKey,
            generation,
            birthYear: toNumberOrZero(season.birthYear),
            leagueTotalRound: schedule.leagueTotalRound,
            competitionRules,
            seasonStatus: normalizeSeasonStatus(
              season.seasonStatus,
              clean(season.seasonStatus) === 'completed'
                ? 'completed'
                : 'active'
            ),
            tableRank,
            teamPerformanceContext,
            updatedAt: new Date().toISOString(),
          },
        }

    const canonicalSeason = isHistory
      ? findSeason({
          history: nextData.history,
          seasonId,
          seasonKey,
        })
      : nextData.current

    if (!canonicalSeason) {
      throw new Error('Failed to build canonical league season')
    }

    const changed = !(
      existingSeason &&
      isSameLeagueSeasonPersistedState(
        existingSeason,
        canonicalSeason
      )
    )

    const actions = buildLeagueProjectionActions({
      jobId,
      league: {
        ...league,
        id: leagueId,
      },
      season: canonicalSeason,
      target: isHistory ? 'history' : 'current',
      sourceGeneration: generation,
      tableRank,
    })

    const job = buildQueuedPlayersDatabaseJob({
      id: jobId,
      type: 'league',
      scope: {
        leagueId,
        seasonId,
        seasonKey,
      },
      sourceGeneration: generation,
      approvedPlan,
      actionCount: actions.length,
    })

    await assertActiveOperationAvailable({
      transaction,
      jobId,
    })

    transaction.set(reference, nextData, { merge: true })

    createActiveOperation({
      transaction,
      job,
    })

    queuePlayersDatabaseJobInTransaction({
      transaction,
      job,
      actions,
    })

    return {
      leagueId,
      seasonId,
      seasonKey,
      target: isHistory ? 'history' : 'current',
      generation,
      rowsCount: tableRank.length,
      changed,
      seasonDocument: canonicalSeason,
      projectionJob: {
        id: job.id,
        type: job.document.type,
        jobType: job.document.type,
        sourceGeneration: generation,
      },
    }
  }, {
    feature: 'playersDatabase',
    action: 'league-import-atomic-commit',
    collection: 'dbLeagues',
  })
}
