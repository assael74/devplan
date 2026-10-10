// src/features/playersDatabase/domain/clubIntelligence/clubIntelligence.canonical.js

import {
  CLUB_INTELLIGENCE_EMPTY_AVAILABILITY,
  CLUB_INTELLIGENCE_SEASON_VIEW,
} from './clubIntelligence.contract.js'
import { buildClubSignalCoverage } from './clubSignalCoverage.builder.js'
import { buildClubSpotlights } from './clubSpotlights.builder.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => (value && typeof value === 'object' ? value : {})

const positiveNumberOrNull = value => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

const buildClubIdentity = ({ clubId, profile, directoryEntry, centerEntry }) => ({
  clubId: clean(clubId),
  externalClubId: clean(profile && profile.externalClubId),
  name: clean(
    profile && profile.names && (profile.names.display || profile.names.official) ||
    directoryEntry && directoryEntry.names && (
      directoryEntry.names.display || directoryEntry.names.official
    ) ||
    centerEntry && centerEntry.displayName
  ),
  shortName: clean(
    profile && profile.names && profile.names.short ||
    directoryEntry && directoryEntry.names && directoryEntry.names.short ||
    centerEntry && centerEntry.shortName
  ),
  clubUrl: clean(
    profile && profile.clubUrl !== undefined
      ? profile.clubUrl
      : directoryEntry && directoryEntry.clubUrl
  ),
  clubLevel: positiveNumberOrNull(
    profile && profile.clubLevel !== undefined
      ? profile.clubLevel
      : directoryEntry && directoryEntry.clubLevel !== undefined
        ? directoryEntry.clubLevel
        : centerEntry && centerEntry.clubLevel
  ),
  clubStrengthLevel: positiveNumberOrNull(
    profile && profile.clubStrengthLevel !== undefined
      ? profile.clubStrengthLevel
      : directoryEntry && directoryEntry.clubStrengthLevel !== undefined
        ? directoryEntry.clubStrengthLevel
        : centerEntry && centerEntry.clubStrengthLevel
  ),
})

const buildTeam = ({
  teamId,
  team,
  league,
  season,
} = {}) => ({
  ...object(team),
  teamId: clean(teamId),
  teamSeasonDocumentId: clean(team && team.teamSeasonDocumentId),
  birthYear: positiveNumberOrNull(team && team.birthYear),
  ageGroupId: clean(team && team.ageGroupId),
  ageGroupLabel: clean(league && league.ageGroupLabel),
  teamSlot: positiveNumberOrNull(team && team.teamSlot),
  seasonId: clean(season && season.seasonId),
  seasonKey: clean(season && season.seasonKey),
  seasonStatus: clean(league && league.seasonStatus),
  league: {
    leagueId: clean(team && team.leagueId),
    leagueName: clean(league && league.displayName),
    leagueLevel: positiveNumberOrNull(league && league.leagueLevel),
  },
  performance: object(team && team.performance),
  teamTaskAvailability: {
    availability: team && team.documentExists === false ? 'unavailable' : 'available',
    reason: team && team.documentExists === false ? 'TEAM_SEASON_MISSING' : null,
  },
})

