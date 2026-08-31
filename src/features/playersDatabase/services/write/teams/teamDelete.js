import { db } from '../../../../../services/firebase/firebase.js'
import { clean } from '../leagues/leagueDoc.js'
import { normalizeSeasonIdentity } from '../../../model/season.model.js'
import { resolveTeamLookupKey } from '../../../model/teamIdentity.model.js'
import { getPlayerMergeKey } from './teamSeason.model.js'
import { teamSeasonDocRef, buildTeamSeasonDocumentData } from './teamSeasonDoc.js'
import {
  buildTeamRootWithSeasonIndex,
  buildTeamRootWithoutSeasonIndex,
  teamDocRef,
} from './teamDoc.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { withTeamBalanceSnapshot } from './teamBalanceSnapshot.js'
import { buildScoutProfilesSummary } from '../../../model/scoutProfilesSummary.model.js'

export const buildTeamPlayersScoutProfilesSummary = buildScoutProfilesSummary

const scope = ({ team = {}, season = {} } = {}) => {
  const teamId = resolveTeamLookupKey(team)
  const identity = normalizeSeasonIdentity({ season })
  if (!teamId || !identity.seasonId) throw new Error('Missing Team Season identity')
  return { teamId, ...identity, ref: teamSeasonDocRef({ birthTeamDocumentId: teamId, seasonKey: identity.seasonKey }) }
}

const playerDocumentIds = players => [...new Set((Array.isArray(players) ? players : []).map(player => clean(player?.playerDocumentId)).filter(Boolean))]

export async function removeTeamSeason({ season = {}, team = {} } = {}) {
  const { teamId, seasonId, seasonKey, ref } = scope({ team, season })
  const rootRef = teamDocRef(teamId)
  return trackedRunTransaction(db, async transaction => {
    const [rootSnapshot, snapshot] = await Promise.all([
      transaction.get(rootRef),
      transaction.get(ref),
    ])
    const rootData = rootSnapshot.exists() ? rootSnapshot.data() || {} : null
    if (rootData) {
      transaction.set(rootRef, buildTeamRootWithoutSeasonIndex({
        team: { ...team, birthTeamDocumentId: teamId },
        currentData: rootData,
        seasonKey,
      }))
    }
    if (!snapshot.exists()) return { birthTeamDocumentId: teamId, teamDocumentId: teamId, teamSeasonDocumentId: ref.id, seasonId, seasonKey, target: clean(season.seasonStatus) === 'completed' ? 'history' : 'current', removed: false, reason: 'teamSeasonMissing' }
    const current = snapshot.data() || {}
    const players = Array.isArray(current.teamPlayers) ? current.teamPlayers : []
    transaction.delete(ref)
    return { birthTeamDocumentId: teamId, teamDocumentId: teamId, teamSeasonDocumentId: ref.id, seasonId, seasonKey, target: clean(current.seasonStatus) === 'completed' ? 'history' : 'current', removed: true, removedPlayersCount: players.length, playerDocumentIds: playerDocumentIds(players) }
  })
}

