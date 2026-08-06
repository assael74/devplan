// features/playersDatabase/model/teamPage.model.js

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../catalog/clubs.catalog.js'
import { resolveAgeGroupLabel } from '../catalog/ageGroups.catalog.js'
import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../catalog/leagues.catalog.js'
import { buildTeamDisplayName } from '../catalog/teamDisplay.js'
import {
  adaptBirthTeamDocumentSeason,
  adaptLeagueTableTeam,
  adaptPlayerDocumentSeason,
  adaptTeamScoutEngineRow,
} from '../domain/index.js'
import { normalizeSeasonLookupKey, normalizeSeasonIdentity, isSameSeason } from './season.model.js'
import { normalizeTeamIdentity, resolveTeamLookupKey } from './teamIdentity.model.js'
import { cleanValue } from './value.model.js'
import { buildTeamPerformanceViewModel } from './teamPerformance.viewModel.js'
import {
  buildTeamScoutLeagueModel,
  TEAM_SCOUT_NORMALIZATION_MODE,
  TEAM_SCOUT_SORT_MODE,
} from '../../../shared/teams/scout/index.js'

const TEAM_PAGE_FUTURE_SEASON_KEY = '26/27'

const resolveSeasonStartYear = seasonKey => {
  const match = cleanValue(seasonKey).match(/^(\d{2})[\/_-](\d{2})$/)
  return match ? 2000 + Number(match[1]) : null
}

const resolveSeasonAgeGroupLabel = ({
  seasonKey = '',
  birthYear = null,
  ageGroupId = '',
  ageGroupLabel = '',
} = {}) => {
  const startYear = resolveSeasonStartYear(seasonKey)
  const ageGroupNumber = startYear && birthYear
    ? startYear - Number(birthYear) + 1
    : null

  if (ageGroupNumber) {
    return resolveAgeGroupLabel({
      ageGroupId: `u${ageGroupNumber}`,
    })
  }

  return resolveAgeGroupLabel({
    ageGroupId,
    ageGroupLabel,
  })
}


const resolveLeagueOptionLabel = ({ season = {}, leagueId = '' } = {}) => {
  const directLabel = cleanValue(
    season?.leagueName ||
    season?.leagueLabel
  )
  if (directLabel) return directLabel

  const catalogLeague = PLAYERS_DATABASE_LEAGUES_CATALOG.find(item => (
    cleanValue(item?.id) === cleanValue(leagueId)
  ))

  return cleanValue(catalogLeague?.name || catalogLeague?.leagueName || leagueId)
}

const resolveSeasonSortValue = seasonKey => {
  const match = cleanValue(seasonKey).match(/^(\d{2})[\/_-](\d{2})$/)
  return match ? Number(match[1]) : 0
}

const resolveExpectedBirthYear = ({ teamDoc = {}, teamId = '' } = {}) => {
  const direct = Number(
    teamDoc?.birthYear ||
    teamDoc?.identity?.birthYear ||
    teamDoc?.metadata?.birthYear ||
    0
  )
  if (direct) return direct

  const match = cleanValue(teamId).match(/(?:^|_)(19|20)\d{2}(?:_|$)/)
  return match ? Number(match[0].replace(/_/g, '')) : null
}

const resolveOptionTeamName = ({ season = {}, teamDoc = {} } = {}) => cleanValue(
  season?.displayName ||
  season?.teamName ||
  teamDoc?.displayName ||
  teamDoc?.teamName ||
  teamDoc?.name ||
  'קבוצה'
)

