// features/playersDatabase/services/write/teams/teamSeasonRoster.js

import { runTransaction } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { clean } from '../leagues/leagueDoc.js'
import {
  isSameSeason,
  normalizeSeasonIdentity,
} from '../../../model/season.model.js'
import { resolveTeamLookupKey } from '../../../model/teamIdentity.model.js'
import { buildTeamBaseDoc, teamDocRef } from './teamDoc.js'
import {
  buildPlayerLookup,
  buildTeamSeasonDoc,
  findExistingPlayerIndex,
  normalizeTeamPlayer,
  upsertSeasonRows,
} from './teamSeason.model.js'

export async function upsertTeamSeasonPlayers({
  season = {},
  team = {},
  target = 'current',
  players = [],
} = {}) {
  const teamId = resolveTeamLookupKey(team)
  const { seasonId, seasonKey } = normalizeSeasonIdentity({ season })
  if (!teamId) throw new Error('Missing birth team id')
  if (!seasonId && !seasonKey) throw new Error('Missing season id')

  const ref = teamDocRef(teamId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const baseDoc = buildTeamBaseDoc({ ...team, teamDocumentId: teamId }, currentData)
    const isHistory = clean(target) === 'history'
    const targetRows = isHistory ? baseDoc.history : baseDoc.current
    const existingSeason = (Array.isArray(targetRows) ? targetRows : [])
      .find(row => isSameSeason(row, { seasonId, seasonKey }))

    if (Array.isArray(existingSeason?.teamPlayers) && existingSeason.teamPlayers.length > 0) {
      const error = new Error('Team roster already exists for this season')
      error.code = 'TEAM_ROSTER_ALREADY_EXISTS'
      error.seasonId = seasonId
      error.teamId = teamId
      throw error
    }

    const seasonDoc = buildTeamSeasonDoc({
      season: { ...season, seasonId, seasonKey },
      team: { ...team, birthTeamDocumentId: teamId, teamDocumentId: teamId },
      players,
    })
    const nextData = isHistory
      ? {
          ...baseDoc,
          history: upsertSeasonRows({
            rows: baseDoc.history,
            season: { seasonId, seasonKey },
            seasonDoc,
          }),
        }
      : {
          ...baseDoc,
          current: upsertSeasonRows({
            rows: baseDoc.current,
            season: { seasonId, seasonKey },
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
      playersCount: seasonDoc.teamPlayers.length,
      createdTeam: !snapshot.exists(),
      players: seasonDoc.teamPlayers,
    }
  })
}

export async function appendTeamSeasonPlayer({
  season = {},
  team = {},
  target = 'current',
  player = {},
} = {}) {
  const teamId = resolveTeamLookupKey(team)
  const { seasonId, seasonKey } = normalizeSeasonIdentity({ season })
  if (!teamId) throw new Error('Missing birth team id')
  if (!seasonId && !seasonKey) throw new Error('Missing season id')

  const ref = teamDocRef(teamId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) throw new Error('Team document not found')

    const currentData = snapshot.data() || {}
    const baseDoc = buildTeamBaseDoc({ ...team, teamDocumentId: teamId }, currentData)
    const isHistory = clean(target) === 'history'
    const targetRows = isHistory ? baseDoc.history : baseDoc.current
    const seasonIndex = (Array.isArray(targetRows) ? targetRows : [])
      .findIndex(row => isSameSeason(row, { seasonId, seasonKey }))

    if (seasonIndex === -1) throw new Error('Team season not found')

    const existingSeason = targetRows[seasonIndex] || {}
    const existingPlayers = Array.isArray(existingSeason.teamPlayers)
      ? existingSeason.teamPlayers
      : []
    const normalizedPlayer = normalizeTeamPlayer(player, season)
    const existingIndex = findExistingPlayerIndex({
      lookup: buildPlayerLookup(existingPlayers),
      player: normalizedPlayer,
    })

    if (existingIndex !== -1) {
      const error = new Error('Player already exists in team roster')
      error.code = 'TEAM_PLAYER_ALREADY_EXISTS'
      error.playerId = normalizedPlayer.playerId
      throw error
    }

    const nextPlayers = [...existingPlayers, normalizedPlayer]
    const nextRows = targetRows.map((row, index) => (
      index === seasonIndex
        ? {
            ...row,
            teamPlayers: nextPlayers,
            updatedAt: new Date().toISOString(),
          }
        : row
    ))
    const nextData = isHistory
      ? { ...baseDoc, history: nextRows }
      : { ...baseDoc, current: nextRows }

    transaction.set(ref, nextData, { merge: true })

    return {
      birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
      seasonId,
      seasonKey,
      target: isHistory ? 'history' : 'current',
      playersCount: nextPlayers.length,
      player: normalizedPlayer,
    }
  })
}
