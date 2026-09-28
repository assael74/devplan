import {
  STATS_AUDIT_V2_COVERED_TARGETS,
  STATS_AUDIT_V2_RESULT,
  STATS_AUDIT_V2_UNCOVERED_TARGETS,
} from './contract.js'
import {
  readStatsCanonicalV2,
} from './readCanonical.js'
import {
  buildExpectedStatsCounterpartsV2,
} from './buildExpectedCounterparts.js'
import {
  readActualStatsCounterpartsV2,
} from './readActualCounterparts.js'
import {
  compareStatsCounterpartsV2,
} from './compareCounterparts.js'
import {
  buildExpectedStatsPlayerDocumentsV2,
} from './buildExpectedPlayerDocuments.js'
import {
  readActualStatsPlayerDocumentsV2,
} from './readActualPlayerDocuments.js'
import {
  compareStatsPlayerDocumentsV2,
} from './comparePlayerDocuments.js'
import {
  buildExpectedStatsProjectionsV2,
} from './buildExpectedProjections.js'
import {
  readActualStatsProjectionsV2,
} from './readActualProjections.js'
import {
  compareStatsProjectionsV2,
} from './compareProjections.js'
import {
  buildExpectedStatsLeaguesMasterV2,
} from './buildExpectedLeaguesMaster.js'
import {
  readActualStatsLeaguesMasterV2,
} from './readActualLeaguesMaster.js'
import {
  compareStatsLeaguesMasterV2,
} from './compareLeaguesMaster.js'
import {
  buildExpectedStatsClubsV2,
} from './buildExpectedClubs.js'
import {
  readActualStatsClubsV2,
} from './readActualClubs.js'
import {
  compareStatsClubsV2,
} from './compareClubs.js'
import {
  compareStatsCanonicalTeamSeasonV2,
} from './compareCanonicalTeamSeason.js'

export async function auditStatsV2({
  birthTeamDocumentId = '',
  seasonKey = '',
} = {}) {
  const canonical = await readStatsCanonicalV2({
    birthTeamDocumentId,
    seasonKey,
  })
  const expectedCounterparts = buildExpectedStatsCounterpartsV2({
    canonical,
  })
  const candidatePlayerDocuments = buildExpectedStatsPlayerDocumentsV2({
    canonical,
  })
  const expectedLeaguesMaster = buildExpectedStatsLeaguesMasterV2({
    canonical,
  })

  const [
    actualCounterparts,
    candidatePlayerDocumentsActual,
    actualLeaguesMaster,
  ] = await Promise.all([
    readActualStatsCounterpartsV2({
      expectedCounterparts,
    }),
    readActualStatsPlayerDocumentsV2({
      expectedPlayerDocuments: candidatePlayerDocuments,
    }),
    readActualStatsLeaguesMasterV2(),
  ])

  const existingPlayerDocumentIds = new Set(
    candidatePlayerDocumentsActual
      .filter(row => row?.exists === true)
      .map(row => row.playerDocumentId)
  )
  const expectedPlayerDocuments = buildExpectedStatsPlayerDocumentsV2({
    canonical,
    existingPlayerDocumentIds,
  })
  const expectedPlayerDocumentIds = new Set(
    expectedPlayerDocuments.map(row => row.playerDocumentId)
  )
  const actualPlayerDocuments = candidatePlayerDocumentsActual.filter(row => (
    expectedPlayerDocumentIds.has(row.playerDocumentId)
  ))
  const expectedProjections = buildExpectedStatsProjectionsV2({
    canonical,
    existingPlayerDocumentIds,
  })
  const actualProjections = await readActualStatsProjectionsV2({
    expected: expectedProjections,
    canonical,
  })

  const expectedClubs = buildExpectedStatsClubsV2({
    canonical,
    counterpartCanonical: actualCounterparts,
    expectedCounterparts,
  })
  const actualClubs = await readActualStatsClubsV2({
    expectedClubs,
  })
  const clubComparison = compareStatsClubsV2({
    expectedClubs,
    actual: actualClubs,
  })

  const findings = [
    ...compareStatsCanonicalTeamSeasonV2({
      canonical,
    }),
    ...compareStatsCounterpartsV2({
      expectedCounterparts,
      actualCounterparts,
    }),
    ...compareStatsPlayerDocumentsV2({
      expectedPlayerDocuments,
      actualPlayerDocuments,
      seasonKey: canonical.seasonKey,
    }),
    ...compareStatsProjectionsV2({
      expected: expectedProjections,
      actual: actualProjections,
    }),
    ...compareStatsLeaguesMasterV2({
      expected: expectedLeaguesMaster,
      actual: actualLeaguesMaster,
    }),
    ...clubComparison.clubFindings,
    ...clubComparison.masterFindings,
  ]
  const coveredTargets = [
    ...STATS_AUDIT_V2_COVERED_TARGETS,
  ]
  const uncoveredTargets = [
    ...STATS_AUDIT_V2_UNCOVERED_TARGETS,
  ]
  const complete = uncoveredTargets.length === 0

  return {
    flowType: 'stats',
    birthTeamDocumentId: canonical.birthTeamDocumentId,
    leagueId: canonical.leagueId,
    seasonKey: canonical.seasonKey,
    result: complete
      ? findings.length
        ? STATS_AUDIT_V2_RESULT.FINDINGS
        : STATS_AUDIT_V2_RESULT.CLEAN
      : STATS_AUDIT_V2_RESULT.PARTIAL,
    coverage: {
      complete,
      coveredTargets,
      uncoveredTargets,
    },
    findings,
    summary: {
      expectedCounterparts: expectedCounterparts.length,
      checkedCounterpartTeamSeasons: actualCounterparts.filter(
        row => row.teamSeason
      ).length,
      expectedPlayerDocuments: expectedPlayerDocuments.length,
      checkedPlayerDocuments: actualPlayerDocuments.filter(
        row => row.exists
      ).length,
      expectedPlayerSearchIndexes:
        expectedProjections.playerSearchIndexes.length,
      checkedPlayerSearchIndexes:
        actualProjections.playerSearchIndexes.length,
      checkedTeamSearchIndex:
        actualProjections.teamSearchIndex ? 1 : 0,
      checkedLeagueMetadata:
        actualProjections.league ? 1 : 0,
      checkedLeaguesMaster:
        actualLeaguesMaster ? 1 : 0,
      expectedClubs: expectedClubs.length,
      checkedClubs: actualClubs.clubs.length,
      checkedClubsMaster:
        actualClubs.clubsMaster ? 1 : 0,
      findingsCount: findings.length,
    },
  }
}
