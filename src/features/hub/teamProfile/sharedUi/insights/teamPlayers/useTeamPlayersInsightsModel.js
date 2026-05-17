// TEAMPROFILE/sharedUi/insights/teamPlayers/useTeamPlayersInsightsModel.js

import { useEffect, useMemo, useState } from 'react'

import {
  buildModel,
} from '../../../sharedLogic/players/insightsLogic/index.js'

const emptyArray = []
const emptyObject = {}

const getTeamGames = team => {
  return Array.isArray(team?.teamGames) ? team.teamGames : emptyArray
}

export function useTeamPlayersInsightsModel({
  rows,
  summary,
  team,
  enabled = true,
  defer = true,
  calculationMode = 'games',
  performanceScope,
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

  const safeRows = useMemo(() => {
    return Array.isArray(rows) ? rows : emptyArray
  }, [rows])

  const safeSummary = summary || emptyObject
  const safeTeam = team || emptyObject

  const safeGames = useMemo(() => {
    return getTeamGames(safeTeam)
  }, [safeTeam])

  const shouldBuild = enabled && canBuild

  return useMemo(() => {
    
    return buildModel({
      rows: safeRows,
      summary: safeSummary,
      team: safeTeam,
      games: safeGames,
      enabled: shouldBuild,
      calculationMode,
      performanceScope,
    })
  }, [
    safeRows,
    safeSummary,
    safeTeam,
    safeGames,
    shouldBuild,
    calculationMode,
    performanceScope,
  ])
}
