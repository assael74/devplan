// src/features/playersDatabase/domain/orchestration/playerFutureCompetitionPath.js

import { scoutingCommon } from '../../../../shared/scouting/index.js'

const toPositiveNumber = value => {
  const number = Number(value)

  return Number.isFinite(number) && number > 0 ? number : null
}

const toFiniteNumber = value => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)

  return Number.isFinite(number) ? number : null
}

const firstObject = values => (
  values.find(value => value && typeof value === 'object' && !Array.isArray(value)) || null
)

const firstArray = values => (
  values.find(value => Array.isArray(value) && value.length > 0) || []
)


const normalizeSeasonKey = (value) => {
  const raw = String(value || '').trim().toLowerCase()
  if (!raw) return ''

  const match = raw.match(/(?:^|s)(\d{2,4})[\/_-](\d{2,4})$/)
  if (!match) return raw

  return `${match[1].slice(-2)}/${match[2].slice(-2)}`
}

const resolveCurrentSeasonKey = ({ player = {}, team = {}, season = {} } = {}) => (
  String(
    season.seasonKey ||
    season.season ||
    team.seasonKey ||
    team.season ||
    player.seasonKey ||
    player.season ||
    ''
  ).trim()
)

const isPathForSeason = ({ futureCompetitionPath, seasonKey } = {}) => {
  const expectedSeasonKey = normalizeSeasonKey(seasonKey)
  const pathSeasonKey = normalizeSeasonKey(futureCompetitionPath?.current?.seasonKey)

  if (!expectedSeasonKey) return true
  if (!pathSeasonKey) return false

  return expectedSeasonKey === pathSeasonKey
}

const resolveSeasonStatus = ({ season = {}, team = {} } = {}) => (
  String(season.seasonStatus || team.seasonStatus || '').trim().toLowerCase()
)

const resolveExpectedLevelDelta = ({ player = {}, team = {}, season = {} } = {}) => {
  const values = [
    team.expectedLevelDelta,
    team.expectedLeagueLevelChange?.expectedLevelDelta,
    season.expectedLevelDelta,
    season.expectedLeagueLevelChange?.expectedLevelDelta,
    player.expectedLevelDelta,
    player.expectedLeagueLevelChange?.expectedLevelDelta,
  ]

  for (const value of values) {
    const delta = toFiniteNumber(value)
    if (delta !== null) return delta
  }

  return null
}

const buildExpectedLevelRows = ({ birthYear, birthTeamSlot, leagueLevel, expectedLevelDelta } = {}) => {
  const currentBirthYear = toPositiveNumber(birthYear)
  const currentLeagueLevel = toPositiveNumber(leagueLevel)
  const delta = toFiniteNumber(expectedLevelDelta)

  if (!currentBirthYear || !currentLeagueLevel || delta === null) return []

  const nextLeagueLevel = currentLeagueLevel - delta
  if (!toPositiveNumber(nextLeagueLevel)) return []

  return [{
    birthYear: currentBirthYear - 1,
    birthTeamSlot: toPositiveNumber(birthTeamSlot) || 1,
    leagueLevel: nextLeagueLevel,
  }]
}

export const resolvePlayerFutureCompetitionPath = ({
  player = {},
  team = {},
  season = {},
  futureCompetitionPath = null,
  clubBirthTeams = [],
} = {}) => {
  const seasonStatus = resolveSeasonStatus({ season, team })
  if (seasonStatus === 'completed') return null

  const currentSeasonKey = resolveCurrentSeasonKey({ player, team, season })
  const existingPath = firstObject([
    futureCompetitionPath,
    player.futureCompetitionPath,
    team.futureCompetitionPath,
    season.futureCompetitionPath,
  ])

  if (existingPath && isPathForSeason({
    futureCompetitionPath: existingPath,
    seasonKey: currentSeasonKey,
  })) return existingPath

  const birthYear = toPositiveNumber(
    team.birthYear ||
    season.birthYear ||
    player.teamBirthYear ||
    player.birthYear
  )
  const leagueLevel = toPositiveNumber(
    season.leagueLevel ||
    team.leagueLevel ||
    team.league?.level ||
    player.leagueLevel
  )
  const birthTeamSlot = toPositiveNumber(
    team.birthTeamSlot ||
    team.teamSlot ||
    player.birthTeamSlot ||
    player.teamSlot
  ) || 1
  const seasonKey = currentSeasonKey
  const resolvedClubBirthTeams = firstArray([
    clubBirthTeams,
    team.clubBirthTeams,
    season.clubBirthTeams,
    player.clubBirthTeams,
  ])

  if (resolvedClubBirthTeams.length > 0) {
    return scoutingCommon.buildYouthFutureCompetitionPath({
      birthYear,
      leagueLevel,
      seasonKey,
      birthTeamSlot,
      clubBirthTeams: resolvedClubBirthTeams,
      yearsAhead: 2,
    })
  }

  const expectedLevelDelta = resolveExpectedLevelDelta({
    player,
    team,
    season,
  })
  const expectedLevelRows = buildExpectedLevelRows({
    birthYear,
    birthTeamSlot,
    leagueLevel,
    expectedLevelDelta,
  })

  if (!expectedLevelRows.length) return null

  return scoutingCommon.buildYouthFutureCompetitionPath({
    birthYear,
    leagueLevel,
    seasonKey,
    birthTeamSlot,
    clubBirthTeams: expectedLevelRows,
    yearsAhead: 1,
  })
}
