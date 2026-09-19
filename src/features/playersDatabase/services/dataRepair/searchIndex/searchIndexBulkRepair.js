// src/features/playersDatabase/services/dataRepair/searchIndex/searchIndexBulkRepair.js

import { readPlayerDatabaseAuditSnapshot } from '../../audit/audit.read.js'
import { AUDIT_REPAIR_TYPE, normalizeLegacyAuditRepairType } from '../../audit/audit.contract.js'
import { doc, getDoc, writeBatch } from 'firebase/firestore'
import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { buildTeamSeasonDocumentId } from '../../../model/team/teamIdentity.model.js'
import { resetTeamSeasonSearchIndexToLeagueOnly } from '../../write/searchIndex/team/index.js'
import {
  PLAYER_DATA_ISSUE_CODE,
  canRepairPlayerDataIssue,
  repairPlayerDataIssue,
} from '../player/index.js'
import { repairTeamSearchIndexLifecycleMany } from '../team/index.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const playerKeys = player => new Set([
  player?.playerDocumentId,
  player?.playerId,
  player?.externalPlayerId,
  player?.id,
].map(value => clean(value).replace(/^external__/, '')).filter(Boolean))
const samePlayer = (left, right) => [...playerKeys(left)].some(key => playerKeys(right).has(key))

export const isPlayerSearchIndexScoutProfileFinding = finding => (
  clean(finding?.entityType) === 'playerSearchIndex' &&
  normalizeLegacyAuditRepairType(finding) === AUDIT_REPAIR_TYPE.REBUILD_PLAYER_SEARCH_INDEX &&
  clean(finding?.documentId) && clean(finding?.relatedDocumentId)
)

export const isTeamSearchIndexLifecycleFinding = finding => (
  clean(finding?.entityType) === 'teamSearchIndex' &&
  normalizeLegacyAuditRepairType(finding) === AUDIT_REPAIR_TYPE.REBUILD_TEAM_SEARCH_INDEX &&
  clean(finding?.documentId) && clean(finding?.teamDocumentId) && clean(finding?.seasonKey)
)

const isOrphanPlayerSearchIndexFinding = finding => (
  clean(finding?.type) === 'unexpected_document' &&
  clean(finding?.entityType) === 'playerSearchIndex' &&
  clean(finding?.documentId) &&
  clean(finding?.teamDocumentId) &&
  clean(finding?.seasonKey)
)

// Each index is revalidated before deletion, so a roster restored after the
// audit always wins over the earlier finding.
export async function deleteOrphanPlayerSearchIndexesFromAuditFindings({ findings = [] } = {}) {
  const targets = [...new Map((Array.isArray(findings) ? findings : [])
    .filter(isOrphanPlayerSearchIndexFinding)
    .map(finding => [clean(finding.documentId), finding])).values()]
  const deletableRefs = []
  const skipped = []

  for (const finding of targets) {
    const indexRef = doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, clean(finding.documentId))
    const teamSeasonId = buildTeamSeasonDocumentId(clean(finding.teamDocumentId), clean(finding.seasonKey))
    const [indexSnapshot, teamSeasonSnapshot] = await Promise.all([
      getDoc(indexRef),
      getDoc(doc(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons, teamSeasonId)),
    ])
    if (!indexSnapshot.exists()) {
      skipped.push({ documentId: clean(finding.documentId), reason: 'INDEX_ALREADY_MISSING' })
      continue
    }
    const index = indexSnapshot.data() || {}
    if (clean(index.entityType) !== 'playerSeason' ||
      clean(index.birthTeamDocumentId || index.teamDocumentId || index.birthTeamId || index.teamId) !== clean(finding.teamDocumentId) ||
      clean(index.seasonKey || index.seasonId) !== clean(finding.seasonKey)) {
      skipped.push({ documentId: clean(finding.documentId), reason: 'INDEX_IDENTITY_CHANGED' })
      continue
    }
    const roster = teamSeasonSnapshot.exists() ? (teamSeasonSnapshot.data()?.teamPlayers || []) : []
    if (Array.isArray(roster) && roster.some(player => samePlayer(player, index))) {
      skipped.push({ documentId: clean(finding.documentId), reason: 'PLAYER_NOW_IN_ROSTER' })
      continue
    }
    deletableRefs.push(indexRef)
  }

  for (let offset = 0; offset < deletableRefs.length; offset += 450) {
    const batch = writeBatch(db)
    deletableRefs.slice(offset, offset + 450).forEach(ref => batch.delete(ref))
    await batch.commit()
  }
  return { totalCount: targets.length, deletedCount: deletableRefs.length, skipped }
}

const isOrphanTeamSearchIndexFinding = finding => (
  clean(finding?.type) === 'broken_relation' &&
  clean(finding?.entityType) === 'teamSearchIndex' &&
  clean(finding?.documentId) && clean(finding?.teamDocumentId) && clean(finding?.seasonKey)
)

const findLeagueSeasonContext = ({ leagues = [], leagueId = '', seasonKey = '' } = {}) => {
  const leagueRow = leagues.find(row => clean(row?.data?.leagueId || row?.id) === clean(leagueId))
  if (!leagueRow) return null
  const current = leagueRow.data?.current
  if (clean(current?.seasonKey || current?.seasonId) === clean(seasonKey)) {
    return { league: { ...(leagueRow.data || {}), id: leagueRow.id }, season: current, target: 'current' }
  }
  const historical = (Array.isArray(leagueRow.data?.history) ? leagueRow.data.history : [])
    .find(season => clean(season?.seasonKey || season?.seasonId) === clean(seasonKey))
  return historical ? {
    league: { ...(leagueRow.data || {}), id: leagueRow.id },
    season: { ...historical, seasonStatus: clean(historical?.seasonStatus) || 'completed' },
    target: 'history',
  } : null
}