const buildSeasonOption = ({ season, target, leagueId = '', teamDoc = {} }) => {
  const identity = normalizeSeasonIdentity({ season })
  const seasonKey = normalizeSeasonLookupKey(identity.seasonKey || identity.seasonId)
  const birthYear = Number(season?.birthYear || teamDoc?.birthYear || 0) || null
  const resolvedLeagueId = cleanValue(season?.leagueId || leagueId)
  const leagueName = resolveLeagueOptionLabel({
    season,
    leagueId: resolvedLeagueId,
  })
  const ageGroupLabel = resolveSeasonAgeGroupLabel({
    seasonKey,
    birthYear,
    ageGroupId: season?.ageGroupId,
    ageGroupLabel: season?.ageGroupLabel,
  })
  const teamName = resolveOptionTeamName({ season, teamDoc })
  const optionKey = [
    seasonKey,
    birthYear || '',
    resolvedLeagueId,
    target,
  ].join('|')

  return {
    optionKey,
    target,
    season,
    seasonId: identity.seasonId,
    seasonKey,
    birthYear,
    leagueId: resolvedLeagueId,
    leagueName,
    ageGroupLabel,
    teamName,
    primaryLabel: [
      teamName,
      birthYear ? `שנתון ${birthYear}` : '',
      seasonKey,
    ].filter(Boolean).join(' · '),
    secondaryLabel: [
      leagueName,
      ageGroupLabel && ageGroupLabel !== '-' ? ageGroupLabel : '',
    ].filter(Boolean).join(' · '),
  }
}

export const buildTeamPageSeasonOptions = (league, teamDoc = {}, teamId = '') => {
  const options = []
  const seen = new Set()
  const expectedBirthYear = resolveExpectedBirthYear({ teamDoc, teamId })

  const pushOption = option => {
    if (!option.optionKey || seen.has(option.optionKey)) return
    if (
      expectedBirthYear &&
      option.birthYear &&
      Number(option.birthYear) !== Number(expectedBirthYear)
    ) return

    seen.add(option.optionKey)
    options.push(option)
  }

  const teamCurrent = Array.isArray(teamDoc?.current) ? teamDoc.current : []
  teamCurrent.forEach(season => {
    if (!season?.seasonId && !season?.seasonKey) return
    pushOption(buildSeasonOption({
      season,
      target: 'current',
      teamDoc,
    }))
  })

  const teamHistory = Array.isArray(teamDoc?.history) ? teamDoc.history : []
  teamHistory.forEach(season => {
    if (!season?.seasonId && !season?.seasonKey) return
    pushOption(buildSeasonOption({
      season,
      target: 'history',
      teamDoc,
    }))
  })

  if (!options.length) {
    const leagueId = cleanValue(league?.leagueId || league?.id)

    if (league?.current?.seasonId || league?.current?.seasonKey) {
      pushOption(buildSeasonOption({
        season: league.current,
        target: 'current',
        leagueId,
        teamDoc,
      }))
    }

    const history = Array.isArray(league?.history) ? league.history : []
    history.forEach(season => {
      if (!season?.seasonId && !season?.seasonKey) return
      pushOption(buildSeasonOption({
        season,
        target: 'history',
        leagueId,
        teamDoc,
      }))
    })
  }

  const hasFutureSeason = options.some(option => (
    option.seasonKey === TEAM_PAGE_FUTURE_SEASON_KEY
  ))

  if (expectedBirthYear && !hasFutureSeason) {
    const routeLeagueId = cleanValue(league?.leagueId || league?.id)

    pushOption(buildSeasonOption({
      season: {
        seasonId: TEAM_PAGE_FUTURE_SEASON_KEY,
        seasonKey: TEAM_PAGE_FUTURE_SEASON_KEY,
        birthYear: expectedBirthYear,
        leagueId: routeLeagueId,
        leagueName: 'ליגה טרם הוגדרה',
      },
      target: 'future',
      leagueId: routeLeagueId,
      teamDoc,
    }))
  }

  return options
    .filter(option => option.seasonKey || option.seasonId)
    .sort((left, right) => {
      const seasonOrder = resolveSeasonSortValue(right.seasonKey) - resolveSeasonSortValue(left.seasonKey)
      if (seasonOrder) return seasonOrder

      return Number(right.birthYear || 0) - Number(left.birthYear || 0)
    })
}


