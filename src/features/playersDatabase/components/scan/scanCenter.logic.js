// src/features/playersDatabase/components/scan/scanCenter.logic.js

import {
  getLeagueLevelLabel,
  getLeagueRegionLabel,
  getLeagueSeasonRows,
} from '../leagues/leagueUtils.js'
import { SCOUT_PROFILES } from '../../../../shared/players/scouting/index.js'

const clean = value => String(value ?? '').trim()

export const SCAN_SCOPE_OPTIONS = [
  { value: 'all', label: 'כל הפרופילים' },
  { value: 'database', label: 'דאטה בייס' },
  { value: 'year', label: 'שנתון' },
  { value: 'league', label: 'ליגה' },
]

export const SCAN_STATUS_OPTIONS = [
  { value: 'all', label: 'כל הסטטוסים' },
  { value: 'risk', label: 'בסיכון' },
  { value: 'profiles', label: 'עם פרופילים' },
  { value: 'missingSnapshot', label: 'חסר צילום' },
  { value: 'ok', label: 'ללא דגל' },
]

export const SCAN_PROFILE_OPTIONS = [
  { value: 'all', label: 'כל הפרופילים' },
  ...SCOUT_PROFILES.map(profile => ({
    value: profile.id,
    label: profile.label,
  })),
]

export const getPrimarySeason = league =>
  getLeagueSeasonRows(league)[0] || null

export const getLeagueBirthYear = league => {
  const season = getPrimarySeason(league)
  const birthYear =
    season?.primaryBirthYear ||
    season?.birthYear ||
    season?.birthYears?.[0]

  return clean(birthYear)
}

export const getLeagueSnapshotId = league => (
  clean(getPrimarySeason(league)?.latestSnapshotId)
)

export const getLeagueSnapshotDate = league => (
  clean(getPrimarySeason(league)?.latestSnapshotAt)
)

export const getLeagueScoutProfilesCount = league => (
  Object.values(league?.teamsIndex || {})
    .reduce((sum, team) => (
      sum + (Number(team?.scoutProfilesCount) || 0)
    ), 0)
)

export const getLeagueLoadedPlayersCount = league => (
  Object.values(league?.teamsIndex || {})
    .reduce((sum, team) => (
      sum + (Number(team?.playersCount) || 0)
    ), 0)
)

export const getLeagueExpectedTeamsCount = league => (
  getLeagueSeasonRows(league)
    .reduce((max, season) => (
      Math.max(max, Number(season?.clubsCount) || 0)
    ), 0)
)

export const getLeagueLoadedTeamsCount = league => (
  Object.values(league?.teamsIndex || {})
    .filter(team => (Number(team?.playersCount) || 0) > 0)
    .length
)

const mergeCountMaps = maps => (
  maps.reduce((acc, map = {}) => {
    Object.entries(map || {}).forEach(([key, value]) => {
      const id = clean(key)
      if (!id) return

      acc[id] = (acc[id] || 0) + (Number(value) || 0)
    })

    return acc
  }, {})
)

export const getLeagueProfileCounts = league => (
  mergeCountMaps(
    Object.values(league?.teamsIndex || {})
      .map(team => team?.profileCounts || {})
  )
)

export const getProfileLabel = profileId => (
  SCOUT_PROFILES.find(profile => profile.id === profileId)?.label ||
  profileId
)

export const getProfileBreakdownRows = profileCounts => (
  Object.entries(profileCounts || {})
    .map(([profileId, count]) => ({
      profileId,
      label: getProfileLabel(profileId),
      count: Number(count) || 0,
    }))
    .filter(row => row.count > 0)
    .sort((a, b) => (
      b.count - a.count ||
      a.label.localeCompare(b.label, 'he')
    ))
)

export const getProfileLeagues = profile => {
  if (!profile) return []
  if (profile.scope === 'league') return profile.league ? [profile.league] : []

  return (profile.children || [])
    .flatMap(child => getProfileLeagues(child))
}

export const getProfileTeams = profile => (
  getProfileLeagues(profile)
    .flatMap(league => (
      Object.entries(league?.teamsIndex || {})
        .map(([teamSeasonKey, team]) => ({
          ...team,
          teamSeasonKey: clean(team?.teamSeasonKey || teamSeasonKey),
          leagueId: clean(team?.leagueId || league.id),
          leagueName: clean(team?.leagueName || league.leagueName),
          ageGroupId: clean(team?.ageGroupId || league.ageGroupId),
          ageGroupLabel: clean(team?.ageGroupLabel || league.ageGroupLabel),
        }))
    ))
    .filter(team => clean(team.teamSeasonKey))
)

export const buildScanYearOptions = leagues => [
  { value: 'all', label: 'כל השנתונים' },
  ...Array.from(new Set(
    leagues
      .map(getLeagueBirthYear)
      .filter(Boolean)
  ))
    .sort((a, b) => Number(a) - Number(b))
    .map(value => ({ value, label: value })),
]

const getLeagueRiskCount = (league, opportunities) => (
  opportunities.filter(item => (
    clean(
      item?.currentTeam?.leagueId ||
      item?.currentTeam?.league?.id
    ) === league?.id
  )).length
)

const getProfileStatus = ({
  riskCount,
  scoutProfilesCount,
  snapshotId,
}) => {
  if (riskCount > 0) return 'risk'
  if (!snapshotId) return 'missingSnapshot'
  if (scoutProfilesCount > 0) return 'profiles'
  return 'ok'
}

const statusLabelMap = {
  risk: 'בסיכון',
  profiles: 'עם פרופילים',
  missingSnapshot: 'חסר צילום',
  ok: 'ללא דגל',
}

