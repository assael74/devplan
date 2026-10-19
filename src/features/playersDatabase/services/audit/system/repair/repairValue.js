// src/features/playersDatabase/services/audit/system/repair/repairValue.js

const normalize = value => {
  if (value === undefined || value === null) return null
  if (value instanceof Date) return { timestamp: value.getTime() }
  if (value && typeof value.toMillis === 'function') return { timestamp: value.toMillis() }
  if (Array.isArray(value)) return value.map(normalize)
  if (typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, normalize(value[key])]))
  }
  return value
}

export const serializeRepairValue = value => JSON.stringify(normalize(value))
export const sameRepairValue = (left, right) => serializeRepairValue(left) === serializeRepairValue(right)

export const getSystemAuditFindingKey = finding => serializeRepairValue([
  finding && finding.type,
  finding && finding.target,
  finding && finding.documentId,
  finding && finding.relatedDocumentId,
  finding && finding.title,
  finding && finding.playerId,
  finding && finding.teamId,
  finding && finding.leagueId,
  finding && finding.clubId,
  finding && finding.seasonId,
])

export const getSystemRepairPreviewKey = plan => serializeRepairValue({
  changes: plan.changes,
  guards: plan.guards || [],
  signalClubIds: plan.signalClubIds || [],
})
