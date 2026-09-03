// src/features/playersDatabase/services/write/teams/teamSeasonPlayer.js

import { db } from '../../../../../services/firebase/firebase.js'
import { buildSeasonKey, clean } from '../leagues/leagueDoc.js'
import { buildPlayerMatchValues } from '../../../model/playerIdentity.model.js'
import { buildScoutProfilesSummary } from '../../../model/scoutProfilesSummary.model.js'
import { normalizeSeasonIdentity } from '../../../model/season.model.js'
import { resolveTeamLookupKey } from '../../../model/teamIdentity.model.js'
import { getPlayerMergeKey, normalizeTeamPlayer } from './teamSeason.model.js'
import { buildTeamPlayerScoutProjection } from '../shared/playerScoutProjection.js'
import {
  buildTeamSeasonDocumentData,
  teamSeasonDocRef,
} from './teamSeasonDoc.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { withTeamBalanceSnapshot } from './teamBalanceSnapshot.js'
import { buildPlayerLineClassificationState } from '../../../domain/orchestration/buildPlayerLineClassificationState.js'

const normalizeComparableValue = value => Array.isArray(value)
  ? value.map(normalizeComparableValue)
  : value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype
    ? Object.keys(value).sort().reduce((result, key) => ({
      ...result,
      [key]: normalizeComparableValue(value[key]),
    }), {})
    : value

const isPatchUnchanged = ({ current = {}, patch = {} } = {}) => (
  Object.keys(patch).every(key => JSON.stringify(normalizeComparableValue(current[key])) ===
    JSON.stringify(normalizeComparableValue(patch[key])))
)

const context = ({ team, teamId }) => ({ ...team, id: teamId, birthTeamDocumentId: teamId })
const targetFor = seasonStatus => (
  clean(seasonStatus) === 'completed' ? 'history' : 'current'
)

const result = ({ teamId, ref, seasonId, seasonKey, target, updated, reason = '', changed, writeSkipped, scoutProfilesSummary, seasonDocument, player }) => ({
  birthTeamDocumentId: teamId,
  teamDocumentId: teamId,
  teamSeasonDocumentId: ref?.id || '',
  seasonId,
  seasonKey,
  target,
  updated,
  ...(reason ? { reason } : {}),
  ...(typeof changed === 'boolean' ? { changed } : {}),
  ...(typeof writeSkipped === 'boolean' ? { writeSkipped } : {}),
  ...(scoutProfilesSummary ? { scoutProfilesSummary } : {}),
  ...(seasonDocument ? { seasonDocument } : {}),
  ...(player ? { player } : {}),
})

const persistSeason = ({ transaction, ref, team, teamId, season, current, next }) => {
  const persisted = buildTeamSeasonDocumentData({
    team: { ...team, birthTeamDocumentId: teamId },
    season,
    seasonDoc: next,
    existingData: current,
  })
  transaction.set(ref, persisted)
  return persisted
}

const updateSeasonPlayer = async ({ season = {}, team = {}, player = {}, buildPatch, includeScoutSummary = false } = {}) => {
  const teamId = resolveTeamLookupKey(team)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const playerKey = getPlayerMergeKey(player)
  if (!teamId) throw new Error('Missing birth team id')
  if (!seasonId || !playerKey || typeof buildPatch !== 'function') throw new Error('Missing Team Season player update identity')

  const ref = teamSeasonDocRef({ birthTeamDocumentId: teamId, seasonKey })
  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) return result({ teamId, ref, seasonId, seasonKey, target: targetFor(season.seasonStatus), updated: false, reason: 'teamSeasonMissing' })
    const current = snapshot.data() || {}
    const sourceTarget = targetFor(current.seasonStatus || season.seasonStatus)
    const players = Array.isArray(current.teamPlayers) ? current.teamPlayers : []
    let found = false
    let changed = false
    let updatedPlayer = null
    const nextPlayers = players.map(existing => {
      if (getPlayerMergeKey(existing) !== playerKey) return existing
      found = true
      const patch = buildPatch(existing, current)
      if (isPatchUnchanged({ current: existing, patch })) {
        updatedPlayer = existing
        return existing
      }
      changed = true
      updatedPlayer = normalizeTeamPlayer({ ...existing, ...patch }, current)
      return updatedPlayer
    })
    const scoutProfilesSummary = includeScoutSummary ? buildScoutProfilesSummary(nextPlayers) : null
    if (!changed) return result({ teamId, ref, seasonId, seasonKey, target: sourceTarget, updated: found, changed: false, writeSkipped: found, scoutProfilesSummary, seasonDocument: current, player: updatedPlayer })
    const next = withTeamBalanceSnapshot({
      seasonDoc: { ...current, teamPlayers: nextPlayers, playersCount: nextPlayers.length, ...(scoutProfilesSummary ? { scoutProfilesSummary } : {}), updatedAt: new Date().toISOString() },
      teamRoot: context({ team, teamId }),
    })
    const persisted = persistSeason({ transaction, ref, team, teamId, season: { ...season, seasonId, seasonKey }, current, next })
    return result({ teamId, ref, seasonId, seasonKey, target: sourceTarget, updated: true, changed: true, writeSkipped: false, scoutProfilesSummary, seasonDocument: persisted, player: updatedPlayer })
  })
}

