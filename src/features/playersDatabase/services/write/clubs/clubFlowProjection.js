// Flow-facing adapters for Club projections.
// They compose existing canonical facts into Club/Clubs Master persistence.

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../catalog/clubs.catalog.js'
import { cleanValue, pickDefinedValue } from '../../../model/shared/value.model.js'
import { buildTeamLoadStatus } from '../../../model/team/teamLoadStatus.model.js'
import { resolveTeamLookupKey } from '../../../model/team/teamIdentity.model.js'
import {
  buildTeamPerformanceProjectionFromTableRows,
  getLeagueTableRowStats,
} from '../../../domain/projections/teamPerformance.projection.js'
import {
  buildClubAgeGroupSeasonProjection,
  buildClubCompetitionPathSeason,
  buildCompetitionProjection,
} from '../../../domain/projections/club/index.js'
import {
  CLUB_TRANSFER_COVERAGE_STATUS,
} from '../../../domain/contracts/club.contract.js'
import { syncClubProjectionPersistence } from './clubProjectionSync.js'
import { syncClubsMasterDocument } from './clubsMaster.js'
import {
  CLUB_PROJECTION_STAGE,
  buildClubProjectionCompletion,
  buildClubProjectionRecoveryScope,
} from './projectionCompletion.js'

const clean = cleanValue

const resolveCanonicalTeamSeason = ({ teamSeasonsByKey, row, season } = {}) => {
  if (!(teamSeasonsByKey instanceof Map)) return {}

  const seasonKey = clean(season?.seasonKey || season?.seasonId)
  const teamKeys = [
    row?.teamId,
    row?.birthTeamId,
    row?.birthTeamDocumentId,
    row?.teamDocumentId,
  ].map(clean).filter(Boolean)

  return teamKeys
    .map(teamKey => teamSeasonsByKey.get(`${teamKey}::${seasonKey}`))
    .find(Boolean) || {}
}

export const CLUB_PROJECTION_REASON = Object.freeze({
  MISSING_CLUB_ID: 'MISSING_CLUB_ID',
})

export const ensureRequiredClubProjectionCompleted = result => {
  if (result?.completed === true) return result

  const error = new Error(
    result?.reason || 'Required Club projection did not complete'
  )
  error.name = 'RequiredClubProjectionIncompleteError'
  error.reason = result?.reason || ''
  error.completion = result || null
  error.stage = result?.errorStage || CLUB_PROJECTION_STAGE.CLUB_DOCUMENT
  error.recoveryScope = result?.recoveryScope || null
  throw error
}

const getCatalogClub = clubId => (
  PLAYERS_DATABASE_CLUBS_CATALOG.find(club => clean(club?.id) === clean(clubId)) || null
)

export const buildClubIdentityFromTeam = (team = {}) => {
  const clubId = clean(team?.clubId)
  if (!clubId) return null

  const catalogClub = getCatalogClub(clubId)

  return {
    clubId,
    externalClubId: clean(team?.externalClubId || catalogClub?.externalClubId),
    // `team.name` is a display name and may contain a team slot (for example,
    // "Club 2").  The Club document represents the parent club, so prefer
    // its canonical catalog name whenever the League row did not provide one.
    name: clean(team?.clubName || catalogClub?.name || team?.name),
    shortName: clean(team?.shortName || catalogClub?.shortName),
    sourceName: clean(team?.sourceName || catalogClub?.sourceName),
    clubUrl: clean(team?.clubUrl || catalogClub?.clubUrl),
    clubLevel: Number(
      pickDefinedValue(team?.clubLevel, catalogClub?.clubLevel)
    ) || 0,
    clubStrengthLevel: Number(
      pickDefinedValue(
        team?.clubStrengthLevel,
        catalogClub?.clubStrengthLevel,
        catalogClub?.clubLevel
      )
    ) || 0,
    aliases: Array.isArray(catalogClub?.aliases) ? [...catalogClub.aliases] : [],
    searchAliases: Array.isArray(catalogClub?.searchAliases) ? [...catalogClub.searchAliases] : [],
  }
}