const updatePlayers = async ({
  season = {},
  team = {},
  mutate,
  seasonStatusOverride = '',
  syncTeamRoot = false,
}) => {
  const { teamId, seasonId, seasonKey, ref } = scope({ team, season })
  const rootRef = teamDocRef(teamId)
  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const rootSnapshot = syncTeamRoot
      ? await transaction.get(rootRef)
      : null
    const sourceTarget = clean(season.seasonStatus) === 'completed' ? 'history' : 'current'
    if (!snapshot.exists()) return { birthTeamDocumentId: teamId, teamDocumentId: teamId, teamSeasonDocumentId: ref.id, seasonId, seasonKey, target: sourceTarget, updated: false, reason: 'teamSeasonMissing' }
    const current = snapshot.data() || {}
    const seasonStatus = ['active', 'completed'].includes(clean(seasonStatusOverride))
      ? clean(seasonStatusOverride)
      : clean(current.seasonStatus) === 'completed'
        ? 'completed'
        : 'active'
    const persistedTarget = seasonStatus === 'completed'
      ? 'history'
      : 'current'
    const result = mutate(Array.isArray(current.teamPlayers) ? current.teamPlayers : [])
    const next = withTeamBalanceSnapshot({
      seasonDoc: { ...current, seasonStatus, teamPlayers: result.players, playersCount: result.players.length, scoutProfilesSummary: buildScoutProfilesSummary(result.players), updatedAt: new Date().toISOString() },
      teamRoot: { ...team, id: teamId, birthTeamDocumentId: teamId },
    })
    const persisted = buildTeamSeasonDocumentData({ team: { ...team, birthTeamDocumentId: teamId }, season: { ...season, seasonId, seasonKey }, seasonDoc: next, existingData: current })
    transaction.set(ref, persisted)
    if (syncTeamRoot) {
      transaction.set(rootRef, buildTeamRootWithSeasonIndex({
        team: { ...team, birthTeamDocumentId: teamId },
        currentData: rootSnapshot.exists() ? rootSnapshot.data() || {} : {},
        season: persisted,
      }))
    }
    return { birthTeamDocumentId: teamId, teamDocumentId: teamId, teamSeasonDocumentId: ref.id, seasonId, seasonKey, target: persistedTarget, updated: true, players: persisted.teamPlayers, playersCount: persisted.teamPlayers.length, removedPlayersCount: result.removed.length, playerDocumentIds: playerDocumentIds(result.removed), scoutProfilesSummary: persisted.scoutProfilesSummary, teamBalance: persisted.teamBalance || null, seasonDocument: persisted }
  })
}

export async function removeTeamPlayerFromSeason({ player = {}, ...payload } = {}) {
  const key = getPlayerMergeKey(player)
  if (!key) throw new Error('Missing player id')
  return updatePlayers({ ...payload, mutate: players => ({ players: players.filter(row => getPlayerMergeKey(row) !== key), removed: players.filter(row => getPlayerMergeKey(row) === key) }) })
}

const EMPTY_PLAYER_STATS = Object.freeze({
  games: 0,
  goals: 0,
  yellowCards: 0,
  minutes: 0,
  starts: 0,
  substituteIn: 0,
  substitutedOut: 0,
  teamMinutes: 0,
  teamGames: 0,
  teamRank: null,
  teamGoalsFor: 0,
  teamGoalsAgainst: 0,
  minutesPerGame: 0,
  goalsPer90: 0,
})

const clearTeamPlayerStatsDerivedState = player => {
  const {
    scoutSignals,
    scoutCombinations,
    scoutProfiles,
    scoutCombinationIds,
    scoutEvidence,
    scoutCandidateSignals,
    scoutProfileCaseStrength,
    scoutOpportunity,
    scoutProfileHierarchy,
    scoutPlayerInterest,
    scoutProfileProgression,
    hierarchy,
    opportunity,
    interest,
    progression,
    combinations,
    ...rosterPlayer
  } = player || {}

  return {
    ...rosterPlayer,
    statsStatus: 'missing',
    playerStats: { ...EMPTY_PLAYER_STATS },
    primaryScoutProfileId: '',
    primaryScoutProfileStrengthDepthPct: null,
    professionalScoutProfileIds: [],
    preliminaryScoutProfileIds: [],
    scoutEffectiveImmediacyStatus: '',
    scoutPlayerInterestLevel: '',
    scoutEngineVersion: '',
  }
}

// Stats clearing keeps the canonical roster and League performance projection.
// It only resets stats-owned player and Team Season derived state.
export async function clearTeamSeasonStats(payload = {}) {
  return updatePlayers({
    ...payload,
    seasonStatusOverride: clean(payload?.season?.seasonStatus),
    syncTeamRoot: true,
    mutate: players => ({
      players: players.map(clearTeamPlayerStatsDerivedState),
      removed: [],
    }),
  })
}

export async function clearTeamSeasonPlayerDocumentIds({
  playerDocumentIds = [],
  ...payload
} = {}) {
  const deletedIds = new Set(
    (Array.isArray(playerDocumentIds) ? playerDocumentIds : [])
      .map(clean)
      .filter(Boolean)
  )
  if (!deletedIds.size) return {
    updated: true,
    changed: false,
    players: [],
    playersCount: 0,
  }

  return updatePlayers({
    ...payload,
    syncTeamRoot: true,
    mutate: players => ({
      players: players.map(player => (
        deletedIds.has(clean(player?.playerDocumentId))
          ? { ...player, playerDocumentId: '' }
          : player
      )),
      removed: [],
    }),
  })
}