const findTeamRow = ({ season, teamId }) => {
  const rows = Array.isArray(season?.tableRank) ? season.tableRank : []
  const key = cleanValue(teamId)

  return rows.find(row => {
    const identity = normalizeTeamIdentity({ team: row })
    return [
      identity.teamId,
      identity.birthTeamId,
      identity.teamDocumentId,
      identity.birthTeamDocumentId,
      identity.teamSlotId,
    ].includes(key)
  }) || null
}

const buildScoutResultMap = ({ tableRank = [], leagueDoc = {}, season = {} } = {}) => {
  const result = buildTeamScoutLeagueModel({
    leagueLevel: leagueDoc?.level,
    leagueNumGames: season?.leagueTotalRound || 30,
    rows: tableRank,
    normalizationMode: TEAM_SCOUT_NORMALIZATION_MODE.AUTO,
    sortMode: TEAM_SCOUT_SORT_MODE.TABLE,
  })

  return new Map((result.rows || []).map(row => [
    resolveTeamLookupKey(row) || cleanValue(row.clubId || row.rank),
    adaptTeamScoutEngineRow({
      row,
      source: {
        normalization: result.normalization,
        leagueLevel: leagueDoc?.level,
        leagueGames: season?.leagueTotalRound || 30,
      },
    }),
  ]))
}

export const findTeamPageSeasonDoc = ({ teamDoc, selectedSeasonOption }) => {
  if (!teamDoc || !selectedSeasonOption) return null

  const fieldKey = selectedSeasonOption.target === 'history' ? 'history' : 'current'
  const rows = Array.isArray(teamDoc[fieldKey]) ? teamDoc[fieldKey] : []
  return rows.find(row => isSameSeason(row, selectedSeasonOption)) || null
}

export const findTeamPageLeagueSeasonDoc = ({ leagueDoc, selectedSeasonOption }) => {
  if (!leagueDoc || !selectedSeasonOption) return null

  const current = leagueDoc?.current
  if (
    current &&
    typeof current === 'object' &&
    isSameSeason(current, selectedSeasonOption)
  ) {
    return {
      season: current,
      target: 'current',
    }
  }

  const history = Array.isArray(leagueDoc?.history) ? leagueDoc.history : []
  const historySeason = history.find(row => isSameSeason(row, selectedSeasonOption))

  return historySeason
    ? {
      season: historySeason,
      target: 'history',
    }
    : null
}

const getClubIdFromTeamId = teamId => cleanValue(teamId).split('_').filter(Boolean)[0] || ''

const getClubById = clubId => PLAYERS_DATABASE_CLUBS_CATALOG.find(
  club => cleanValue(club.id) === cleanValue(clubId)
) || null

const resolveTeamName = ({ teamRow = {}, teamDoc = {}, teamId = '' } = {}) => {
  const identity = normalizeTeamIdentity({
    team: teamRow,
    fallback: {
      ...teamDoc,
      teamId,
      clubId: teamDoc?.clubId || getClubIdFromTeamId(teamId),
    },
  })
  const club = getClubById(identity.clubId)

  return buildTeamDisplayName({
    clubName: club?.name || teamRow.clubName || teamDoc?.displayName || teamRow.displayName || teamRow.teamName,
    clubId: identity.clubId,
    teamId: identity.birthTeamId || identity.teamId || teamId,
    teamSlot: identity.birthTeamSlot || identity.teamSlot,
  }) || cleanValue(teamId || '-')
}

