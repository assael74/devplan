// src/features/hub/playerProfile/sharedModules/games/model/usePlayerGamesCoreModel.js

import { useMemo } from 'react'

import {
  resolvePlayerGamesFiltersDomain,
  sortPlayerGamesRows,
} from '../../../sharedLogic/games/module/index.js'

import {
  isLeagueGame,
  isPrivatePlayerEntity,
} from '../playerGamesModule.helpers.js'

function getContextPlayers(context) {
  if (!context) return []
  if (!Array.isArray(context.players)) return []

  return context.players
}

function resolveLivePlayer({ entity, context }) {
  const players = getContextPlayers(context)
  const livePlayer = players.find(player => {
    return player && entity && player.id === entity.id
  })

  return livePlayer || entity || null
}

function resolveLiveTeam({ context, profileData, livePlayer }) {
  if (context && context.team) return context.team

  if (
    profileData &&
    profileData.entity &&
    profileData.entity.team
  ) {
    return profileData.entity.team
  }

  if (livePlayer && livePlayer.team) return livePlayer.team

  return null
}

function addRows(acc, rows) {
  if (!Array.isArray(rows)) return acc

  return [...acc, ...rows]
}

function resolveContextPlayers({ context, liveTeam, profileData }) {
  let rows = []

  rows = addRows(rows, context && context.players)
  rows = addRows(rows, liveTeam && liveTeam.players)

  if (profileData && profileData.entity) {
    rows = addRows(rows, profileData.entity.players)

    if (profileData.entity.team) {
      rows = addRows(rows, profileData.entity.team.players)
    }
  }

  rows = addRows(rows, profileData && profileData.players)

  return rows
}

function resolvePlayerScoring(profileData) {
  if (!profileData) return null
  if (profileData.playerScoring) return profileData.playerScoring

  if (profileData.scoring && profileData.scoring.player) {
    return profileData.scoring.player
  }

  return null
}

function resolveHasAnyGames(livePlayer) {
  if (!livePlayer) return false
  if (!Array.isArray(livePlayer.playerGames)) return false

  return livePlayer.playerGames.length > 0
}

export function usePlayerGamesCoreModel({
  entity,
  context,
  profileData,
  filters,
  sort,
  seasonStartYear = 2025,
}) {
  const livePlayer = useMemo(() => {
    return resolveLivePlayer({ entity, context })
  }, [entity, context])

  const isPrivatePlayer = isPrivatePlayerEntity(livePlayer)

  const liveTeam = useMemo(() => {
    return resolveLiveTeam({ context, profileData, livePlayer })
  }, [context, profileData, livePlayer])

  const contextPlayers = useMemo(() => {
    return resolveContextPlayers({
      context,
      liveTeam,
      profileData,
    })
  }, [context, liveTeam, profileData])

  const playerScoring = useMemo(() => {
    return resolvePlayerScoring(profileData)
  }, [profileData])

  const domain = useMemo(() => {
    return resolvePlayerGamesFiltersDomain(livePlayer, filters, {
      seasonStartYear,
      scoring: playerScoring,
      profileData,
    })
  }, [livePlayer, filters, seasonStartYear, playerScoring, profileData])

  const summary = domain && domain.summary ? domain.summary : null
  const games = domain && Array.isArray(domain.games) ? domain.games : []
  const options = domain && domain.options ? domain.options : null
  const indicators = domain && domain.indicators ? domain.indicators : null

  const calculationGames = useMemo(() => {
    return games.filter(isLeagueGame)
  }, [games])

  const sortedGames = useMemo(() => {
    return sortPlayerGamesRows(games, sort)
  }, [games, sort])

  const hasRows = Array.isArray(sortedGames) && sortedGames.length > 0
  const hasAnyGames = resolveHasAnyGames(livePlayer)

  return {
    livePlayer,
    liveTeam,
    contextPlayers,
    playerScoring,
    isPrivatePlayer,

    summary,
    games,
    options,
    indicators,
    calculationGames,
    sortedGames,

    hasRows,
    hasAnyGames,
  }
}
