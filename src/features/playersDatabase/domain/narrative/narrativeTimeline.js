// src/features/playersDatabase/domain/narrative/narrativeTimeline.js

import { resolveAgeGroupLabel } from '../../catalog/ageGroups.catalog.js'
import { resolveSeasonLookupKey } from '../../model/season.model.js'
import { buildAgeContext } from './narrativeAge.js'
import { buildNarrativeEvidence } from './narrativeEvidence.js'

const clean = value => String(value || '').trim()

const resolveSeasonKey = value => resolveSeasonLookupKey(
  value?.season || value
)

const isSameTeam = (season, teamSeason) => {
  const playerTeam = season?.team || {}
  const team = teamSeason?.identity || {}
  const documentId = clean(playerTeam.teamDocumentId)
  const teamDocumentId = clean(team.teamDocumentId)

  if (documentId && teamDocumentId) return documentId === teamDocumentId

  const teamId = clean(playerTeam.teamId)
  const candidateTeamId = clean(team.teamId)
  if (teamId && candidateTeamId) return teamId === candidateTeamId

  const clubId = clean(playerTeam.clubId)
  const candidateClubId = clean(team.clubId)
  return Boolean(clubId && candidateClubId && clubId === candidateClubId)
}

const findTeamSeason = ({ season, teams }) => {
  const seasonKey = resolveSeasonKey(season)

  return (Array.isArray(teams) ? teams : []).find(team => (
    resolveSeasonKey(team) === seasonKey &&
    isSameTeam(season, team)
  )) || null
}

const pickNumber = (primary, fallback) => {
  const first = Number(primary)
  if (Number.isFinite(first) && first > 0) return first

  const second = Number(fallback)
  return Number.isFinite(second) && second > 0 ? second : null
}

const enrichTeamContext = ({ season, teamSeason }) => {
  if (!teamSeason) return season

  const teamStats = teamSeason.stats?.actual || {}
  const ranking = teamSeason.ranking || {}
  const hasPerformance = season?.completeness?.hasPerformance === true

  return {
    ...season,
    team: {
      ...(season.team || {}),
      teamId: season?.team?.teamId || teamSeason.identity?.teamId || '',
      teamDocumentId: season?.team?.teamDocumentId || teamSeason.identity?.teamDocumentId || '',
      clubId: season?.team?.clubId || teamSeason.identity?.clubId || '',
      displayName: season?.team?.displayName || teamSeason.identity?.displayName || '',
      leagueId: season?.team?.leagueId || teamSeason.league?.leagueId || '',
      leagueLevel: pickNumber(
        season?.team?.leagueLevel,
        teamSeason.league?.leagueLevel
      ),
      ageGroupId: season?.team?.ageGroupId || teamSeason.league?.ageGroupId || '',
      ageGroupLabel: season?.team?.ageGroupLabel || teamSeason.league?.ageGroupLabel || '',
    },
    stats: {
      ...(season.stats || {}),
      context: {
        ...(season.stats?.context || {}),
        teamGames: pickNumber(
          teamStats.gamesPlayed,
          season?.stats?.context?.teamGames
        ),
        teamRank: pickNumber(
          ranking.tableRank,
          season?.stats?.context?.teamRank
        ),
        teamGoalsFor: pickNumber(
          teamStats.goalsFor,
          season?.stats?.context?.teamGoalsFor
        ),
        teamGoalsAgainst: pickNumber(
          teamStats.goalsAgainst,
          season?.stats?.context?.teamGoalsAgainst
        ),
      },
    },
    teamPerformance: hasPerformance
      ? season.teamPerformance
      : teamSeason.performance,
  }
}

const buildEntry = ({ season, playerBirthYear, teams }) => {
  const teamSeason = findTeamSeason({
    season,
    teams,
  })
  const source = enrichTeamContext({
    season,
    teamSeason,
  })
  const age = buildAgeContext({
    playerBirthYear,
    groupBirthYear: source?.season?.birthYear,
    season: source?.season,
  })

  return {
    seasonId: source?.season?.seasonId || '',
    seasonKey: source?.season?.seasonKey || '',
    seasonStatus: source?.season?.seasonStatus || '',
    sourceTarget: source?.metadata?.sourceTarget || '',
    team: {
      teamId: source?.team?.teamId || '',
      teamDocumentId: source?.team?.teamDocumentId || '',
      teamSlot: Number(source?.team?.birthTeamSlot || 0),
      teamName: source?.team?.displayName || '',
      clubId: source?.team?.clubId || '',
      clubName: source?.team?.clubName || '',
      clubLevel: source?.team?.clubLevel === undefined
        ? null
        : source.team.clubLevel,
      clubStrengthLevel: source?.team?.clubStrengthLevel === undefined
        ? null
        : source.team.clubStrengthLevel,
      leagueId: source?.team?.leagueId || '',
      leagueName: source?.team?.leagueName || '',
      leagueLevel: source?.team?.leagueLevel === undefined
        ? null
        : source.team.leagueLevel,
      ageGroupId: source?.team?.ageGroupId || '',
      ageGroupName: resolveAgeGroupLabel({
        ageGroupId: source?.team?.ageGroupId,
        ageGroupLabel: source?.team?.ageGroupLabel,
      }),
    },
    age,
    lifecycle: source?.lifecycle || null,
    position: source?.position || {},
    scout: {
      profileIds: Array.isArray(source?.scout?.profileIds)
        ? source.scout.profileIds
        : [],
      primaryProfile: source?.scout?.primaryProfile || null,
      secondaryProfile: source?.scout?.secondaryProfile || null,
      opportunity: source?.scout?.opportunity || null,
      verification: source?.scout?.verification || null,
      profileProgression: source?.scout?.profileProgression || null,
      trajectory: source?.scout?.trajectory || null,
      transferContext: source?.scout?.transferContext || null,
    },
    evidence: buildNarrativeEvidence(source),
  }
}

const groupEntries = entries => {
  const groups = new Map()

  entries.forEach(entry => {
    const key = resolveSeasonLookupKey({
      seasonId: entry.seasonId,
      seasonKey: entry.seasonKey,
    })
    if (!key) return

    const current = groups.get(key) || {
      seasonId: entry.seasonId,
      seasonKey: entry.seasonKey,
      entries: [],
    }

    current.entries.push(entry)
    groups.set(key, current)
  })

  return [...groups.values()].sort((left, right) => (
    resolveSeasonLookupKey(left).localeCompare(resolveSeasonLookupKey(right))
  ))
}

export const buildNarrativeTimeline = ({ seasons = [], teams = [], playerBirthYear = null } = {}) => {
  const entries = (Array.isArray(seasons) ? seasons : []).map(season => buildEntry({
    season,
    playerBirthYear,
    teams,
  }))

  return groupEntries(entries)
}
