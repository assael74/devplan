// src/features/playersDatabase/domain/league/leagueWritePlan.builder.js

import {
  buildTeamSeasonDocumentId,
  requireSeasonId,
} from '../identity/index.js'
import { requireLeagueId } from './leagueIdentity.js'
import {
  buildCenterTeamStateProjection,
  buildClubsCenterTeamProjection,
} from './clubsCenterTeam.builder.js'
import { resolveLeagueLoadContext } from './leagueLoadContext.resolver.js'
import { buildLeagueLoadDocument } from './leagueLoad.builder.js'
import { buildLeaguePerformanceProjection } from './leaguePerformance.builder.js'
import {
  buildLeagueTeamsClearApprovedState,
  buildLeagueSeasonDeleteApprovedState,
} from './leagueClear.builder.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const toNullableNumber = value => {
  if (value === null || value === undefined || value === '') return null
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

const object = value => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
)

const map = value => object(value)

const resolveLeagueName = names => clean(
  names && (names.display || names.official || names.short || names.source)
)

const requireClubProfiles = ({ rows, clubProfilesById }) => {
  const profiles = map(clubProfilesById)
  const clubIds = Array.from(new Set(
    rows.map(row => clean(row && row.clubId)).filter(Boolean)
  ))

  clubIds.forEach(clubId => {
    const profile = profiles[clubId]
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
      throw new Error(`Missing ClubProfile for League club ${clubId}`)
    }
    if (clean(profile.clubId) !== clubId) {
      throw new Error(`ClubProfile identity mismatch for League club ${clubId}`)
    }
    if (!profile.names || typeof profile.names !== 'object' || Array.isArray(profile.names)) {
      throw new Error(`Invalid ClubProfile names for League club ${clubId}`)
    }
  })

  return profiles
}

export const buildClubProfileProjection = profile => ({
  displayName: clean(profile && profile.names && profile.names.display),
  shortName: clean(profile && profile.names && profile.names.short),
  clubLevel: toNullableNumber(profile && profile.clubLevel),
  clubStrengthLevel: toNullableNumber(profile && profile.clubStrengthLevel),
})

const indexTeamSeasons = ({ existingTeamSeasons, leagueId, seasonId }) => {
  const rows = Array.isArray(existingTeamSeasons) ? existingTeamSeasons : []
  const byTeamId = new Map()

  rows.forEach(document => {
    const source = object(document)
    const identity = object(source.identity)
    if (clean(identity.leagueId) !== leagueId || clean(identity.seasonId) !== seasonId) return

    const teamId = clean(identity.teamId)
    const clubId = clean(identity.clubId)
    if (!teamId || !clubId) throw new Error('Invalid Team Season identity in League scope')

    const expectedDocumentId = buildTeamSeasonDocumentId({ teamId, seasonId })
    const documentId = clean(source.id || identity.teamSeasonDocumentId)
    if (documentId !== expectedDocumentId) {
      throw new Error(`Team Season identity mismatch for ${teamId}`)
    }
    if (byTeamId.has(teamId)) throw new Error(`Duplicate Team Season for ${teamId}`)

    byTeamId.set(teamId, {
      ...source,
      id: documentId,
      identity,
    })
  })

  return byTeamId
}

const emptyOfficialTable = () => ({
  rank: null,
  points: null,
  goalsFor: null,
  goalsAgainst: null,
  teamGamePlayed: null,
})

const buildCompetitionSnapshot = ({ teamRow, profile, updatedAt }) => ({
  teamUrl: clean(teamRow && teamRow.teamUrl),
  clubLevel: toNullableNumber(profile && profile.clubLevel),
  clubStrengthLevel: toNullableNumber(profile && profile.clubStrengthLevel),
  officialTable: {
    rank: toNullableNumber(teamRow && teamRow.officialTable && teamRow.officialTable.rank),
    points: toNullableNumber(teamRow && teamRow.officialTable && teamRow.officialTable.points),
    goalsFor: toNullableNumber(teamRow && teamRow.officialTable && teamRow.officialTable.goalsFor),
    goalsAgainst: toNullableNumber(teamRow && teamRow.officialTable && teamRow.officialTable.goalsAgainst),
    teamGamePlayed: toNullableNumber(
      teamRow && teamRow.officialTable && teamRow.officialTable.teamGamePlayed
    ),
  },
  updatedAt: updatedAt || null,
})

