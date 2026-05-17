// teamProfile/sharedUi/insights/teamGames/useTeamGamesInsightsModel.js

import { useEffect, useMemo, useState } from 'react'

import {
  buildTeamGamesInsights,
  buildTeamGamesBriefSections,
} from '../../../../../../shared/games/insights/team/index.js'

import {
  buildPlayersInsightsFromGames,
  printPlayersInsightsDebug,
} from '../../../../../../shared/players/insights/index.js'

import { createGameRowNormalizer } from '../../../../../../shared/games/games.normalize.logic.js'

import { buildTeamGamesDrawerViewModel } from '../../../sharedLogic/games/index.js'

import { CALCULATION_MODES } from './controls/index.js'

const emptyArray = []
const emptyObject = {}

const DEBUG_PLAYER_INSIGHTS = true

const buildEmptyModel = ({
  calculationMode,
  setCalculationMode,
  liveTeam,
  isBuilding = false,
} = {}) => {
  return {
    calculationMode,
    setCalculationMode,
    isGamesMode: calculationMode === CALCULATION_MODES.GAMES,

    liveTeam: liveTeam || emptyObject,

    insights: null,
    viewModel: null,

    isBuilding,

    teamSource: emptyObject,
    gamesSource: emptyObject,

    targetProgress: emptyObject,
    forecast: emptyObject,
    targetRows: emptyArray,

    homeAwayProjection: emptyObject,
    difficultyProjection: emptyObject,
    squadMetrics: emptyObject,

    playerInsights: null,
    playerInsightRows: emptyArray,

    briefSections: emptyObject,
  }
}

export function useTeamGamesInsightsModel({
  games,
  entity,
  team,
  enabled = true,
  defer = true,
  initialCalculationMode = CALCULATION_MODES.TEAM,
} = {}) {
  const [calculationMode, setCalculationMode] = useState(initialCalculationMode)
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

  const liveTeam = team || entity || emptyObject
  const isGamesMode = calculationMode === CALCULATION_MODES.GAMES

  const normalizeRow = useMemo(() => {
    return createGameRowNormalizer({})
  }, [])

  const safeGames = useMemo(() => {
    return Array.isArray(games) ? games : emptyArray
  }, [games])

  const shouldBuild = enabled && canBuild

  const playerInsights = useMemo(() => {
    if (!shouldBuild) return null

    return buildPlayersInsightsFromGames({
      games: safeGames,
      team: liveTeam,
      calculationMode,
    })
  }, [
    shouldBuild,
    safeGames,
    liveTeam,
    calculationMode,
  ])

  useEffect(() => {
    if (!DEBUG_PLAYER_INSIGHTS || !playerInsights) return

    printPlayersInsightsDebug(playerInsights)
  }, [playerInsights])

  const insights = useMemo(() => {
    if (!shouldBuild) return null

    return buildTeamGamesInsights({
      team: liveTeam,
      rows: safeGames,
      normalizeRow,
      calculationMode,
    })
  }, [
    shouldBuild,
    safeGames,
    liveTeam,
    normalizeRow,
    calculationMode,
  ])

  const teamSource = insights?.sources?.team || insights?.league || emptyObject
  const gamesSource = insights?.sources?.games || insights?.games || emptyObject

  const viewModel = useMemo(() => {
    if (!shouldBuild || !insights) return null

    return buildTeamGamesDrawerViewModel({
      ...insights,
      team: liveTeam,
    })
  }, [
    shouldBuild,
    insights,
    liveTeam,
  ])

  const targetProgress = viewModel?.targetProgress || emptyObject
  const forecast = targetProgress?.forecast || emptyObject

  const targetRows = Array.isArray(targetProgress?.rows)
    ? targetProgress.rows
    : emptyArray

  const homeAwayProjection = viewModel?.homeAwayProjection || emptyObject
  const difficultyProjection = viewModel?.difficultyProjection || emptyObject
  const squadMetrics = viewModel?.squadMetrics || emptyObject

  const playerInsightRows = Array.isArray(playerInsights?.rows)
    ? playerInsights.rows
    : emptyArray

  const briefSections = useMemo(() => {
    if (!shouldBuild || !insights) return emptyObject

    return buildTeamGamesBriefSections({
      ...insights,
      squadMetrics,
      targetProgress,
      homeAwayProjection,
      difficultyProjection,
    })
  }, [
    shouldBuild,
    insights,
    targetProgress,
    homeAwayProjection,
    difficultyProjection,
    squadMetrics,
  ])

  if (!shouldBuild || !viewModel) {
    return buildEmptyModel({
      calculationMode,
      setCalculationMode,
      liveTeam,
      isBuilding: enabled,
    })
  }

  return {
    calculationMode,
    setCalculationMode,
    isGamesMode,

    liveTeam,

    insights,
    viewModel,

    isBuilding: false,

    teamSource,
    gamesSource,

    targetProgress,
    forecast,
    targetRows,

    homeAwayProjection,
    difficultyProjection,
    squadMetrics,

    playerInsights,
    playerInsightRows,

    briefSections,
  }
}