const buildBirthYearTeam = ({ birthYear, teamsByView }) => ({
  birthYear,
  seasons: {
    [CLUB_INTELLIGENCE_SEASON_VIEW.CURRENT]: {
      teams: teamsByView.current || [],
    },
    [CLUB_INTELLIGENCE_SEASON_VIEW.PREVIOUS]: {
      teams: teamsByView.previous || [],
    },
  },
  league: {
    current: (teamsByView.current || []).map(team => team.league),
    previous: (teamsByView.previous || []).map(team => team.league),
  },
  performance: {
    current: (teamsByView.current || []).map(team => team.performance),
    previous: (teamsByView.previous || []).map(team => team.performance),
  },
  squad: {
    current: (teamsByView.current || []).map(team => ({
      teamTaskSignals: team.teamTaskSignals || {},
      teamTaskAvailability: team.teamTaskAvailability,
    })),
    previous: (teamsByView.previous || []).map(team => ({
      teamTaskSignals: team.teamTaskSignals || {},
      teamTaskAvailability: team.teamTaskAvailability,
    })),
  },
  profiles: { current: [], previous: [] },
  transfers: {
    current: (teamsByView.current || []).map(team => team.transfers || null),
    previous: (teamsByView.previous || []).map(team => team.transfers || null),
  },
  competition: {
    sourceBirthYear: null,
    sourceTeamId: null,
    sourceTeamSlot: null,
    currentLeagueLevel: null,
    projectedNextLeagueLevel: null,
    status: 'UNKNOWN',
    source: 'AUTOMATIC',
    reason: 'SOURCE_COMPETITION_PATH_NOT_PERSISTED',
    availability: { ...CLUB_INTELLIGENCE_EMPTY_AVAILABILITY },
  },
})

const buildCanonicalTeams = ({ clubId, centers }) => (
  (Array.isArray(centers) ? centers : []).flatMap(({ season, document }) => {
    const club = object(object(document && document.clubsById)[clubId])
    const leaguesById = object(document && document.leaguesById)
    const seasonContext = {
      seasonId: clean(document && document.seasonId || season && season.seasonId),
      seasonKey: clean(document && document.seasonKey || season && season.seasonKey),
      target: season && season.target === 'current' ? 'current' : 'previous',
    }

    return Object.entries(object(club.teamsById)).map(([teamId, team]) => ({
      seasonView: seasonContext.target,
      team: buildTeam({
        teamId,
        team,
        league: leaguesById[clean(team && team.leagueId)] || {},
        season: seasonContext,
      }),
    }))
  })
)

export const buildClubIntelligenceFromCanonicalSources = ({
  clubId = '',
  profile = null,
  directoryEntry = null,
  centers = [],
} = {}) => {
  const normalizedClubId = clean(clubId)
  const canonicalTeams = buildCanonicalTeams({
    clubId: normalizedClubId,
    centers,
  })
  const centerEntry = (Array.isArray(centers) ? centers : [])
    .map(item => object(object(item && item.document && item.document.clubsById)[normalizedClubId]))
    .find(item => Object.keys(item).length) || null
  const club = buildClubIdentity({
    clubId: normalizedClubId,
    profile,
    directoryEntry,
    centerEntry,
  })
  const teamsByBirthYear = canonicalTeams.reduce((map, item) => {
    const birthYear = positiveNumberOrNull(item.team.birthYear)
    if (!birthYear) return map
    if (!map.has(birthYear)) map.set(birthYear, { current: [], previous: [] })
    map.get(birthYear)[item.seasonView].push(item.team)
    return map
  }, new Map())
  const birthYearTeams = [...teamsByBirthYear.entries()]
    .map(([birthYear, teamsByView]) => buildBirthYearTeam({ birthYear, teamsByView }))
    .sort((left, right) => right.birthYear - left.birthYear)
  const intelligence = {
    club,
    seasons: {
      current: { ageGroups: [] },
      previous: { ageGroups: [] },
    },
    birthYearTeams,
    signalCoverage: {},
    spotlights: [],
  }

  return {
    ...intelligence,
    signalCoverage: buildClubSignalCoverage({ club, birthYearTeams }),
    spotlights: buildClubSpotlights({ club, birthYearTeams }),
  }
}

export const buildAllClubIntelligencesFromCanonicalSources = ({
  directory = {},
  centers = [],
} = {}) => {
  const clubIds = new Set(Object.keys(object(directory && directory.clubsById)))

  ;(Array.isArray(centers) ? centers : []).forEach(item => {
    Object.keys(object(item && item.document && item.document.clubsById))
      .forEach(clubId => clubIds.add(clubId))
  })

  return new Map([...clubIds].map(clubId => [
    clubId,
    buildClubIntelligenceFromCanonicalSources({
      clubId,
      directoryEntry: object(directory && directory.clubsById)[clubId] || null,
      centers,
    }),
  ]))
}
