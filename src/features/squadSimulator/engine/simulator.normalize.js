// src/features/squadSimulator/engine/simulator.normalize.js

import {
  PLAYER_TARGET_BENCHMARK_DEFAULTS,
  PLAYER_TARGET_POSITION_GROUPS,
} from '../../../shared/players/targets/index.js'
import {
  TEAM_TARGET_POSITION_PROFILES,
} from '../../../shared/teams/targets/index.js'
import {
  SQUAD_ROLE_ALIASES,
  TARGET_PROFILE_ALIASES,
} from './simulator.constants.js'

export const toFiniteNumber = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export const roundNumber = (value, digits = 0) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0

  const factor = 10 ** digits
  return Math.round(n * factor) / factor
}

export const normalizeTargetProfileId = (value) => {
  if (!value && value !== 0) return ''

  const key = String(value).trim()
  return TARGET_PROFILE_ALIASES[key] || key
}

export const normalizeSquadRoleId = (value) => {
  if (!value && value !== 0) return ''

  const key = String(value).trim()
  return SQUAD_ROLE_ALIASES[key] || key
}

export const normalizeSeasonContext = ({
  team = {},
  leagueNumGames,
  leagueGameTime,
  squadSize,
} = {}) => {
  const games =
    toFiniteNumber(leagueNumGames) ||
    toFiniteNumber(team?.leagueNumGames) ||
    PLAYER_TARGET_BENCHMARK_DEFAULTS.leagueNumGames

  const gameTime =
    toFiniteNumber(leagueGameTime) ||
    toFiniteNumber(team?.leagueGameTime) ||
    toFiniteNumber(team?.leagueGameDuration) ||
    PLAYER_TARGET_BENCHMARK_DEFAULTS.leagueGameTime

  const size =
    toFiniteNumber(squadSize) ||
    toFiniteNumber(team?.squadSize) ||
    PLAYER_TARGET_BENCHMARK_DEFAULTS.squadSize

  return {
    leagueNumGames: games,
    leagueGameTime: gameTime,
    squadSize: size,
    seasonMinutesPerPlayer: games * gameTime,
    totalTeamMinutes: games * gameTime * 11,
  }
}

export const buildTargetContext = ({
  team = {},
  teamBenchmark,
  targetPositionMode,
  targetPosition,
  targetPositionProfile,
  targetProfileId,
} = {}) => {
  const benchmarkProfileId = normalizeTargetProfileId(
    teamBenchmark?.targetPositionProfile ||
      teamBenchmark?.profile?.id ||
      teamBenchmark?.id
  )

  const profileId =
    benchmarkProfileId ||
    normalizeTargetProfileId(
      targetPositionProfile ||
        targetProfileId ||
        team?.targetPositionProfile ||
        team?.targetProfileId ||
        team?.targetPosition
    )

  const profile = TEAM_TARGET_POSITION_PROFILES[profileId] || null
  const mode =
    targetPositionMode ||
    team?.targetPositionMode ||
    (teamBenchmark?.targetPosition ? 'exact' : 'range')

  return {
    mode,
    targetPosition:
      targetPosition ||
      team?.targetPosition ||
      teamBenchmark?.targetPosition ||
      null,
    targetPositionProfile: profileId,
    targetProfileId: profileId,
    label:
      teamBenchmark?.label ||
      teamBenchmark?.profile?.label ||
      profile?.label ||
      '',
    rankRange:
      teamBenchmark?.rankRange ||
      profile?.rankRange ||
      (teamBenchmark?.targetPosition
        ? [teamBenchmark.targetPosition, teamBenchmark.targetPosition]
        : null),
  }
}

export const getPositionGroupLabel = (positionGroupId) => {
  return PLAYER_TARGET_POSITION_GROUPS[positionGroupId]?.label || positionGroupId
}
