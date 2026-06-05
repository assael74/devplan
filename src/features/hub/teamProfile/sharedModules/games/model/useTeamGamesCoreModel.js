// src/features/hub/teamProfile/sharedModules/games/model/useTeamGamesCoreModel.js

import { useMemo } from 'react'

import {
  resolveTeamGamesFiltersDomain,
  sortTeamGamesRows,
} from '../../../sharedLogic/games'

function getContextTeams(context) {
  if (!context) return []
  if (!Array.isArray(context.teams)) return []

  return context.teams
}

function getPlayedLeagueGames(profileData) {
  if (!profileData) return []
  if (!profileData.games) return []
  if (!Array.isArray(profileData.games.playedLeagueGames)) return []

  return profileData.games.playedLeagueGames
}

function getTeamScoring(profileData) {
  if (!profileData) return null
  if (profileData.teamScoring) return profileData.teamScoring

  if (profileData.scoring && profileData.scoring.team) {
    return profileData.scoring.team
  }

  return null
}

function getPlayerScoring(profileData) {
  if (!profileData) return null
  if (profileData.playerScoring) return profileData.playerScoring

  if (profileData.scoring && profileData.scoring.players) {
    return profileData.scoring.players
  }

  if (profileData.scoring) return profileData.scoring

  return null
}

function getScoringByGameId(profileData) {
  if (!profileData) return {}
  if (!profileData.scoring) return {}

  return profileData.scoring.byGameId || {}
}

function resolveLiveTeam({ entity, context }) {
  const teams = getContextTeams(context)
  const liveTeam = teams.find(team => team && entity && team.id === entity.id)

  return liveTeam || entity || null
}

function resolveHasAnyGames({ liveTeam, calculationGames }) {
  if (calculationGames.length > 0) return true
  if (!liveTeam) return false
  if (!Array.isArray(liveTeam.teamGames)) return false

  return liveTeam.teamGames.length > 0
}

export function useTeamGamesCoreModel({
  entity,
  context,
  profileData,
  filters,
  sort,
}) {
  const liveTeam = useMemo(() => {
    return resolveLiveTeam({ entity, context })
  }, [context, entity])

  const calculationGames = useMemo(() => {
    return getPlayedLeagueGames(profileData)
  }, [profileData])

  const teamScoring = useMemo(() => {
    return getTeamScoring(profileData)
  }, [profileData])

  const playerScoring = useMemo(() => {
    return getPlayerScoring(profileData)
  }, [profileData])

  const teamScoringByGameId = useMemo(() => {
    if (!teamScoring) return {}

    return teamScoring.byGameId || {}
  }, [teamScoring])

  const playerScoringByGameId = useMemo(() => {
    if (!playerScoring) return {}

    return playerScoring.byGameId || {}
  }, [playerScoring])

  const scoringByGameId = useMemo(() => {
    return getScoringByGameId(profileData)
  }, [profileData])

  const domain = useMemo(() => {
    return resolveTeamGamesFiltersDomain(liveTeam, filters, {
      seasonStartYear: 2025,
      teamScoringByGameId,
    })
  }, [liveTeam, filters, teamScoringByGameId])

  const summary = domain && domain.summary ? domain.summary : null
  const viewGames = domain && Array.isArray(domain.games) ? domain.games : []
  const options = domain && domain.options ? domain.options : null
  const indicators = domain && domain.indicators ? domain.indicators : null

  const sortedGames = useMemo(() => {
    return sortTeamGamesRows(viewGames, sort)
  }, [viewGames, sort])

  const hasRows = Array.isArray(sortedGames) && sortedGames.length > 0

  const hasAnyGames = resolveHasAnyGames({
    liveTeam,
    calculationGames,
  })

  return {
    liveTeam,
    calculationGames,

    teamScoring,
    playerScoring,
    teamScoringByGameId,
    playerScoringByGameId,
    scoringByGameId,

    summary,
    options,
    indicators,
    sortedGames,

    hasRows,
    hasAnyGames,
  }
}
