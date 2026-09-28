// src/features/playersDatabase/services/auditV2/stats/clear/auditClearStatsV2.js

import { getTeamSeasonStatsState } from '../../../../domain/statsV2/teamSeasonStatsState.js'
import { resolveClearStatsPlayersCount } from '../../../../domain/statsV2/clearStatsProjectionPlan.builder.js'

const normalize = value => {
  if (Array.isArray(value)) return value.map(normalize)
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = normalize(value[key])
      return result
    }, {})
  }
  return value
}

const sameValue = (left, right) => JSON.stringify(normalize(left)) === JSON.stringify(normalize(right))
const clean = value => String(value === undefined || value === null ? '' : value).trim()

const check = ({ checks, targetType, docId, name, passed, reason }) => {
  checks.push({
    targetType,
    docId,
    check: name,
    status: passed ? 'passed' : 'failed',
    reason: passed ? null : reason,
  })
}

const auditOperation = ({ checks, targetType, operation, actual }) => {
  if (!operation) return

  const docId = String(operation.target?.docId || '')
  const expectedFields = operation.setFields || {}

  if (operation.action === 'skip' && Object.keys(expectedFields).length === 0) return

  check({
    checks,
    targetType,
    docId,
    name: 'target_exists',
    passed: Boolean(actual),
    reason: 'Projection target is missing',
  })

  if (!actual) return

  Object.entries(expectedFields).forEach(([field, expected]) => {
    check({
      checks,
      targetType,
      docId,
      name: `setFields.${field}`,
      passed: sameValue(actual[field], expected),
      reason: `Approved field ${field} does not match actual state`,
    })
  })
}