export const normalizeTeamPagePlayerRow = (playerSeason = {}, index = 0) => {
  const actual = playerSeason.stats?.actual || {}
  const scout = playerSeason.scout || {}
  const display = scout.display || {}

  return {
    ...playerSeason,
    id: playerSeason.identity?.playerId || playerSeason.identity?.playerDocumentId || `${index}`,
    playerId: playerSeason.identity?.playerId || '',
    playerDocumentId: playerSeason.identity?.playerDocumentId || '',
    externalPlayerId: playerSeason.identity?.externalPlayerId || '',
    playerUrl: playerSeason.metadata?.playerUrl || '',
    rosterStatus: playerSeason.metadata?.rosterStatus || 'regular',
    isYoungerAgeGroup: (
      playerSeason.metadata?.rosterStatus === 'youngerAgeGroup'
    ),
    number: playerSeason.position?.shirtNumber || `${index + 1}`,
    numShirt: playerSeason.position?.shirtNumber || '',
    fullName: playerSeason.identity?.displayName || '',
    normalizedName: playerSeason.identity?.normalizedName || '',
    positionLayer: playerSeason.position?.layer || '',
    primaryPosition: playerSeason.position?.primary || '',
    playerStats: {
      ...actual,
      teamMinutes: playerSeason.stats?.context?.teamMinutes,
      teamGames: playerSeason.stats?.context?.teamGames,
      teamRank: playerSeason.stats?.context?.teamRank,
      teamGoalsFor: playerSeason.stats?.context?.teamGoalsFor,
      teamGoalsAgainst: playerSeason.stats?.context?.teamGoalsAgainst,
    },
    games: actual.games || 0,
    goals: actual.goals || 0,
    starts: actual.starts || 0,
    yellowCards: actual.yellowCards || 0,
    minutes: actual.minutes || 0,
    profile: display.label || '-',
    reliability: display.reliability?.level || '-',
    scoutProfiles: scout.profiles || [],
    scoutCombinations: scout.combinations || [],
    scoutProfileDisplay: display,
  }
}

export const adaptTeamPagePlayerRow = ({
  player = {},
  index = 0,
  selectedSeasonOption = null,
  teamSeason = null,
} = {}) => {
  const playerSeason = adaptPlayerDocumentSeason({
    playerDocument: player,
    seasonDocument: player,
    target: selectedSeasonOption?.target || 'current',
    team: {
      birthTeamId: teamSeason?.identity?.teamId,
      birthTeamDocumentId: teamSeason?.identity?.teamDocumentId,
      clubId: teamSeason?.identity?.clubId,
      leagueId: teamSeason?.league?.leagueId,
      leagueLevel: teamSeason?.league?.leagueLevel,
      ageGroupId: teamSeason?.league?.ageGroupId,
      ageGroupLabel: teamSeason?.league?.ageGroupLabel,
      birthTeamSlot: player.birthTeamSlot,
      displayName: teamSeason?.identity?.displayName,
      teamUrl: teamSeason?.metadata?.teamUrl,
    },
    teamScout: teamSeason?.performance || null,
  })

  return normalizeTeamPagePlayerRow(playerSeason, index)
}

