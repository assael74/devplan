// src/features/playersDatabase/services/auditV2/league/auditLeagueSeasonAbsent.js

import { readClearLeagueSources } from '../../writeV2/league/clear/readClearLeagueTeams.js'
import { resolveDeleteSeason, assertSeasonDependenciesAbsent, buildCanonicalLeaguesMasterPatch } from '../../../domain/leagueV2/deleteSeason/deleteLeagueSeason.builder.js'
import { sameValue } from '../../../domain/leagueV2/clear/leagueTeamsClearedState.builder.js'

const targets = ['league', 'teamSeasons', 'teamRoots', 'searchIndexes', 'identity', 'clubs', 'clubsMaster', 'leaguesMaster']

export const auditLeagueSeasonAbsent = async identity => {
  const findings = []
  const coveredTargets = []
  try {
    const sources = await readClearLeagueSources()
    const scope = resolveDeleteSeason(sources, identity)
    coveredTargets.push('league')
    if (scope.selected) findings.push({ type: 'unexpected_document', target: 'league', documentId: identity.leagueId, reason: 'העונה עדיין קיימת במסמך הליגה.' })
    assertSeasonDependenciesAbsent(sources, scope.identity)
    coveredTargets.push('teamSeasons', 'teamRoots', 'searchIndexes', 'identity', 'clubs', 'clubsMaster')
    // Expected comes exclusively from the freshly read canonical collection.
    const expected = buildCanonicalLeaguesMasterPatch(sources.leagues)
    if (!sources.leaguesMaster) {
      findings.push({ type: 'missing_document', target: 'leaguesMaster', documentId: 'all', reason: 'מרכז הליגות חסר.' })
    } else if (!Object.entries(expected).every(([field, value]) => sameValue(value, sources.leaguesMaster[field]))) {
      findings.push({ type: 'source_mismatch', target: 'leaguesMaster', documentId: 'all', reason: 'מרכז הליגות אינו תואם למסמכי הליגות.' })
    }
    coveredTargets.push('leaguesMaster')
  } catch (error) {
    findings.push({
      type: error.code === 'DELETE_SEASON_LEAGUE_MISSING' ? 'missing_document' : 'broken_relation',
      target: 'league', documentId: identity.leagueId,
      reason: error.code === 'DELETE_SEASON_LEAGUE_MISSING'
        ? 'מסמך הליגה חסר; זהות הליגה חייבת להישמר.'
        : 'לא ניתן להוכיח היעדר עונה: נותרו תלויות או נמצאה בעיית זהות או קריאה.',
    })
  }
  const uncoveredTargets = targets.filter(target => !coveredTargets.includes(target))
  const complete = uncoveredTargets.length === 0
  return {
    flowType: 'league', ...identity, expectedLifecycle: 'season_absent',
    result: !complete ? 'partial' : findings.length ? 'findings' : 'clean',
    coverage: { complete, coveredTargets, uncoveredTargets }, findings,
    summary: { findingsCount: findings.length },
  }
}
