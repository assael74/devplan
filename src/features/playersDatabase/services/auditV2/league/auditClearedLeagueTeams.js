// src/features/playersDatabase/services/auditV2/league/auditClearedLeagueTeams.js

import { readClearLeagueSources } from '../../writeV2/league/clear/readClearLeagueTeams.js'
import { buildClearLeagueTeamsPlan, resolveClearLeagueScope } from '../../../domain/leagueV2/clear/clearLeagueTeamsPlan.builder.js'
import { sameValue, sameSeason } from '../../../domain/leagueV2/clear/leagueTeamsClearedState.builder.js'

const targets = ['league', 'teamSeasons', 'teamRoots', 'teamSearchIndexes', 'playerSearchIndexes', 'identity', 'clubs', 'clubsMaster', 'leaguesMaster']

export const auditLeagueWithoutTeams = async identity => {
  const findings = []
  let complete = false
  let coveredTargets = []
  try {
    const sources = await readClearLeagueSources()
    const scope = resolveClearLeagueScope(sources, identity)
    coveredTargets = ['league', 'teamSeasons', 'teamRoots', 'teamSearchIndexes', 'playerSearchIndexes']
    scope.seasons.forEach(row => findings.push({
      type: 'unexpected_document', target: 'teamSeason', documentId: row.docId, reason: 'נמצאה עונת קבוצה למרות שאין טבלת קבוצות טעונה בליגה.',
    }))
    scope.scopedIndexes.forEach(row => findings.push({
      type: 'unexpected_document', target: row.data.entityType === 'playerSeason' ? 'playerSearchIndex' : 'teamSearchIndex',
      documentId: row.docId, reason: 'אינדקס נשאר בתחום עונת הליגה.',
    }))
    // Current relations only, not historical membership in the former League table.
    sources.roots.filter(root => String(root.data.birthYear) === String(scope.identity.birthYear)).forEach(root => {
      ;(root.data.seasons || []).filter(row => sameSeason(row.seasonKey, scope.identity.seasonKey)).forEach(relation => {
        const season = sources.teamSeasons.find(row => row.docId === relation.seasonDocumentId)
        if (!season || season.data.birthTeamDocumentId !== root.docId || !sameSeason(season.data.seasonKey, relation.seasonKey)) {
          findings.push({ type: 'broken_relation', target: 'teamRoot', documentId: root.docId, reason: 'הפניית עונה אינה נפתחת לעונת הקבוצה המתאימה; שיוך היסטורי לליגה אינו מוכח.' })
        }
      })
    })
    const expected = buildClearLeagueTeamsPlan(sources, identity, new Date().toISOString())
    expected.operations.forEach(operation => {
      if (['team', 'teamIndex'].includes(operation.kind)) return
      if (operation.patch === null) {
        findings.push({ type: 'unexpected_document', target: operation.kind, documentId: operation.docId, reason: 'נשאר מסמך הקרנה ריק שאינו נדרש.' })
        return
      }
      Object.entries(operation.patch).forEach(([field, value]) => {
        if (!sameValue(operation.before[field], value)) {
          findings.push({ type: 'source_mismatch', target: operation.kind, documentId: operation.docId, field, reason: 'הנתונים אינם תואמים לעונת הליגה ללא קבוצות.' })
        }
      })
    })
    complete = true
    coveredTargets = targets
  } catch (error) {
    findings.push({ type: 'broken_relation', target: 'league', reason: 'לא ניתן להשלים את הביקורת: נדרשת השלמת ניקוי סגל או סטטיסטיקה, או בדיקת זהויות ומקורות.' })
  }
  return {
    flowType: 'league', ...identity,
    result: !complete ? 'partial' : findings.length ? 'findings' : 'clean',
    coverage: { complete, coveredTargets, uncoveredTargets: targets.filter(target => !coveredTargets.includes(target)) },
    findings,
    summary: { findingsCount: findings.length, expectedTeams: 0 },
  }
}