const buildEmptyCompetitionSnapshot = updatedAt => ({
  teamUrl: '',
  clubLevel: null,
  clubStrengthLevel: null,
  officialTable: emptyOfficialTable(),
  updatedAt: updatedAt || null,
})

const buildSnapshotTargetsForLoad = ({
  season,
  seasonId,
  clubProfilesById,
  teamSeasonsByTeamId,
  updatedAt,
}) => Object.entries(object(season && season.table && season.table.teamsById))
  .filter(([teamId]) => teamSeasonsByTeamId.has(teamId))
  .map(([teamId, teamRow]) => {
    const teamSeason = teamSeasonsByTeamId.get(teamId)
    const clubId = clean(teamRow && teamRow.clubId)
    return {
      teamId,
      teamSeasonDocumentId: teamSeason.id,
      competitionSnapshot: buildCompetitionSnapshot({
        teamRow,
        profile: clubProfilesById[clubId],
        updatedAt,
      }),
    }
  })

const buildSnapshotTargetsForClear = ({ affectedTeamIds, teamSeasonsByTeamId, updatedAt }) => (
  affectedTeamIds
    .filter(teamId => teamSeasonsByTeamId.has(teamId))
    .map(teamId => ({
      teamId,
      teamSeasonDocumentId: teamSeasonsByTeamId.get(teamId).id,
      competitionSnapshot: buildEmptyCompetitionSnapshot(updatedAt),
    }))
)

export const buildLeaguesCenterIdentity = league => ({
  leagueName: resolveLeagueName(league && league.names),
  region: clean(league && league.region),
  ageGroupId: clean(league && league.ageGroupId),
  ageGroupLabel: clean(league && league.ageGroupLabel),
  level: toNullableNumber(league && league.level),
})

export const buildLeaguesCenterSeason = ({
  season,
  teamSeasonsByTeamId,
  previousLeaguesCenterTeamsById,
  updatedAt,
}) => {
  const teamsById = {}

  Object.entries(object(season && season.table && season.table.teamsById)).forEach(([teamId, row]) => {
    const teamSeason = teamSeasonsByTeamId.get(teamId) || null
    const centerState = buildCenterTeamStateProjection({
      teamSeason,
      seasonStatus: season.seasonStatus,
      previousTeamProjection: object(previousLeaguesCenterTeamsById)[teamId] || null,
    })
    teamsById[teamId] = {
      clubId: clean(row && row.clubId),
      teamSlot: toNullableNumber(row && row.teamSlot),
      ...centerState,
    }
  })

  return {
    seasonKey: clean(season.seasonKey),
    seasonStatus: clean(season.seasonStatus),
    birthYear: toNullableNumber(season.birthYear),
    seasonUrl: clean(season.seasonUrl),
    hasCompetitionRules: Boolean(season.competitionRules && season.competitionRules.configured),
    tableState: clean(season.table && season.table.tableState),
    tableImportedAt: season.tableImportedAt || null,
    teamsById,
    updatedAt: updatedAt || null,
  }
}

const readSeasonTeams = ({ league, seasonId }) => {
  const seasonsById = object(league && league.seasonsById)
  const season = object(seasonsById[seasonId])
  return object(season.table && season.table.teamsById)
}


const normalizePreviousClubsCenterTeamLocations = ({
  locations,
  leagueId,
}) => {
  const normalized = []
  const seenPairs = new Set()

  ;(Array.isArray(locations) ? locations : []).forEach(entry => {
    const source = object(entry)
    const clubId = clean(source.clubId)
    const teamId = clean(source.teamId)
    const team = object(source.team)

    if (!clubId || !teamId) {
      throw new Error('Invalid ClubsCenter Team location')
    }
    if (clean(team.leagueId) !== leagueId) {
      throw new Error(`ClubsCenter Team league mismatch for ${teamId}`)
    }

    const pairKey = `${clubId}::${teamId}`
    if (seenPairs.has(pairKey)) {
      throw new Error(`Duplicate ClubsCenter Team location for ${teamId}`)
    }
    seenPairs.add(pairKey)
    normalized.push({ clubId, teamId, team })
  })

  return normalized
}

const findPreviousClubsCenterTeamProjection = ({ locations, clubId, teamId }) => {
  const match = locations.find(entry => entry.clubId === clubId && entry.teamId === teamId)
  return match ? match.team : null
}

