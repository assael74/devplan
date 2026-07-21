// features/playersDatabase/services/write/searchIndex/player/playerSeasonIndex.patch.js

import { doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { clean } from '../../leagues/leagueDoc.js'
import { buildSearchIndexWriteResult, SEARCH_INDEX_ENTITY_TYPES } from '../shared/searchIndexResult.model.js'
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
  const primaryScoutSignal = scoutSignals[0] || null
  const secondaryScoutSignal = scoutSignals[1] || null

  return updatePlayerSeasonSearchIndexFields({
    ...payload,
    fields: {
      primaryPosition: clean(payload.primaryPosition),
      positionLayer: clean(payload.positionLayer),
      numShirt: clean(payload.numShirt),
      primaryScoutProfileId: clean(primaryScoutSignal?.profileId),
      primaryScoutReliabilityLevel: clean(primaryScoutSignal?.reliability?.level),
      primaryScoutScore: Number.isFinite(Number(primaryScoutSignal?.score)) ? Number(primaryScoutSignal.score) : null,
      secondaryScoutProfileId: clean(secondaryScoutSignal?.profileId),
      secondaryScoutReliabilityLevel: clean(secondaryScoutSignal?.reliability?.level),
      secondaryScoutScore: Number.isFinite(Number(secondaryScoutSignal?.score)) ? Number(secondaryScoutSignal.score) : null,
    },
  })
}

export const clearPlayerSeasonSearchIndexScoutProfile = payload =>
  updatePlayerSeasonSearchIndexFields({
    ...payload,
    fields: {
      primaryScoutProfileId: '',
      primaryScoutReliabilityLevel: '',
      primaryScoutScore: null,
      secondaryScoutProfileId: '',
      secondaryScoutReliabilityLevel: '',
      secondaryScoutScore: null,
    },
  })
