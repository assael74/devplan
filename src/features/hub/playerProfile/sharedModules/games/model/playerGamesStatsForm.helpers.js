// src/features/hub/playerProfile/sharedModules/games/model/playerGamesStatsForm.helpers.js

import {
  createInitialGameStatsDraft,
} from '../../../../../../ui/forms/gameStatsForm/logic/index.js'

import {
  getPlayerId,
  getPlayerName,
  isPlayerInSquad,
  isPlayerStarting,
  toNumber,
} from '../../../../../../ui/forms/gameStatsForm/logic/core/form.helpers.js'

import {
  clean,
  getGameId,
  getGameSource,
  getGameStatsDocId,
  getStatsSource,
} from './playerGamesStats.helpers.js'

function hasValue(value) {
  return value !== undefined && value !== null
}

function pickValue(values, fallback = '') {
  for (const value of values) {
    if (hasValue(value)) return value
  }

  return fallback
}

export function getGamePlayers(game) {
  const source = getGameSource(game)

  if (Array.isArray(source.gamePlayers)) return source.gamePlayers

  return []
}

export function indexPlayersById(players) {
  return new Map(
    (Array.isArray(players) ? players : [])
      .map(player => [clean(getPlayerId(player)), player])
      .filter(([id]) => Boolean(id))
  )
}

export function findPlayerEntry({ game, player }) {
  const playerId = clean(player && player.id)
  const players = getGamePlayers(game)

  return players.find(item => clean(getPlayerId(item)) === playerId) || null
}

export function buildPlayerEntry({ game, player }) {
  const source = getGameSource(game)
  const entry = findPlayerEntry({ game, player })
  const identity = player || entry || {}

  const isStarting = pickValue([
    entry && entry.isStarting,
    entry && entry.onStart,
  ], false)

  const onSquad = pickValue([
    entry && entry.onSquad,
  ], true)

  const timePlayed = pickValue([
    entry && entry.timePlayed,
    source.gameDuration,
  ])

  const timeVideoStats = pickValue([
    entry && entry.timeVideoStats,
    entry && entry.timePlayed,
    source.gameDuration,
  ])

  return {
    ...(entry || {}),
    id: player && player.id || entry && entry.id || '',
    playerId: player && player.id || entry && entry.playerId || entry && entry.id || '',
    name: getPlayerName(identity),
    photo: identity.photo || entry && entry.photo || '',
    position:
      entry && entry.position ||
      identity.primaryPosition ||
      identity.position ||
      '',
    isSelected: true,
    isStarting,
    onSquad,
    timePlayed: toNumber(timePlayed),
    timeVideoStats: toNumber(timeVideoStats),
  }
}

function buildStatsDocPlayerRow({
  row,
  source,
  gamePlayersById,
  contextPlayersById,
}) {
  const playerId = clean(row.playerId || row.id)

  if (!playerId) return null

  const fromContext = contextPlayersById.get(playerId)
  const fromGame = gamePlayersById.get(playerId)
  const identity = fromContext || fromGame || row

  const timePlayed = pickValue([
    row.timePlayed,
    identity.timePlayed,
    source.gameDuration,
  ])

  const timeVideoStats = pickValue([
    row.timeVideoStats,
    row.timePlayed,
    identity.timeVideoStats,
    identity.timePlayed,
    source.gameDuration,
  ])

  return {
    ...identity,
    id: playerId,
    playerId,
    name: getPlayerName(identity),
    photo: identity.photo || identity.playerPhoto || '',
    position:
      row.position ||
      identity.primaryPosition ||
      identity.position ||
      '',
    isSelected: true,
    isStarting: isPlayerStarting(identity) || row.isStarting === true,
    onSquad: isPlayerInSquad(identity) || row.isSelected === true,
    timePlayed: toNumber(timePlayed),
    timeVideoStats: toNumber(timeVideoStats),
  }
}

export function buildStatsDocPlayers({
  statsDoc,
  game,
  player,
  contextPlayers,
}) {
  const source = getGameSource(game)
  const gamePlayersById = indexPlayersById(getGamePlayers(game))
  const contextPlayersById = indexPlayersById(contextPlayers)
  const rows = statsDoc && Array.isArray(statsDoc.playerStats)
    ? statsDoc.playerStats
    : []

  const statsPlayers = rows
    .map(row => {
      return buildStatsDocPlayerRow({
        row,
        source,
        gamePlayersById,
        contextPlayersById,
      })
    })
    .filter(Boolean)

  const currentPlayerId = clean(player && player.id)
  const hasCurrentPlayer = statsPlayers.some(item => {
    return item.playerId === currentPlayerId
  })

  if (hasCurrentPlayer || !currentPlayerId) return statsPlayers

  return [
    ...statsPlayers,
    buildPlayerEntry({ game, player }),
  ]
}

export function buildPlayerStatsFormGame({
  game,
  team,
  player,
  statsDoc = null,
  contextPlayers = [],
}) {
  const source = getGameSource(game)
  const gameId = getGameId(game)
  const teamId = clean(source.teamId || game && game.teamId || team && team.id)
  const statsDocId = getGameStatsDocId(game)

  const statsPlayers = statsDoc
    ? buildStatsDocPlayers({ statsDoc, game, player, contextPlayers })
    : []

  return {
    ...source,
    id: gameId,
    gameId,
    teamId,
    statsDocId,
    gameStatsDocId: statsDocId,
    gamePlayers: statsPlayers.length
      ? statsPlayers
      : [buildPlayerEntry({ game, player })],
  }
}

function lockPlayerRow({ row, playerId }) {
  const rowPlayerId = clean(row.playerId || row.id)
  const isEditable = rowPlayerId === playerId

  return {
    ...row,
    isStatsLocked: !isEditable,
    statsDisabled: !isEditable,
    readOnly: !isEditable,
    isEditableStatsPlayer: isEditable,
  }
}

function buildSelectedPlayerIds({ draft, playerId }) {
  const selectedPlayerIds = Array.isArray(draft.selectedPlayerIds)
    ? draft.selectedPlayerIds
    : []

  if (selectedPlayerIds.includes(playerId)) return selectedPlayerIds

  return [...selectedPlayerIds, playerId]
}

export function lockDraftToPlayer({ draft, player, scope = 'player' }) {
  const playerId = clean(player && player.id)

  if (!draft || !playerId) return draft

  const source = getStatsSource(scope)

  return {
    ...draft,
    scope,
    source,
    activePlayerId: playerId,
    editablePlayerId: playerId,
    selectedPlayerIds: buildSelectedPlayerIds({ draft, playerId }),
    players: Array.isArray(draft.players)
      ? draft.players.map(row => lockPlayerRow({ row, playerId }))
      : [],
    playerStats: Array.isArray(draft.playerStats)
      ? draft.playerStats.map(row => lockPlayerRow({ row, playerId }))
      : [],
    meta: {
      ...(draft.meta || {}),
      scope,
      source,
      playerId,
      editablePlayerId: playerId,
    },
  }
}

export function createScopedInitialDraft({ game, team, player, scope }) {
  return lockDraftToPlayer({
    draft: createInitialGameStatsDraft({ game, team }),
    player,
    scope,
  })
}