const collectTeamClubIds = ({ existingLeague, seasonId, teamSeasonsByTeamId }) => {
  const result = new Map()

  Object.entries(readSeasonTeams({ league: existingLeague, seasonId })).forEach(([teamId, row]) => {
    const clubId = clean(row && row.clubId)
    if (clubId) result.set(teamId, clubId)
  })
  teamSeasonsByTeamId.forEach((teamSeason, teamId) => {
    const clubId = clean(teamSeason && teamSeason.identity && teamSeason.identity.clubId)
    if (clubId) result.set(teamId, clubId)
  })

  return result
}

const buildClubWritesForLoad = ({
  canonicalLeague,
  seasonId,
  existingLeague,
  clubProfilesById,
  teamSeasonsByTeamId,
  previousClubsCenterTeamLocations,
  otherLeagueIdsByTeamId,
  updatedAt,
}) => {
  const season = canonicalLeague.seasonsById[seasonId]
  const currentTeams = object(season.table && season.table.teamsById)
  const previousTeamClubIds = collectTeamClubIds({
    existingLeague,
    seasonId,
    teamSeasonsByTeamId,
  })
  const previousLocations = normalizePreviousClubsCenterTeamLocations({
    locations: previousClubsCenterTeamLocations,
    leagueId: canonicalLeague.leagueId,
  })
  const writesByClubId = new Map()

  const ensure = clubId => {
    if (!writesByClubId.has(clubId)) {
      writesByClubId.set(clubId, {
        clubId,
        clubProfile: null,
        upsertTeamsById: {},
        deleteTeamIds: [],
      })
    }
    return writesByClubId.get(clubId)
  }

  Object.entries(currentTeams).forEach(([teamId, teamRow]) => {
    const clubId = clean(teamRow && teamRow.clubId)
    const profile = clubProfilesById[clubId]
    const write = ensure(clubId)
    write.clubProfile = buildClubProfileProjection(profile)
    write.upsertTeamsById[teamId] = buildClubsCenterTeamProjection({
      league: canonicalLeague,
      season,
      seasonId,
      teamId,
      teamRow,
      teamSeason: teamSeasonsByTeamId.get(teamId) || null,
      previousTeamProjection: findPreviousClubsCenterTeamProjection({
        locations: previousLocations,
        clubId,
        teamId,
      }),
      updatedAt,
    })
  })

  previousTeamClubIds.forEach((clubId, teamId) => {
    if (Object.prototype.hasOwnProperty.call(currentTeams, teamId)) return

    const otherOwners = Array.isArray(object(otherLeagueIdsByTeamId)[teamId])
      ? object(otherLeagueIdsByTeamId)[teamId]
      : []
    const belongsToCurrentLeagueProjection = previousLocations.some(location => (
      location.clubId === clubId && location.teamId === teamId
    ))
    if (otherOwners.length > 0 && !belongsToCurrentLeagueProjection) return

    ensure(clubId).deleteTeamIds.push(teamId)
  })

  previousLocations.forEach(({ clubId, teamId }) => {
    const current = object(currentTeams[teamId])
    const canonicalClubId = clean(current.clubId)
    if (canonicalClubId === clubId) return

    const deletes = ensure(clubId).deleteTeamIds
    if (!deletes.includes(teamId)) deletes.push(teamId)
  })

  return Array.from(writesByClubId.values())
}

const buildClubWritesForRemoval = ({
  affectedTeamIds,
  existingLeague,
  seasonId,
  teamSeasonsByTeamId,
  previousClubsCenterTeamLocations,
  otherLeagueIdsByTeamId,
  leagueId,
}) => {
  const teamClubIds = collectTeamClubIds({
    existingLeague,
    seasonId,
    teamSeasonsByTeamId,
  })
  const previousLocations = normalizePreviousClubsCenterTeamLocations({
    locations: previousClubsCenterTeamLocations,
    leagueId,
  })
  const writesByClubId = new Map()

  const ensureDelete = (clubId, teamId) => {
    if (!writesByClubId.has(clubId)) {
      writesByClubId.set(clubId, {
        clubId,
        clubProfile: null,
        upsertTeamsById: {},
        deleteTeamIds: [],
      })
    }
    const deletes = writesByClubId.get(clubId).deleteTeamIds
    if (!deletes.includes(teamId)) deletes.push(teamId)
  }

  previousLocations.forEach(({ clubId, teamId }) => {
    ensureDelete(clubId, teamId)
  })

  affectedTeamIds.forEach(teamId => {
    const clubId = teamClubIds.get(teamId)
    if (!clubId) throw new Error(`Missing club identity for affected Team ${teamId}`)

    const otherOwners = Array.isArray(object(otherLeagueIdsByTeamId)[teamId])
      ? object(otherLeagueIdsByTeamId)[teamId]
      : []
    const belongsToCurrentLeagueProjection = previousLocations.some(location => (
      location.clubId === clubId && location.teamId === teamId
    ))
    if (otherOwners.length > 0 && !belongsToCurrentLeagueProjection) return

    ensureDelete(clubId, teamId)
  })

  return Array.from(writesByClubId.values())
}

