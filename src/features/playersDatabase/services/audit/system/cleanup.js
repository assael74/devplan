// src/features/playersDatabase/services/audit/system/cleanup.js

import { doc, serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import {
  createTrackedWriteBatch,
  trackedGetDocFromServer,
} from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { buildTeamSeasonDocumentId } from '../../../domain/identity/index.js'
import { writeRosterPlayerSeasons } from '../../write/roster/writeRosterPlayerSeasons.js'
import { getTeamSeasonPlayerIds } from './evaluate.js'
import { auditSystem } from './index.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {}

export const getSystemCleanupCandidateKey = finding => [
  clean(finding && finding.target),
  clean(finding && finding.documentId),
  clean(finding && finding.teamId),
].join(':')

const MAX_CLEANUP_DELETES = 400
const runAudit = checks => (
  Array.isArray(checks) ? auditSystem({ checks }) : auditSystem()
)

export const getSystemCleanupCandidates = result => {
  const findings = result && Array.isArray(result.findings) ? result.findings : []
  const unique = new Map()

  findings.forEach(finding => {
    const isOrphanSearchIndex = (
      finding.type === 'orphan_projection'
      && finding.target === 'playerSearchIndexes'
      && finding.documentId
    )
    let isOrphanPlayerSeasonTeam = false
    if (
      finding.type === 'orphan_projection'
      && finding.target === 'playerSeasons'
      && finding.documentId
      && finding.teamId
      && finding.seasonId
    ) {
      try {
        isOrphanPlayerSeasonTeam = clean(finding.expected) === buildTeamSeasonDocumentId({
          teamId: clean(finding.teamId),
          seasonId: clean(finding.seasonId),
        })
      } catch (_error) {
        isOrphanPlayerSeasonTeam = false
      }
    }

    if (isOrphanSearchIndex || isOrphanPlayerSeasonTeam) {
      unique.set(getSystemCleanupCandidateKey(finding), finding)
    }
  })

  return Array.from(unique.values())
}

export const deleteSystemCleanupCandidates = async ({ candidates = [], checks } = {}) => {
  const requestedKeys = new Set(candidates.map(getSystemCleanupCandidateKey))
  if (!requestedKeys.size) throw new Error('לא נבחרו ממצאים לניקוי')
  if (requestedKeys.size > MAX_CLEANUP_DELETES) {
    throw new Error(`ניתן לנקות עד ${MAX_CLEANUP_DELETES} ממצאים בפעולה אחת`)
  }

  const freshAudit = await runAudit(checks)
  const eligible = getSystemCleanupCandidates(freshAudit)
    .filter(finding => requestedKeys.has(getSystemCleanupCandidateKey(finding)))

  if (eligible.length !== requestedKeys.size) {
    throw new Error('מצב המאגר השתנה. יש להריץ את סריקת הניקיון מחדש לפני המחיקה.')
  }

  const searchIndexFindings = eligible.filter(finding => finding.target === 'playerSearchIndexes')
  const playerSeasonFindings = eligible.filter(finding => finding.target === 'playerSeasons')
  const playerSeasonGroups = new Map()
  playerSeasonFindings.forEach(finding => {
    const documentId = clean(finding.documentId)
    const group = playerSeasonGroups.get(documentId) || []
    group.push(finding)
    playerSeasonGroups.set(documentId, group)
  })

  const playerSeasonRows = []
  const deletedPlayerSeasonIds = []
  const updatedPlayerSeasonIds = []
  for (const [documentId, findings] of playerSeasonGroups) {
    const playerSeasonSnapshot = await trackedGetDocFromServer(
      doc(db, PLAYERS_DATABASE_COLLECTIONS.playerSeasons, documentId),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.playerSeasons,
        action: 'data-ops-validate-orphan-player-season',
        operationSubtype: 'data-ops-cleanup-getDoc',
      }
    )
    if (!playerSeasonSnapshot.exists()) {
      throw new Error('מצב המאגר השתנה. יש להריץ את סריקת הניקיון מחדש לפני המחיקה.')
    }
    const playerSeason = playerSeasonSnapshot.data()
    const teamsById = object(playerSeason.teamsById)
    const playerId = clean(playerSeason.identity && playerSeason.identity.playerId)
    const selectedTeamIds = []
    for (const finding of findings) {
      const teamId = clean(finding.teamId)
      if (
        !playerId
        || playerId !== clean(finding.playerId)
        || !Object.prototype.hasOwnProperty.call(teamsById, teamId)
      ) {
        throw new Error('מצב המאגר השתנה. יש להריץ את סריקת הניקיון מחדש לפני המחיקה.')
      }
      const teamSeasonSnapshot = await trackedGetDocFromServer(
        doc(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons, clean(finding.expected)),
        {
          feature: 'playersDatabase',
          collection: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
          action: 'data-ops-validate-orphan-player-season',
          operationSubtype: 'data-ops-cleanup-getDoc',
        }
      )
      if (
        teamSeasonSnapshot.exists()
        && getTeamSeasonPlayerIds(teamSeasonSnapshot.data()).has(playerId)
      ) {
        throw new Error('השחקן קיים בעונת הקבוצה ולכן הקשר אינו בטוח למחיקה. יש להריץ את האודיט מחדש.')
      }
      selectedTeamIds.push(teamId)
    }

    const remainingTeamIds = Object.keys(teamsById)
      .filter(teamId => !selectedTeamIds.includes(teamId))
    if (!remainingTeamIds.length) {
      playerSeasonRows.push({ operation: 'DELETE', documentId })
      deletedPlayerSeasonIds.push(documentId)
    } else {
      selectedTeamIds.forEach(teamId => {
        playerSeasonRows.push({
          operation: 'REMOVE_TEAM',
          documentId,
          teamId,
          updatedAt: serverTimestamp(),
        })
      })
      updatedPlayerSeasonIds.push(documentId)
    }
  }

  if (playerSeasonRows.length) {
    await writeRosterPlayerSeasons({
      approvedState: { playerSeasons: playerSeasonRows },
    })
  }

  if (searchIndexFindings.length) {
    const batch = createTrackedWriteBatch(db, {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.playerSearchIndexes,
      action: 'data-ops-delete-orphan-search-indexes',
      operationSubtype: 'data-ops-cleanup-writeBatch',
    })

    searchIndexFindings.forEach(finding => {
      batch.delete(doc(
        db,
        PLAYERS_DATABASE_COLLECTIONS.playerSearchIndexes,
        finding.documentId
      ))
    })
    await batch.commit()
  }

  return {
    cleanedCandidatesCount: eligible.length,
    deletedDocumentIds: [
      ...searchIndexFindings.map(finding => finding.documentId),
      ...deletedPlayerSeasonIds,
    ],
    updatedDocumentIds: updatedPlayerSeasonIds,
    auditResult: await runAudit(checks),
  }
}

