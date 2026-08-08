// features/playersDatabase/services/audit/playerScout.repair.js

import {
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { buildPlayerScoutAudit } from './playerScout.audit.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const getSeasonKey = row => clean(row.seasonKey || row.seasonId)
const getTeamId = row => clean(row.birthTeamId || row.teamId)
const getPlayerId = row => clean(
  row.playerDocumentId || row.playerId || row.externalPlayerId
)

const buildKey = row => [
  getPlayerId(row),
  getSeasonKey(row),
  getTeamId(row),
].filter(Boolean).join('::')

const sameScope = ({ row, seasonKey, teamId }) => (
  getSeasonKey(row) === seasonKey &&
  getTeamId(row) === teamId
)

const cloneRows = rows => (
  Array.isArray(rows) ? rows.map(row => ({ ...row })) : []
)

const buildRepairActions = ({ audit, rows }) => {
  const teamByKey = new Map(rows.teamRows.map(row => [buildKey(row), row]))
  const playerByKey = new Map(rows.playerRows.map(row => [buildKey(row), row]))

  return audit.issues
    .filter(issue => issue.type === 'team_player_profile_mismatch')
    .map(issue => {
      const teamRow = teamByKey.get(issue.key)
      const playerRow = playerByKey.get(issue.key)

      if (!teamRow || !playerRow) return null

      return {
        key: issue.key,
        playerDocumentId: clean(playerRow.sourceDocumentId),
        playerId: clean(playerRow.playerId),
        fullName: clean(teamRow.fullName || playerRow.fullName),
        sourceTarget: clean(playerRow.sourceTarget),
        seasonId: clean(teamRow.seasonId),
        seasonKey: getSeasonKey(teamRow),
        birthTeamId: getTeamId(teamRow),
        scoutProfiles: Array.isArray(teamRow.scoutProfiles)
          ? teamRow.scoutProfiles
          : [],
        scoutCombinations: Array.isArray(teamRow.scoutCombinations)
          ? teamRow.scoutCombinations
          : [],
      }
    })
    .filter(action => action?.playerDocumentId)
}

export async function buildPlayerScoutRepairPreview() {
  const audit = await buildPlayerScoutAudit()
  const actions = buildRepairActions({
    audit,
    rows: audit,
  })

  return {
    generatedAt: new Date().toISOString(),
    mode: 'preview',
    sourceOfTruth: PLAYERS_DATABASE_COLLECTIONS.teams,
    targetCollection: PLAYERS_DATABASE_COLLECTIONS.players,
    totalAuditIssues: audit.summary.totalIssues,
    repairableCount: actions.length,
    actions,
  }
}

const applyAction = async action => {
  const ref = doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.players,
    action.playerDocumentId
  )

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)

    if (!snapshot.exists()) {
      return {
        ...action,
        repaired: false,
        reason: 'playerDocumentMissing',
      }
    }

    const data = snapshot.data() || {}
    const target = action.sourceTarget === 'current' ? 'current' : 'history'
    const rows = cloneRows(data[target])
    const rowIndex = rows.findIndex(row => sameScope({
      row,
      seasonKey: action.seasonKey,
      teamId: action.birthTeamId,
    }))

    if (rowIndex === -1) {
      return {
        ...action,
        repaired: false,
        reason: 'playerSeasonMissing',
      }
    }

    rows[rowIndex] = {
      ...rows[rowIndex],
      scoutSignals: action.scoutProfiles,
      scoutProfiles: action.scoutProfiles,
      scoutCombinations: action.scoutCombinations,
    }

    transaction.set(
      ref,
      {
        [target]: rows,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return {
      ...action,
      repaired: true,
      profilesCount: action.scoutProfiles.length,
      combinationsCount: action.scoutCombinations.length,
    }
  })
}

export async function applyPlayerScoutRepair({ confirmed = false } = {}) {
  if (!confirmed) {
    throw new Error('Player scout repair requires explicit confirmation')
  }

  const preview = await buildPlayerScoutRepairPreview()
  const results = []

  for (const action of preview.actions) {
    results.push(await applyAction(action))
  }

  return {
    generatedAt: new Date().toISOString(),
    mode: 'apply',
    requestedCount: preview.actions.length,
    repairedCount: results.filter(result => result.repaired).length,
    skippedCount: results.filter(result => !result.repaired).length,
    results,
  }
}
