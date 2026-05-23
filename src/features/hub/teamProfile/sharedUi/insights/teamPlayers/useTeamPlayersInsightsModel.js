// TEAMPROFILE/sharedUi/insights/teamPlayers/useTeamPlayersInsightsModel.js

import { useEffect, useMemo, useState } from 'react'

import {
  buildModel,
} from '../../../sharedLogic/players/insightsLogic/index.js'

const emptyArray = []
const emptyObject = {}
const DEFAULT_BUILD_DELAY = 120

const getTeamGames = team => {
  return Array.isArray(team?.teamGames) ? team.teamGames : emptyArray
}

const deferBuild = ({ delay, onReady }) => {
  let timeoutId = null

  const frameId = requestAnimationFrame(() => {
    timeoutId = window.setTimeout(onReady, delay)
  })

  return () => {
    cancelAnimationFrame(frameId)

    if (timeoutId) {
      window.clearTimeout(timeoutId)
    }
  }
}

export function useTeamPlayersInsightsModel({
  rows,
  summary,
  team,
  enabled = true,
  defer = true,
  deferDelay = DEFAULT_BUILD_DELAY,
  buildKey = 'default',
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

    return deferBuild({
      delay: deferDelay,
      onReady: () => setCanBuild(true),
    })
  }, [enabled, defer, deferDelay, buildKey])

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
