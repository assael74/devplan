// playerProfile/sharedUi/insights/playerGames/usePlayerGamesInsightsModel.js

import { useEffect, useMemo, useState } from 'react'

import {
  buildPlayerGamesInsights,
} from '../../../../../../shared/games/insights/player/index.js'

import { createGameRowNormalizer } from '../../../../../../shared/games/games.normalize.logic.js'

import {
  buildPlayerGamesDrawerViewModel,
} from '../../../sharedLogic/games/insightsDrawer/index.js'

const emptyArray = []
const emptyObject = {}

const buildEmptyModel = ({ player, team, isBuilding = false } = {}) => {
  const livePlayer = player || emptyObject
  const liveTeam = team || livePlayer?.team || emptyObject

  return {
    livePlayer,
    liveTeam,

    insights: null,
    viewModel: null,

    isBuilding,

    gamesReady: false,
    teamContextReady: false,
    mainDiagnosis: null,

    topStats: emptyArray,
    briefCards: emptyArray,
    briefsList: emptyArray,

    blocked: {
      games: true,
      gamesReasons: [],
      teamContext: true,
      teamContextReasons: [],
    },
  }
}

export function usePlayerGamesInsightsModel({
  games,
  player,
  team,
  enabled = true,
  defer = true,
} = {}) {
  const [canBuild, setCanBuild] = useState(!defer)

  useEffect(() => {
    if (!enabled) {
      setCanBuild(false)
      return
    }

    if (!defer) {
      setCanBuild(true)
      return
    }

    setCanBuild(false)

    const frameId = requestAnimationFrame(() => {
      setCanBuild(true)
    })

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [enabled, defer])

  const normalizeRow = useMemo(() => {
    return createGameRowNormalizer({})
  }, [])

  const safeGames = useMemo(() => {
    return Array.isArray(games) ? games : emptyArray
  }, [games])

  const livePlayer = player || emptyObject
  const liveTeam = team || livePlayer?.team || emptyObject

  const shouldBuild = enabled && canBuild

  const insights = useMemo(() => {
    if (!shouldBuild) return null

    return buildPlayerGamesInsights({
      player: livePlayer,
      team: liveTeam,
      rows: safeGames,
      normalizeRow,
    })
  }, [
    shouldBuild,
    safeGames,
    livePlayer,
    liveTeam,
    normalizeRow,
  ])

  const viewModel = useMemo(() => {
    if (!shouldBuild || !insights) return null

    return buildPlayerGamesDrawerViewModel({
      ...insights,
      player: livePlayer,
      team: liveTeam,
    })
  }, [
    shouldBuild,
    insights,
    livePlayer,
    liveTeam,
  ])

  if (!shouldBuild || !viewModel) {
    return buildEmptyModel({
      player: livePlayer,
      team: liveTeam,
      isBuilding: enabled,
    })
  }

  return {
    livePlayer,
    liveTeam,
    insights,
    viewModel,

    isBuilding: false,

    gamesReady: viewModel?.gamesReady === true,
    teamContextReady: viewModel?.teamContextReady === true,
    mainDiagnosis: viewModel?.mainDiagnosis || null,

    topStats: Array.isArray(viewModel?.topStats)
      ? viewModel.topStats
      : emptyArray,

    briefCards: Array.isArray(viewModel?.briefCards)
      ? viewModel.briefCards
      : emptyArray,

    briefsList: Array.isArray(viewModel?.briefsList)
      ? viewModel.briefsList
      : emptyArray,

    blocked: viewModel?.blocked || emptyObject,
  }
}
