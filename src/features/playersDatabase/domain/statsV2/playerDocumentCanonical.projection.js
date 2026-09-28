import {
  resolveLeagueSeasonStatus,
} from '../projections/teamPerformance.projection.js'
import {
  buildStatsPlayerDocumentSeasonRow,
} from './playerDocumentStats.projection.js'
import {
  buildStatsScoutedPlayer,
} from './teamSeasonStats.builder.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const resolveLeagueSeason = ({
  league = {},
  club = {},
  seasonKey = '',
  seasonStatus = '',
} = {}) => {
  if (seasonStatus === 'completed') {
    return (Array.isArray(league.history) ? league.history : [])
      .find(row => clean(row?.seasonKey) === clean(seasonKey)) || {}
  }

  return clean(league.current?.seasonKey) === clean(seasonKey)
    ? league.current
    : {}
}

export const buildStatsCanonicalPlayerDocumentProjection = ({
  player = {},
  teamRoot = {},
  teamSeason = {},
  league = {},
  club = {},
  seasonKey = '',
  leagueId = '',
  birthTeamDocumentId = '',
} = {}) => {
  const resolvedSeasonKey = clean(seasonKey || teamSeason.seasonKey)
  const resolvedLeagueId = clean(
    leagueId || teamSeason.leagueId || teamRoot.leagueId
  )
  const resolvedTeamDocumentId = clean(
    birthTeamDocumentId || teamRoot.id || teamRoot.birthTeamDocumentId
  )
  const seasonStatus = resolveLeagueSeasonStatus({
    league,
    season: {
      ...teamSeason,
      seasonKey: resolvedSeasonKey,
    },
  })
  const leagueSeason = resolveLeagueSeason({
    league,
    seasonKey: resolvedSeasonKey,
    seasonStatus,
  })
  const season = {
    ...leagueSeason,
    seasonId: clean(
      teamSeason.seasonId || leagueSeason.seasonId || resolvedSeasonKey
    ),
    seasonKey: resolvedSeasonKey,
    seasonStatus,
    leagueId: resolvedLeagueId,
    leagueName: clean(league.leagueName || league.name),
    leagueLevel: leagueSeason.leagueLevel ?? league.level ?? teamSeason.leagueLevel ?? null,
    ageGroupId: clean(
      leagueSeason.ageGroupId ||
      league.ageGroupId ||
      teamSeason.ageGroupId ||
      teamRoot.ageGroupId
    ),
    ageGroupLabel: clean(
      leagueSeason.ageGroupLabel ||
      league.ageGroupLabel ||
      teamSeason.ageGroupLabel ||
      teamRoot.ageGroupLabel
    ),
  }
  const canonicalClub = club || {}
  const team = {
    ...teamRoot,
    birthTeamDocumentId: resolvedTeamDocumentId,
    teamDocumentId: resolvedTeamDocumentId,
    leagueId: resolvedLeagueId,
    teamId: clean(teamRoot.teamId || resolvedTeamDocumentId),
    teamName: clean(
      teamRoot.teamName ||
      teamRoot.displayName ||
      teamRoot.name ||
      teamSeason.teamName
    ),
    clubId: clean(teamRoot.clubId || canonicalClub.clubId || canonicalClub.id),
    clubName: clean(canonicalClub.name || teamRoot.clubName),
    clubLevel: canonicalClub.clubLevel ?? teamRoot.clubLevel ?? null,
    clubStrengthLevel: canonicalClub.clubStrengthLevel ?? teamRoot.clubStrengthLevel ?? null,
    ageGroupId: clean(
      leagueSeason.ageGroupId ||
      league.ageGroupId ||
      teamSeason.ageGroupId ||
      teamRoot.ageGroupId
    ),
    ageGroupLabel: clean(
      leagueSeason.ageGroupLabel ||
      league.ageGroupLabel ||
      teamSeason.ageGroupLabel ||
      teamRoot.ageGroupLabel
    ),
    leagueName: clean(league.leagueName || league.name),
    leagueLevel: leagueSeason.leagueLevel ?? league.level ?? teamSeason.leagueLevel ?? null,
  }
  const projectedPlayer = buildStatsScoutedPlayer({
    player,
    team,
    season,
  })

  return {
    player: projectedPlayer,
    season,
    team,
    target: seasonStatus === 'completed' ? 'history' : 'current',
    seasonRow: buildStatsPlayerDocumentSeasonRow({
      player: projectedPlayer,
      season,
      team,
    }),
  }
}
