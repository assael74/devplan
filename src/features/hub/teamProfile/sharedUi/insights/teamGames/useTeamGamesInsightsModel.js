// teamProfile/sharedUi/insights/teamGames/useTeamGamesInsightsModel.js

import { useMemo, useState } from 'react'

import {
  buildTeamGamesInsights,
  buildTeamGamesBriefSections,
} from '../../../../../../shared/games/insights/team/index.js'

import { createGameRowNormalizer } from '../../../../../../shared/games/games.normalize.logic.js'

import { buildTeamGamesDrawerViewModel } from '../../../sharedLogic/games/index.js'

import { CALCULATION_MODES } from './controls/index.js'

export function useTeamGamesInsightsModel({
  games,
  entity,
  team,
  initialCalculationMode = CALCULATION_MODES.TEAM,
} = {}) {
  const [calculationMode, setCalculationMode] = useState(initialCalculationMode)

  const liveTeam = team || entity || {}
  const isGamesMode = calculationMode === CALCULATION_MODES.GAMES

  const normalizeRow = useMemo(() => createGameRowNormalizer({}), [])

  const insights = useMemo(() => {
    return buildTeamGamesInsights({
      team: liveTeam,
      rows: Array.isArray(games) ? games : [],
      normalizeRow,
      calculationMode,
    })
  }, [games, liveTeam, normalizeRow, calculationMode])

  const teamSource = insights?.sources?.team || insights?.league || {}
  const gamesSource = insights?.sources?.games || insights?.games || {}

  const viewModel = useMemo(() => {
    return buildTeamGamesDrawerViewModel({
      ...insights,
      team: liveTeam,
    })
  }, [insights, liveTeam])

  const targetProgress = viewModel?.targetProgress || {}
  const forecast = targetProgress?.forecast || {}

  const targetRows = Array.isArray(targetProgress?.rows)
    ? targetProgress.rows
    : []

  const homeAwayProjection = viewModel?.homeAwayProjection || {}
  const difficultyProjection = viewModel?.difficultyProjection || {}
  const squadMetrics = viewModel?.squadMetrics || {}

  const briefSections = useMemo(() => {
    return buildTeamGamesBriefSections({
      ...insights,
      squadMetrics,
      targetProgress,
      homeAwayProjection,
      difficultyProjection,
    })
  }, [
    insights,
    targetProgress,
    homeAwayProjection,
    difficultyProjection,
    squadMetrics,
  ])

  return {
    calculationMode,
    setCalculationMode,
    isGamesMode,

    liveTeam,

    insights,
    viewModel,

    teamSource,
    gamesSource,

    targetProgress,
    forecast,
    targetRows,

    homeAwayProjection,
    difficultyProjection,
    squadMetrics,

    briefSections,
  }
}
