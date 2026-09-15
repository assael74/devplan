import { buildLeagueTeamSeasons } from '../../../domain/index.js'
import { cleanValue } from '../../shared/value.model.js'
import { normalizeTeamIdentity } from '../teamIdentity.model.js'

const seasonKeyOf = season => cleanValue(
  season?.seasonKey || season?.seasonId || season?.id
)

const teamMatches = ({ candidate, teamId }) => {
  const identity = normalizeTeamIdentity({ team: candidate })
  const key = cleanValue(teamId)

  return [
    identity.teamId,
    identity.birthTeamId,
    identity.teamDocumentId,
    identity.birthTeamDocumentId,
    identity.teamSlotId,
  ].includes(key)
}

const getLeagueSeasonCandidates = ({ leagueDocuments = [], teamId = '' } = {}) => (
  (Array.isArray(leagueDocuments) ? leagueDocuments : []).flatMap(leagueDocument => {
    const sourceSeasons = [
      leagueDocument?.current && { season: leagueDocument.current, target: 'current' },
      ...(Array.isArray(leagueDocument?.history)
        ? leagueDocument.history.map(season => ({ season, target: 'history' }))
        : []),
    ].filter(Boolean)

    return sourceSeasons.flatMap(({ season, target }) => (
      buildLeagueTeamSeasons({
        leagueDocument,
        seasonDocument: season,
        target,
      })
        .filter(candidate => teamMatches({ candidate: candidate.identity, teamId }))
        .map(candidate => ({
          ...candidate,
          seasonKey: seasonKeyOf(candidate?.season),
          seasonId: cleanValue(candidate?.season?.seasonId),
          leagueId: cleanValue(candidate?.league?.leagueId),
          leagueName: cleanValue(
            leagueDocument?.leagueName || leagueDocument?.name || leagueDocument?.id
          ),
          ageGroupId: cleanValue(candidate?.league?.ageGroupId),
          ageGroupLabel: cleanValue(candidate?.league?.ageGroupLabel),
          tableRank: candidate?.ranking?.tableRank ?? null,
          games: candidate?.stats?.actual?.gamesPlayed ?? null,
          goalsForPerGame: candidate?.stats?.actual?.goalsForPerGame ?? null,
          goalsAgainstPerGame: candidate?.stats?.actual?.goalsAgainstPerGame ?? null,
          tableAttackRank: candidate?.ranking?.attackRank ?? null,
          tableDefenseRank: candidate?.ranking?.defenseRank ?? null,
          teamStats: {
            teamGamePlayed: candidate?.stats?.actual?.gamesPlayed ?? null,
            points: candidate?.stats?.actual?.points ?? null,
            goalsFor: candidate?.stats?.actual?.goalsFor ?? null,
            goalsAgainst: candidate?.stats?.actual?.goalsAgainst ?? null,
          },
          source: 'league',
          sourceDocumentId: cleanValue(candidate?.metadata?.sourceDocumentId),
        }))
    ))
  })
)

const selectLeagueCandidate = ({ candidates = [], teamSeason = null } = {}) => {
  const teamLeagueId = cleanValue(teamSeason?.leagueId)
  return [...candidates].sort((left, right) => (
    Number(cleanValue(right.leagueId) === teamLeagueId) -
    Number(cleanValue(left.leagueId) === teamLeagueId) ||
    cleanValue(left.leagueId).localeCompare(cleanValue(right.leagueId))
  ))[0] || null
}

// A page-level record exists once per season, regardless of whether its data was
// loaded from a TeamSeason document, a league table, or both.
export const buildTeamPageSeasonSnapshots = ({
  teamId = '',
  teamSeasons = [],
  leagueDocuments = [],
} = {}) => {
  const teamSeasonsByKey = new Map(
    (Array.isArray(teamSeasons) ? teamSeasons : [])
      .filter(Boolean)
      .map(season => [seasonKeyOf(season), season])
      .filter(([seasonKey]) => Boolean(seasonKey))
  )
  const leagueCandidatesByKey = new Map()

  getLeagueSeasonCandidates({ leagueDocuments, teamId }).forEach(candidate => {
    if (!candidate.seasonKey) return
    const current = leagueCandidatesByKey.get(candidate.seasonKey) || []
    leagueCandidatesByKey.set(candidate.seasonKey, [...current, candidate])
  })

  const seasonKeys = new Set([
    ...teamSeasonsByKey.keys(),
    ...leagueCandidatesByKey.keys(),
  ])

  return [...seasonKeys].map(seasonKey => {
    const teamSeason = teamSeasonsByKey.get(seasonKey) || null
    const leagueSeason = selectLeagueCandidate({
      candidates: leagueCandidatesByKey.get(seasonKey) || [],
      teamSeason,
    })

    if (!leagueSeason) {
      return {
        ...teamSeason,
        seasonKey,
        source: 'teamSeason',
        sourceDocumentId: cleanValue(teamSeason?.id),
      }
    }

    // League data is official for results and ranking; TeamSeason enriches it
    // with roster, balance and derived scouting data when that document exists.
    return {
      ...leagueSeason,
      ...teamSeason,
      seasonKey,
      seasonId: cleanValue(teamSeason?.seasonId || leagueSeason.seasonId),
      leagueId: cleanValue(teamSeason?.leagueId || leagueSeason.leagueId),
      leagueName: cleanValue(teamSeason?.leagueName || leagueSeason.leagueName),
      ageGroupId: cleanValue(teamSeason?.ageGroupId || leagueSeason.ageGroupId),
      ageGroupLabel: cleanValue(teamSeason?.ageGroupLabel || leagueSeason.ageGroupLabel),
      tableRank: leagueSeason.tableRank ?? teamSeason?.tableRank ?? null,
      games: leagueSeason.games ?? teamSeason?.games ?? null,
      goalsForPerGame: leagueSeason.goalsForPerGame ?? teamSeason?.goalsForPerGame ?? null,
      goalsAgainstPerGame: leagueSeason.goalsAgainstPerGame ?? teamSeason?.goalsAgainstPerGame ?? null,
      tableAttackRank: leagueSeason.tableAttackRank ?? teamSeason?.tableAttackRank ?? null,
      tableDefenseRank: leagueSeason.tableDefenseRank ?? teamSeason?.tableDefenseRank ?? null,
      teamStats: {
        ...(teamSeason?.teamStats || {}),
        ...(leagueSeason.teamStats || {}),
      },
      performance: leagueSeason.performance || teamSeason?.performance || null,
      source: teamSeason ? 'teamSeason+league' : 'league',
      sourceDocumentId: leagueSeason.sourceDocumentId,
    }
  }).sort((left, right) => cleanValue(right.seasonKey).localeCompare(cleanValue(left.seasonKey)))
}
