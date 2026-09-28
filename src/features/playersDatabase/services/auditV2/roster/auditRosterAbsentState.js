// src/features/playersDatabase/services/auditV2/roster/auditRosterAbsentState.js

import { readClearRosterSources } from '../../writeV2/roster/clear/readClearRoster.js'
import { buildClearRosterPlan, sameClearRosterValue } from '../../../domain/rosterV2/clear/clearRosterPlan.builder.js'
import { getTeamSeasonRosterState } from '../../../domain/rosterV2/clear/rosterAbsent.builder.js'

const get = (value, path) => path.reduce((current, field) => current?.[field], value)

// Read-only branch of Roster Audit. Never consumes an old Approved State.
export async function auditRosterAbsentState(target) {
  const findings = []
  let coveredTargets = []
  try {
    const sources = await readClearRosterSources(target)
    const expected = buildClearRosterPlan(sources)
    coveredTargets = ['teamSeason', 'playerIndex', 'teamSearchIndex', 'league', 'club', 'clubsMaster', 'leaguesMaster']
    if (getTeamSeasonRosterState(sources.teamSeason) !== 'absent') {
      findings.push({ type: 'source_mismatch', target: 'teamSeason', reason: 'מצב הסגל אינו ריק.' })
    }
    expected.operations.forEach(operation => {
      operation.changes.forEach(change => {
        if (!sameClearRosterValue(get(operation.source, change.path), change.value)) {
          findings.push({
            type: 'source_mismatch', target: operation.kind, documentId: operation.docId,
            reason: 'נתוני הסגל אינם תואמים למקור הקנוני.', field: change.path.join('.'),
          })
        }
      })
    })
    expected.deletions.forEach(operation => findings.push({
      type: 'unexpected_document', target: 'playerIndex', documentId: operation.docId,
      reason: 'אינדקס שחקן נשאר לאחר הסרת הסגל.',
    }))
  } catch (error) {
    return {
      flowType: 'roster', result: 'partial',
      coverage: { complete: false, coveredTargets, uncoveredTargets: ['rosterAbsence'] },
      findings: [{ type: 'broken_relation', target: 'roster', reason: 'לא ניתן להשלים את הביקורת: חסר מקור או קיימת סתירה בזהות או בתנאי הקדם.' }],
      summary: { findingsCount: 1 },
    }
  }
  return {
    flowType: 'roster', result: findings.length ? 'findings' : 'clean',
    coverage: { complete: true, coveredTargets, uncoveredTargets: [] },
    findings, summary: { findingsCount: findings.length },
  }
}
