// features/playersDatabase/services/write/teams/teamSeasonMeta.js

import { runTransaction } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { buildSeasonKey, clean, toNumberOrZero } from '../leagues/leagueDoc.js'
import { isSameSeason, normalizeSeasonIdentity } from '../../../model/season.model.js'
import { teamDocRef } from './teamDoc.js'

export async function updateTeamSeasonTeamUrl({
  season = {},
  team = {},
} = {}) {
  const birthTeamId = clean(
    team.birthTeamId ||
    team.teamId
  )
  const seasonId = clean(season.seasonId)
  const { seasonKey } = normalizeSeasonIdentity({ season })
  const teamUrl = clean(team.teamUrl)

  if (!birthTeamId) throw new Error('Missing birth team id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = teamDocRef(birthTeamId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)

    if (!snapshot.exists()) {
      return {
        birthTeamId,
        teamDocumentId: birthTeamId,
        seasonId,
        teamUrl,
        updated: false,
        reason: 'teamDocMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const currentValue = currentData.current
    const historyValue = currentData.history
    const currentRows = Array.isArray(currentValue)
      ? currentValue
      : currentValue
        ? [currentValue]
        : []
    const historyRows = Array.isArray(historyValue)
      ? historyValue
      : historyValue
        ? [historyValue]
        : []
    const requestedSeason = { seasonId, seasonKey }
    const currentIndex = currentRows.findIndex(row => isSameSeason(row, requestedSeason))
    const historyIndex = historyRows.findIndex(row => isSameSeason(row, requestedSeason))
    const sourceTarget = currentIndex >= 0
      ? 'current'
      : historyIndex >= 0
        ? 'history'
        : ''

    if (!sourceTarget) {
      return {
        birthTeamId,
        teamDocumentId: birthTeamId,
        seasonId,
        teamUrl,
        updated: false,
        reason: 'teamSeasonMissing',
      }
    }

    const fieldKey = sourceTarget
    const rows = sourceTarget === 'current' ? currentRows : historyRows
    const seasonIndex = sourceTarget === 'current' ? currentIndex : historyIndex
    const nextRows = rows.map((row, index) => (
      index === seasonIndex
        ? {
            ...row,
            teamUrl,
            updatedAt: new Date().toISOString(),
          }
        : row
    ))
    const originalValue = sourceTarget === 'current' ? currentValue : historyValue
    const nextValue = Array.isArray(originalValue)
      ? nextRows
      : nextRows[0] || originalValue

    transaction.set(
      ref,
      {
        [fieldKey]: nextValue,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )

    return {
      birthTeamId,
      teamDocumentId: birthTeamId,
      seasonId,
      teamUrl,
      sourceTarget,
      updated: true,
    }
  })
}

const getTeamMetaUpdateIds = ({
  team = {},
  rows = [],
  teams = [],
} = {}) => {
  const candidates = [
    team,
    ...(Array.isArray(rows) ? rows : []),
    ...(Array.isArray(teams) ? teams : []),
  ]

  return [...new Set(candidates
    .map(row => clean(row.teamDocumentId || row.teamId))
    .filter(Boolean))]
}

export async function updateTeamSeasonsMetaMany({
  season = {},
  team = {},
  rows = [],
  teams = [],
  target = 'current',
  birthYear = null,
  leagueTotalRound = null,
} = {}) {
  const seasonId = clean(season.seasonId)
  if (!seasonId) throw new Error('Missing season id')

  const teamIds = getTeamMetaUpdateIds({ team, rows, teams })
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const isHistory = clean(target) === 'history'
  const fieldKey = isHistory ? 'history' : 'current'
  const results = []

  for (const teamId of teamIds) {
    const ref = teamDocRef(teamId)
    results.push(await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(ref)
      if (!snapshot.exists()) {
        return {
          birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
          updated: false,
          reason: 'teamDocMissing',
        }
      }

      const currentData = snapshot.data() || {}
      const rowsData = Array.isArray(currentData[fieldKey]) ? currentData[fieldKey] : []
      let updated = false
      const nextRows = rowsData.map(row => {
        if (!isSameSeason(row, { seasonId, seasonKey })) return row

        updated = true
        return {
          ...row,
          birthYear: toNumberOrZero(birthYear ?? season.birthYear),
          leagueTotalRound: toNumberOrZero(leagueTotalRound ?? season.leagueTotalRound),
          updatedAt: new Date().toISOString(),
        }
      })

      if (updated) {
        transaction.set(
          ref,
          {
            [fieldKey]: nextRows,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        )
      }

      return {
        birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
        updated,
      }
    }))
  }

  return {
    rowsCount: results.length,
    updatedCount: results.filter(result => result.updated).length,
    results,
  }
}
