// features/playersDatabase/components/summary/logic/summaryIndicators.logic.js

import {
  getLeagueLevelLabel,
  getLeagueRegionLabel,
  getLeagueSeasonRows,
} from '../../leagues/leagueUtils.js'

const clean = value => String(value || '').trim()

export const getSummaryIndicatorTeamKey = item => (
  clean(item?.currentTeam?.teamSeasonKey) ||
  clean(item?.currentTeam?.teamSlotId) ||
  clean(item?.clubId) ||
  clean(item?.clubName)
)

export const formatSummaryIndicatorTeamLabel = team => {
  let levelLabel = ''

  if (
    team?.leagueLevel !== null &&
    team?.leagueLevel !== undefined
  ) {
    levelLabel = getLeagueLevelLabel(team.leagueLevel)
  }

  return [
    team?.ageGroupLabel,
    levelLabel,
  ]
    .filter(Boolean)
    .join(' | ') || '-'
}

export const getSummaryIndicatorsPrintContext = league => {
  const primarySeason = getLeagueSeasonRows(league)[0] || {}

  const birthYear =
    primarySeason.primaryBirthYear ||
    primarySeason.birthYear ||
    primarySeason.birthYears?.join(', ') ||
    '-'

  return {
    birthYear,
    leagueName: league?.leagueName || '-',
    leagueLevel: getLeagueLevelLabel(league?.level),
    region: getLeagueRegionLabel(league?.region),
    ageGroup:
      league?.ageGroupLabel ||
      primarySeason.ageGroupLabel ||
      '-',
  }
}

export const buildSummaryIndicatorsPrintFileName = context => (
  [
    'אינדיקציות',
    context.ageGroup,
    context.leagueLevel,
    context.region,
    context.birthYear,
  ]
    .filter(value => value && value !== '-')
    .join('_')
)

const buildRiskRows = opportunities => (
  opportunities.map(item => ({
    ...item,
    indicatorType: 'risk',
  }))
)

const buildProfileOnlyRows = ({ profileRows, riskRows }) => {
  const riskKeys = new Set(
    riskRows
      .map(getSummaryIndicatorTeamKey)
      .filter(Boolean)
  )

  return profileRows
    .filter(item => !riskKeys.has(getSummaryIndicatorTeamKey(item)))
    .map(item => ({
      ...item,
      indicatorType: 'profiles',
    }))
}

const getMaxLevelGap = opportunities => (
  opportunities.reduce((max, item) => {
    const levelGap = Number(item.levelGap) || 0

    return Math.max(max, levelGap)
  }, 0)
)

const getProfilesCount = rows => (
  rows.reduce((sum, item) => {
    const profilesCount = Number(item.scoutProfilesCount) || 0

    return sum + profilesCount
  }, 0)
)

const getDisplayProfilesCount = ({
  opportunities,
  profileRows,
  scoutProfilesCount,
}) => {
  const directProfilesCount = Number(scoutProfilesCount) || 0
  const opportunityProfilesCount = getProfilesCount(opportunities)
  const profileRowsCount = getProfilesCount(profileRows)

  return Math.max(
    directProfilesCount,
    opportunityProfilesCount,
    profileRowsCount
  )
}

const getRiskClubCount = opportunities => {
  const riskClubKeys = opportunities
    .map(item => item.clubId || item.clubName)
    .filter(Boolean)

  return new Set(riskClubKeys).size
}

export const buildSummaryIndicatorsData = ({
  opportunities = [],
  profileRows = [],
  scoutProfilesCount = 0,
  rowsLimit = 8,
}) => {
  const riskRows = buildRiskRows(opportunities)

  const profileOnlyRows = buildProfileOnlyRows({
    profileRows,
    riskRows,
  })

  const indicatorRows = [
    ...riskRows,
    ...profileOnlyRows,
  ]

  const rows = indicatorRows.slice(0, rowsLimit)
  const maxLevelGap = getMaxLevelGap(opportunities)

  const displayProfilesCount = getDisplayProfilesCount({
    opportunities,
    profileRows,
    scoutProfilesCount,
  })

  const riskClubCount = getRiskClubCount(opportunities)
  const hiddenCount = Math.max(indicatorRows.length - rows.length, 0)

  return {
    indicatorRows,
    rows,
    maxLevelGap,
    displayProfilesCount,
    riskClubCount,
    hiddenCount,
  }
}