export async function updateTeamSeasonPlayerUrl({ season = {}, team = {}, player = {}, playerUrl = '' } = {}) {
  const nextPlayerUrl = clean(player.playerUrl || playerUrl)
  const matches = new Set(buildPlayerMatchValues(player).map(value => clean(value).toLowerCase()).filter(Boolean))
  return updateSeasonPlayer({
    season, team, player,
    buildPatch: existing => (
      buildPlayerMatchValues(existing).some(value => matches.has(clean(value).toLowerCase()))
        ? { playerUrl: nextPlayerUrl, updatedAt: new Date().toISOString() }
        : {}
    ),
  })
}

export async function removeTeamSeasonPlayerScoutProfile({ player = {}, ...payload } = {}) {
  return updateSeasonPlayer({ ...payload, includeScoutSummary: true, player, buildPatch: () => buildTeamPlayerScoutProjection(player) })
}

export async function updateTeamSeasonPlayerScoutProjection({ player = {}, ...payload } = {}) {
  return updateSeasonPlayer({ ...payload, includeScoutSummary: true, player, buildPatch: () => buildTeamPlayerScoutProjection(player) })
}

const findScoutedPlayer = ({ player = {}, scoutedPlayers = [] } = {}) => {
  const keys = new Set(buildPlayerMatchValues(player).map(value => clean(value).toLowerCase()).filter(Boolean))
  return (Array.isArray(scoutedPlayers) ? scoutedPlayers : []).find(candidate => (
    buildPlayerMatchValues(candidate).some(value => keys.has(clean(value).toLowerCase()))
  )) || null
}

export async function updateTeamSeasonPlayersScoutProjections({ season = {}, team = {}, scoutedPlayers = [] } = {}) {
  const teamId = resolveTeamLookupKey(team)
  const { seasonId, seasonKey } = normalizeSeasonIdentity({ season })
  if (!teamId || !seasonId) throw new Error('Missing Team Season identity')
  const ref = teamSeasonDocRef({ birthTeamDocumentId: teamId, seasonKey })
  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) return result({ teamId, ref, seasonId, seasonKey, target: targetFor(season.seasonStatus), updated: false, reason: 'teamSeasonMissing' })
    const current = snapshot.data() || {}
    const sourceTarget = targetFor(current.seasonStatus || season.seasonStatus)
    const players = Array.isArray(current.teamPlayers) ? current.teamPlayers : []
    const nextPlayers = players.map(player => {
      const scouted = findScoutedPlayer({ player, scoutedPlayers })
      return scouted ? { ...player, ...buildTeamPlayerScoutProjection(scouted) } : player
    })
    const scoutProfilesSummary = buildScoutProfilesSummary(nextPlayers)
    const changed = JSON.stringify(normalizeComparableValue(players)) !== JSON.stringify(normalizeComparableValue(nextPlayers)) ||
      JSON.stringify(normalizeComparableValue(current.scoutProfilesSummary || {})) !== JSON.stringify(normalizeComparableValue(scoutProfilesSummary))
    if (!changed) return { ...result({ teamId, ref, seasonId, seasonKey, target: sourceTarget, updated: true, changed: false, writeSkipped: true, scoutProfilesSummary, seasonDocument: current }), players, playersCount: players.length, teamBalance: current.teamBalance || null }
    const next = { ...current, teamPlayers: nextPlayers, playersCount: nextPlayers.length, scoutProfilesSummary, updatedAt: new Date().toISOString() }
    const persisted = persistSeason({ transaction, ref, team, teamId, season, current, next })
    return { ...result({ teamId, ref, seasonId, seasonKey, target: sourceTarget, updated: true, changed: true, writeSkipped: false, scoutProfilesSummary, seasonDocument: persisted }), players: nextPlayers, playersCount: nextPlayers.length, teamBalance: persisted.teamBalance || null }
  })
}

export async function updateTeamSeasonPlayerVerificationAndScout({ player = {}, ...payload } = {}) {
  return updateSeasonPlayer({ ...payload, player, buildPatch: () => ({}) })
}

export async function updateTeamSeasonPlayerRoleAndScoutProfiles({ player = {}, primaryPosition = '', positionLayer = '', numShirt = '', ...payload } = {}) {
  return updateSeasonPlayer({
    ...payload,
    player,
    buildPatch: existing => {
      const nextRole = {
        ...existing,
        primaryPosition: clean(primaryPosition),
        positionLayer: clean(positionLayer),
        numShirt: clean(numShirt),
      }

      return {
        primaryPosition: nextRole.primaryPosition,
        positionLayer: nextRole.positionLayer,
        numShirt: nextRole.numShirt,
        lineClassification: buildPlayerLineClassificationState({ player: nextRole }),
      }
    },
  })
}
