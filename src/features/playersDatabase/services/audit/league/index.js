// src/features/playersDatabase/services/audit/league/index.js

import {
  buildExpectedLeagueAudit,
  buildMissingLeagueExpected,
  collectLeagueSeasonClubIds,
} from './buildExpected.js'
import { compareLeagueAudit } from './compare.js'
import { compareTeamSignalSummaries } from '../signals/compareTeamSignalSummaries.js'
import { readExpectedTeamSignals } from '../signals/readExpectedTeamSignals.js'
import { teamSignalAuditKey } from '../signals/buildExpectedTeamSignals.js'
import {
  LEAGUE_AUDIT_ALL_TARGETS,
  LEAGUE_AUDIT_RESULT,
  LEAGUE_AUDIT_TARGET,
} from './contract.js'
import {
  readActualLeagueAudit,
  readClubProfiles,
  readLeagueCanonical,
} from './readActual.js'

export const auditLeague = async ({ leagueId = '', seasonId = '' } = {}) => {
  const canonical = await readLeagueCanonical({ leagueId })

  let expected
  let clubProfilesById = {}

  if (!canonical) {
    expected = buildMissingLeagueExpected({ leagueId, seasonId })
  } else {
    const clubIds = collectLeagueSeasonClubIds({ league: canonical, seasonId })
    clubProfilesById = await readClubProfiles({ clubIds })
    expected = buildExpectedLeagueAudit({
      league: canonical,
      seasonId,
      clubProfilesById,
    })
  }

  const actual = await readActualLeagueAudit({
    expected,
    leagueId: expected.leagueId,
    seasonId: expected.seasonId,
  })

  if (canonical) {
    expected = buildExpectedLeagueAudit({
      league: canonical,
      seasonId,
      clubProfilesById,
      teamSeasons: actual.teamSeasons,
    })
  }
  const projectionFindings = compareLeagueAudit({ expected, actual })
  const expectedSignals = await readExpectedTeamSignals({
    clubIds: canonical ? collectLeagueSeasonClubIds({ league: canonical, seasonId }) : [],
  })
  Object.entries(canonical?.seasonsById?.[seasonId]?.table?.teamsById || {}).forEach(([teamId, leagueTeam]) => {
    projectionFindings.push(...compareTeamSignalSummaries({
      teamId, clubId: leagueTeam.clubId, seasonId, leagueTeam,
      expectedSummary: expectedSignals.get(teamSignalAuditKey(teamId, seasonId)) || null,
      teamSeason: actual.teamSeasons.find(season => season.identity?.teamId === teamId),
      leaguesCenterTeam: actual.leaguesCenter?.leaguesById?.[expected.leagueId]?.seasonsById?.[seasonId]?.teamsById?.[teamId],
      clubsCenterTeam: actual.clubsCenter?.clubsById?.[leagueTeam.clubId]?.teamsById?.[teamId],
    }))
  })
  const dependencyFindings = expected.missingCanonicalDependencies || []
  const findings = [...dependencyFindings, ...projectionFindings]
  const missingCanonicalDependencies = dependencyFindings.length > 0
  const auditedFields = expected.auditedFields || {}
  const clubsCenterExtendedFieldsCovered = (
    auditedFields.clubsCenterCompetitionProjection === true
    && auditedFields.clubsCenterTransfers === true
  )
  const coverageComplete = !missingCanonicalDependencies && clubsCenterExtendedFieldsCovered

  const uncoveredTargets = []
  if (missingCanonicalDependencies || !clubsCenterExtendedFieldsCovered) {
    uncoveredTargets.push(LEAGUE_AUDIT_TARGET.CLUBS_CENTER)
  }
  if (missingCanonicalDependencies) {
    uncoveredTargets.push(LEAGUE_AUDIT_TARGET.TEAM_SEASON_COMPETITION_SNAPSHOTS)
  }

  return {
    flowType: 'league',
    leagueId: expected.leagueId,
    seasonId: expected.seasonId,
    result: missingCanonicalDependencies
      ? LEAGUE_AUDIT_RESULT.PARTIAL
      : findings.length
        ? LEAGUE_AUDIT_RESULT.FINDINGS
        : LEAGUE_AUDIT_RESULT.CLEAN,
    coverage: {
      complete: coverageComplete,
      coveredTargets: LEAGUE_AUDIT_ALL_TARGETS.filter(
        target => !uncoveredTargets.includes(target)
      ),
      uncoveredTargets,
    },
    findings,
    summary: {
      findingsCount: findings.length,
      leagueExists: expected.leagueExists,
      seasonExists: expected.seasonExists,
      expectedTeams: expected.teamSeasonCompetitionSnapshots.length,
      checkedTeamSeasons: actual.teamSeasons.length,
      missingCanonicalDependencies: dependencyFindings.length,
    },
  }
}

export {
  buildExpectedLeagueAudit,
  compareLeagueAudit,
}
