// src/ui/forms/create/logic/games/externalGameCreate.logic.js

import {
  buildGameInfoItem,
  buildGameTimeItem,
  buildGameResultItem,
} from '../../../helpers/gameForm.helpers.js'

import { createShort } from '../../../../../services/firestore/shorts/shortsCreate'
import { makeId } from '../../../../../utils/id.js'
import { DEFAULT_GAME_HOUR } from './gameCreate.logic.js'

const clean = value => String(value ?? '').trim()

const toNum = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const toBool = (value, fallback = false) => {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

const resolveResult = ({ goalsFor, goalsAgainst }) => {
  const gf = toNum(goalsFor)
  const ga = toNum(goalsAgainst)

  if (gf > ga) return 'win'
  if (gf < ga) return 'loss'

  return 'draw'
}

export const buildExternalGameInfoItem = ({ id, draft, now }) => {
  return {
    ...buildGameInfoItem({ id, draft, now }),
    ...buildGameTimeItem({ id, draft }),
    ...buildGameResultItem({ id, draft }),

    playerId: clean(draft?.playerId),
    teamName: clean(draft?.teamName),
    clubName: clean(draft?.clubName),

    result: clean(draft?.result) || resolveResult({
      goalsFor: draft?.goalsFor,
      goalsAgainst: draft?.goalsAgainst,
    }),

    gameSource: 'external',
    isExternalGame: true,
  }
}

export const buildExternalGamePlayersItem = ({ id, draft }) => {
  const goalsFor = toNum(draft?.goalsFor)

  return {
    id,
    playerId: clean(draft?.playerId),
    isSelected: toBool(draft?.isSelected, true),
    isStarting: toBool(draft?.isStarting, false),
    onSquad: toBool(draft?.isSelected, true),
    onStart: toBool(draft?.isStarting, false),
    goals: Math.min(toNum(draft?.goals), goalsFor),
    assists: Math.min(toNum(draft?.assists), goalsFor),
    timePlayed: toNum(draft?.timePlayed),
  }
}

export const buildExternalGameDraft = ({ draft, context, row = {} }) => {
  const player = context?.player || context?.entity || {}

  const merged = {
    ...draft,
    ...row,
  }

  return {
    ...merged,
    playerId: clean(merged?.playerId || context?.playerId || player?.id),

    teamId: clean(merged?.teamId || context?.teamId || player?.teamId),
    clubId: clean(merged?.clubId || context?.clubId || player?.clubId),

    teamName: clean(merged?.teamName || player?.teamName || player?.team?.teamName),
    clubName: clean(merged?.clubName || player?.clubName || player?.club?.clubName),

    gameHour: clean(merged?.gameHour) || DEFAULT_GAME_HOUR,
    home: toBool(merged?.home, true),
    goalsFor: toNum(merged?.goalsFor),
    goalsAgainst: toNum(merged?.goalsAgainst),
    result: clean(merged?.result) || resolveResult({
      goalsFor: merged?.goalsFor,
      goalsAgainst: merged?.goalsAgainst,
    }),

    isSelected: toBool(merged?.isSelected, true),
    isStarting: toBool(merged?.isStarting, false),
    goals: toNum(merged?.goals),
    assists: toNum(merged?.assists),
    timePlayed: toNum(merged?.timePlayed),

    gameSource: 'external',
    isExternalGame: true,
  }
}

export const createExternalGameShorts = async ({ draft, context }) => {
  const id = makeId()
  const now = Date.now()
  const externalDraft = buildExternalGameDraft({ draft, context })

  const gameInfoItem = buildExternalGameInfoItem({
    id,
    draft: externalDraft,
    now,
  })

  const gamePlayersItem = buildExternalGamePlayersItem({
    id,
    draft: externalDraft,
  })

  await Promise.all([
    createShort({
      shortKey: 'externalGames.gameInfo',
      item: gameInfoItem,
    }),
    createShort({
      shortKey: 'externalGames.gamePlayers',
      item: gamePlayersItem,
    }),
  ])

  return {
    ...gameInfoItem,
    ...gamePlayersItem,
  }
}

export const createExternalGamesShorts = async ({ draft, context }) => {
  const rows = Array.isArray(draft?.games) ? draft.games : []

  const tasks = rows.map(row => {
    const rowDraft = {
      ...draft,
      ...row,
      gameHour: row?.gameHour || draft?.defaults?.gameHour || DEFAULT_GAME_HOUR,
      gameLeagueNum: row?.gameLeagueNum ?? draft?.gameLeagueNum ?? '',
      type: row?.type || draft?.defaults?.type || '',
      gameDuration: row?.gameDuration || draft?.defaults?.gameDuration || '',
      home: row?.home ?? draft?.defaults?.home ?? true,
      goalsFor: row?.goalsFor ?? draft?.goalsFor ?? 0,
      goalsAgainst: row?.goalsAgainst ?? draft?.goalsAgainst ?? 0,
    }

    return createExternalGameShorts({
      draft: rowDraft,
      context,
    })
  })

  const created = await Promise.all(tasks)

  return {
    total: created.length,
    items: created,
  }
}
