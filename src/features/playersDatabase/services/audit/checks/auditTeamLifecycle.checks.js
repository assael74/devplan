import {
  buildLeagueTeamPerformanceProjection,
  buildTeamBalanceSearchIndexProjection,
  buildTeamSeasonSearchMetrics,
} from '../audit.projections.js'
import { buildAuditFinding, AUDIT_FINDING_TYPE, AUDIT_REPAIR_TYPE } from '../audit.contract.js'

export function appendTeamLifecycleAuditFindings({
  normalizedScope,
  leagues,
  teams,
  teamIndexes,
  findings,
  lifecycle,
  helpers,
}) {
  const { clean, seasonKeyOf, teamIdOf, inScope, findLeagueSeason, same } = helpers

  teamIndexes.filter(row => !clean(row.data.teamSeasonDocumentId)).forEach(row => {
    const source = findLeagueSeason({
      leagues,
      leagueId: row.data?.leagueId,
      seasonKey: seasonKeyOf(row.data),
    })
    const isNotStarted = clean(source?.season?.seasonStatus) === 'not_started'
    lifecycle.push({
      entityType: 'team',
      documentId: row.id,
      teamDocumentId: teamIdOf(row.data),
      seasonKey: seasonKeyOf(row.data),
      status: isNotStarted ? 'league_only_not_started' : 'league_only',
    })
  })
  teams.filter(root => !(Array.isArray(root.data.seasons) && root.data.seasons.length)).forEach(root => {
    lifecycle.push({ entityType: 'team', documentId: root.id, teamDocumentId: root.id, seasonKey: '', status: 'root_without_seasons' })
  })

  // A league-only index is valid while a season has not started: it is the
  // league-table projection and must not be treated as a missing Team Season.
  // Its lifecycle fields still have to match the source league season.
  teamIndexes
    .filter(row => inScope({ scope: normalizedScope, row: row.data }))
    .forEach(row => {
      const source = findLeagueSeason({
        leagues,
        leagueId: row.data?.leagueId,
        seasonKey: seasonKeyOf(row.data),
      })
      if (!source) return

      const performance = buildLeagueTeamPerformanceProjection({
        league: source.league.data,
        season: source.season,
        target: source.target,
        team: {
          ...row.data,
          birthTeamId: teamIdOf(row.data),
          teamId: teamIdOf(row.data),
        },
      })
      const metricsSource = performance || row.data

      const expected = buildTeamSeasonSearchMetrics({
        target: source.target,
        seasonStatus: source.season.seasonStatus,
        leagueTotalRound: source.season.leagueTotalRound,
        teamGamePlayed: metricsSource.teamGamePlayed,
        points: metricsSource.points,
        goalsFor: metricsSource.goalsFor,
        goalsAgainst: metricsSource.goalsAgainst,
      })
      const fields = [
        'seasonStatus',
        'normalizationStatus',
        'remainingTeamGames',
      ]
      const actualLifecycle = Object.fromEntries(fields.map(field => [field, row.data?.[field]]))
      const expectedLifecycle = Object.fromEntries(fields.map(field => [field, expected[field]]))

      if (!same(expectedLifecycle, actualLifecycle)) findings.push(buildAuditFinding({
        type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
        entityType: 'teamSearchIndex',
        documentId: row.id,
        teamDocumentId: teamIdOf(row.data),
        seasonKey: seasonKeyOf(row.data),
        title: 'מצב עונת האינדקס אינו תואם למסמך הליגה',
        explanation: 'אינדקס ליגה של עונה שטרם החלה הוא תקין ללא עונת קבוצה, אך סטטוס העונה שלו חייב לשקף את מסמך הליגה.',
        source: 'League season → buildTeamSeasonSearchMetrics',
        repairType: AUDIT_REPAIR_TYPE.REBUILD_TEAM_SEARCH_INDEX,
        expected: expectedLifecycle,
        actual: {
          ...actualLifecycle,
          leagueId: clean(row.data?.leagueId),
        },
      }))
    })
}

