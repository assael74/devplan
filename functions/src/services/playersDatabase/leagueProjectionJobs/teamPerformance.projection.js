// C:/projects/devplan/functions/src/services/playersDatabase/leagueProjectionJobs/teamPerformance.projection.js

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const numberValue = value => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const pickDefinedValue = (...values) => (
  values.find(value => value !== undefined && value !== null && value !== '')
)

const resolveTeamId = row => clean(
  row?.birthTeamDocumentId ||
  row?.teamDocumentId ||
  row?.birthTeamId ||
  row?.teamId
)

const getStats = row => ({
  gamesPlayed: numberValue(
    pickDefinedValue(row?.games, row?.teamGamePlayed, row?.teamStats?.teamGamePlayed)
  ),
  goalsFor: numberValue(pickDefinedValue(row?.goalsFor, row?.teamStats?.goalsFor)),
  goalsAgainst: numberValue(pickDefinedValue(row?.goalsAgainst, row?.teamStats?.goalsAgainst)),
  points: numberValue(pickDefinedValue(row?.points, row?.teamStats?.points)),
})

const getTableRank = row => numberValue(
  pickDefinedValue(row?.position, row?.rank, row?.leaguePosition)
)

const buildRankMap = ({ rows = [], value, direction }) => {
  const ranks = new Map()
  ;[...(Array.isArray(rows) ? rows : [])]
    .sort((left, right) => {
      const difference = value(left) - value(right)
      if (difference) return direction === 'asc' ? difference : -difference
      return getTableRank(left) - getTableRank(right)
    })
    .forEach((row, index) => {
      const teamId = resolveTeamId(row)
      if (teamId) ranks.set(teamId, index + 1)
    })
  return ranks
}

const roundRate = value => Math.round((numberValue(value) + Number.EPSILON) * 10) / 10

function buildTeamPerformanceRows(rows = []) {
  const safeRows = Array.isArray(rows) ? rows : []
  const attackRanks = buildRankMap({
    rows: safeRows,
    value: row => getStats(row).goalsFor,
    direction: 'desc',
  })
  const defenseRanks = buildRankMap({
    rows: safeRows,
    value: row => getStats(row).goalsAgainst,
    direction: 'asc',
  })

  return safeRows.map(row => {
    const teamId = resolveTeamId(row)
    const stats = getStats(row)
    return {
      teamId,
      row,
      performance: {
        tableRank: getTableRank(row),
        tableAttackRank: attackRanks.get(teamId) || 0,
        tableDefenseRank: defenseRanks.get(teamId) || 0,
        teamGamePlayed: stats.gamesPlayed,
        goalsFor: stats.goalsFor,
        goalsAgainst: stats.goalsAgainst,
        goalsForPerGame: roundRate(
          stats.gamesPlayed ? stats.goalsFor / stats.gamesPlayed : 0
        ),
        goalsAgainstPerGame: roundRate(
          stats.gamesPlayed ? stats.goalsAgainst / stats.gamesPlayed : 0
        ),
        points: stats.points,
      },
    }
  })
}

module.exports = {
  buildTeamPerformanceRows,
  resolveTeamId,
}
