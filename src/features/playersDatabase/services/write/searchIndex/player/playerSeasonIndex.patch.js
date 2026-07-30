// features/playersDatabase/services/write/searchIndex/player/playerSeasonIndex.patch.js

import { doc, serverTimestamp, writeBatch } from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { adaptPlayerScoutEngineResult } from '../../../../domain/index.js'
import { clean } from '../../leagues/leagueDoc.js'
import { buildSearchIndexWriteResult, SEARCH_INDEX_ENTITY_TYPES } from '../shared/searchIndexResult.model.js'
import { buildPlayerSeasonIndexDoc } from './playerSeasonIndex.model.js'
import {
  buildScoutProfileSearchIds,
  normalizeScoutSignalsForIndex,
} from './playerSeasonIndex.scout.js'
import {
  buildPlayerSeasonIndexIdFromPayload,
  findPlayerSeasonIndexDocForPayload,
} from './playerSeasonIndex.query.js'

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
  const id = existingDoc?.id || buildPlayerSeasonIndexIdFromPayload({ season, team, player })
  if (!id) throw new Error('Missing player season index id')

  const ref = existingDoc?.ref || doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, id)
  const batch = writeBatch(db)

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
      seasonNotes: clean(payload.notes),
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
  const scoutSignals = Array.isArray(payload?.player?.scoutSignals)
    ? payload.player.scoutSignals
    : []
  const player = {
    ...(payload.player || {}),
    primaryPosition: clean(payload.primaryPosition || payload.player?.primaryPosition),
    positionLayer: clean(payload.positionLayer || payload.player?.positionLayer),
    numShirt: clean(payload.numShirt || payload.player?.numShirt),
    scoutSignals,
  }

  return updatePlayerSeasonSearchIndexFields({
    ...payload,
    player,
    fields: buildPlayerSeasonIndexDoc({
      league: payload.league || {},
      season: payload.season || {},
      team: payload.team || {},
      target: payload.target || 'current',
      player,
    }),
  })
}

export const updatePlayerSeasonSearchIndexScoutProfiles = payload => {
  const player = payload?.player || {}
  const scoutSignals = normalizeScoutSignalsForIndex(player)
  const playerScout = adaptPlayerScoutEngineResult({
    signals: scoutSignals,
    combinations: Array.isArray(player.scoutCombinations)
      ? player.scoutCombinations
      : [],
  })
  const primaryProfile = playerScout.primaryProfile
  const secondaryProfile = playerScout.secondaryProfile
  const scoutProfileIds = playerScout.profileIds
  const scoutCombinationIds = playerScout.combinationIds

  return updatePlayerSeasonSearchIndexFields({
    ...payload,
    player,
    fields: {
      primaryScoutProfileId: clean(primaryProfile?.id),
      primaryScoutReliabilityLevel: clean(primaryProfile?.reliability?.level),
      primaryScoutScore: Number.isFinite(Number(primaryProfile?.score))
        ? Number(primaryProfile.score)
        : null,
      secondaryScoutProfileId: clean(secondaryProfile?.id),
      secondaryScoutReliabilityLevel: clean(secondaryProfile?.reliability?.level),
      secondaryScoutScore: Number.isFinite(Number(secondaryProfile?.score))
        ? Number(secondaryProfile.score)
        : null,
      scoutProfileIds,
      scoutCombinationIds,
      scoutProfileSearchIds: buildScoutProfileSearchIds({
        scoutProfileIds,
        scoutCombinationIds,
      }),
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
