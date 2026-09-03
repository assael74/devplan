// src/features/playersDatabase/services/write/searchIndex/player/playerSeasonIndex.patch.js

import {
  collection,
  doc,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import {
  createTrackedWriteBatch,
  trackedGetDocs,
} from '../../../../../../services/firestore/usage/index.js'

import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import {
  buildSeasonKey,
  clean,
  toNumberOrZero,
} from '../../leagues/leagueDoc.js'
import { buildPlayerSeasonScope } from '../../shared/playerSeasonScope.js'
import {
  buildSearchIndexWriteResult,
  SEARCH_INDEX_ENTITY_TYPES,
} from '../shared/searchIndexResult.model.js'
import { buildPlayerScoutIndexFields } from './playerSeasonIndex.scout.js'
import {
  buildPlayerSeasonIndexLookup,
  buildPlayerSeasonIndexScope,
  buildLineClassificationIndexFields,
  findExistingPlayerSeasonIndexDoc,
  isSamePlayerSeasonIndexContext,
} from './playerSeasonIndex.model.js'
import {
  buildPlayerSeasonIndexIdFromPayload,
  findPlayerSeasonIndexDocForPayload,
} from './playerSeasonIndex.query.js'

const normalizeComparableValue = value => {
  if (Array.isArray(value)) {
    return value.map(normalizeComparableValue)
  }

  if (
    value &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = normalizeComparableValue(value[key])
        return result
      }, {})
  }

  return value
}

const isPatchUnchanged = ({ existingData = {}, fields = {} } = {}) => (
  Object.keys(fields).every(key => (
    JSON.stringify(normalizeComparableValue(existingData[key])) ===
    JSON.stringify(normalizeComparableValue(fields[key]))
  ))
)

export async function updatePlayerSeasonSearchIndexFields({
  league = {},
  season = {},
  team = {},
  player = {},
  fields = {},
} = {}) {
  const existingDoc = await findPlayerSeasonIndexDocForPayload({
    league,
    season,
    team,
    player,
  })
  const id = existingDoc?.id || buildPlayerSeasonIndexIdFromPayload({
    season,
    team,
    player,
  })
  if (!id) throw new Error('Missing player season index id')

  if (!existingDoc) {
    return buildSearchIndexWriteResult({
      entityType: SEARCH_INDEX_ENTITY_TYPES.playerSeason,
      operation: 'patch',
      rowsCount: 0,
      id,
      updated: false,
      reason: 'playerSeasonIndexMissing',
    })
  }

  const ref = existingDoc.ref
  const existingData = existingDoc.data() || {}
  if (isPatchUnchanged({
    existingData,
    fields,
  })) {
    return buildSearchIndexWriteResult({
      entityType: SEARCH_INDEX_ENTITY_TYPES.playerSeason,
      operation: 'patch',
      rowsCount: 0,
      id,
      updated: true,
      changed: false,
      unchangedCount: 1,
      writeSkipped: true,
    })
  }

  const batch = createTrackedWriteBatch(db, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    action: 'playerSeasonIndex-patch',
    operationSubtype: 'maintenance-batch',
  })

  batch.set(
    ref,
    {
      ...fields,
      id,
      entityId: id,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )

  await batch.commit()

  return buildSearchIndexWriteResult({
    entityType: SEARCH_INDEX_ENTITY_TYPES.playerSeason,
    operation: 'patch',
    rowsCount: 1,
    id,
    updated: true,
  })
}

export const updatePlayerSeasonSearchIndexNotes = payload =>
  updatePlayerSeasonSearchIndexFields({
    ...payload,
    fields: {
      notes: clean(payload.notes),
    },
  })

export const updatePlayerSeasonSearchIndexPlayerUrl = payload =>
  updatePlayerSeasonSearchIndexFields({
    ...payload,
    fields: {
      playerUrl: clean(payload.player?.playerUrl || payload.playerUrl),
    },
  })

export const updatePlayerSeasonSearchIndexRole = payload => {
  const player = {
    ...(payload.player || {}),
    primaryPosition: clean(payload.primaryPosition || payload.player?.primaryPosition),
    positionLayer: clean(payload.positionLayer || payload.player?.positionLayer),
    numShirt: clean(payload.numShirt || payload.player?.numShirt),
  }

  return updatePlayerSeasonSearchIndexFields({
    ...payload,
    player,
    fields: {
      primaryPosition: player.primaryPosition,
      positionLayer: player.positionLayer,
      numShirt: player.numShirt,
      ...buildLineClassificationIndexFields(player),
      ...buildPlayerScoutIndexFields(player),
    },
  })
}

