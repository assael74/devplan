import {
  ROSTER_AUDIT_V2_COVERED_TARGETS,
  ROSTER_AUDIT_V2_RESULT,
  ROSTER_AUDIT_V2_UNCOVERED_TARGETS,
} from './contract.js'
import { readRosterCanonicalV2 } from './readCanonical.js'
import { buildExpectedRosterAuditV2 } from './buildExpected.js'
import { readActualRosterAuditV2 } from './readActual.js'
import { compareRosterAuditV2 } from './compare.js'
import { buildExpectedRosterCounterpartsV2 } from './buildExpectedCounterparts.js'
import { readActualRosterCounterpartsV2 } from './readActualCounterparts.js'
import { compareRosterCounterpartsV2 } from './compareCounterparts.js'
import { buildExpectedRosterLeaguesMasterV2 } from './buildExpectedLeaguesMaster.js'
import { readActualRosterLeaguesMasterV2 } from './readActualLeaguesMaster.js'
import { compareRosterLeaguesMasterV2 } from './compareLeaguesMaster.js'
import { buildExpectedRosterClubsV2 } from './buildExpectedClubs.js'
import { readActualRosterClubsV2 } from './readActualClubs.js'
import { compareRosterClubsV2 } from './compareClubs.js'

export async function auditRosterV2({
  birthTeamDocumentId = '',
  seasonKey = '',
} = {}) {
  const canonical = await readRosterCanonicalV2({
    birthTeamDocumentId,
    seasonKey,
  })
  const expected = buildExpectedRosterAuditV2({ canonical })
  const expectedCounterparts = buildExpectedRosterCounterpartsV2({ canonical })
  const expectedLeaguesMaster = buildExpectedRosterLeaguesMasterV2({ canonical })
  const [actual, actualCounterparts, actualLeaguesMaster] = await Promise.all([
    readActualRosterAuditV2({ expected, canonical }),
    readActualRosterCounterpartsV2({ expectedCounterparts }),
    readActualRosterLeaguesMasterV2(),
  ])
  const expectedClubs = buildExpectedRosterClubsV2({
    canonical,
    counterpartCanonical: actualCounterparts,
    expectedCounterparts,
  })
  const actualClubs = await readActualRosterClubsV2({ expectedClubs })
  const clubComparison = compareRosterClubsV2({
    expectedClubs,
    actual: actualClubs,
  })
  const findings = [
    ...compareRosterAuditV2({ expected, actual }),
    ...compareRosterCounterpartsV2({
      expectedCounterparts,
      actualCounterparts,
    }),
    ...compareRosterLeaguesMasterV2({
      expected: expectedLeaguesMaster,
      actual: actualLeaguesMaster,
    }),
    ...clubComparison.clubFindings,
    ...clubComparison.masterFindings,
  ]
  const coveredTargets = [...ROSTER_AUDIT_V2_COVERED_TARGETS]
  const uncoveredTargets = [...ROSTER_AUDIT_V2_UNCOVERED_TARGETS]
  const complete = uncoveredTargets.length === 0

  return {
    flowType: 'roster',
    birthTeamDocumentId: canonical.birthTeamDocumentId,
    seasonKey: canonical.seasonKey,
    result: complete
      ? findings.length
        ? ROSTER_AUDIT_V2_RESULT.FINDINGS
        : ROSTER_AUDIT_V2_RESULT.CLEAN
      : ROSTER_AUDIT_V2_RESULT.PARTIAL,
    coverage: {
      complete,
      coveredTargets,
      uncoveredTargets,
    },
    findings,
    summary: {
      expectedPlayerSearchIndexes: expected.playerSearchIndexes.length,
      checkedPlayerSearchIndexes: actual.playerSearchIndexes.length,
      checkedTeamSearchIndex: actual.teamSearchIndex ? 1 : 0,
      checkedLeagueRosterMetadata: actual.league ? 1 : 0,
      expectedCounterparts: expectedCounterparts.length,
      checkedCounterpartTeamSeasons: actualCounterparts.filter(
        row => row.teamSeason
      ).length,
      checkedLeaguesMaster: actualLeaguesMaster ? 1 : 0,
      expectedClubs: expectedClubs.length,
      checkedClubs: actualClubs.clubs.length,
      checkedClubsMaster: actualClubs.clubsMaster ? 1 : 0,
      findingsCount: findings.length,
    },
  }
}
