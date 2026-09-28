import {
  buildClubAgeGroupSeasonProjection,
  buildClubsMasterAgeGroupSeasonProjection,
} from '../../../domain/projections/club/index.js'
import {
  buildLeagueTeamPerformanceProjection,
  resolveLeagueSeasonStatus,
  resolveLeagueTeamPoints,
} from '../../../domain/projections/teamPerformance.projection.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const buildTarget = ({
  team = {},
  teamSeason = {},
  league = {},
  seasonKey = '',
} = {}) => {
  const clubId = clean(team?.clubId)
  if (!clubId) return null

  const seasonStatus = resolveLeagueSeasonStatus({
    league,
    season: {
      ...teamSeason,
      seasonKey,
    },
  })
  const season = {
    ...teamSeason,
    seasonKey: clean(seasonKey),
    seasonId: clean(teamSeason?.seasonId || seasonKey),
    seasonStatus,
  }
  const target = seasonStatus === 'completed'
    ? 'history'
    : 'current'
  const performance = buildLeagueTeamPerformanceProjection({
    league,
    season,
    target,
    team,
  })
  const points = resolveLeagueTeamPoints({
    league,
    season,
    target,
    team,
  })
  const projection = buildClubAgeGroupSeasonProjection({
    season,
    league,
    team,
    teamSeason,
    performance,
    points,
    leagueScoutProfilesSummary: teamSeason?.scoutProfilesSummary || {},
  })

  if (!projection?.season) return null

  return {
    clubId,
    ageGroupId: clean(projection.ageGroupId),
    seasonKey: clean(
      projection.season.seasonKey ||
      projection.season.seasonId
    ),
    teamId: clean(projection.season.teamId),
    season: projection.season,
    masterSeason: buildClubsMasterAgeGroupSeasonProjection(projection.season),
  }
}

const hasCanonicalMovement = ({
  row = {},
  expectedCounterparts = [],
} = {}) => (
  (Array.isArray(expectedCounterparts)
    ? expectedCounterparts
    : []).some(expected => {
    if (
      clean(expected?.target?.birthTeamDocumentId) !==
      clean(row?.birthTeamDocumentId)
    ) return false
    if (
      clean(expected?.target?.seasonKey) !==
      clean(row?.seasonKey)
    ) return false

    const side = clean(expected?.target?.side)
    return (Array.isArray(row?.teamSeason?.[side])
      ? row.teamSeason[side]
      : []).some(fact => (
      clean(fact?.movementId) ===
      clean(expected?.movementId)
    ))
  })
)

export function buildExpectedStatsClubsV2({
  canonical = {},
  counterpartCanonical = [],
  expectedCounterparts = [],
} = {}) {
  const rows = []
  const local = buildTarget({
    team: canonical.teamRoot,
    teamSeason: canonical.teamSeason,
    league: canonical.league,
    seasonKey: canonical.seasonKey,
  })

  if (local) rows.push(local)

  ;(Array.isArray(counterpartCanonical)
    ? counterpartCanonical
    : []).forEach(row => {
    if (
      !row?.teamRoot ||
      !row?.teamSeason ||
      !row?.league
    ) return
    if (!hasCanonicalMovement({
      row,
      expectedCounterparts,
    })) return

    const target = buildTarget({
      team: row.teamRoot,
      teamSeason: row.teamSeason,
      league: row.league,
      seasonKey: row.seasonKey,
    })

    if (target) rows.push(target)
  })

  const byKey = new Map()
  rows.forEach(row => {
    const key = [
      row.clubId,
      row.ageGroupId,
      row.seasonKey,
      row.teamId,
    ].join('::')
    byKey.set(key, row)
  })

  return [...byKey.values()]
}
