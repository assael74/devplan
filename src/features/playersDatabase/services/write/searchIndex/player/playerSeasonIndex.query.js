// features/playersDatabase/services/write/searchIndex/player/playerSeasonIndex.query.js

import {
  collection,
  query,
  where,
} from 'firebase/firestore'
import { trackedGetDocs } from '../../../../../../services/firestore/usage/index.js'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import {
  buildSeasonKey,
  clean,
} from '../../leagues/leagueDoc.js'
import { buildPlayerSeasonScope } from '../../shared/playerSeasonScope.js'
import {
  buildPlayerSeasonIndexId,
  buildPlayerSeasonIndexLookup,
  buildPlayerSeasonIndexScope,
  findExistingPlayerSeasonIndexDoc,
  isSamePlayerSeasonIndexContext,
  normalizeText,
} from './playerSeasonIndex.model.js'

const readSearchIndexes = queryRef => trackedGetDocs(queryRef, {
  feature: 'playersDatabase',
  collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
  action: 'playerSeasonIndex-query',
  operationSubtype: 'maintenance-query',
})

export const buildPlayerSeasonIndexIdFromPayload = ({
  season = {},
  team = {},
  player = {},
} = {}) => {
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const displayName = clean(player.matchedPlayerName || player.fullName)
  const normalizedDisplayName = normalizeText(player.normalizedName || displayName)
  const teamScope = buildPlayerSeasonScope({
    season: {
      ...season,
      seasonId,
      seasonKey,
    },
    team,
  })

  return buildPlayerSeasonIndexId({
    seasonKey,
    clubId: teamScope.clubId || team.clubId,
    ageGroupId: teamScope.ageGroupId || team.ageGroupId,
    ageGroupLabel: teamScope.ageGroupLabel || team.ageGroupLabel,
    birthYear: teamScope.birthYear || season.birthYear || player.birthYear,
    birthTeamSlot: teamScope.birthTeamSlot,
    playerId: clean(player.matchedPlayerId || player.playerId),
    externalPlayerId: clean(player.externalPlayerId),
    normalizedName: normalizedDisplayName || clean(player.playerId),
  })
}

export const findPlayerSeasonIndexDocForPayload = async ({
  league = {},
  season = {},
  team = {},
  player = {},
} = {}) => {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const teamScope = buildPlayerSeasonScope({
    season: {
      ...season,
      seasonId,
      seasonKey,
    },
    team,
  })
  const indexScope = buildPlayerSeasonIndexScope({
    league,
    season: {
      ...season,
      seasonId,
      seasonKey,
      leagueId,
    },
    team,
  })
  const teamId = teamScope.birthTeamId
  if (!teamId || !seasonKey) return null

  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('birthTeamId', '==', teamId),
    where('seasonKey', '==', seasonKey),
    where('entityType', '==', 'playerSeason')
  )
  const snapshot = await readSearchIndexes(rowsQuery)
  const existingDocs = snapshot.docs.filter(playerDoc => (
    isSamePlayerSeasonIndexContext(playerDoc.data() || {}, indexScope)
  ))

  return findExistingPlayerSeasonIndexDoc({
    lookup: buildPlayerSeasonIndexLookup(existingDocs),
    player,
    season: {
      ...season,
      seasonId,
      seasonKey,
    },
    team,
  }).snapshot
}

// Resolve the one canonical-or-legacy index target before a coordinated
// lifecycle transaction starts.  A duplicate identity is not safe to mutate:
// selecting the first candidate would turn a repairable data issue into data
// loss, so callers must abort before any lifecycle write.
export const resolvePlayerSeasonIndexTargetForPayload = async ({
  league = {},
  season = {},
  team = {},
  player = {},
} = {}) => {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const teamScope = buildPlayerSeasonScope({
    season: { ...season, seasonId, seasonKey },
    team,
  })
  const teamId = teamScope.birthTeamId
  if (!teamId || !seasonKey) return {
    snapshot: null,
    duplicateSnapshots: [],
    identity: {},
  }

  const indexScope = buildPlayerSeasonIndexScope({
    league,
    season: { ...season, seasonId, seasonKey, leagueId },
    team,
  })
  const snapshot = await readSearchIndexes(query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('birthTeamId', '==', teamId),
    where('seasonKey', '==', seasonKey),
    where('entityType', '==', 'playerSeason')
  ))
  const existingDocs = snapshot.docs.filter(playerDocument => (
    isSamePlayerSeasonIndexContext(playerDocument.data() || {}, indexScope)
  ))
  const match = findExistingPlayerSeasonIndexDoc({
    lookup: buildPlayerSeasonIndexLookup(existingDocs),
    player,
    season: { ...season, seasonId, seasonKey },
    team,
  })
  if (match.duplicateSnapshots.length) {
    const error = new Error('Ambiguous Player Season SearchIndex identity')
    error.code = 'PLAYER_SEASON_INDEX_AMBIGUOUS'
    error.documentIds = [match.snapshot?.id, ...match.duplicateSnapshots.map(item => item.id)]
      .filter(Boolean)
    throw error
  }
  return match
}
