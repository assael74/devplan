// shared/games/insights/team/snapshots/teamGames.sync.js

const toNumber = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const buildGap = (teamValue, gamesValue) => {
  return toNumber(gamesValue) - toNumber(teamValue)
}

const getSnapshotValue = (snapshot, key) => {
  if (snapshot?.[key] !== undefined) return snapshot[key]
  if (snapshot?.totals?.[key] !== undefined) return snapshot.totals[key]
  return 0
}

export const buildTeamGamesSyncStatus = ({ leagueSnapshot, gamesSnapshot }) => {
  const team = {
    playedGames: getSnapshotValue(leagueSnapshot, 'playedGames'),
    points: getSnapshotValue(leagueSnapshot, 'points'),
    goalsFor: getSnapshotValue(leagueSnapshot, 'goalsFor'),
    goalsAgainst: getSnapshotValue(leagueSnapshot, 'goalsAgainst'),
  }

  const games = {
    playedGames: getSnapshotValue(gamesSnapshot, 'playedGames'),
    points: getSnapshotValue(gamesSnapshot, 'points'),
    goalsFor: getSnapshotValue(gamesSnapshot, 'goalsFor'),
    goalsAgainst: getSnapshotValue(gamesSnapshot, 'goalsAgainst'),
  }

  const gaps = {
    playedGames: buildGap(team.playedGames, games.playedGames),
    points: buildGap(team.points, games.points),
    goalsFor: buildGap(team.goalsFor, games.goalsFor),
    goalsAgainst: buildGap(team.goalsAgainst, games.goalsAgainst),
  }

  const blockingReasons = []

  if (gaps.playedGames !== 0) blockingReasons.push('playedGamesMismatch')
  if (gaps.points !== 0) blockingReasons.push('pointsMismatch')
  if (gaps.goalsFor !== 0) blockingReasons.push('goalsForMismatch')
  if (gaps.goalsAgainst !== 0) blockingReasons.push('goalsAgainstMismatch')

  return {
    isSynced: blockingReasons.length === 0,
    team,
    games,
    gaps,
    blockingReasons,
  }
}