// An index whose Team Season was cleared remains a valid League-only index.
// Resetting it removes only the stale teamSeasonDocumentId and team-derived
// fields; when its canonical League row is gone too, the existing reset helper
// safely removes the now-unusable derived index.
export async function resetOrphanTeamSearchIndexesFromAuditFindings({ findings = [] } = {}) {
  const targets = [...new Map((Array.isArray(findings) ? findings : [])
    .filter(isOrphanTeamSearchIndexFinding)
    .map(finding => [clean(finding.documentId), finding])).values()]
  const snapshot = await readPlayerDatabaseAuditSnapshot()
  const indexesById = new Map(snapshot.rows.searchIndexes.map(row => [row.id, row.data || {}]))
  const teamSeasonsById = new Map(snapshot.rows.teamSeasons.map(row => [row.id, row.data || {}]))
  const results = []
  const skipped = []

  for (const finding of targets) {
    const index = indexesById.get(clean(finding.documentId))
    if (!index || clean(index?.entityType) !== 'birthTeamSeason') {
      skipped.push({ documentId: clean(finding.documentId), reason: 'INDEX_MISSING_OR_CHANGED' })
      continue
    }
    const linkedSeasonId = clean(index?.teamSeasonDocumentId || finding?.relatedDocumentId)
    if (!linkedSeasonId || teamSeasonsById.has(linkedSeasonId)) {
      skipped.push({ documentId: clean(finding.documentId), reason: 'TEAM_SEASON_NOW_EXISTS' })
      continue
    }
    const leagueContext = findLeagueSeasonContext({
      leagues: snapshot.rows.leagues,
      leagueId: clean(index?.leagueId),
      seasonKey: clean(index?.seasonKey || index?.seasonId),
    })
    if (!leagueContext) {
      skipped.push({ documentId: clean(finding.documentId), reason: 'LEAGUE_SEASON_MISSING' })
      continue
    }
    results.push(await resetTeamSeasonSearchIndexToLeagueOnly({
      ...leagueContext,
      team: {
        ...index,
        teamId: clean(index?.birthTeamDocumentId || index?.teamDocumentId || index?.birthTeamId),
        birthTeamId: clean(index?.birthTeamDocumentId || index?.teamDocumentId || index?.birthTeamId),
        birthTeamDocumentId: clean(index?.birthTeamDocumentId || index?.teamDocumentId || index?.birthTeamId),
      },
    }))
  }
  return { totalCount: targets.length, repairedCount: results.length, results, skipped }
}

export async function repairPlayerSearchIndexesFromAuditFindings({ findings = [] } = {}) {
  const targets = [...new Map((Array.isArray(findings) ? findings : [])
    .filter(isPlayerSearchIndexScoutProfileFinding)
    .map(finding => [clean(finding.documentId), finding])).values()]
  const snapshot = await readPlayerDatabaseAuditSnapshot()
  const teamSeasons = new Map(snapshot.rows.teamSeasons.map(row => [row.id, { ...row.data, id: row.id }]))
  const teams = new Map(snapshot.rows.teams.map(row => [row.id, { ...row.data, id: row.id }]))
  const players = new Map(snapshot.rows.players.map(row => [row.id, { ...row.data, id: row.id }]))
  const indexes = new Map(snapshot.rows.searchIndexes.map(row => [row.id, { ...row.data, id: row.id }]))
  const results = []
  const failures = []

  for (const finding of targets) {
    try {
      const teamSeason = teamSeasons.get(clean(finding.relatedDocumentId))
      const teamDocument = teams.get(clean(finding.teamDocumentId))
      const playerSearchIndex = indexes.get(clean(finding.documentId))
      const playerDocument = players.get(clean(finding.playerDocumentId)) || {}
      const teamPlayer = (Array.isArray(teamSeason?.teamPlayers) ? teamSeason.teamPlayers : [])
        .find(player => samePlayer(player, { ...playerDocument, playerDocumentId: finding.playerDocumentId })) || null
      const issue = { code: PLAYER_DATA_ISSUE_CODE.PLAYER_SEARCH_INDEX_SCOUT_PROFILE_MISMATCH }
      const context = { teamSeason, teamDocument, teamPlayer, playerDocument, playerSearchIndex, selectedRow: { leagueId: teamSeason?.leagueId } }
      if (!canRepairPlayerDataIssue({ issue, context })) {
        throw new Error('מקור התיקון אינו זמין או שהאינדקס כבר מסונכרן')
      }
      results.push(await repairPlayerDataIssue({ issue, context }))
    } catch (error) {
      failures.push({ documentId: clean(finding.documentId), message: clean(error?.message) || 'תיקון אינדקס השחקן נכשל' })
    }
  }

  return { totalCount: targets.length, repairedCount: results.length, results, failures }
}

export const repairTeamSearchIndexesFromAuditFindings = ({ findings = [] } = {}) => (
  repairTeamSearchIndexLifecycleMany({ findings: (Array.isArray(findings) ? findings : []).filter(isTeamSearchIndexLifecycleFinding) })
)
