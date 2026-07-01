// src/features/playersDatabase/components/leagues/board/logic/leagueIndicators.logic.js

import {
  getLeagueLevelLabel,
  getLeagueRegionLabel,
  getLeagueSeasonRows,
} from '../../leagueUtils.js'

const clean = value => String(value || '').trim()

export const getIndicatorTeamKey = item => {
  return (
    clean(item?.currentTeam?.teamSeasonKey) ||
    clean(item?.currentTeam?.teamSlotId) ||
    clean(item?.clubId) ||
    clean(item?.clubName)
  )
}

export const formatIndicatorTeamLabel = team => {
  let levelLabel = ''

  if (
    team?.leagueLevel !== null &&
    team?.leagueLevel !== undefined
  ) {
    levelLabel = getLeagueLevelLabel(
      team.leagueLevel
    )
  }

  return [
    team?.ageGroupLabel,
    levelLabel,
  ]
    .filter(Boolean)
    .join(' | ') || '-'
}

export const getLeagueIndicatorsPrintContext = league => {
  const primarySeason =
    getLeagueSeasonRows(league)[0] || {}

  const birthYear =
    primarySeason.primaryBirthYear ||
    primarySeason.birthYear ||
    primarySeason.birthYears?.join(', ') ||
    '-'

  return {
    birthYear,
    leagueName: league?.leagueName || '-',
    leagueLevel: getLeagueLevelLabel(
      league?.level
    ),
    region: getLeagueRegionLabel(
      league?.region
    ),
    ageGroup:
      league?.ageGroupLabel ||
      primarySeason.ageGroupLabel ||
      '-',
  }
}

export const buildLeagueIndicatorsPrintFileName =
  context => {
    return [
      'אינדיקציות',
      context.ageGroup,
      context.leagueLevel,
      context.region,
      context.birthYear,
    ]
      .filter(value => (
        value &&
        value !== '-'
      ))
      .join('_')
  }

const buildRiskRows = opportunities => {
  return opportunities.map(item => ({
    ...item,
    indicatorType: 'risk',
  }))
}

const buildProfileOnlyRows = ({
  profileRows,
  riskRows,
}) => {
  const riskKeys = new Set(
    riskRows
      .map(getIndicatorTeamKey)
      .filter(Boolean)
  )

  return profileRows
    .filter(item => (
      !riskKeys.has(
        getIndicatorTeamKey(item)
      )
    ))
    .map(item => ({
      ...item,
      indicatorType: 'profiles',
    }))
}

const getMaxLevelGap = opportunities => {
  return opportunities.reduce(
    (max, item) => {
      const levelGap =
        Number(item.levelGap) || 0

      return Math.max(
        max,
        levelGap
      )
    },
    0
  )
}

const getProfilesCount = rows => {
  return rows.reduce(
    (sum, item) => {
      const profilesCount =
        Number(
          item.scoutProfilesCount
        ) || 0

      return sum + profilesCount
    },
    0
  )
}

const getDisplayProfilesCount = ({
  opportunities,
  profileRows,
  scoutProfilesCount,
}) => {
  const directProfilesCount =
    Number(scoutProfilesCount) || 0

  const opportunityProfilesCount =
    getProfilesCount(opportunities)

  const profileRowsCount =
    getProfilesCount(profileRows)

  return Math.max(
    directProfilesCount,
    opportunityProfilesCount,
    profileRowsCount
  )
}

const getRiskClubCount = opportunities => {
  const riskClubKeys = opportunities
    .map(item => (
      item.clubId ||
      item.clubName
    ))
    .filter(Boolean)

  return new Set(
    riskClubKeys
  ).size
}

export const buildLeagueIndicatorsData = ({
  opportunities = [],
  profileRows = [],
  scoutProfilesCount = 0,
  rowsLimit = 8,
}) => {
  const riskRows =
    buildRiskRows(opportunities)

  const profileOnlyRows =
    buildProfileOnlyRows({
      profileRows,
      riskRows,
    })

  const indicatorRows = [
    ...riskRows,
    ...profileOnlyRows,
  ]

  const rows = indicatorRows.slice(
    0,
    rowsLimit
  )

  const maxLevelGap =
    getMaxLevelGap(opportunities)

  const displayProfilesCount =
    getDisplayProfilesCount({
      opportunities,
      profileRows,
      scoutProfilesCount,
    })

  const riskClubCount =
    getRiskClubCount(opportunities)

  const hiddenCount = Math.max(
    indicatorRows.length - rows.length,
    0
  )

  return {
    indicatorRows,
    rows,
    maxLevelGap,
    displayProfilesCount,
    riskClubCount,
    hiddenCount,
  }
}