export const resolveClubTransferCoverageStatus = teamSeason => {
  const loadStatus = buildTeamLoadStatus(teamSeason?.teamPlayers)

  if (loadStatus.statsComplete) return CLUB_TRANSFER_COVERAGE_STATUS.COMPLETE
  if (loadStatus.hasStats) return CLUB_TRANSFER_COVERAGE_STATUS.PARTIAL
  return CLUB_TRANSFER_COVERAGE_STATUS.NOT_LOADED
}

export const syncClubProjectionFromTeamSeason = async ({
  league = {},
  season = {},
  team = {},
  teamSeason = {},
  performance,
  points,
  leagueScoutProfilesSummary,
  canonicalCommitted = true,
  lastWriteAction = '',
  syncMaster = true,
} = {}) => {
  const clubIdentity = buildClubIdentityFromTeam(team)
  if (!clubIdentity?.clubId) {
    const recoveryScope = buildClubProjectionRecoveryScope({
      ageGroupId: league?.ageGroupId || team?.ageGroupId,
      seasonKey: season?.seasonKey || season?.seasonId,
      teamId: team?.teamId || teamSeason?.teamId,
      birthYear: season?.birthYear,
    })

    return {
      ...buildClubProjectionCompletion({
        canonicalCommitted,
        clubDocumentCompleted: false,
        clubsMasterCompleted: false,
        errorStage: CLUB_PROJECTION_STAGE.CLUB_DOCUMENT,
      }),
      skipped: true,
      reason: CLUB_PROJECTION_REASON.MISSING_CLUB_ID,
      recoveryScope,
    }
  }
  // Team writers persist a birth-team identity.  A Team Page model may expose
  // it as `birthTeamId` rather than `teamId`, so resolve the shared canonical
  // lookup key instead of requiring one display-specific field.
  if (!resolveTeamLookupKey(team) && !resolveTeamLookupKey(teamSeason)) {
    throw new Error('Missing team id for Club projection')
  }

  const ageGroupSeasonProjection = buildClubAgeGroupSeasonProjection({
    season,
    league,
    team,
    teamSeason,
    performance,
    points,
    leagueScoutProfilesSummary,
    transferCoverageStatus: resolveClubTransferCoverageStatus(teamSeason),
  })

  return syncClubProjectionPersistence({
    canonicalCommitted,
    clubIdentity,
    ageGroupSeasonProjection,
    lastWriteAction,
    syncMaster,
  })
}

