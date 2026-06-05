// src/features/hub/playerProfile/sharedModules/games/model/playerGamesStats.helpers.js

import {
  isPrivatePlayerEntity,
} from '../playerGamesModule.helpers.js'

export function clean(value) {
  if (value === undefined || value === null) return ''

  return String(value).trim()
}

export function getGameSource(game) {
  if (game && game.game) return game.game

  return game || {}
}

export function getStatsScope(player) {
  return isPrivatePlayerEntity(player) ? 'privatePlayer' : 'player'
}

export function getStatsSource(scope) {
  if (scope === 'privatePlayer') return 'privatePlayerProfile'

  return 'playerProfile'
}

export function getGameId(game) {
  const source = getGameSource(game)

  return clean(
    source.id ||
      source.gameId ||
      game && game.id ||
      game && game.gameId
  )
}

export function getGameStatsDocId(game) {
  const source = getGameSource(game)

  return clean(
    source.statsDocId ||
      source.gameStatsDocId ||
      game && game.statsDocId ||
      game && game.gameStatsDocId
  )
}

export function getCreatedStatsDocId({ result, payload }) {
  const ids = result && result.ids ? result.ids : {}

  return clean(
    ids.gameStatsDocId ||
      result && result.gameStatsDocId ||
      payload && payload.gameStatsDocId ||
      payload && payload.statsDocId
  )
}

export function isLocalDraftSave(payload) {
  return Boolean(payload) && payload.status === 'draft'
}

export function mergeStatsDocId({ payload, draft, gameStatsDocId }) {
  if (!gameStatsDocId) return { payload, draft }

  return {
    payload: {
      ...(payload || {}),
      gameStatsDocId,
    },
    draft: {
      ...(draft || {}),
      gameStatsDocId,
    },
  }
}

function getLocalDraft({ gameId, statsPayloadsByGameId }) {
  if (!gameId) return null
  if (!statsPayloadsByGameId) return null

  return statsPayloadsByGameId[gameId] || null
}

function getDraftStatsDocId(draft) {
  if (!draft) return ''

  return clean(draft.gameStatsDocId || draft.statsDocId)
}

function resolveFirestoreDocId({ editingStatsGame, activeStatsFormDraft }) {
  const fromGame = getGameStatsDocId(editingStatsGame)

  if (fromGame) return fromGame

  return getDraftStatsDocId(activeStatsFormDraft)
}

export function buildStatsDeleteAction({
  editingStatsGame,
  activeStatsFormDraft,
  statsPayloadsByGameId,
}) {
  const gameId = getGameId(editingStatsGame)

  const localDraft = getLocalDraft({
    gameId,
    statsPayloadsByGameId,
  })

  if (isLocalDraftSave(localDraft)) {
    return {
      type: 'localDraft',
      label: 'מחיקת טיוטה',
      color: 'danger',
      disabled: false,
    }
  }

  const firestoreDocId = resolveFirestoreDocId({
    editingStatsGame,
    activeStatsFormDraft,
  })

  if (firestoreDocId) {
    return {
      type: 'firestoreStats',
      label: 'מחיקת טופס סטטיסטיקה',
      color: 'danger',
      disabled: false,
    }
  }

  return null
}

function getMetaValue(source, key) {
  if (!source) return ''

  const meta = source.meta || {}

  return meta[key] || ''
}

function resolveDeleteScope({ draft, activeStatsFormDraft, livePlayer }) {
  return (
    draft && draft.scope ||
    activeStatsFormDraft && activeStatsFormDraft.scope ||
    getMetaValue(draft, 'scope') ||
    getMetaValue(activeStatsFormDraft, 'scope') ||
    getStatsScope(livePlayer)
  )
}

function resolveDeleteSource({ draft, activeStatsFormDraft, scope }) {
  return (
    draft && draft.source ||
    activeStatsFormDraft && activeStatsFormDraft.source ||
    getMetaValue(draft, 'source') ||
    getMetaValue(activeStatsFormDraft, 'source') ||
    getStatsSource(scope)
  )
}

function resolveDeletePlayerId({ livePlayer, draft, activeStatsFormDraft }) {
  return (
    livePlayer && livePlayer.id ||
    draft && draft.playerId ||
    getMetaValue(draft, 'playerId') ||
    getMetaValue(activeStatsFormDraft, 'playerId') ||
    ''
  )
}

function resolveDeleteTeamId({ liveTeam, draft, targetGame }) {
  if (liveTeam && liveTeam.id) return liveTeam.id
  if (draft && draft.teamId) return draft.teamId
  if (targetGame && targetGame.teamId) return targetGame.teamId

  return ''
}

export function buildStatsDeletePayload({
  gameId,
  gameStatsDocId,
  livePlayer,
  liveTeam,
  targetGame,
  draft,
  activeStatsFormDraft,
}) {
  const scope = resolveDeleteScope({
    draft,
    activeStatsFormDraft,
    livePlayer,
  })

  const source = resolveDeleteSource({
    draft,
    activeStatsFormDraft,
    scope,
  })

  const playerId = resolveDeletePlayerId({
    livePlayer,
    draft,
    activeStatsFormDraft,
  })

  return {
    gameId,
    teamId: resolveDeleteTeamId({ liveTeam, draft, targetGame }),
    gameStatsDocId,
    source,
    scope,
    playerId,
    meta: {
      ...(draft && draft.meta ? draft.meta : {}),
      ...(activeStatsFormDraft && activeStatsFormDraft.meta ? activeStatsFormDraft.meta : {}),
      playerId,
      scope,
      source,
    },
  }
}
