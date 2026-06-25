// src/features/playersDatabase/sharedLogic/yearGroupOpportunities.js

import { findYearGroupsBlockedByUpperLeague } from '../../../shared/players/index.js'

const clean = value => String(value ?? '').trim()

const latestSnapshotByLeagueId = snapshots => (
  (Array.isArray(snapshots) ? snapshots : []).reduce((acc, snapshot) => {
    const leagueId = clean(snapshot.leagueId)
    if (!leagueId) return acc

    const current = acc[leagueId]
    const nextDate = clean(snapshot.capturedAt) || clean(snapshot.createdAt)
    const currentDate = clean(current?.capturedAt) || clean(current?.createdAt)

    if (!current || nextDate.localeCompare(currentDate) > 0) {
      acc[leagueId] = snapshot
    }

    return acc
  }, {})
)

const leagueSeasonIds = league => (
  Object.values(league?.seasons || {})
    .map(season => clean(season.seasonId))
    .filter(Boolean)
)

const rowToTeam = ({ row, league, snapshot }) => ({
  clubId: clean(row.clubId),
  clubName: clean(row.clubName || row.teamName || row.sourceTeamName),
  sourceTeamName: clean(row.sourceTeamName || row.teamName),
  seasonId: clean(row.seasonId || snapshot.seasonId || league.seasonId || leagueSeasonIds(league)[0]),
  ageGroupId: clean(row.ageGroupId || snapshot.ageGroupId || league.ageGroupId),
  ageGroupLabel: clean(row.ageGroupLabel || snapshot.ageGroupLabel || league.ageGroupLabel),
  teamSlot: row.teamSlot || 1,
  teamSlotId: clean(row.teamSlotId),
  teamSeasonKey: clean(row.teamSeasonKey),
  leagueId: clean(league.id || row.leagueId || snapshot.leagueId),
  leagueName: clean(league.leagueName || league.name || snapshot.leagueName),
  leagueLevel: league.level ?? snapshot.level ?? null,
  leagueRegion: clean(league.region || snapshot.region),
  games: row.games ?? null,
  goalsFor: row.goalsFor ?? null,
  goalsAgainst: row.goalsAgainst ?? null,
  points: row.points ?? null,
})

export function buildYearGroupOpportunityTeams({
  leagues = [],
  snapshots = [],
} = {}) {
  const snapshotsByLeagueId = latestSnapshotByLeagueId(snapshots)

  return (Array.isArray(leagues) ? leagues : []).flatMap(league => {
    const snapshot = snapshotsByLeagueId[clean(league.id)]
    const rows = Array.isArray(snapshot?.rows) ? snapshot.rows : []

    return rows.map(row => rowToTeam({ row, league, snapshot }))
  })
}

export function findPlayersDatabaseYearGroupOpportunities(data = {}, options = {}) {
  return findYearGroupsBlockedByUpperLeague(
    buildYearGroupOpportunityTeams(data),
    options
  )
}