export const buildClubsCenterLeague = ({ league, season }) => ({
  displayName: resolveLeagueName(league && league.names),
  ageGroupLabel: clean(league && league.ageGroupLabel),
  leagueLevel: toNullableNumber(league && league.level),
  seasonStatus: clean(season && season.seasonStatus),
  tableImportedAt: season && season.tableImportedAt ? season.tableImportedAt : null,
})

export const buildLeagueLoadWritePlan = ({
  league = {},
  season = {},
  rows = [],
  existingLeague = {},
  clubProfilesById = {},
  existingTeamSeasons = [],
  previousLeaguesCenterTeamsById = {},
  previousClubsCenterTeamLocations = [],
  otherLeagueIdsByTeamId = {},
  createdAt = null,
  updatedAt = null,
  tableImportedAt = null,
  calculatedAt = null,
  tableState = '',
} = {}) => {
  const context = resolveLeagueLoadContext({ league, season, rows, existingLeague })
  context.canonicalRows.forEach(row => {
    const ownerIds = otherLeagueIdsByTeamId && otherLeagueIdsByTeamId[row.teamId]
    const owners = Array.isArray(ownerIds)
      ? ownerIds
      : []
    if (!owners.length) return
    const error = new Error(`Team ${row.teamId} already belongs to another League in this season`)
    error.code = 'LEAGUE_TEAM_DUPLICATE_OWNER'
    error.teamId = row.teamId
    error.leagueIds = owners
    throw error
  })
  const profiles = requireClubProfiles({
    rows: context.canonicalRows,
    clubProfilesById,
  })
  const performance = buildLeaguePerformanceProjection({
    context,
    clubProfilesById: profiles,
    calculatedAt,
  })
  const canonical = buildLeagueLoadDocument({
    context,
    season,
    clubProfilesById: profiles,
    performanceByTeamId: performance.performanceByTeamId,
    performanceCalculation: performance.performanceCalculation,
    createdAt,
    updatedAt,
    tableImportedAt,
    tableState,
  })
  const canonicalLeague = canonical.document
  const canonicalSeason = canonical.season
  const teamSeasonsByTeamId = indexTeamSeasons({
    existingTeamSeasons,
    leagueId: canonical.leagueId,
    seasonId: canonical.seasonId,
  })

  return {
    leagueId: canonical.leagueId,
    seasonId: canonical.seasonId,
    canonicalWriteRequired: true,
    document: canonicalLeague,
    clubAliasEdits: rows.filter(row => clean(row.clubAlias)).map(row => ({
      clubId: clean(row.clubId),
      aliases: [clean(row.clubAlias)],
    })),
    teamSeasonCompetitionSnapshots: buildSnapshotTargetsForLoad({
      season: canonicalSeason,
      seasonId: canonical.seasonId,
      clubProfilesById: profiles,
      teamSeasonsByTeamId,
      updatedAt,
    }),
    leaguesCenterProjection: {
      writeRequired: true,
      operation: 'UPSERT_SEASON',
      leagueId: canonical.leagueId,
      seasonId: canonical.seasonId,
      identity: buildLeaguesCenterIdentity(canonicalLeague),
      season: buildLeaguesCenterSeason({
        season: canonicalSeason,
        teamSeasonsByTeamId,
        previousLeaguesCenterTeamsById,
        updatedAt,
      }),
      updatedAt: updatedAt || null,
    },
    clubsCenterProjection: {
      writeRequired: true,
      seasonId: canonical.seasonId,
      seasonKey: canonicalSeason.seasonKey,
      leagueId: canonical.leagueId,
      leagueOperation: 'UPSERT',
      league: buildClubsCenterLeague({ league: canonicalLeague, season: canonicalSeason }),
      clubWrites: buildClubWritesForLoad({
        canonicalLeague,
        seasonId: canonical.seasonId,
        existingLeague,
        clubProfilesById: profiles,
        teamSeasonsByTeamId,
        previousClubsCenterTeamLocations,
        otherLeagueIdsByTeamId,
        updatedAt,
      }),
      updatedAt: updatedAt || null,
    },
  }
}

