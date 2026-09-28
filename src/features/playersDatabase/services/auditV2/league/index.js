// src/features/playersDatabase/services/auditV2/league/index.js

import {
  LEAGUE_AUDIT_V2_ALL_TARGETS,
  LEAGUE_AUDIT_V2_RESULT,
} from './contract.js'
import { auditLeagueSeasonAbsent } from './auditLeagueSeasonAbsent.js'
import { readLeagueCanonicalV2 } from './readCanonical.js'
import { buildExpectedLeagueAuditV2 } from './buildExpected.js'
import { readActualLeagueAuditV2 } from './readActual.js'
import { compareLeagueAuditV2 } from './compare.js'
import { auditLeagueWithoutTeams } from './auditClearedLeagueTeams.js'
import { getLeagueTeamsState } from '../../../domain/leagueV2/clear/leagueTeamsClearedState.builder.js'

export async function auditLeagueV2({ leagueId = '', seasonKey = '', expectedLifecycle = '' } = {}) {
  if (expectedLifecycle === 'season_absent') return auditLeagueSeasonAbsent({ leagueId, seasonKey })
  if (expectedLifecycle) throw new Error('Unsupported expected League lifecycle')
  const canonical = await readLeagueCanonicalV2({ leagueId, seasonKey })
  // Both a newly created season and a cleared season have no loaded table.
  // This branch audits current absence; it does not infer a Clear action.
  if (getLeagueTeamsState(canonical.season) === 'absent') {
    return auditLeagueWithoutTeams({ leagueId, seasonKey })
  }
  const expected = buildExpectedLeagueAuditV2({ canonical })
  const actual = await readActualLeagueAuditV2({ expected, leagueId, seasonKey })
  const findings = compareLeagueAuditV2({ expected, actual, leagueId, seasonKey })
  const coveredTargets = [...LEAGUE_AUDIT_V2_ALL_TARGETS]
  const uncoveredTargets = []
  const complete = uncoveredTargets.length === 0

  return {
    flowType: 'league',
    leagueId,
    seasonKey,
    result: complete
      ? findings.length ? LEAGUE_AUDIT_V2_RESULT.FINDINGS : LEAGUE_AUDIT_V2_RESULT.CLEAN
      : LEAGUE_AUDIT_V2_RESULT.PARTIAL,
    coverage: {
      complete,
      coveredTargets,
      uncoveredTargets,
    },
    findings,
    summary: {
      expectedTeams: expected.teams.length,
      checkedTeamRoots: actual.teamRoots.length,
      checkedTeamSeasons: actual.teamSeasons.length,
      expectedTeamSearchIndexes: expected.teamSearchIndexes.length,
      checkedTeamSearchIndexes: actual.teamSearchIndexes.length,
      expectedClubProjections: expected.clubs.length,
      checkedClubDocuments: actual.clubs.length,
      identityEntries: expected.identity.entries.length,
      findingsCount: findings.length,
    },
  }
}
