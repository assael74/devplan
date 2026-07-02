// src/features/playersDatabase/components/scan/logic/profiles.logic.js

import { getLeagueLevelLabel, getLeagueRegionLabel, getLeagueSeasonRows } from '../../leagues/leagueUtils.js'
import { SCAN_STATUS_COLORS, SCAN_STATUS_LABELS } from './constants.js'
import { getLeagueBirthYear, getLeagueSnapshotDate, getLeagueSnapshotId } from './season.logic.js'
import { getProfileLabel } from './scout.logic.js'
import { clean, mergeCountMaps } from './utils.js'

export const getLeagueScoutProfilesCount = league => Object.values(league?.teamsIndex || {}).reduce((sum, team) => sum + (Number(team?.scoutProfilesCount) || 0), 0)

export const getLeagueLoadedPlayersCount = league => Object.values(league?.teamsIndex || {}).reduce((sum, team) => sum + (Number(team?.playersCount) || 0), 0)

export const getLeagueExpectedTeamsCount = league => getLeagueSeasonRows(league).reduce((max, season) => Math.max(max, Number(season?.clubsCount) || 0), 0)

export const getLeagueLoadedTeamsCount = league => Object.values(league?.teamsIndex || {}).filter(team => (Number(team?.playersCount) || 0) > 0).length

export const getLeagueProfileCounts = league => mergeCountMaps(Object.values(league?.teamsIndex || {}).map(team => team?.profileCounts || {}))

export const getProfileBreakdownRows = profileCounts => Object.entries(profileCounts || {}).map(([profileId, count]) => ({ profileId, label: getProfileLabel(profileId), count: Number(count) || 0 })).filter(row => row.count > 0).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'he'))

export const getProfileLeagues = profile => {
  if (!profile) return []
  if (profile.scope === 'league') return profile.league ? [profile.league] : []
  return (profile.children || []).flatMap(child => getProfileLeagues(child))
}

export const getProfileTeams = profile => getProfileLeagues(profile).flatMap(league => Object.entries(league?.teamsIndex || {}).map(([teamSeasonKey, team]) => ({
  ...team,
  teamSeasonKey: clean(team?.teamSeasonKey || teamSeasonKey),
  leagueId: clean(team?.leagueId || league.id),
  leagueName: clean(team?.leagueName || league.leagueName),
  ageGroupId: clean(team?.ageGroupId || league.ageGroupId),
  ageGroupLabel: clean(team?.ageGroupLabel || league.ageGroupLabel),
}))).filter(team => clean(team.teamSeasonKey))

export const getScanStatus = ({ riskCount, scoutProfilesCount, snapshotId }) => {
  if (riskCount > 0) return 'risk'
  if (!snapshotId) return 'missingSnapshot'
  if (scoutProfilesCount > 0) return 'profiles'
  return 'ok'
}

export const getScanStatusLabel = status => SCAN_STATUS_LABELS[status] || SCAN_STATUS_LABELS.ok

export const getScanStatusColor = status => SCAN_STATUS_COLORS[status] || 'neutral'

const getLeagueRiskCount = (league, opportunities) => opportunities.filter(item => clean(item?.currentTeam?.leagueId || item?.currentTeam?.league?.id) === league?.id).length

const buildLeagueProfile = ({ league, opportunities, seasonId }) => {
  const birthYear = getLeagueBirthYear(league, seasonId)
  const snapshotId = getLeagueSnapshotId(league, seasonId)
  const scoutProfilesCount = getLeagueScoutProfilesCount(league)
  const loadedPlayersCount = getLeagueLoadedPlayersCount(league)
  const loadedTeamsCount = getLeagueLoadedTeamsCount(league)
  const expectedTeamsCount = getLeagueExpectedTeamsCount(league)
  const profileCounts = getLeagueProfileCounts(league)
  const riskCount = getLeagueRiskCount(league, opportunities)

  return {
    id: `league:${league.id}`,
    scope: 'league',
    status: getScanStatus({ riskCount, scoutProfilesCount, snapshotId }),
    title: `${league.ageGroupLabel || '-'} | ${league.leagueName || '-'}`,
    subtitle: [getLeagueLevelLabel(league.level), getLeagueRegionLabel(league.region), birthYear].filter(Boolean).join(' | '),
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
    latestSnapshotAt: getLeagueSnapshotDate(league, seasonId),
    targetPath: `/players-database/leagues/${encodeURIComponent(league.id)}`,
  }
}

const aggregateProfiles = ({ id, scope, title, subtitle, rows }) => {
  const riskCount = rows.reduce((sum, row) => sum + row.riskCount, 0)
  const scoutProfilesCount = rows.reduce((sum, row) => sum + row.scoutProfilesCount, 0)
  const loadedPlayersCount = rows.reduce((sum, row) => sum + row.loadedPlayersCount, 0)
  const loadedTeamsCount = rows.reduce((sum, row) => sum + row.loadedTeamsCount, 0)
  const expectedTeamsCount = rows.reduce((sum, row) => sum + row.expectedTeamsCount, 0)
  const snapshotsCount = rows.reduce((sum, row) => sum + row.snapshotsCount, 0)
  const snapshotDates = rows.map(row => row.latestSnapshotAt).filter(Boolean).sort()

  return {
    id,
    scope,
    status: getScanStatus({ riskCount, scoutProfilesCount, snapshotId: snapshotsCount ? 'loaded' : '' }),
    title,
    subtitle,
    birthYear: scope === 'year' ? id.replace('year:', '') : '',
    leaguesCount: rows.length,
    loadedPlayersCount,
    loadedTeamsCount,
    expectedTeamsCount,
    scoutProfilesCount,
    profileCounts: mergeCountMaps(rows.map(row => row.profileCounts || {})),
    riskCount,
    snapshotsCount,
    latestSnapshotAt: snapshotDates.at(-1) || '',
    children: rows,
  }
}

export const buildScanProfiles = ({ leagues = [], opportunities = [], seasonId = '' }) => {
  const leagueRows = leagues.map(league => buildLeagueProfile({ league, opportunities, seasonId }))
  const yearRows = Array.from(leagueRows.reduce((map, row) => {
    const key = row.birthYear || 'ללא שנתון'
    map.set(key, [...(map.get(key) || []), row])
    return map
  }, new Map())).map(([birthYear, rows]) => aggregateProfiles({ id: `year:${birthYear}`, scope: 'year', title: `שנתון ${birthYear}`, subtitle: `${rows.length} ליגות`, rows })).sort((a, b) => Number(a.birthYear) - Number(b.birthYear))

  const databaseRow = aggregateProfiles({ id: 'database:all', scope: 'database', title: 'כל הדאטה בייס', subtitle: `${leagues.length} ליגות | ${yearRows.length} שנתונים`, rows: leagueRows })
  return [databaseRow, ...yearRows, ...leagueRows]
}