export const updatePlayerSeasonSearchIndexScoutProfiles = payload => {
  const player = payload?.player || {}

  return updatePlayerSeasonSearchIndexFields({
    ...payload,
    player,
    fields: {
      ...buildLineClassificationIndexFields(player),
      ...buildPlayerScoutIndexFields(player),
    },
  })
}

export const clearPlayerSeasonSearchIndexScoutProfile = payload =>
  updatePlayerSeasonSearchIndexScoutProfiles({
    ...payload,
    player: {
      ...(payload.player || {}),
      scoutProfiles: [],
      scoutSignals: [],
    },
  })


export async function updatePlayerSeasonSearchIndexScoutContextMany({ league = {}, season = {}, team = {}, players = [] } = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const normalizedSeason = {
    ...season,
    seasonId,
    seasonKey,
    leagueId,
  }
  const teamScope = buildPlayerSeasonScope({
    season: normalizedSeason,
    team,
  })
  const indexScope = buildPlayerSeasonIndexScope({
    league,
    season: normalizedSeason,
    team,
  })
  const teamId = teamScope.birthTeamId

  if (!teamId || !seasonKey) {
    return buildSearchIndexWriteResult({
      entityType: SEARCH_INDEX_ENTITY_TYPES.playerSeason,
      operation: 'updateScoutContextMany',
      rowsCount: 0,
      updatedCount: 0,
      missingCount: 0,
    })
  }

  const snapshot = await trackedGetDocs(
    query(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
      where('birthTeamId', '==', teamId),
      where('seasonKey', '==', seasonKey),
      where('entityType', '==', SEARCH_INDEX_ENTITY_TYPES.playerSeason)
    ),
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      action: 'playerSeasonIndex-scout-context',
      operationSubtype: 'maintenance-query',
    }
  )
  const existingDocs = snapshot.docs.filter(playerDocument => (
    isSamePlayerSeasonIndexContext(playerDocument.data() || {}, indexScope)
  ))
  const existingLookup = buildPlayerSeasonIndexLookup(existingDocs)
  const batch = createTrackedWriteBatch(db, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    action: 'playerSeasonIndex-scout-context',
    operationSubtype: 'maintenance-batch',
  })
  let updatedCount = 0
  let unchangedCount = 0
  let missingCount = 0

  ;(Array.isArray(players) ? players : []).forEach(player => {
    const match = findExistingPlayerSeasonIndexDoc({
      lookup: existingLookup,
      player,
      season: normalizedSeason,
      team,
    })
    const existingDoc = match.snapshot

    if (!existingDoc) {
      missingCount += 1
      return
    }

    const fields = {
      clubLevel: toNumberOrZero(team.clubLevel),
      clubStrengthLevel: toNumberOrZero(team.clubStrengthLevel || team.clubLevel),
      leagueLevel: toNumberOrZero(team.leagueLevel || league.level),
      leagueTotalRound: toNumberOrZero(team.leagueTotalRound || season.leagueTotalRound),
      seasonStatus: clean(season.seasonStatus || team.seasonStatus) === 'completed'
        ? 'completed'
        : 'active',
      teamTableRank: toNumberOrZero(team.tableRank),
      teamTableAttackRank: toNumberOrZero(team.tableAttackRank),
      teamTableDefenseRank: toNumberOrZero(team.tableDefenseRank),
      teamGoalsFor: toNumberOrZero(team.teamStats?.goalsFor || team.goalsFor),
      teamGoalsAgainst: toNumberOrZero(team.teamStats?.goalsAgainst || team.goalsAgainst),
      teamGoalsForPerGame: Number(team.goalsForPerGame) || 0,
      teamGamePlayed: toNumberOrZero(team.teamStats?.teamGamePlayed || team.teamGamePlayed),
      teamGames: toNumberOrZero(team.teamStats?.teamGamePlayed || team.teamGamePlayed),
      ...buildPlayerScoutIndexFields(player),
    }
    if (isPatchUnchanged({
      existingData: existingDoc.data() || {},
      fields,
    })) {
      unchangedCount += 1
      return
    }

    batch.set(
      existingDoc.ref,
      {
        ...fields,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
    updatedCount += 1
  })

  if (updatedCount) await batch.commit()

  return buildSearchIndexWriteResult({
    entityType: SEARCH_INDEX_ENTITY_TYPES.playerSeason,
    operation: 'updateScoutContextMany',
    rowsCount: updatedCount,
    updatedCount,
    unchangedCount,
    missingCount,
  })
}
