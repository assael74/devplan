import {
  buildLeaguesMasterLeagueEntry,
} from '../../../domain/projections/leaguesMaster.projection.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const resolveSeason = ({
  leagueEntry = {},
  seasonKey = '',
} = {}) => (
  (Array.isArray(leagueEntry?.seasons)
    ? leagueEntry.seasons
    : []).find(row => (
    clean(row?.seasonKey || row?.seasonId) ===
    clean(seasonKey)
  )) || null
)

export function buildExpectedStatsLeaguesMasterV2({
  canonical = {},
} = {}) {
  const leagueEntry = buildLeaguesMasterLeagueEntry(
    canonical.league || {}
  )
  const season = resolveSeason({
    leagueEntry,
    seasonKey: canonical.seasonKey,
  })

  if (!season) {
    throw new Error(
      'Stats Leagues Master season could not be derived from canonical League'
    )
  }

  return {
    leagueId: clean(canonical.leagueId),
    seasonKey: clean(canonical.seasonKey),
    fields: {
      playersCount: Number(season.playersCount || 0),
      playersWithScoutProfileCount: Number(
        season.playersWithScoutProfileCount || 0
      ),
      scoutProfilesCount: Number(
        season.scoutProfilesCount || 0
      ),
    },
  }
}
