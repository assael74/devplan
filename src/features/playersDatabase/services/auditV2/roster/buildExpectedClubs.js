import { buildRosterClubIdentity, resolveRosterClubTransferCoverageStatus } from '../../../domain/rosterV2/clubRosterProjection.helpers.js'
import { buildClubAgeGroupSeasonProjection, buildClubsMasterAgeGroupEntry } from '../../../domain/projections/club/index.js'
import { buildLeagueTeamPerformanceProjection, resolveLeagueTeamPoints } from '../../../domain/projections/teamPerformance.projection.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const rosterOwnedSeasonFields = season => ({
  teamId: clean(season?.teamId),
  teamSlot: Number(season?.teamSlot) || null,
  seasonKey: clean(season?.seasonKey || season?.seasonId),
  playersCount: Number(season?.playersCount) || 0,
  transfers: season?.transfers || null,
})

const buildTarget = ({ team = {}, teamSeason = {}, league = {}, seasonKey = '' } = {}) => {
  const clubIdentity = buildRosterClubIdentity(team)
  if (!clubIdentity?.clubId) return null

  const season = {
    ...teamSeason,
    seasonKey: clean(seasonKey || teamSeason?.seasonKey),
    seasonId: clean(teamSeason?.seasonId || seasonKey),
  }
  const performance = buildLeagueTeamPerformanceProjection({
    league,
    season,
    target: 'current',
    team,
  })
  const points = resolveLeagueTeamPoints({
    league,
    season,
    target: 'current',
    team,
  })
  const projection = buildClubAgeGroupSeasonProjection({
    season,
    league,
    team,
    teamSeason,
    performance,
    points,
    transferCoverageStatus: resolveRosterClubTransferCoverageStatus(teamSeason),
  })

  const masterAgeGroup = buildClubsMasterAgeGroupEntry({
    ageGroupId: projection?.ageGroupId,
    ageGroupLabel: projection?.ageGroupLabel,
    seasons: projection?.season ? [projection.season] : [],
  })
  const masterRows = [
    ...(Array.isArray(masterAgeGroup?.current) ? masterAgeGroup.current : []),
    ...(Array.isArray(masterAgeGroup?.previous) ? masterAgeGroup.previous : []),
  ]
  const clubsMasterExpected = masterRows.some(row => (
    clean(row?.seasonKey || row?.seasonId) === clean(projection?.season?.seasonKey) &&
    clean(row?.teamId) === clean(projection?.season?.teamId)
  ))

  return {
    clubId: clean(clubIdentity.clubId),
    ageGroupId: clean(projection?.ageGroupId),
    seasonKey: clean(projection?.season?.seasonKey),
    teamId: clean(projection?.season?.teamId),
    clubsMasterExpected,
    fields: rosterOwnedSeasonFields(projection?.season),
  }
}

const hasExpectedMovement = ({ row = {}, expectedCounterparts = [] } = {}) => (
  (Array.isArray(expectedCounterparts) ? expectedCounterparts : []).some(expected => {
    if (clean(expected?.target?.birthTeamDocumentId) !== clean(row?.birthTeamDocumentId)) return false
    if (clean(expected?.target?.seasonKey) !== clean(row?.seasonKey)) return false
    const side = clean(expected?.target?.side)
    return (Array.isArray(row?.teamSeason?.[side]) ? row.teamSeason[side] : [])
      .some(fact => clean(fact?.movementId) === clean(expected?.movementId))
  })
)

export function buildExpectedRosterClubsV2({
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

  ;(Array.isArray(counterpartCanonical) ? counterpartCanonical : []).forEach(row => {
    if (!row?.teamRoot || !row?.teamSeason || !row?.league) return
    if (!hasExpectedMovement({ row, expectedCounterparts })) return
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
    const key = [row.clubId, row.ageGroupId, row.seasonKey, row.teamId].join('::')
    byKey.set(key, row)
  })
  return [...byKey.values()]
}