export const syncClubProjectionsFromLeagueTable = async ({
  league = {},
  season = {},
  rows = [],
  leagueSeasonDocument = {},
  canonicalCommitted = true,
  lastWriteAction = '',
  syncMaster = true,
  excludedTeamIds = [],
  teamSeasonsByKey = new Map(),
  onProjection = null,
} = {}) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const excludedIds = new Set((Array.isArray(excludedTeamIds) ? excludedTeamIds : [])
    .map(clean)
    .filter(Boolean))
  const projectionRows = safeRows.filter(row => !excludedIds.has(clean(row?.teamId)))
  const results = []
  const failures = []

  for (const row of projectionRows) {
    const clubIdentity = buildClubIdentityFromTeam(row)
    if (!clubIdentity?.clubId) {
      failures.push({
        reason: CLUB_PROJECTION_REASON.MISSING_CLUB_ID,
        message: 'Missing club id for required Club projection',
        stage: CLUB_PROJECTION_STAGE.CLUB_DOCUMENT,
        completion: buildClubProjectionCompletion({
          canonicalCommitted,
          clubDocumentCompleted: false,
          clubsMasterCompleted: false,
          errorStage: CLUB_PROJECTION_STAGE.CLUB_DOCUMENT,
        }),
        recoveryScope: buildClubProjectionRecoveryScope({
          ageGroupId: league?.ageGroupId || row?.ageGroupId,
          seasonKey: season?.seasonKey || season?.seasonId,
          teamId: row?.teamId,
          birthYear: season?.birthYear || leagueSeasonDocument?.birthYear,
        }),
      })
      continue
    }
    if (!clean(row?.teamId)) {
      failures.push({
        clubId: clubIdentity.clubId,
        message: 'Missing team id for Club projection',
        stage: 'clubDocument',
      })
      continue
    }

    const performance = buildTeamPerformanceProjectionFromTableRows({
      rows: safeRows,
      team: row,
    })
    const points = getLeagueTableRowStats(row).points
    const canonicalTeamSeason = resolveCanonicalTeamSeason({
      teamSeasonsByKey,
      row,
      season,
    })
    const ageGroupSeasonProjection = buildClubAgeGroupSeasonProjection({
      season: {
        ...season,
        seasonStatus: leagueSeasonDocument?.seasonStatus || season?.seasonStatus,
        leagueTotalRound: leagueSeasonDocument?.leagueTotalRound || season?.leagueTotalRound,
      },
      league,
      team: row,
      performance,
      points,
      // League owns performance, scouting priority and profiles. Team Season
      // below is intentionally used only for balance and transfer projections.
      leagueTeam: row,
      leagueScoutProfilesSummary: row?.scoutProfilesSummary || {},
      teamSeason: {
        ...canonicalTeamSeason,
        playersCount: row?.playersCount,
      },
      // A league-table load does not own transfer facts. Omitting this field
      // preserves any transfer projection already written from Team Season.
      transferCoverageStatus: null,
    })

    const automaticProjection = buildCompetitionProjection({
      rows: safeRows,
      targetTeam: row,
      leagueLevel: league?.level,
      competitionRules: leagueSeasonDocument?.competitionRules || {},
    })
    const competitionSeason = buildClubCompetitionPathSeason({
      season: {
        ...season,
        seasonStatus: leagueSeasonDocument?.seasonStatus || season?.seasonStatus,
      },
      ageGroupId: league?.ageGroupId,
      league,
      team: row,
      automaticProjection,
      // Undefined means: preserve an existing manual override if one exists.
      manualProjection: undefined,
    })
    const birthYear = Number(season?.birthYear || leagueSeasonDocument?.birthYear) || 0
    const competitionPathUpdates = birthYear
      ? [{ birthYear, season: competitionSeason }]
      : []

    try {
      const result = await syncClubProjectionPersistence({
        canonicalCommitted,
        clubIdentity,
        ageGroupSeasonProjection,
        competitionPathUpdates,
        propagateCompetitionFromBirthYear: birthYear,
        propagateCompetitionSeasonKey: competitionSeason?.seasonKey || season?.seasonKey,
        propagateCompetitionTeamId: competitionSeason?.teamId || row?.teamId,
        propagateCompetitionTeamSlot: competitionSeason?.teamSlot ||
          row?.birthTeamSlot ||
          row?.teamSlot ||
          null,
        lastWriteAction,
        syncMaster: false,
      })
      results.push({ clubId: clubIdentity.clubId, ...result })
      onProjection?.({
        teamId: clean(row?.teamId),
        clubId: clubIdentity.clubId,
        result,
        failed: false,
      })
    } catch (error) {
      const failure = {
        clubId: clubIdentity.clubId,
        message: error?.message || 'Club projection failed',
        stage: error?.stage || '',
        recoveryScope: error?.recoveryScope || null,
        completion: error?.completion || null,
      }
      failures.push(failure)
      onProjection?.({
        teamId: clean(row?.teamId),
        clubId: clubIdentity.clubId,
        result: null,
        failure,
        failed: true,
      })
    }
  }

  let masterResult = null
  if (syncMaster && !failures.length && results.length) {
    try {
      masterResult = await syncClubsMasterDocument({
        clubIds: results.map(result => result.clubId),
        lastWriteAction,
      })
    } catch (error) {
      failures.push({
        clubIds: results.map(result => result.clubId),
        message: error?.message || 'Clubs Master sync failed',
        stage: 'clubsMaster',
      })
    }
  }

  const masterDeferred = !syncMaster && results.length > 0
  const projectionsCompleted = failures.length === 0 && !masterDeferred

  return {
    rowsCount: results.length,
    failedCount: failures.length,
    failures,
    results,
    canonicalCommitted: Boolean(canonicalCommitted),
    projectionsCompleted,
    completed: Boolean(canonicalCommitted && projectionsCompleted),
    recoveryRequired: Boolean(canonicalCommitted && failures.length > 0),
    updated: projectionsCompleted,
    changed: results.some(result => result?.results?.club?.changed) || Boolean(masterResult?.changed),
    masterResult,
    masterDeferred,
  }
}