export const buildTeamPageView = ({
  teamId,
  leagueDoc,
  teamDoc,
  selectedSeasonOption,
  selectedLeagueSeason,
  selectedTeamSeason,
}) => {
  const leagueSeason = selectedLeagueSeason?.season || {}
  const leagueTarget = selectedLeagueSeason?.target || selectedSeasonOption?.target || 'current'
  const teamTarget = selectedSeasonOption?.target || leagueTarget
  const teamRow = findTeamRow({
    season: leagueSeason,
    teamId,
  }) || {}
  const tableRank = Array.isArray(leagueSeason?.tableRank)
    ? leagueSeason.tableRank
    : []
  const teamIdentity = normalizeTeamIdentity({
    team: teamRow,
    fallback: {
      ...teamDoc,
      teamId,
      teamDocumentId: teamDoc?.id,
      birthTeamId: teamDoc?.birthTeamId || teamId,
    },
  })

  const performance = buildScoutResultMap({
    tableRank,
    leagueDoc,
    season: leagueSeason,
  }).get(
    resolveTeamLookupKey(teamRow) || resolveTeamLookupKey(teamIdentity)
  ) || null

  const leagueTeamSeason = adaptLeagueTableTeam({
    leagueDocument: leagueDoc || {},
    seasonDocument: leagueSeason,
    tableRow: teamRow,
    target: leagueTarget,
  })
  const birthTeamSeason = adaptBirthTeamDocumentSeason({
    teamDocument: teamDoc || {},
    seasonDocument: selectedTeamSeason || {},
    target: teamTarget,
    league: leagueDoc || {},
  })

  const actual = leagueTeamSeason.completeness?.hasStats
    ? leagueTeamSeason.stats.actual
    : birthTeamSeason.stats.actual
  const canonicalTeamSeason = {
    ...birthTeamSeason,
    identity: {
      ...birthTeamSeason.identity,
      ...leagueTeamSeason.identity,
      displayName: resolveTeamName({ teamRow, teamDoc, teamId }),
    },
    season: { ...birthTeamSeason.season, ...leagueTeamSeason.season },
    league: { ...birthTeamSeason.league, ...leagueTeamSeason.league },
    stats: { actual, projected: birthTeamSeason.stats.projected },
    ranking: leagueTeamSeason.ranking,
    performance: performance || birthTeamSeason.performance,
    scoutProfilesSummary: leagueTeamSeason.scoutProfilesSummary,
    completeness: {
      ...birthTeamSeason.completeness,
      ...leagueTeamSeason.completeness,
      hasPerformance: Boolean(performance),
    },
  }

  const games = actual.gamesPlayed || 0
  const points = actual.points || 0
  const goalsFor = actual.goalsFor || 0
  const goalsAgainst = actual.goalsAgainst || 0
  const successPercent = games ? Math.round((points / (games * 3)) * 100) : null
  const teamPlayers = Array.isArray(selectedTeamSeason?.teamPlayers)
    ? selectedTeamSeason.teamPlayers
    : []
  const playersCount = teamPlayers.length
  const performanceView = buildTeamPerformanceViewModel(canonicalTeamSeason.performance)
  const clubId = canonicalTeamSeason.identity.clubId || getClubIdFromTeamId(teamId)
  const club = getClubById(clubId)

  return {
    ...canonicalTeamSeason,
    domain: canonicalTeamSeason,
    id: cleanValue(teamId),
    birthTeamId: canonicalTeamSeason.identity.teamId || cleanValue(teamId),
    teamDocumentId: canonicalTeamSeason.identity.teamDocumentId || cleanValue(teamId),
    clubId,
    clubLevel: Number(club?.clubLevel || canonicalTeamSeason.clubLevel || 0),
    birthTeamSlot: canonicalTeamSeason.identity.teamSlot || 1,
    teamSlot: canonicalTeamSeason.identity.teamSlot || 1,
    name: canonicalTeamSeason.identity.displayName,
    leagueId: canonicalTeamSeason.league.leagueId,
    leagueName: cleanValue(leagueDoc?.leagueName || leagueDoc?.name || leagueDoc?.id || '-'),
    ageGroupId: canonicalTeamSeason.league.ageGroupId,
    ageGroupLabel: canonicalTeamSeason.league.ageGroupLabel,
    birthYear: canonicalTeamSeason.season.birthYear || '-',
    seasonKey: canonicalTeamSeason.season.seasonKey || '-',
    tableRank: canonicalTeamSeason.ranking.tableRank || '-',
    games,
    points,
    successPercent,
    goalsFor,
    goalsAgainst,
    teamUrl: canonicalTeamSeason.metadata.teamUrl,
    teamStats: {
      teamGamePlayed: games,
      gamesPlayed: games,
      points,
      goalsFor,
      goalsAgainst,
      goalsForPerGame: actual.goalsForPerGame,
      goalsAgainstPerGame: actual.goalsAgainstPerGame,
      attackPerformance: performanceView.offense.priority.score,
      defensePerformance: performanceView.defense.priority.score,
    },
    attackPerGame: games ? (goalsFor / games).toFixed(2) : '-',
    defensePerGame: games ? (goalsAgainst / games).toFixed(2) : '-',
    offense: canonicalTeamSeason.performance?.offense || {},
    defense: canonicalTeamSeason.performance?.defense || {},
    performanceView,
    playersStatus: playersCount ? `${playersCount}` : 'אין סגל',
    statsStatus: playersCount
      ? `${teamPlayers.filter(player => Number(player?.playerStats?.minutes || player?.minutes || 0) > 0).length}`
      : '0',
  }
}
