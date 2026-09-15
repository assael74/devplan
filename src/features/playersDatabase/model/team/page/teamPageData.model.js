import { createEmptyTeamSeason } from '../../../domain/index.js'
import { cleanValue } from '../../shared/value.model.js'
import { normalizeTeamIdentity } from '../teamIdentity.model.js'

const seasonKeyOf = season => cleanValue(
  season?.seasonKey || season?.seasonId || season?.season?.seasonKey || season?.season?.seasonId
)

const hasTeamSeasonDocument = season => (
  season?.source === 'teamSeason' || season?.source === 'teamSeason+league'
)

const hasLeagueDocument = season => (
  season?.source === 'league' || season?.source === 'teamSeason+league'
)

const buildSeasonData = season => {
  const empty = createEmptyTeamSeason()
  const teamSeasonExists = hasTeamSeasonDocument(season)
  const leagueExists = hasLeagueDocument(season)
  const seasonKey = seasonKeyOf(season)

  const availability = {
    teamSeasonDocument: teamSeasonExists ? 'available' : 'missing',
    leagueDocument: leagueExists ? 'available' : 'missing',
    roster: teamSeasonExists && Array.isArray(season?.teamPlayers) ? 'available' : 'missing',
    balance: teamSeasonExists && season?.teamBalance ? 'available' : 'missing',
    scoutProfiles: teamSeasonExists && season?.scoutProfilesSummary ? 'available' : 'missing',
    performance: leagueExists ? 'available' : 'missing',
  }

  return {
    ...empty,
    ...season,
    identity: {
      ...empty.identity,
      ...(season?.identity || {}),
    },
    season: {
      ...empty.season,
      ...(season?.season || {}),
      seasonId: cleanValue(season?.seasonId || season?.season?.seasonId || seasonKey),
      seasonKey,
    },
    league: {
      ...empty.league,
      ...(season?.league || {}),
      leagueId: cleanValue(season?.leagueId || season?.league?.leagueId),
      ageGroupId: cleanValue(season?.ageGroupId || season?.league?.ageGroupId),
      ageGroupLabel: cleanValue(season?.ageGroupLabel || season?.league?.ageGroupLabel),
    },
    availability,
  }
}

// The Team Page consumes this object only. It keeps a stable root identity and
// one complete, explicit record per discovered season.
export const buildTeamPageData = ({
  teamId = '',
  teamDocument = null,
  seasonSnapshots = [],
} = {}) => {
  const identity = normalizeTeamIdentity({
    team: teamDocument || {},
    fallback: { teamId },
  })
  const seasons = (Array.isArray(seasonSnapshots) ? seasonSnapshots : [])
    .filter(Boolean)
    .map(snapshot => {
      const resolved = buildSeasonData(snapshot)
      const seasonKey = resolved.season.seasonKey
      const leagueDocumentExists = hasLeagueDocument(snapshot)
      const teamSeasonDocumentExists = hasTeamSeasonDocument(snapshot)

      return {
        seasonKey,
        sources: {
          league: {
            documentExists: leagueDocumentExists,
            documentId: cleanValue(snapshot?.sourceDocumentId),
            seasonKey,
            tableRowExists: leagueDocumentExists,
          },
          teamSeason: {
            documentExists: teamSeasonDocumentExists,
            documentId: cleanValue(snapshot?.id),
          },
        },
        resolved,
        availability: resolved.availability,
      }
    })
    .filter(season => Boolean(season.seasonKey))

  const seasonOrder = seasons.map(season => season.seasonKey)

  return {
    id: cleanValue(teamId),
    identity: {
      teamId: identity.birthTeamId || identity.teamId || cleanValue(teamId),
      clubId: identity.clubId,
      birthYear: Number(teamDocument?.birthYear || 0) || null,
      displayName: cleanValue(teamDocument?.displayName || teamDocument?.teamName),
      teamSlot: identity.birthTeamSlot || identity.teamSlot || 1,
    },
    root: {
      documentExists: Boolean(teamDocument),
      availability: teamDocument ? 'available' : 'missing',
      identity,
      document: teamDocument || null,
    },
    seasonOrder,
    seasons,
    seasonsByKey: Object.fromEntries(seasons.map(season => [season.seasonKey, season])),
  }
}