const statusColorMap = {
  risk: 'warning',
  profiles: 'neutral',
  missingSnapshot: 'danger',
  ok: 'success',
}

export const getScanStatusLabel = status =>
  statusLabelMap[status] || statusLabelMap.ok

export const getScanStatusColor = status =>
  statusColorMap[status] || 'neutral'

const buildLeagueProfile = ({
  league,
  opportunities,
}) => {
  const birthYear = getLeagueBirthYear(league)
  const snapshotId = getLeagueSnapshotId(league)
  const scoutProfilesCount = getLeagueScoutProfilesCount(league)
  const loadedPlayersCount = getLeagueLoadedPlayersCount(league)
  const loadedTeamsCount = getLeagueLoadedTeamsCount(league)
  const expectedTeamsCount = getLeagueExpectedTeamsCount(league)
  const profileCounts = getLeagueProfileCounts(league)
  const riskCount = getLeagueRiskCount(league, opportunities)
  const status = getProfileStatus({
    riskCount,
    scoutProfilesCount,
    snapshotId,
  })

  return {
    id: `league:${league.id}`,
    scope: 'league',
    status,
    title: `${league.ageGroupLabel || '-'} | ${league.leagueName || '-'}`,
    subtitle: [
      getLeagueLevelLabel(league.level),
      getLeagueRegionLabel(league.region),
      birthYear,
    ].filter(Boolean).join(' | '),
    leagueId: league.id,
    league,
    birthYear,
    leaguesCount: 1,
    loadedPlayersCount,
    loadedTeamsCount,
    expectedTeamsCount,
    scoutProfilesCount,
    profileCounts,
    riskCount,
    snapshotsCount: snapshotId ? 1 : 0,
    latestSnapshotAt: getLeagueSnapshotDate(league),
    targetPath: `/players-database/leagues/${encodeURIComponent(league.id)}`,
  }
}

const aggregateProfiles = ({
  id,
  scope,
  title,
  subtitle,
  rows,
}) => {
  const riskCount = rows.reduce((sum, row) => sum + row.riskCount, 0)
  const scoutProfilesCount = rows.reduce(
    (sum, row) => sum + row.scoutProfilesCount,
    0
  )
  const loadedPlayersCount = rows.reduce(
    (sum, row) => sum + row.loadedPlayersCount,
    0
  )
  const loadedTeamsCount = rows.reduce(
    (sum, row) => sum + row.loadedTeamsCount,
    0
  )
  const expectedTeamsCount = rows.reduce(
    (sum, row) => sum + row.expectedTeamsCount,
    0
  )
  const profileCounts = mergeCountMaps(
    rows.map(row => row.profileCounts || {})
  )
  const snapshotsCount = rows.reduce(
    (sum, row) => sum + row.snapshotsCount,
    0
  )
  const status = getProfileStatus({
    riskCount,
    scoutProfilesCount,
    snapshotId: snapshotsCount ? 'loaded' : '',
  })
  const snapshotDates = rows
    .map(row => row.latestSnapshotAt)
    .filter(Boolean)
    .sort()

  return {
    id,
    scope,
    status,
    title,
    subtitle,
    birthYear: scope === 'year' ? id.replace('year:', '') : '',
    leaguesCount: rows.length,
    loadedPlayersCount,
    loadedTeamsCount,
    expectedTeamsCount,
    scoutProfilesCount,
    profileCounts,
    riskCount,
    snapshotsCount,
    latestSnapshotAt: snapshotDates[snapshotDates.length - 1] || '',
    children: rows,
  }
}

export const buildScanProfiles = ({
  leagues = [],
  opportunities = [],
}) => {
  const leagueRows = leagues.map(league => buildLeagueProfile({
    league,
    opportunities,
  }))

  const yearRows = Array.from(
    leagueRows.reduce((map, row) => {
      const key = row.birthYear || 'ללא שנתון'
      map.set(key, [...(map.get(key) || []), row])
      return map
    }, new Map())
  )
    .map(([birthYear, rows]) => aggregateProfiles({
      id: `year:${birthYear}`,
      scope: 'year',
      title: `שנתון ${birthYear}`,
      subtitle: `${rows.length} ליגות`,
      rows,
    }))
    .sort((a, b) => Number(a.birthYear) - Number(b.birthYear))

  const databaseRow = aggregateProfiles({
    id: 'database:all',
    scope: 'database',
    title: 'כל הדאטה בייס',
    subtitle: `${leagues.length} ליגות | ${yearRows.length} שנתונים`,
    rows: leagueRows,
  })

  return [
    databaseRow,
    ...yearRows,
    ...leagueRows,
  ]
}

export const filterScanProfiles = ({
  rows,
  scope,
  birthYear,
  status,
  profileId,
  search,
}) => {
  const query = clean(search).toLowerCase()

  return rows.filter(row => {
    const scopeOk = scope === 'all' || row.scope === scope
    const yearOk =
      birthYear === 'all' ||
      row.birthYear === birthYear ||
      row.children?.some(child => child.birthYear === birthYear)
    const statusOk =
      status === 'all' ||
      row.status === status ||
      row.children?.some(child => child.status === status)
    const profileOk =
      profileId === 'all' ||
      (Number(row.profileCounts?.[profileId]) || 0) > 0 ||
      row.children?.some(child => (
        (Number(child.profileCounts?.[profileId]) || 0) > 0
      ))
    const searchOk =
      !query ||
      [
        row.title,
        row.subtitle,
        row.leagueId,
      ].some(value => clean(value).toLowerCase().includes(query))

    return scopeOk && yearOk && statusOk && profileOk && searchOk
  })
}
