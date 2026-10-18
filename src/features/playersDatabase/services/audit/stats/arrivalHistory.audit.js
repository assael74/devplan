// src/features/playersDatabase/services/audit/stats/arrivalHistory.audit.js

import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDocFromServer } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { arrivalSourceDocumentId, buildArrivalHistory } from '../../../domain/movement/arrivalHistory.projection.js'
import { sameStatsAuditValue } from './compare.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {}

export const readArrivalHistorySources = async (teamSeason, scopedPlayerIds = []) => {
  const movement = object(teamSeason && teamSeason.movement)
  const facts = object(movement.transfersInById)
  const seasonId = object(teamSeason && teamSeason.identity).seasonId
  const documentIds = [...new Set(Object.keys(object(movement.arrivalHistoryById))
    .filter(movementId => !scopedPlayerIds.length || scopedPlayerIds.includes(clean(object(facts[movementId]).playerId)))
    .map(movementId => arrivalSourceDocumentId({
      teamId: object(facts[movementId]).fromTeamId,
      seasonId,
    }))
    .filter(Boolean))]
  const rows = await Promise.all(documentIds.map(async documentId => {
    const snapshot = await trackedGetDocFromServer(
      doc(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons, documentId),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
        action: 'audit-arrival-history-source',
        operationSubtype: 'audit-getDoc',
      }
    )
    return [documentId, snapshot.exists() ? snapshot.data() : null]
  }))
  return Object.fromEntries(rows)
}

export const compareArrivalHistory = ({ teamSeason, sourcesById = {}, scopedPlayerIds = [] }) => {
  const movement = object(teamSeason && teamSeason.movement)
  const histories = object(movement.arrivalHistoryById)
  const facts = object(movement.transfersInById)
  const identity = object(teamSeason && teamSeason.identity)
  const findings = []
  Object.entries(histories).forEach(([movementId, history]) => {
    const fact = facts[movementId]
    if (!fact || (scopedPlayerIds.length && !scopedPlayerIds.includes(clean(fact.playerId)))) return
    const sourceId = arrivalSourceDocumentId({ teamId: fact.fromTeamId, seasonId: identity.seasonId })
    const source = sourcesById[sourceId]
    if (!source) return
    const expected = buildArrivalHistory({
      movementId,
      playerId: fact.playerId,
      fromTeamId: fact.fromTeamId,
      seasonId: identity.seasonId,
      sourceTeamSeason: source,
      updatedAt: history.updatedAt,
    })
    if (sameStatsAuditValue(expected, history)) return
    findings.push({
      type: 'projection_mismatch',
      target: 'arrivalHistory',
      documentId: identity.teamSeasonDocumentId,
      field: `movement.arrivalHistoryById.${movementId}`,
      expected,
      actual: history,
    })
  })
  return findings
}
