import { AUDIT_REPAIR_TYPE, normalizeLegacyAuditRepairType } from '../../audit/audit.contract.js'
import { getTeamSeason } from '../../read/entities/teamSeason.js'
import { retryTeamSeasonMovementCounterparts } from '../../write/teams/index.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const movementFindingGroups = findings => {
  const groups = new Map()

  ;(Array.isArray(findings) ? findings : []).forEach(finding => {
    if (normalizeLegacyAuditRepairType(finding) !== AUDIT_REPAIR_TYPE.RETRY_MOVEMENT_COUNTERPART) return

    const birthTeamDocumentId = clean(finding?.teamDocumentId)
    const seasonKey = clean(finding?.seasonKey)
    const movementId = clean(finding?.relationKey || finding?.expected?.movementId)
    if (!birthTeamDocumentId || !seasonKey || !movementId) return

    const key = `${birthTeamDocumentId}__${seasonKey}`
    const group = groups.get(key) || {
      birthTeamDocumentId,
      seasonKey,
      movementIds: new Set(),
    }
    group.movementIds.add(movementId)
    groups.set(key, group)
  })

  return [...groups.values()]
}

// This repair retries only the local facts selected by audit findings, on both
// sides of a movement. It never builds a Team Season and leaves the local
// canonical fact untouched when its counterpart is absent or the retry fails.
export async function retryMovementCounterpartsFromAuditFindings({ findings = [] } = {}) {
  const groups = movementFindingGroups(findings)
  const results = []
  const skipped = []
  const failures = []

  for (const group of groups) {
    const teamSeason = await getTeamSeason({
      birthTeamDocumentId: group.birthTeamDocumentId,
      seasonKey: group.seasonKey,
    })
    if (!teamSeason) {
      skipped.push({ ...group, reason: 'LOCAL_TEAM_SEASON_MISSING' })
      continue
    }

    const transfersIn = (Array.isArray(teamSeason.transfersIn) ? teamSeason.transfersIn : [])
      .filter(incoming => group.movementIds.has(clean(incoming?.movementId)))
    const transfersOut = (Array.isArray(teamSeason.transfersOut) ? teamSeason.transfersOut : [])
      .filter(outgoing => group.movementIds.has(clean(outgoing?.movementId)))
    if (!transfersIn.length && !transfersOut.length) {
      skipped.push({ ...group, reason: 'MOVEMENT_ALREADY_CHANGED' })
      continue
    }

    const result = await retryTeamSeasonMovementCounterparts({
      teamSeason: { ...teamSeason, transfersIn, transfersOut },
    })
    results.push({ ...group, result })
    ;(Array.isArray(result?.results) ? result.results : [])
      .filter(item => clean(item?.status) === 'failed')
      .forEach(item => failures.push({
        ...group,
        movementId: clean(item?.movementId),
        message: clean(item?.message) || 'Counterpart reconciliation failed',
      }))
  }

  return {
    totalCount: groups.length,
    repairedCount: results.length,
    results,
    skipped,
    failures,
  }
}
