// features/playersDatabase/services/write/searchIndex/player/playerSeasonIndex.query.js

import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { buildSeasonKey, clean } from '../../leagues/leagueDoc.js'
import { buildPlayerSeasonScope } from '../../shared/playerSeasonScope.js'
import {
  buildPlayerSeasonIndexId,
  buildPlayerSeasonIndexLookup,
  buildPlayerSeasonIndexScope,
  findExistingPlayerSeasonIndexDoc,
  isSamePlayerSeasonIndexContext,
  normalizeText,
} from './playerSeasonIndex.model.js'

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
    season: { ...season, seasonId, seasonKey },
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
    season: { ...season, seasonId, seasonKey },
    team,
  })
  const indexScope = buildPlayerSeasonIndexScope({
    league,
    season: { ...season, seasonId, seasonKey, leagueId },
    team,
  })
  const teamId = teamScope.birthTeamId
  if (!teamId || !seasonKey) return null

  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where(indexScope.clubId ? 'clubId' : 'teamId', '==', indexScope.clubId || teamId)
  )
  const snapshot = await getDocs(rowsQuery)
  const existingDocs = snapshot.docs.filter(playerDoc => (
    isSamePlayerSeasonIndexContext(playerDoc.data() || {}, indexScope)
  ))

  return findExistingPlayerSeasonIndexDoc({
    lookup: buildPlayerSeasonIndexLookup(existingDocs),
    player,
  })
}

