// playerProfile/sharedUi/insights/playerGames/usePlayerGamesInsightsModel.js

import { useMemo } from 'react'

import {
  buildPlayerGamesInsights,
} from '../../../../../../shared/games/insights/player/index.js'

import { createGameRowNormalizer } from '../../../../../../shared/games/games.normalize.logic.js'

import {
  buildPlayerGamesDrawerViewModel,
} from '../../../sharedLogic/games/insightsDrawer/index.js'

export function usePlayerGamesInsightsModel({
  games,
  player,
  team,
} = {}) {
  const normalizeRow = useMemo(() => {
    return createGameRowNormalizer({})
  }, [])

  const livePlayer = player || {}
  const liveTeam = team || livePlayer?.team || {}

  const insights = useMemo(() => {
    return buildPlayerGamesInsights({
      player: livePlayer,
      team: liveTeam,
      rows: Array.isArray(games) ? games : [],
      normalizeRow,
    })
  }, [
    games,
    livePlayer,
    liveTeam,
    normalizeRow,
  ])

  const viewModel = useMemo(() => {
    return buildPlayerGamesDrawerViewModel({
      ...insights,
      player: livePlayer,
      team: liveTeam,
    })
  }, [
    insights,
    livePlayer,
    liveTeam,
  ])

  return {
    livePlayer,
    liveTeam,
    insights,
    viewModel,

    gamesReady: viewModel?.gamesReady === true,
    teamContextReady: viewModel?.teamContextReady === true,
    mainDiagnosis: viewModel?.mainDiagnosis || null,

    topStats: Array.isArray(viewModel?.topStats)
      ? viewModel.topStats
      : [],

    briefCards: Array.isArray(viewModel?.briefCards)
      ? viewModel.briefCards
      : [],

    briefsList: Array.isArray(viewModel?.briefsList)
      ? viewModel.briefsList
      : [],

    blocked: viewModel?.blocked || {},
  }
}