export function appendTeamSeasonAuditFindings({
  id,
  season,
  teamId,
  seasonKey,
  root,
  leagues,
  teamIndexes,
  findings,
  lifecycle,
  helpers,
}) {
  const { clean, seasonKeyOf, teamLeagueSeasonKeyOf, findLeagueSeason, same } = helpers

  const status = clean(season.statsStatus) === 'loaded' ? 'stats_loaded' : 'roster_loaded'
  lifecycle.push({
    entityType: 'team',
    documentId: id,
    teamDocumentId: teamId,
    seasonKey,
    status,
  })
  if (!root) {
    findings.push(buildAuditFinding({
      type: AUDIT_FINDING_TYPE.BROKEN_RELATION,
      entityType: 'teamSeason',
      documentId: id,
      relatedDocumentId: teamId,
      teamDocumentId: teamId,
      seasonKey,
      title: 'מסמך עונת קבוצה מצביע לקבוצה שאינה קיימת',
      explanation: 'לכל Team Season חייב להיות Team Root.',
    }))
  }
  else if (!(root.seasons || []).some(
    entry => seasonKeyOf(entry) === seasonKey && clean(entry.seasonDocumentId) === id
  )) {
    findings.push(buildAuditFinding({
      type: AUDIT_FINDING_TYPE.BROKEN_RELATION,
      entityType: 'teamRoot',
      documentId: teamId,
      relatedDocumentId: id,
      teamDocumentId: teamId,
      seasonKey,
      title: 'חסרה הפניה לעונת הקבוצה',
      explanation: 'Team Root חייב להפנות ל-Team Season שלו.',
    }))
  }
  const matchingIndex = teamIndexes.filter(index => (
    teamLeagueSeasonKeyOf(index.data) === teamLeagueSeasonKeyOf(season)
  ))
  if (matchingIndex.length !== 1) {
    findings.push(buildAuditFinding({
      type: AUDIT_FINDING_TYPE.MISSING_DOCUMENT,
      entityType: 'teamSearchIndex',
      documentId: id,
      teamDocumentId: teamId,
      seasonKey,
      title: 'חסר אינדקס קבוצה',
      explanation: 'סגל טעון מחייב Team SearchIndex אחד.',
    }))
  }
  else if (clean(matchingIndex[0].data.teamSeasonDocumentId) !== id) {
    findings.push(buildAuditFinding({
      type: AUDIT_FINDING_TYPE.BROKEN_RELATION,
      entityType: 'teamSearchIndex',
      documentId: matchingIndex[0].id,
      relatedDocumentId: id,
      teamDocumentId: teamId,
      seasonKey,
      title: 'אינדקס הקבוצה אינו מחובר לעונת הקבוצה',
      explanation: 'teamSeasonDocumentId אינו תואם.',
    }))
  }
  const leagueSource = findLeagueSeason({
    leagues,
    leagueId: season.leagueId,
    seasonKey,
  })
  const expected = leagueSource ? buildLeagueTeamPerformanceProjection({
    league: leagueSource.league.data,
    season,
    target: leagueSource.target,
    team: { ...(root || {}), ...season },
  }) : null
  if (!expected) {
    findings.push(buildAuditFinding({
      type: AUDIT_FINDING_TYPE.BROKEN_RELATION,
      entityType: 'teamSeason',
      documentId: id,
      teamDocumentId: teamId,
      seasonKey,
      title: 'עונת הקבוצה אינה מחוברת לטבלת ליגה',
      explanation: 'לא נמצאה ליגה, עונה או שורת טבלה מתאימה.',
    }))
  }
  else {
    const actual = {
      teamGamePlayed: season.teamStats?.teamGamePlayed,
      goalsFor: season.teamStats?.goalsFor,
      goalsAgainst: season.teamStats?.goalsAgainst,
      goalsForPerGame: season.goalsForPerGame,
      goalsAgainstPerGame: season.goalsAgainstPerGame,
      tableRank: season.tableRank,
      tableAttackRank: season.tableAttackRank,
      tableDefenseRank: season.tableDefenseRank,
    }
    if (!same(expected, actual)) {
      findings.push(buildAuditFinding({
        type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
        entityType: 'teamSeason',
        documentId: id,
        teamDocumentId: teamId,
        seasonKey,
        title: 'ביצועי הקבוצה אינם תואמים לטבלת הליגה',
        source: 'League table → buildLeagueTeamPerformanceProjection',
        expected,
        actual,
      }))
    }
    matchingIndex.forEach(index => {
      const indexActual = Object.fromEntries(Object.keys(expected).map(field => [field, index.data[field]]))
      if (!same(expected, indexActual)) {
        findings.push(buildAuditFinding({
          type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
          entityType: 'teamSearchIndex',
          documentId: index.id,
          relatedDocumentId: id,
          teamDocumentId: teamId,
          seasonKey,
          title: 'אינדקס הקבוצה אינו תואם לטבלת הליגה',
          source: 'League table → buildLeagueTeamPerformanceProjection',
          repairType: AUDIT_REPAIR_TYPE.REBUILD_TEAM_SEARCH_INDEX,
          expected,
          actual: indexActual,
        }))
      }
    })
  }
  const expectedBalance = buildTeamBalanceSearchIndexProjection(season.teamBalance || {})
  matchingIndex.forEach(index => {
    const actualBalance = Object.fromEntries(Object.keys(expectedBalance).map(field => [field, index.data[field]]))
    if (!same(expectedBalance, actualBalance)) {
      findings.push(buildAuditFinding({
        type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
        entityType: 'teamSearchIndex',
        documentId: index.id,
        relatedDocumentId: id,
        teamDocumentId: teamId,
        seasonKey,
        title: 'Balance באינדקס הקבוצה אינו תואם לעונת הקבוצה',
        source: 'Team Season teamBalance → buildTeamBalanceSearchIndexProjection',
        expected: expectedBalance,
        actual: actualBalance,
      }))
    }
  })
}
