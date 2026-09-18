import { buildAuditFinding, AUDIT_FINDING_TYPE, AUDIT_REPAIR_TYPE } from '../audit.contract.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const teamIdOf = row => clean(row?.birthTeamDocumentId || row?.teamDocumentId)
const seasonKeyOf = row => clean(row?.seasonKey || row?.seasonId)
const playerIdOf = row => clean(row?.playerId)

const duplicateIds = rows => {
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

const appendDuplicateFindings = ({ rows, side, context, findings }) => {
  duplicateIds(rows).forEach(movementId => {
    findings.push(buildAuditFinding({
      type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
      entityType: 'teamSeasonMovement',
      documentId: context.id,
      teamDocumentId: context.teamId,
      seasonKey: context.seasonKey,
      relationKey: movementId,
      title: 'Movement כפול בעונת הקבוצה',
      explanation: `אותו movementId מופיע יותר מפעם אחת ב-${side}.`,
      source: 'Team Season Movement canonical state',
      actual: { movementId, side },
    }))
  })
}

const appendPendingFindings = ({ season, context, findings }) => {
  const rosterPlayerIds = new Set(
    (Array.isArray(season.teamPlayers) ? season.teamPlayers : [])
      .map(playerIdOf)
      .filter(Boolean)
  )

  ;(Array.isArray(season.pendingPlayers) ? season.pendingPlayers : []).forEach(pending => {
    const playerId = playerIdOf(pending)
    if (!playerId || !rosterPlayerIds.has(playerId)) return

    findings.push(buildAuditFinding({
      type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
      entityType: 'teamSeasonMovement',
      documentId: context.id,
      teamDocumentId: context.teamId,
      playerId,
      seasonKey: context.seasonKey,
      relationKey: clean(pending.pendingId) || playerId,
      title: 'Pending פתוח לשחקן שנמצא בסגל',
      explanation: 'pendingPlayers מכיל רק היעדרויות פתוחות. שחקן שנמצא שוב ב-teamPlayers אינו יכול להישאר Pending.',
      source: 'Team Season teamPlayers ↔ pendingPlayers',
    }))
  })
}

const findCounterpartSeason = ({ teamSeasons, sourceTeamId, seasonKey }) => (
  (Array.isArray(teamSeasons) ? teamSeasons : []).find(row => (
    teamIdOf(row.data) === sourceTeamId &&
    seasonKeyOf(row.data) === seasonKey
  ))
)

const appendCounterpartFindings = ({ season, teamSeasons, context, findings }) => {
  ;(Array.isArray(season.transfersIn) ? season.transfersIn : []).forEach(incoming => {
    const movementId = clean(incoming?.movementId)
    const sourceTeamId = clean(incoming?.fromBirthTeamDocumentId)
    if (!movementId || !sourceTeamId) return

    const counterpartSeason = findCounterpartSeason({
      teamSeasons,
      sourceTeamId,
      seasonKey: context.seasonKey,
    })
    if (!counterpartSeason) return

    const counterpartExists = (Array.isArray(counterpartSeason.data?.transfersOut)
      ? counterpartSeason.data.transfersOut
      : [])
      .some(outgoing => clean(outgoing?.movementId) === movementId)
    if (counterpartExists) return

    findings.push(buildAuditFinding({
      type: AUDIT_FINDING_TYPE.BROKEN_RELATION,
      entityType: 'teamSeasonMovementCounterpart',
      documentId: context.id,
      relatedDocumentId: counterpartSeason.id,
      teamDocumentId: context.teamId,
      playerId: playerIdOf(incoming),
      seasonKey: context.seasonKey,
      relationKey: movementId,
      title: 'חסר counterpart ל-Movement',
      explanation: 'ה-Movement המקומי תקין, אך Team Season של קבוצת המקור קיים ואינו מכיל את ה-transfersOut המשלים. זהו reconciliation חסר ולא כשל באמת המקומית.',
      source: 'Team Season transfersIn ↔ existing source Team Season transfersOut',
      repairType: AUDIT_REPAIR_TYPE.RETRY_MOVEMENT_COUNTERPART,
      expected: {
        movementId,
        sourceBirthTeamDocumentId: sourceTeamId,
      },
      actual: null,
      severity: 'low',
    }))
  })

  ;(Array.isArray(season.transfersOut) ? season.transfersOut : []).forEach(outgoing => {
    const movementId = clean(outgoing?.movementId)
    const targetTeamId = clean(outgoing?.toBirthTeamDocumentId)
    if (!movementId || !targetTeamId) return

    const counterpartSeason = findCounterpartSeason({
      teamSeasons,
      sourceTeamId: targetTeamId,
      seasonKey: context.seasonKey,
    })
    if (!counterpartSeason) return

    const counterpartExists = (Array.isArray(counterpartSeason.data?.transfersIn)
      ? counterpartSeason.data.transfersIn
      : [])
      .some(incoming => clean(incoming?.movementId) === movementId)
    if (counterpartExists) return

    findings.push(buildAuditFinding({
      type: AUDIT_FINDING_TYPE.BROKEN_RELATION,
      entityType: 'teamSeasonMovementCounterpart',
      documentId: context.id,
      relatedDocumentId: counterpartSeason.id,
      teamDocumentId: context.teamId,
      playerId: playerIdOf(outgoing),
      seasonKey: context.seasonKey,
      relationKey: movementId,
      title: 'חסר counterpart ל-Movement',
      explanation: 'ה-Movement המקומי תקין, אך Team Season של קבוצת היעד קיים ואינו מכיל את ה-transfersIn המשלים.',
      source: 'Team Season transfersOut ↔ existing target Team Season transfersIn',
      repairType: AUDIT_REPAIR_TYPE.RETRY_MOVEMENT_COUNTERPART,
      expected: { movementId, targetBirthTeamDocumentId: targetTeamId },
      actual: null,
      severity: 'low',
    }))
  })
}

export function appendTeamSeasonMovementAuditFindings({
  id,
  season,
  teamId,
  seasonKey,
  teamSeasons,
  findings,
}) {
  const context = { id, teamId, seasonKey }

  appendDuplicateFindings({
    rows: season.transfersIn,
    side: 'transfersIn',
    context,
    findings,
  })
  appendDuplicateFindings({
    rows: season.transfersOut,
    side: 'transfersOut',
    context,
    findings,
  })
  appendPendingFindings({ season, context, findings })
  appendCounterpartFindings({
    season,
    teamSeasons,
    context,
    findings,
  })
}
