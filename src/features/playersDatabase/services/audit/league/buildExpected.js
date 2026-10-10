// src/features/playersDatabase/services/audit/league/buildExpected.js

import { buildTeamSeasonDocumentId } from '../../../domain/identity/teamIdentity.js'
import { requireSeasonId } from '../../../domain/identity/seasonIdentity.js'
import { requireLeagueId } from '../../../domain/league/leagueIdentity.js'
import {
  buildCenterTeamStateProjection,
  buildClubsCenterTeamProjection,
} from '../../../domain/league/clubsCenterTeam.builder.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const toNullableNumber = value => {
  if (value === null || value === undefined || value === '') return null
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

const normalizeOfficialTable = value => ({
  rank: toNullableNumber(value && value.rank),
  points: toNullableNumber(value && value.points),
  goalsFor: toNullableNumber(value && value.goalsFor),
  goalsAgainst: toNullableNumber(value && value.goalsAgainst),
  teamGamePlayed: toNullableNumber(value && value.teamGamePlayed),
})

const resolveLeagueName = names => clean(
  names && (names.display || names.official || names.short || names.source)
)

const hasCompetitionRules = rules => Boolean(rules && rules.configured)

const getSeasonTeams = season => (
  season && season.table && season.table.teamsById && typeof season.table.teamsById === 'object'
    ? season.table.teamsById
    : {}
)

const getObject = value => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
)

const buildTeamSeasonMap = ({ teamSeasons = [], leagueId, seasonId }) => {
  const result = new Map()

  teamSeasons.forEach(teamSeason => {
    const identity = getObject(teamSeason && teamSeason.identity)
    const teamId = clean(identity.teamId)
    if (!teamId) return
    if (clean(identity.leagueId) !== leagueId) return
    if (clean(identity.seasonId) !== seasonId) return

    const expectedDocumentId = buildTeamSeasonDocumentId({ teamId, seasonId })
    const documentId = clean(teamSeason && teamSeason.id) || clean(identity.teamSeasonDocumentId)
    if (documentId && documentId !== expectedDocumentId) return

    result.set(teamId, teamSeason)
  })

  return result
}

export const buildEmptyCompetitionSnapshot = (updatedAt = null) => ({
  teamUrl: '',
  clubLevel: null,
  clubStrengthLevel: null,
  officialTable: normalizeOfficialTable(null),
  updatedAt: updatedAt || null,
})

export const collectLeagueSeasonClubIds = ({ league = {}, seasonId = '' } = {}) => {
  const safeSeasonId = requireSeasonId(seasonId)
  const season = league && league.seasonsById && league.seasonsById[safeSeasonId]
    ? league.seasonsById[safeSeasonId]
    : null

  return Array.from(new Set(
    Object.values(getSeasonTeams(season))
      .map(row => clean(row && row.clubId))
      .filter(Boolean)
  ))
}

const buildLeaguesCenterSeason = ({
  season = {},
  teamsById = {},
  teamSeasonsByTeamId = new Map(),
} = {}) => {
  const projectedTeams = {}

  Object.entries(teamsById).forEach(([teamId, row]) => {
    const teamSeason = teamSeasonsByTeamId.get(teamId) || null
    const centerState = buildCenterTeamStateProjection({
      teamSeason,
      seasonStatus: season.seasonStatus,
      previousTeamProjection: null,
    })

    projectedTeams[teamId] = {
      clubId: clean(row && row.clubId),
      teamSlot: toNullableNumber(row && row.teamSlot),
      documentationState: centerState.documentationState,
      documentationStateUpdatedAt: centerState.documentationStateUpdatedAt,
      teamTaskSignals: centerState.teamTaskSignals,
    }
  })

  return {
    seasonKey: clean(season.seasonKey),
    seasonStatus: clean(season.seasonStatus),
    birthYear: toNullableNumber(season.birthYear),
    seasonUrl: clean(season.seasonUrl),
    hasCompetitionRules: hasCompetitionRules(season.competitionRules),
    tableState: clean(season.table && season.table.tableState),
    tableImportedAt: season.tableImportedAt || null,
    teamsById: projectedTeams,
    updatedAt: season.updatedAt || null,
  }
}

const buildClubProfileProjection = profile => ({
  displayName: clean(profile && profile.names && profile.names.display),
  shortName: clean(profile && profile.names && profile.names.short),
  clubLevel: toNullableNumber(profile && profile.clubLevel),
  clubStrengthLevel: toNullableNumber(profile && profile.clubStrengthLevel),
})

const buildClubsCenterExpected = ({
  league = {},
  season = {},
  seasonId = '',
  clubProfilesById = {},
  teamSeasonsByTeamId = new Map(),
} = {}) => {
  const teamsById = getSeasonTeams(season)
  const clubsById = {}

  Object.entries(teamsById).forEach(([teamId, row]) => {
    const clubId = clean(row && row.clubId)
    if (!clubId) throw new Error(`Missing clubId for League team ${teamId}`)

    if (!clubsById[clubId]) {
      const profile = clubProfilesById[clubId] || null
      clubsById[clubId] = {
        clubProfileAvailable: Boolean(profile),
        ...(profile ? buildClubProfileProjection(profile) : {}),
        teamsById: {},
      }
    }

    const teamSeason = teamSeasonsByTeamId.get(teamId) || null

    clubsById[clubId].teamsById[teamId] = buildClubsCenterTeamProjection({
      league,
      season,
      seasonId,
      teamId,
      teamRow: row,
      teamSeason,
      previousTeamProjection: null,
      updatedAt: season.updatedAt || null,
    })
  })

  return {
    seasonId,
    seasonKey: clean(season.seasonKey),
    league: {
      displayName: resolveLeagueName(league.names),
      ageGroupLabel: clean(league.ageGroupLabel),
      leagueLevel: toNullableNumber(league.level),
      seasonStatus: clean(season.seasonStatus),
      tableImportedAt: season.tableImportedAt || null,
    },
    clubsById,
  }
}

