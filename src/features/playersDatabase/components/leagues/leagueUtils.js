// src/features/playersDatabase/components/leagueUtils.js

const clean = value => String(value ?? '').trim()

export const getLeagueRegionLabel = value => {
  const region = clean(value).toLowerCase()

  if (region === 'north') return 'צפון'
  if (region === 'south') return 'דרום'

  return clean(value) || 'כללי'
}

export const getLeagueLevelLabel = level => {
  const numericLevel = Number(level)

  if (numericLevel === 1) return 'על'
  if (numericLevel === 2) return 'לאומית'
  if (numericLevel === 3) return 'ארצית'
  if (numericLevel === 4) return 'מחוזית'

  return 'לא זוהתה'
}

export const getLeagueSeasonRows = league => (
  Object.entries(league?.seasons || {}).map(([key, season]) => ({
    key,
    ...season,
  }))
)

export const getPrimaryLeagueSeason = league => (
  getLeagueSeasonRows(league)[0] || null
)

export const buildLeagueTableRows = ({
  season,
  snapshot,
}) => {
  if (Array.isArray(snapshot?.rows) && snapshot.rows.length) {
    return snapshot.rows.map((row, index) => ({
      id: row.clubId || row.rowId || `snapshot-${index + 1}`,
      leaguePosition:
        row.leaguePosition ??
        row.position ??
        index + 1,
      clubName:
        row.clubName ||
        `מועדון ${index + 1}`,
      games: Number(row.games) || 0,
      wins: Number(row.wins) || 0,
      draws: Number(row.draws) || 0,
      losses: Number(row.losses) || 0,
      goalsFor: Number(row.goalsFor) || 0,
      goalsAgainst: Number(row.goalsAgainst) || 0,
      goalDifference: Number(row.goalDifference) || 0,
      points: Number(row.points) || 0,
      placeholder: false,
    }))
  }

  const clubsCount = Number(season?.clubsCount) || 0
  const clubIds = Array.isArray(season?.clubIds)
    ? season.clubIds
    : []

  return Array.from({ length: clubsCount }, (_, index) => {
    const leaguePosition = index + 1
    const clubId = clean(clubIds[index])

    return {
      id: clubId || `placeholder-${leaguePosition}`,
      leaguePosition,
      clubName: clubId || `מועדון ${leaguePosition}`,
      games: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      placeholder: !clubId,
    }
  })
}
