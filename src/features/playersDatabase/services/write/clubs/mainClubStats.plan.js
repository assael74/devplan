import { Timestamp } from 'firebase/firestore'

import { readClubsMasterDocument } from '../../read/masters/clubsMaster.read.js'
import {
  buildClubAgeGroupSeasonProjection,
  buildClubDocumentProjection,
  buildClubsMasterClubProjection,
} from '../../../domain/projections/club/index.js'
import { buildRosterSourceFingerprint } from '../teams/rosterSourceFingerprint.js'
import {
  buildClubIdentityFromTeam,
  resolveClubTransferCoverageStatus,
} from './clubFlowProjection.js'
import {
  isSameClubProjectionState,
  readClubDocument,
} from './clubDoc.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const withoutDocumentMetadata = value => {
  if (!value || typeof value !== 'object') return value || null
  const { id, exists, ...rest } = value
  return rest
}

const sortClubEntries = clubs => [...clubs].sort((left, right) => (
  clean(left?.name).localeCompare(clean(right?.name), 'he') ||
  clean(left?.clubId).localeCompare(clean(right?.clubId))
))

const upsertMasterClub = ({ clubs = [], club = {} } = {}) => {
  const clubId = clean(club?.clubId)
  const rows = Array.isArray(clubs) ? [...clubs] : []
  if (!clubId) return rows

  const index = rows.findIndex(row => clean(row?.clubId) === clubId)
  if (index >= 0) rows[index] = club
  else rows.push(club)

  return sortClubEntries(rows)
}

export async function prepareMainClubStatsProjectionPlan({
  league = {},
  season = {},
  team = {},
  teamSeason = {},
  performance = null,
  points = 0,
  leagueScoutProfilesSummary = null,
  sourceRevision = '',
  trackedAt = '',
} = {}) {
  const revision = clean(sourceRevision)
  const plannedAt = clean(trackedAt)
  if (!plannedAt) throw new Error('Missing Main Club projection trackedAt')

  const plannedTimestamp = Timestamp.fromDate(new Date(plannedAt))
  const clubIdentity = buildClubIdentityFromTeam(team)
  const clubId = clean(clubIdentity?.clubId)
  const clubOperationId = `mainClub__${clubId}__${revision}`
  const masterOperationId = `mainClubsMaster__${clubId}__${revision}`

  if (!clubId) {
    return {
      skipped: true,
      reason: 'missingClubId',
      operations: [],
      clubsMasterOperations: [],
    }
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

  const [currentClub, currentMaster] = await Promise.all([
    readClubDocument({ clubId }),
    readClubsMasterDocument({ fresh: true }),
  ])

  const existingClub = currentClub.club || {}
  const projectedClub = buildClubDocumentProjection({
    existingClub,
    clubIdentity,
    ageGroupSeasonProjection,
    projectionVersion: 1,
    updatedAt: plannedTimestamp,
  })
  const clubChanged = !currentClub.exists || !isSameClubProjectionState(existingClub, projectedClub)
  const finalClubDocumentBase = clubChanged
    ? {
        ...projectedClub,
        clubId,
        projectionVersion: 1,
        createdAt: existingClub?.createdAt || plannedTimestamp,
        updatedAt: plannedTimestamp,
        lastWriteAction: 'PASTE_TEAM_PLAYER_STATS',
        lastWriteAt: plannedTimestamp,
      }
    : existingClub
  const finalClubDocument = {
    ...finalClubDocumentBase,
    lastStatsMainClubProjectionOperationId: clubOperationId,
  }
  const projectedMasterEntry = buildClubsMasterClubProjection({
    club: finalClubDocument,
    updatedAt: finalClubDocument?.updatedAt || null,
  })
  const projectedMasterClubs = upsertMasterClub({
    clubs: Array.isArray(currentMaster?.clubs) ? currentMaster.clubs : [],
    club: projectedMasterEntry,
  })
  const currentMasterClubs = sortClubEntries(
    Array.isArray(currentMaster?.clubs) ? currentMaster.clubs : []
  )
  const masterChanged = currentMaster?.exists !== true ||
    JSON.stringify(currentMasterClubs) !== JSON.stringify(projectedMasterClubs)
  const finalMasterDocumentBase = masterChanged
    ? {
        ...withoutDocumentMetadata(currentMaster),
        projectionVersion: Number(currentMaster?.projectionVersion || 1),
        clubs: projectedMasterClubs,
        updatedAt: plannedTimestamp,
        lastWriteAction: 'PASTE_TEAM_PLAYER_STATS',
        lastWriteAt: plannedTimestamp,
      }
    : withoutDocumentMetadata(currentMaster)
  const finalMasterDocument = {
    ...finalMasterDocumentBase,
    lastStatsMainClubProjectionOperationId: masterOperationId,
  }

  return {
    skipped: false,
    clubId,
    operations: [{
      operationType: 'mainClubProjection',
      operationId: clubOperationId,
      sourceRevision: revision,
      target: { clubId },
      changed: clubChanged,
      expected: {
        targetExists: currentClub.exists === true,
        targetFingerprint: buildRosterSourceFingerprint(withoutDocumentMetadata(existingClub)),
      },
      patch: { document: finalClubDocument },
    }],
    clubsMasterOperations: [{
      operationType: 'mainClubsMaster',
      operationId: masterOperationId,
      sourceRevision: revision,
      target: { documentId: 'all', clubId },
      changed: masterChanged,
      expected: {
        targetExists: currentMaster?.exists === true,
        targetFingerprint: buildRosterSourceFingerprint(withoutDocumentMetadata(currentMaster)),
      },
      patch: { document: finalMasterDocument },
    }],
    composedState: {
      club: {
        clubId,
        exists: true,
        document: finalClubDocument,
      },
      clubsMaster: {
        exists: true,
        document: finalMasterDocument,
      },
    },
  }
}