export const buildLeagueOpenWritePlan = ({
  league = {},
  season = {},
  existingLeague = {},
  existingTeamSeasons = [],
  previousLeaguesCenterTeamsById = {},
  previousClubsCenterTeamLocations = [],
  createdAt = null,
  updatedAt = null,
} = {}) => {
  const seasonId = requireSeasonId(season.seasonId)
  const existingSeason = object(object(existingLeague).seasonsById)[seasonId]

  if (Object.keys(object(existingSeason)).length) {
    const existingTeams = object(existingSeason.table && existingSeason.table.teamsById)
    const existingTableState = clean(existingSeason.table && existingSeason.table.tableState)
    if (existingTableState !== 'NOT_LOADED' || Object.keys(existingTeams).length) {
      throw new Error('League season already exists')
    }
  }

  return buildLeagueLoadWritePlan({
    league,
    season,
    rows: [],
    existingLeague,
    clubProfilesById: {},
    existingTeamSeasons,
    previousLeaguesCenterTeamsById,
    previousClubsCenterTeamLocations,
    createdAt,
    updatedAt,
    tableImportedAt: null,
    calculatedAt: null,
    tableState: 'NOT_LOADED',
  })
}

export const buildLeagueTeamsClearWritePlan = ({
  leagueId,
  seasonId,
  existingLeague = {},
  existingTeamSeasons = [],
  previousClubsCenterTeamLocations = [],
  otherLeagueIdsByTeamId = {},
  updatedAt = null,
} = {}) => {
  const canonical = buildLeagueTeamsClearApprovedState({
    leagueId,
    seasonId,
    existingLeague,
    existingTeamSeasons,
    updatedAt,
  })
  const teamSeasonsByTeamId = indexTeamSeasons({
    existingTeamSeasons,
    leagueId: canonical.leagueId,
    seasonId: canonical.seasonId,
  })
  const season = canonical.season

  return {
    ...canonical,
    canonicalWriteRequired: true,
    teamSeasonCompetitionSnapshots: buildSnapshotTargetsForClear({
      affectedTeamIds: canonical.affectedTeamIds,
      teamSeasonsByTeamId,
      updatedAt,
    }),
    leaguesCenterProjection: {
      writeRequired: true,
      operation: 'UPSERT_SEASON',
      leagueId: canonical.leagueId,
      seasonId: canonical.seasonId,
      identity: buildLeaguesCenterIdentity(canonical.document),
      season: buildLeaguesCenterSeason({
        season,
        teamSeasonsByTeamId,
        previousLeaguesCenterTeamsById: {},
        updatedAt,
      }),
      updatedAt: updatedAt || null,
    },
    clubsCenterProjection: {
      writeRequired: true,
      seasonId: canonical.seasonId,
      seasonKey: season.seasonKey,
      leagueId: canonical.leagueId,
      leagueOperation: 'UPSERT',
      league: buildClubsCenterLeague({ league: canonical.document, season }),
      clubWrites: buildClubWritesForRemoval({
        affectedTeamIds: canonical.affectedTeamIds,
        existingLeague,
        seasonId: canonical.seasonId,
        teamSeasonsByTeamId,
        previousClubsCenterTeamLocations,
        otherLeagueIdsByTeamId,
        leagueId: canonical.leagueId,
      }),
      updatedAt: updatedAt || null,
    },
  }
}

