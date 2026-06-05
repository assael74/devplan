// src/ui/forms/create/logic/games/gameCreate.logic.js

import {
  buildGameInfoItem,
  buildGameTimeItem,
  buildGameResultItem,
} from '../../../helpers/gameForm.helpers.js'

import { createShort } from '../../../../../services/firestore/shorts/shortsCreate'
import { makeId } from '../../../../../utils/id.js'

export const DEFAULT_GAME_HOUR = '12:00'

const clean = value => String(value ?? '').trim()

const toNum = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const resolveResult = ({ goalsFor, goalsAgainst }) => {
  const gf = toNum(goalsFor)
  const ga = toNum(goalsAgainst)

  if (gf > ga) return 'win'
  if (gf < ga) return 'loss'

  return 'draw'
}

export const normalizeGameCreateDraft = (draft = {}) => ({
  ...draft,
  gameHour: clean(draft?.gameHour) || DEFAULT_GAME_HOUR,
  gameLeagueNum: draft?.gameLeagueNum ?? '',
  goalsFor: toNum(draft?.goalsFor),
  goalsAgainst: toNum(draft?.goalsAgainst),
  result: clean(draft?.result) || resolveResult({
    goalsFor: draft?.goalsFor,
    goalsAgainst: draft?.goalsAgainst,
  }),
})

export const buildGameCreateItems = ({ id, draft, now }) => {
  const gameDraft = normalizeGameCreateDraft(draft)

  const gameInfoItem = buildGameInfoItem({
    id,
    draft: gameDraft,
    now,
  })

  const gameTimeItem = buildGameTimeItem({
    id,
    draft: gameDraft,
  })

  const gameResultItem = buildGameResultItem({
    id,
    draft: gameDraft,
  })

  return {
    gameDraft,
    gameInfoItem,
    gameTimeItem,
    gameResultItem,
    mergedItem: {
      ...gameInfoItem,
      ...gameTimeItem,
      ...gameResultItem,
    },
  }
}

export const createGameShorts = async ({ draft }) => {
  const id = makeId()
  const now = Date.now()

  const {
    gameInfoItem,
    gameTimeItem,
    gameResultItem,
    mergedItem,
  } = buildGameCreateItems({
    id,
    draft,
    now,
  })

  await Promise.all([
    createShort({ shortKey: 'games.gameInfo', item: gameInfoItem }),
    createShort({ shortKey: 'games.gameTime', item: gameTimeItem }),
    createShort({ shortKey: 'games.gameResult', item: gameResultItem }),
  ])

  return mergedItem
}

export const createGamesShorts = async ({ draft }) => {
  const rows = Array.isArray(draft?.games) ? draft.games : []

  const tasks = rows.map(async row => {
    const gameDraft = normalizeGameCreateDraft({
      ...draft,
      ...row,
      gameHour: row?.gameHour || draft?.defaults?.gameHour || DEFAULT_GAME_HOUR,
      gameLeagueNum: row?.gameLeagueNum ?? draft?.gameLeagueNum ?? '',
      type: row?.type || draft?.defaults?.type || '',
      gameDuration: row?.gameDuration || draft?.defaults?.gameDuration || '',
      home: row?.home ?? draft?.defaults?.home ?? true,
      goalsFor: row?.goalsFor ?? draft?.goalsFor ?? 0,
      goalsAgainst: row?.goalsAgainst ?? draft?.goalsAgainst ?? 0,
    })

    return createGameShorts({
      draft: gameDraft,
    })
  })

  const created = await Promise.all(tasks)

  return {
    total: created.length,
    items: created,
  }
}
