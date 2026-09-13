// src/features/playersDatabase/services/write/leagues/leagueTableRankScoutSummary.js

import { serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import {
  buildLeagueBaseDoc,
  buildSeasonKey,
  clean,
  cleanSeasonComputedFields,
  leagueDocRef,
} from './leagueDoc.js'
import { buildSeasonDoc } from './leagueSeason.js'
import { syncLeaguesMasterDocument } from './leaguesMaster.sync.js'
import {
  isSameSeason,
  normalizeSeasonIdentity,
} from '../../../model/shared/season.model.js'
import { normalizeTeamIdentity } from '../../../model/team/teamIdentity.model.js'
import {
  applyScoutProfilesSummaries,
  isSameLeagueSeasonPersistedState,
  updateTableRankRowScoutProfilesSummary,
} from './leagueTableRank.model.js'
import {
  areScoutProfilesSummariesEqual,
  areTeamTaskSignalsEqual,
  normalizeScoutProfilesSummary,
  normalizeTeamTaskSignals,
} from '../../../domain/projections/teamScoutSummary.projection.js'

const hasOwn = (source, key) => (
  Boolean(source) &&
  Object.prototype.hasOwnProperty.call(source, key)
)

export async function updateLeagueSeasonTableRankScoutProfilesSummary({
  league = {},
  season = {},
  target = 'current',
  team = {},
  scoutProfilesSummary = {},
  teamTaskSignals = null,
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const resolvedSeasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = leagueDocRef(leagueId)

  const result = await trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)

    if (!snapshot.exists()) {
      return {
        leagueId,
        seasonId,
        seasonKey: resolvedSeasonKey,
        updated: false,
        reason: 'leagueDocMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const currentSeason = currentData.current || null
    const history = Array.isArray(currentData.history) ? currentData.history : []
    const requestedSeason = {
      seasonId,
      seasonKey: resolvedSeasonKey,
    }
    const isHistory = clean(target) === 'history'
    const sourceSeason = isHistory
      ? history.find(row => isSameSeason(row, requestedSeason)) || null
      : isSameSeason(currentSeason, requestedSeason)
        ? currentSeason
        : null

    if (!sourceSeason) {
      return {
        leagueId,
        seasonId,
        seasonKey: resolvedSeasonKey,
        target: isHistory ? 'history' : 'current',
        updated: false,
        reason: 'leagueSeasonMissing',
      }
    }

    const tableRank = Array.isArray(sourceSeason.tableRank)
      ? sourceSeason.tableRank
      : []
    const teamIdentity = normalizeTeamIdentity({ team })
    const teamId = clean(teamIdentity.birthTeamId || teamIdentity.teamId)
    const clubId = clean(teamIdentity.clubId || team.clubId)
    const teamRowExists = tableRank.some(row => {
      const rowIdentity = normalizeTeamIdentity({ team: row })
      const rowTeamId = clean(rowIdentity.birthTeamId || rowIdentity.teamId)
      const rowClubId = clean(rowIdentity.clubId || row.clubId)

      return (
        (teamId && rowTeamId === teamId) ||
        (!teamId && clubId && rowClubId === clubId)
      )
    })

    if (!teamRowExists) {
      return {
        leagueId,
        seasonId,
        seasonKey: resolvedSeasonKey,
        target: isHistory ? 'history' : 'current',
        teamId,
        updated: false,
        reason: 'leagueTeamRowMissing',
      }
    }

    const existingTeamRow = tableRank.find(row => {
      const rowIdentity = normalizeTeamIdentity({ team: row })
      const rowTeamId = clean(rowIdentity.birthTeamId || rowIdentity.teamId)
      const rowClubId = clean(rowIdentity.clubId || row.clubId)

      return (
        (teamId && rowTeamId === teamId) ||
        (!teamId && clubId && rowClubId === clubId)
      )
    }) || null
    const normalizedSummary = normalizeScoutProfilesSummary(scoutProfilesSummary)
    const hasTeamTaskSignals = Boolean(
      teamTaskSignals && typeof teamTaskSignals === 'object'
    )
    const normalizedTaskSignals = normalizeTeamTaskSignals(teamTaskSignals)
    const taskSignalsUnchanged = !hasTeamTaskSignals || (
      hasOwn(existingTeamRow, 'teamTaskSignals') &&
      areTeamTaskSignalsEqual(
        existingTeamRow?.teamTaskSignals,
        normalizedTaskSignals
      )
    )

    if (
      existingTeamRow &&
      areScoutProfilesSummariesEqual(
        existingTeamRow.scoutProfilesSummary,
        normalizedSummary
      ) &&
      taskSignalsUnchanged
    ) {
      return {
        leagueId,
        seasonId,
        seasonKey: resolvedSeasonKey,
        target: isHistory ? 'history' : 'current',
        teamId,
        scoutProfilesSummary: normalizedSummary,
        teamTaskSignals: normalizeTeamTaskSignals(existingTeamRow.teamTaskSignals),
        updated: true,
        changed: false,
        writeSkipped: true,
      }
    }

    const updatedAt = new Date().toISOString()
    const nextTableRank = updateTableRankRowScoutProfilesSummary({
      tableRank,
      team,
      scoutProfilesSummary,
      teamTaskSignals,
    })

    if (isHistory) {
      const nextHistory = history.map(row => (
        isSameSeason(row, requestedSeason)
          ? {
              ...row,
              tableRank: nextTableRank,
              updatedAt,
            }
          : row
      ))

      transaction.set(
        ref,
        {
          history: nextHistory,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    } else {
      transaction.set(
        ref,
        {
          current: {
            ...sourceSeason,
            tableRank: nextTableRank,
            updatedAt,
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    }

    return {
      leagueId,
      seasonId,
      seasonKey: resolvedSeasonKey,
      target: isHistory ? 'history' : 'current',
      teamId,
      scoutProfilesSummary,
      teamTaskSignals: hasTeamTaskSignals
        ? normalizedTaskSignals
        : normalizeTeamTaskSignals(existingTeamRow?.teamTaskSignals),
      updated: true,
    }
  })

  if (result.updated && !result.writeSkipped) {
    await syncLeaguesMasterDocument({
      leagues: [league],
    })
  }

  return result
}


export async function updateLeagueSeasonTableRankScoutProfilesSummaries({ league = {}, season = {}, target = 'current', summaries = [] } = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonId = clean(season.seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = leagueDocRef(leagueId)

  return trackedRunTransaction(db, async transaction => {
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
    const isHistory = clean(target) === 'history'
    const updatedAt = new Date().toISOString()
    let nextData = baseDoc

    if (isHistory) {
      const history = (Array.isArray(baseDoc.history) ? baseDoc.history : []).map(row => {
        if (!isSameSeason(row, {
          seasonId,
          seasonKey,
        })) return row

        return {
          ...row,
          tableRank: applyScoutProfilesSummaries({
            tableRank: row.tableRank,
            summaries,
          }),
          updatedAt,
        }
      })

      nextData = {
        ...baseDoc,
        history,
      }
    } else {
      nextData = {
        ...baseDoc,
        current: {
          ...cleanSeasonComputedFields(baseDoc.current || buildSeasonDoc({
            ...season,
            seasonId,
            seasonKey,
          })),
          tableRank: applyScoutProfilesSummaries({
            tableRank: baseDoc.current?.tableRank || [],
            summaries,
          }),
          updatedAt,
        },
      }
    }

    const existingSeason = isHistory
      ? (Array.isArray(baseDoc.history) ? baseDoc.history : [])
          .find(row => isSameSeason(row, { seasonId, seasonKey })) || null
      : baseDoc.current || null
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
      rowsCount: Array.isArray(summaries) ? summaries.length : 0,
      updated: true,
      changed: !writeSkipped,
      writeSkipped,
    }
  })
}