export function auditClearStatsV2({ approvedState, actualState } = {}) {
  const checks = []
  const identity = approvedState?.identity || {}
  const teamSeason = actualState?.teamSeason || null

  check({
    checks,
    targetType: 'teamSeason',
    docId: actualState?.teamSeasonDocumentId || '',
    name: 'canonical_stats_absent',
    passed: Boolean(teamSeason) && getTeamSeasonStatsState(teamSeason) === 'absent',
    reason: 'Canonical Team Season is not in canonical Stats absence state',
  })

  if (teamSeason) {
    const preview = approvedState?.finalTeamSeasonPreview || {}
    const canonicalFields = [
      'teamPlayers',
      'scoutProfilesSummary',
      'statsLoadState',
      'teamBalance',
      'transfersIn',
      'transfersOut',
      'pendingPlayers',
      'movement',
      'rosterStatus',
      'performance',
      'teamStats',
      'tableRank',
      'tableAttackRank',
      'tableDefenseRank',
      'goalsForPerGame',
      'goalsAgainstPerGame',
    ]

    canonicalFields
      .filter(field => Object.prototype.hasOwnProperty.call(preview, field))
      .forEach(field => check({
        checks,
        targetType: 'teamSeason',
        docId: actualState?.teamSeasonDocumentId || '',
        name: `canonical.${field}`,
        passed: sameValue(teamSeason[field], preview[field]),
        reason: `Canonical field ${field} changed or does not match the approved preview`,
      }))
  }

  const plan = approvedState?.projectionPlan || {}
  const actual = actualState?.projections || {}

  ;(plan.playerDocumentOperations || []).forEach(operation => auditOperation({
    checks,
    targetType: 'playerDocument',
    operation,
    actual: actual.playerDocumentsById?.[operation.target.docId] || null,
  }))
  ;(plan.playerSearchIndexOperations || []).forEach(operation => auditOperation({
    checks,
    targetType: 'playerSearchIndex',
    operation,
    actual: actual.playerSearchIndexesById?.[operation.target.docId] || null,
  }))

  ;(plan.playerSearchIndexOperations || []).forEach(operation => {
    const playerIndex = actual.playerSearchIndexesById?.[operation.target.docId] || null
    if (!playerIndex) return

    const preview = approvedState?.finalTeamSeasonPreview || {}
    const playerDocumentId = clean(playerIndex.playerDocumentId)
    const expectedSourceCollection = playerDocumentId
      ? 'players'
      : 'birthTeamSeasons'
    const expectedSourceDocumentId = playerDocumentId || clean(actualState?.teamSeasonDocumentId)
    const expectedSourceTarget = clean(preview.seasonStatus).toLowerCase() === 'completed'
      ? 'history'
      : 'current'
    const playerDocument = playerDocumentId
      ? actual.playerDocumentsById?.[playerDocumentId] || null
      : null
    const sourceRows = playerDocument
      ? (Array.isArray(playerDocument[expectedSourceTarget])
          ? playerDocument[expectedSourceTarget]
          : [])
      : []
    const sourceRowExists = !playerDocumentId || sourceRows.some(row => (
      clean(row?.seasonKey) === clean(identity.seasonKey) &&
      clean(row?.birthTeamDocumentId || row?.birthTeamId) ===
        clean(identity.birthTeamDocumentId)
    ))

    ;[
      ['canonical.seasonStatus', playerIndex.seasonStatus, preview.seasonStatus, 'Player SearchIndex seasonStatus does not match the Canonical Team Season'],
      ['canonical.sourceCollection', playerIndex.sourceCollection, expectedSourceCollection, 'Player SearchIndex source collection is invalid'],
      ['canonical.sourceDocumentId', playerIndex.sourceDocumentId, expectedSourceDocumentId, 'Player SearchIndex does not point to its Canonical source document'],
      ['canonical.sourceTarget', playerIndex.sourceTarget, expectedSourceTarget, 'Player SearchIndex does not point to the correct Canonical season target'],
    ].forEach(([name, value, expected, reason]) => check({
      checks,
      targetType: 'playerSearchIndex',
      docId: operation.target?.docId || '',
      name,
      passed: sameValue(value, expected),
      reason,
    }))

    check({
      checks,
      targetType: 'playerSearchIndex',
      docId: operation.target?.docId || '',
      name: 'canonical.sourceRow',
      passed: sourceRowExists,
      reason: 'Player SearchIndex source season row was not found in the Canonical Player Document',
    })
  })

  auditOperation({ checks, targetType: 'teamSearchIndex', operation: plan.teamSearchIndexOperation, actual: actual.teamSearchIndex })

  if (plan.teamSearchIndexOperation && actual.teamSearchIndex) {
    const preview = approvedState?.finalTeamSeasonPreview || {}

    check({
      checks,
      targetType: 'teamSearchIndex',
      docId: plan.teamSearchIndexOperation.target?.docId || '',
      name: 'canonical.teamSeasonDocumentId',
      passed: sameValue(
        actual.teamSearchIndex.teamSeasonDocumentId,
        actualState?.teamSeasonDocumentId
      ),
      reason: 'Team SearchIndex does not point to the Canonical Team Season',
    })
    check({
      checks,
      targetType: 'teamSearchIndex',
      docId: plan.teamSearchIndexOperation.target?.docId || '',
      name: 'canonical.playersCount',
      passed: sameValue(
        actual.teamSearchIndex.playersCount,
        resolveClearStatsPlayersCount(preview)
      ),
      reason: 'Team SearchIndex playersCount does not match the Canonical roster count',
    })
    check({
      checks,
      targetType: 'teamSearchIndex',
      docId: plan.teamSearchIndexOperation.target?.docId || '',
      name: 'canonical.scoutProfilesSummary',
      passed: sameValue(
        actual.teamSearchIndex.scoutProfilesSummary,
        preview.scoutProfilesSummary
      ),
      reason: 'Team SearchIndex scouting summary does not match the Canonical Team Season',
    })
  }

  auditOperation({ checks, targetType: 'league', operation: plan.leagueOperation, actual: actual.league })
  ;(plan.clubOperations || []).forEach(operation => auditOperation({
    checks,
    targetType: 'club',
    operation,
    actual: actual.clubsById?.[operation.target.docId] || null,
  }))
  auditOperation({ checks, targetType: 'clubsMaster', operation: plan.clubsMasterOperation, actual: actual.clubsMaster })

  const failuresCount = checks.filter(item => item.status === 'failed').length

  return {
    auditType: 'clearStatsAudit',
    auditVersion: 1,
    status: failuresCount === 0 ? 'passed' : 'failed',
    identity,
    checksCount: checks.length,
    failuresCount,
    checks,
  }
}
