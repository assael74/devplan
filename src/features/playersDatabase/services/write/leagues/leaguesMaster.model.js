// features/playersDatabase/services/write/leagues/leaguesMaster.model.js

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const toNumber = value => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export const getLeagueSeasonRows = league => {
  const rows = []

  if (league?.current?.seasonId || league?.current?.seasonKey) {
    rows.push({ target: 'current', season: league.current })
  }

  ;(Array.isArray(league?.history) ? league.history : []).forEach(season => {
    if (season?.seasonId || season?.seasonKey) {
      rows.push({ target: 'history', season })
    }
  })

  return rows
}

const countProfiledPlayers = tableRank =>
  (Array.isArray(tableRank) ? tableRank : []).reduce(
    (total, row) => total + toNumber(row?.scoutProfilesSummary?.total),
    0
  )

const countScoutProfiles = tableRank =>
  (Array.isArray(tableRank) ? tableRank : []).reduce((total, row) => {
    const profileCounts = row?.scoutProfilesSummary?.profileCounts
    if (!profileCounts || typeof profileCounts !== 'object') return total

    return total + Object.values(profileCounts).reduce(
      (sum, count) => sum + toNumber(count),
      0
    )
  }, 0)

export const buildLeaguesMasterSeasonEntry = ({
  leagueId,
  target,
  season,
} = {}) => {
  const tableRank = Array.isArray(season?.tableRank) ? season.tableRank : []
  const leagueDocumentRef = `dbLeagues/${leagueId}`

  return {
    seasonId: clean(season?.seasonId),
    seasonKey: clean(season?.seasonKey),
    leagueDocumentId: leagueId,
    leagueName: '',
    leagueUrl: clean(season?.seasonUrl),
    ageGroupId: '',
    ageGroupLabel: '',
    birthYear: toNumber(season?.birthYear),
    teamsCount: toNumber(season?.teamsCount) || tableRank.length,
    playersCount: toNumber(season?.playersCount),
    playersWithScoutProfileCount:
      toNumber(season?.playersWithScoutProfileCount) || countProfiledPlayers(tableRank),
    scoutProfilesCount:
      toNumber(season?.scoutProfilesCount) || countScoutProfiles(tableRank),
    tableRankCount: toNumber(season?.tableRankCount) || tableRank.length,
    currentDocRef: target === 'current' ? leagueDocumentRef : '',
    historyDocRef: target === 'history' ? leagueDocumentRef : '',
    updatedAt: season?.updatedAt || null,
  }
}

export const buildLeaguesMasterLeagueEntry = (league, existing = {}) => {
  const leagueId = clean(league?.leagueId || league?.id)
  const seasons = getLeagueSeasonRows(league).map(row => ({
    ...buildLeaguesMasterSeasonEntry({ leagueId, ...row }),
    leagueName: clean(league?.leagueName || league?.name),
    ageGroupId: clean(league?.ageGroupId),
    ageGroupLabel: clean(league?.ageGroupLabel),
  }))

  return {
    ...existing,
    leagueId,
    leagueDocumentId: leagueId,
    leagueName: clean(league?.leagueName || league?.name || existing?.leagueName),
    leagueUrl: clean(league?.leagueUrl || existing?.leagueUrl),
    region: clean(league?.region || existing?.region),
    ageGroupId: clean(league?.ageGroupId || existing?.ageGroupId),
    ageGroupLabel: clean(league?.ageGroupLabel || existing?.ageGroupLabel),
    active: league?.active !== false,
    seasons,
    updatedAt: league?.updatedAt || null,
  }
}

export const buildLeaguesMasterSummary = leagues => {
  const seasonRows = leagues.flatMap(league => (
    Array.isArray(league?.seasons) ? league.seasons : []
  ))

  return {
    leaguesCount: leagues.length,
    seasonsCount: seasonRows.length,
    teamsCount: seasonRows.reduce(
      (sum, season) => sum + toNumber(season?.teamsCount),
      0
    ),
    playersCount: seasonRows.reduce(
      (sum, season) => sum + toNumber(season?.playersCount),
      0
    ),
    playersWithScoutProfileCount: seasonRows.reduce(
      (sum, season) => sum + toNumber(season?.playersWithScoutProfileCount),
      0
    ),
    scoutProfilesCount: seasonRows.reduce(
      (sum, season) => sum + toNumber(season?.scoutProfilesCount),
      0
    ),
  }
}

export const buildLeaguesMasterLeagueMap = leagues => {
  const map = new Map()

  ;(Array.isArray(leagues) ? leagues : []).forEach(league => {
    const leagueId = clean(league?.leagueId || league?.leagueDocumentId)
    if (leagueId) map.set(leagueId, league)
  })

  return map
}

export const normalizeLeaguesMasterIds = values =>
  new Set(
    (Array.isArray(values) ? values : [])
      .map(clean)
      .filter(Boolean)
  )

export const sortLeaguesMasterEntries = leagues =>
  (Array.isArray(leagues) ? leagues : [])
    .filter(league => clean(league?.leagueId || league?.leagueDocumentId))
    .sort((left, right) => (
      clean(left?.leagueName).localeCompare(clean(right?.leagueName), 'he')
    ))
