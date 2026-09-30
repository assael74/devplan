// src/features/playersDatabase/services/auditV2/system/structural/movementValidation.js

import { cleanValue } from '../../../../model/shared/value.model.js'
import { buildStructuralAuditFindingV2 } from './contract.js'

const clean = cleanValue

const playerIdOf = row => clean(row?.playerId)

const duplicateMovementIds = rows => {
  const seen = new Set()
  const duplicates = new Set()

  ;(Array.isArray(rows) ? rows : []).forEach(row => {
    const movementId = clean(row?.movementId)
    if (!movementId) return
    if (seen.has(movementId)) duplicates.add(movementId)
    seen.add(movementId)
  })

  return [...duplicates]
}

const appendDuplicateMovementFindings = ({
  rows,
  side,
  context,
  findings,
}) => {
  duplicateMovementIds(rows).forEach(movementId => {
    findings.push(buildStructuralAuditFindingV2({
      type: 'invalid_canonical_state',
      target: 'movement',
      documentId: context.documentId,
      teamId: context.teamId,
      seasonKey: context.seasonKey,
      relationKey: movementId,
      title: 'Movement כפול בעונת הקבוצה',
      reason: `אותו movementId מופיע יותר מפעם אחת ב-${side}.`,
      actual: { movementId, side },
    }))
  })
}

export function validateTeamSeasonMovementV2({
  documentId = '',
  teamSeason = {},
} = {}) {
  const findings = []
  const teamId = clean(
    teamSeason?.birthTeamDocumentId ||
    teamSeason?.birthTeamId
  )
  const seasonKey = clean(teamSeason?.seasonKey || teamSeason?.seasonId)
  const context = { documentId: clean(documentId), teamId, seasonKey }

  appendDuplicateMovementFindings({
    rows: teamSeason?.transfersIn,
    side: 'transfersIn',
    context,
    findings,
  })
  appendDuplicateMovementFindings({
    rows: teamSeason?.transfersOut,
    side: 'transfersOut',
    context,
    findings,
  })

  const rosterPlayerIds = new Set(
    (Array.isArray(teamSeason?.teamPlayers) ? teamSeason.teamPlayers : [])
      .map(playerIdOf)
      .filter(Boolean)
  )

  ;(Array.isArray(teamSeason?.pendingPlayers) ? teamSeason.pendingPlayers : [])
    .forEach(pending => {
      const playerId = playerIdOf(pending)
      if (!playerId || !rosterPlayerIds.has(playerId)) return

      findings.push(buildStructuralAuditFindingV2({
        type: 'invalid_canonical_state',
        target: 'movement',
        documentId: context.documentId,
        teamId,
        seasonKey,
        playerId,
        relationKey: clean(pending?.pendingId) || playerId,
        title: 'Pending פתוח לשחקן שנמצא בסגל',
        reason: 'שחקן שקיים ב-teamPlayers לא יכול להישאר גם ב-pendingPlayers.',
      }))
    })

  return findings
}