const buildLoadedCompetitionSnapshots = ({
  season = {},
  seasonId = '',
  clubProfilesById = {},
  teamSeasonsByTeamId = new Map(),
} = {}) => Object.entries(getSeasonTeams(season))
  .filter(([teamId]) => teamSeasonsByTeamId.has(teamId))
  .map(([teamId, row]) => {
    const clubId = clean(row && row.clubId)
    const profile = clubProfilesById[clubId] || null

    return {
      teamId,
      clubId,
      teamSeasonDocumentId: buildTeamSeasonDocumentId({ teamId, seasonId }),
      clubProfileAvailable: Boolean(profile),
      expectedFields: {
        teamUrl: clean(row && row.teamUrl),
        ...(profile ? {
          clubLevel: toNullableNumber(profile.clubLevel),
          clubStrengthLevel: toNullableNumber(profile.clubStrengthLevel),
        } : {}),
        officialTable: normalizeOfficialTable(row && row.officialTable),
        updatedAt: season.updatedAt || null,
      },
    }
  })

const buildMissingCanonicalDependencies = ({ teamsById = {}, clubProfilesById = {} } = {}) => {
  const missingClubIds = Array.from(new Set(
    Object.values(teamsById)
      .map(row => clean(row && row.clubId))
      .filter(clubId => clubId && !clubProfilesById[clubId])
  ))

  return missingClubIds.map(clubId => ({
    type: 'missing_canonical_dependency',
    target: 'clubProfile',
    documentId: clubId,
    field: '',
    reason: 'ClubProfile required by a canonical League team is missing.',
    expected: { exists: true },
    actual: null,
  }))
}

export const buildMissingLeagueExpected = ({ leagueId = '', seasonId = '' } = {}) => ({
  leagueId: requireLeagueId(leagueId),
  seasonId: requireSeasonId(seasonId),
  leagueExists: false,
  seasonExists: false,
  missingCanonicalDependencies: [],
  auditedFields: {
    clubsCenterCompetitionProjection: true,
    clubsCenterTransfers: true,
  },
  leaguesCenter: { identity: null, season: null },
  clubsCenter: { league: null, clubsById: {} },
  projectionUpdatedAt: null,
  teamSeasonCompetitionSnapshots: [],
})

export const buildExpectedLeagueAudit = ({
  league = {},
  seasonId = '',
  clubProfilesById = {},
  teamSeasons = [],
} = {}) => {
  const safeLeagueId = requireLeagueId(league.leagueId)
  const safeSeasonId = requireSeasonId(seasonId)
  const seasonsById = league.seasonsById && typeof league.seasonsById === 'object'
    ? league.seasonsById
    : {}
  const season = seasonsById[safeSeasonId] || null

  const leaguesCenterIdentity = {
    leagueName: resolveLeagueName(league.names),
    region: clean(league.region),
    ageGroupId: clean(league.ageGroupId),
    ageGroupLabel: clean(league.ageGroupLabel),
    level: toNullableNumber(league.level),
  }

  if (!season) {
    return {
      leagueId: safeLeagueId,
      seasonId: safeSeasonId,
      leagueExists: true,
      seasonExists: false,
      missingCanonicalDependencies: [],
      auditedFields: {
        clubsCenterCompetitionProjection: true,
        clubsCenterTransfers: true,
      },
      projectionUpdatedAt: league && league.timestamps ? league.timestamps.updatedAt || null : null,
      leaguesCenter: {
        identity: leaguesCenterIdentity,
        season: null,
      },
      clubsCenter: { league: null, clubsById: {} },
      teamSeasonCompetitionSnapshots: [],
    }
  }

  const teamsById = getSeasonTeams(season)
  const teamSeasonsByTeamId = buildTeamSeasonMap({
    teamSeasons,
    leagueId: safeLeagueId,
    seasonId: safeSeasonId,
  })

  return {
    leagueId: safeLeagueId,
    seasonId: safeSeasonId,
    leagueExists: true,
    seasonExists: true,
    missingCanonicalDependencies: buildMissingCanonicalDependencies({
      teamsById,
      clubProfilesById,
    }),
    auditedFields: {
      clubsCenterCompetitionProjection: true,
      clubsCenterTransfers: true,
    },
    projectionUpdatedAt: season.updatedAt || null,
    leaguesCenter: {
      identity: leaguesCenterIdentity,
      season: buildLeaguesCenterSeason({
        season,
        teamsById,
        teamSeasonsByTeamId,
      }),
    },
    clubsCenter: buildClubsCenterExpected({
      league,
      season,
      seasonId: safeSeasonId,
      clubProfilesById,
      teamSeasonsByTeamId,
    }),
    teamSeasonCompetitionSnapshots: buildLoadedCompetitionSnapshots({
      season,
      seasonId: safeSeasonId,
      clubProfilesById,
      teamSeasonsByTeamId,
    }),
  }
}