export const buildLeagueSeasonDeleteWritePlan = ({
  leagueId,
  seasonId,
  existingLeague = null,
  existingTeamSeasons = [],
  previousClubsCenterTeamLocations = [],
  otherLeagueIdsByTeamId = {},
  updatedAt = null,
} = {}) => {
  const resolvedLeagueId = requireLeagueId(leagueId)
  const resolvedSeasonId = requireSeasonId(seasonId)
  const teamSeasonsByTeamId = indexTeamSeasons({
    existingTeamSeasons,
    leagueId: resolvedLeagueId,
    seasonId: resolvedSeasonId,
  })
  const canonical = buildLeagueSeasonDeleteApprovedState({
    leagueId: resolvedLeagueId,
    seasonId: resolvedSeasonId,
    existingLeague,
    existingTeamSeasons,
    updatedAt,
  })
  const identitySource = canonical.document || existingLeague
  const hasLeagueIdentity = Boolean(identitySource && clean(identitySource.leagueId))

  return {
    ...canonical,
    teamSeasonCompetitionSnapshots: buildSnapshotTargetsForClear({
      affectedTeamIds: canonical.affectedTeamIds,
      teamSeasonsByTeamId,
      updatedAt,
    }),
    leaguesCenterProjection: {
      writeRequired: true,
      operation: hasLeagueIdentity ? 'DELETE_SEASON' : 'DELETE_LEAGUE',
      leagueId: resolvedLeagueId,
      seasonId: resolvedSeasonId,
      identity: hasLeagueIdentity ? buildLeaguesCenterIdentity(identitySource) : null,
      updatedAt: updatedAt || null,
    },
    clubsCenterProjection: {
      writeRequired: true,
      seasonId: resolvedSeasonId,
      leagueId: resolvedLeagueId,
      leagueOperation: 'DELETE',
      clubWrites: buildClubWritesForRemoval({
        affectedTeamIds: canonical.affectedTeamIds,
        existingLeague,
        seasonId: resolvedSeasonId,
        teamSeasonsByTeamId,
        previousClubsCenterTeamLocations,
        otherLeagueIdsByTeamId,
        leagueId: resolvedLeagueId,
      }),
      updatedAt: updatedAt || null,
    },
  }
}

export const buildLeagueLoadProjectionRepairPlan = ({
  leagueId,
  seasonId,
  existingLeague = null,
  clubProfilesById = {},
  existingTeamSeasons = [],
  previousLeaguesCenterTeamsById = {},
  previousClubsCenterTeamLocations = [],
  otherLeagueIdsByTeamId = {},
  updatedAt = null,
} = {}) => {
  const resolvedLeagueId = requireLeagueId(leagueId)
  const resolvedSeasonId = requireSeasonId(seasonId)
  const league = object(existingLeague)
  if (clean(league.leagueId) !== resolvedLeagueId) {
    throw new Error('Canonical League identity does not match receipt target')
  }

  const season = object(object(league.seasonsById)[resolvedSeasonId])
  if (!Object.keys(season).length) {
    throw new Error('Canonical League season does not exist for projection repair')
  }

  const teamsById = object(season.table && season.table.teamsById)
  const rows = Object.entries(teamsById).map(([teamId, row]) => ({
    ...object(row),
    teamId,
  }))
  const profiles = requireClubProfiles({ rows, clubProfilesById })
  const teamSeasonsByTeamId = indexTeamSeasons({
    existingTeamSeasons,
    leagueId: resolvedLeagueId,
    seasonId: resolvedSeasonId,
  })

  return {
    actionType: 'leagueLoad',
    leagueId: resolvedLeagueId,
    seasonId: resolvedSeasonId,
    canonicalWriteRequired: false,
    teamSeasonCompetitionSnapshots: buildSnapshotTargetsForLoad({
      season,
      seasonId: resolvedSeasonId,
      clubProfilesById: profiles,
      teamSeasonsByTeamId,
      updatedAt,
    }),
    leaguesCenterProjection: {
      writeRequired: true,
      operation: 'UPSERT_SEASON',
      leagueId: resolvedLeagueId,
      seasonId: resolvedSeasonId,
      identity: buildLeaguesCenterIdentity(league),
      season: buildLeaguesCenterSeason({
        season,
        teamSeasonsByTeamId,
        previousLeaguesCenterTeamsById,
        updatedAt,
      }),
      updatedAt: updatedAt || null,
    },
    clubsCenterProjection: {
      writeRequired: true,
      seasonId: resolvedSeasonId,
      seasonKey: clean(season.seasonKey),
      leagueId: resolvedLeagueId,
      leagueOperation: 'UPSERT',
      league: buildClubsCenterLeague({ league, season }),
      clubWrites: buildClubWritesForLoad({
        canonicalLeague: league,
        seasonId: resolvedSeasonId,
        existingLeague: league,
        clubProfilesById: profiles,
        teamSeasonsByTeamId,
        previousClubsCenterTeamLocations,
        otherLeagueIdsByTeamId,
        updatedAt,
      }),
      updatedAt: updatedAt || null,
    },
  }
}
