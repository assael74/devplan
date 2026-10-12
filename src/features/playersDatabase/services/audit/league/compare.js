// src/features/playersDatabase/services/audit/league/compare.js

import { buildEmptyCompetitionSnapshot } from './buildExpected.js'
import { LEAGUE_AUDIT_TARGET } from './contract.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const normalizeComparable = value => {
  if (Array.isArray(value)) return value.map(normalizeComparable)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !['updatedAt', 'createdAt', 'documentationStateUpdatedAt'].includes(key))
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, normalizeComparable(nestedValue)])
    )
  }
  return value
}

const same = (left, right) => (
  JSON.stringify(normalizeComparable(left)) === JSON.stringify(normalizeComparable(right))
)

const normalizeExactComparable = value => {
  if (Array.isArray(value)) return value.map(normalizeExactComparable)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, normalizeExactComparable(nestedValue)])
    )
  }
  return value
}

const sameExact = (left, right) => (
  JSON.stringify(normalizeExactComparable(left)) === JSON.stringify(normalizeExactComparable(right))
)

const finding = ({ type, target, documentId, field = '', reason, expected, actual }) => ({
  type,
  target,
  documentId,
  field,
  reason,
  expected,
  actual,
})

const compareValue = ({ findings, target, documentId, field, expected, actual, reason }) => {
  if (same(expected, actual)) return
  findings.push(finding({
    type: 'projection_mismatch',
    target,
    documentId,
    field,
    reason,
    expected,
    actual,
  }))
}

const compareExactValue = ({ findings, target, documentId, field, expected, actual, reason }) => {
  if (sameExact(expected, actual)) return
  findings.push(finding({
    type: 'projection_mismatch',
    target,
    documentId,
    field,
    reason,
    expected,
    actual,
  }))
}

const compareLeaguesCenter = ({ expected, actual, findings }) => {
  const documentId = 'all'
  const leagueId = expected.leagueId
  const seasonId = expected.seasonId
  const actualLeague = actual && actual.leaguesById && actual.leaguesById[leagueId]
    ? actual.leaguesById[leagueId]
    : null
  const actualSeason = actualLeague && actualLeague.seasonsById && actualLeague.seasonsById[seasonId]
    ? actualLeague.seasonsById[seasonId]
    : null

  if (!expected.leagueExists) {
    if (actualLeague) {
      findings.push(finding({
        type: 'stale_projection',
        target: LEAGUE_AUDIT_TARGET.LEAGUES_CENTER,
        documentId,
        field: `leaguesById.${leagueId}`,
        reason: 'LeaguesCenter still exposes a League whose canonical document is missing.',
        expected: null,
        actual: actualLeague,
      }))
    }
    return
  }

  if (!actualLeague) {
    findings.push(finding({
      type: 'missing_projection',
      target: LEAGUE_AUDIT_TARGET.LEAGUES_CENTER,
      documentId,
      field: `leaguesById.${leagueId}`,
      reason: 'LeaguesCenter is missing the canonical League projection.',
      expected: expected.leaguesCenter.identity,
      actual: null,
    }))
    return
  }

  compareValue({
    findings,
    target: LEAGUE_AUDIT_TARGET.LEAGUES_CENTER,
    documentId,
    field: `leaguesById.${leagueId}.identity`,
    expected: expected.leaguesCenter.identity,
    actual: actualLeague.identity,
    reason: 'LeaguesCenter League identity does not match canonical League.',
  })

  if (!expected.seasonExists) {
    if (actualSeason) {
      findings.push(finding({
        type: 'stale_projection',
        target: LEAGUE_AUDIT_TARGET.LEAGUES_CENTER,
        documentId,
        field: `leaguesById.${leagueId}.seasonsById.${seasonId}`,
        reason: 'LeaguesCenter still exposes a deleted League season.',
        expected: null,
        actual: actualSeason,
      }))
    }
    return
  }

  if (!actualSeason) {
    findings.push(finding({
      type: 'missing_projection',
      target: LEAGUE_AUDIT_TARGET.LEAGUES_CENTER,
      documentId,
      field: `leaguesById.${leagueId}.seasonsById.${seasonId}`,
      reason: 'LeaguesCenter is missing the canonical League season projection.',
      expected: expected.leaguesCenter.season,
      actual: null,
    }))
    return
  }

  const expectedSeason = expected.leaguesCenter.season
  const actualLeagueOwnedSeason = {
    seasonKey: clean(actualSeason.seasonKey),
    seasonStatus: clean(actualSeason.seasonStatus),
    birthYear: actualSeason.birthYear === undefined ? null : actualSeason.birthYear,
    seasonUrl: clean(actualSeason.seasonUrl),
    hasCompetitionRules: Boolean(actualSeason.hasCompetitionRules),
    tableState: clean(actualSeason.tableState),
    tableImportedAt: actualSeason.tableImportedAt || null,
    teamsById: Object.fromEntries(
      Object.entries(actualSeason.teamsById || {}).map(([teamId, team]) => [teamId, {
        clubId: clean(team && team.clubId),
        teamSlot: team && team.teamSlot === undefined ? null : team.teamSlot,
        documentationState: clean(team && team.documentationState),
        documentationStateUpdatedAt: team && team.documentationStateUpdatedAt || null,
        teamTaskSignals: {
          offense: Boolean(team && team.teamTaskSignals && team.teamTaskSignals.offense),
          defense: Boolean(team && team.teamTaskSignals && team.teamTaskSignals.defense),
          updatedAt: team && team.teamTaskSignals && team.teamTaskSignals.updatedAt || null,
        },
      }])
    ),
    updatedAt: actualSeason.updatedAt || null,
  }

  compareValue({
    findings,
    target: LEAGUE_AUDIT_TARGET.LEAGUES_CENTER,
    documentId,
    field: `leaguesById.${leagueId}.seasonsById.${seasonId}`,
    expected: expectedSeason,
    actual: actualLeagueOwnedSeason,
    reason: 'LeaguesCenter League-owned season fields do not match canonical League.',
  })

  Object.entries(expectedSeason.teamsById || {}).forEach(([teamId, teamExpected]) => {
    const actualTeam = actualSeason.teamsById && actualSeason.teamsById[teamId]
      ? actualSeason.teamsById[teamId]
      : null
    if (!actualTeam) return

    compareExactValue({
      findings,
      target: LEAGUE_AUDIT_TARGET.LEAGUES_CENTER,
      documentId,
      field: `leaguesById.${leagueId}.seasonsById.${seasonId}.teamsById.${teamId}.teamTaskSignals.updatedAt`,
      expected: teamExpected && teamExpected.teamTaskSignals
        ? teamExpected.teamTaskSignals.updatedAt || null
        : null,
      actual: actualTeam && actualTeam.teamTaskSignals
        ? actualTeam.teamTaskSignals.updatedAt || null
        : null,
      reason: 'LeaguesCenter teamTaskSignals.updatedAt does not match canonical Team Season.',
    })
  })
}

const flattenClubsCenterTeams = document => {
  const result = []
  Object.entries(document && document.clubsById || {}).forEach(([clubId, club]) => {
    Object.entries(club && club.teamsById || {}).forEach(([teamId, team]) => {
      result.push({ clubId, teamId, team })
    })
  })
  return result
}

const compactClubsCenterTeam = team => ({
  teamSeasonDocumentId: clean(team && team.teamSeasonDocumentId),
  birthYear: team && team.birthYear === undefined ? null : team.birthYear,
  ageGroupId: clean(team && team.ageGroupId),
  teamSlot: team && team.teamSlot === undefined ? null : team.teamSlot,
  leagueId: clean(team && team.leagueId),
  documentationState: clean(team && team.documentationState),
  documentationStateUpdatedAt: team && team.documentationStateUpdatedAt || null,
  teamTaskSignals: {
    offense: Boolean(team && team.teamTaskSignals && team.teamTaskSignals.offense),
    defense: Boolean(team && team.teamTaskSignals && team.teamTaskSignals.defense),
    updatedAt: team && team.teamTaskSignals && team.teamTaskSignals.updatedAt || null,
  },
  performance: {
    tableRank: team && team.performance && team.performance.tableRank !== undefined
      ? team.performance.tableRank
      : null,
    points: team && team.performance && team.performance.points !== undefined
      ? team.performance.points
      : null,
    teamGamePlayed: team && team.performance && team.performance.teamGamePlayed !== undefined
      ? team.performance.teamGamePlayed
      : null,
  },
  updatedAt: team && team.updatedAt || null,
})

const compareClubsCenter = ({ expected, actual, findings }) => {
  const documentId = expected.seasonId
  const leagueId = expected.leagueId
  const actualLeague = actual && actual.leaguesById && actual.leaguesById[leagueId]
    ? actual.leaguesById[leagueId]
    : null
  const actualTeams = flattenClubsCenterTeams(actual)
    .filter(item => clean(item.team && item.team.leagueId) === leagueId)
  const expectedTeamKeys = new Set()

  if (!expected.seasonExists) {
    if (actualLeague) {
      findings.push(finding({
        type: 'stale_projection',
        target: LEAGUE_AUDIT_TARGET.CLUBS_CENTER,
        documentId,
        field: `leaguesById.${leagueId}`,
        reason: 'ClubsCenter still exposes metadata for a deleted League season.',
        expected: null,
        actual: actualLeague,
      }))
    }
    actualTeams.forEach(item => findings.push(finding({
      type: 'stale_projection',
      target: LEAGUE_AUDIT_TARGET.CLUBS_CENTER,
      documentId,
      field: `clubsById.${item.clubId}.teamsById.${item.teamId}`,
      reason: 'ClubsCenter still exposes a team from a deleted League season.',
      expected: null,
      actual: item.team,
    })))
    return
  }

  if (!actual) {
    findings.push(finding({
      type: 'missing_projection',
      target: LEAGUE_AUDIT_TARGET.CLUBS_CENTER,
      documentId,
      reason: 'ClubsCenter season document is missing.',
      expected: expected.clubsCenter,
      actual: null,
    }))
    return
  }

  compareValue({
    findings,
    target: LEAGUE_AUDIT_TARGET.CLUBS_CENTER,
    documentId,
    field: 'seasonIdentity',
    expected: {
      seasonId: expected.clubsCenter.seasonId,
      seasonKey: expected.clubsCenter.seasonKey,
    },
    actual: {
      seasonId: clean(actual.seasonId),
      seasonKey: clean(actual.seasonKey),
    },
    reason: 'ClubsCenter season identity does not match canonical League season.',
  })

  if (!actualLeague) {
    findings.push(finding({
      type: 'missing_projection',
      target: LEAGUE_AUDIT_TARGET.CLUBS_CENTER,
      documentId,
      field: `leaguesById.${leagueId}`,
      reason: 'ClubsCenter is missing League metadata for the canonical season.',
      expected: expected.clubsCenter.league,
      actual: null,
    }))
  } else {
    compareValue({
      findings,
      target: LEAGUE_AUDIT_TARGET.CLUBS_CENTER,
      documentId,
      field: `leaguesById.${leagueId}`,
      expected: expected.clubsCenter.league,
      actual: {
        displayName: clean(actualLeague.displayName),
        ageGroupLabel: clean(actualLeague.ageGroupLabel),
        leagueLevel: actualLeague.leagueLevel === undefined ? null : actualLeague.leagueLevel,
        seasonStatus: clean(actualLeague.seasonStatus),
        tableImportedAt: actualLeague.tableImportedAt || null,
      },
      reason: 'ClubsCenter League metadata does not match canonical League.',
    })
  }

  Object.entries(expected.clubsCenter.clubsById || {}).forEach(([clubId, clubExpected]) => {
    const actualClub = actual && actual.clubsById ? actual.clubsById[clubId] : null

    if (clubExpected.clubProfileAvailable) {
      compareValue({
        findings,
        target: LEAGUE_AUDIT_TARGET.CLUBS_CENTER,
        documentId,
        field: `clubsById.${clubId}.profile`,
        expected: {
          displayName: clubExpected.displayName,
          shortName: clubExpected.shortName,
          clubLevel: clubExpected.clubLevel,
          clubStrengthLevel: clubExpected.clubStrengthLevel,
        },
        actual: actualClub ? {
          displayName: clean(actualClub.displayName),
          shortName: clean(actualClub.shortName),
          clubLevel: actualClub.clubLevel === undefined ? null : actualClub.clubLevel,
          clubStrengthLevel: actualClub.clubStrengthLevel === undefined ? null : actualClub.clubStrengthLevel,
        } : null,
        reason: 'ClubsCenter ClubProfile-owned fields do not match canonical ClubProfile.',
      })
    }

    Object.entries(clubExpected.teamsById || {}).forEach(([teamId, teamExpected]) => {
      expectedTeamKeys.add(`${clubId}::${teamId}`)
      const actualTeam = actual && actual.clubsById && actual.clubsById[clubId]
        && actual.clubsById[clubId].teamsById
        ? actual.clubsById[clubId].teamsById[teamId]
        : null

      if (!actualTeam) {
        findings.push(finding({
          type: 'missing_projection',
          target: LEAGUE_AUDIT_TARGET.CLUBS_CENTER,
          documentId,
          field: `clubsById.${clubId}.teamsById.${teamId}`,
          reason: 'ClubsCenter is missing a canonical League team projection.',
          expected: teamExpected,
          actual: null,
        }))
        return
      }

      const {
        competitionProjection: expectedCompetitionProjection,
        transfers: expectedTransfers,
        ...expectedBaseTeam
      } = teamExpected

      compareValue({
        findings,
        target: LEAGUE_AUDIT_TARGET.CLUBS_CENTER,
        documentId,
        field: `clubsById.${clubId}.teamsById.${teamId}`,
        expected: expectedBaseTeam,
        actual: compactClubsCenterTeam(actualTeam),
        reason: 'ClubsCenter League-owned team fields do not match canonical League.',
      })

      compareValue({
        findings,
        target: LEAGUE_AUDIT_TARGET.CLUBS_CENTER,
        documentId,
        field: `clubsById.${clubId}.teamsById.${teamId}.competitionProjection`,
        expected: expectedCompetitionProjection,
        actual: actualTeam.competitionProjection,
        reason: 'ClubsCenter competitionProjection does not match the canonical League projection builder.',
      })

      compareValue({
        findings,
        target: LEAGUE_AUDIT_TARGET.CLUBS_CENTER,
        documentId,
        field: `clubsById.${clubId}.teamsById.${teamId}.transfers`,
        expected: expectedTransfers,
        actual: actualTeam.transfers,
        reason: 'ClubsCenter transfers do not match the canonical League projection builder.',
      })

      compareExactValue({
        findings,
        target: LEAGUE_AUDIT_TARGET.CLUBS_CENTER,
        documentId,
        field: `clubsById.${clubId}.teamsById.${teamId}.transfers.updatedAt`,
        expected: expectedTransfers ? expectedTransfers.updatedAt || null : null,
        actual: actualTeam && actualTeam.transfers ? actualTeam.transfers.updatedAt || null : null,
        reason: 'ClubsCenter transfers.updatedAt does not match canonical Team Season movement.',
      })
    })
  })

  actualTeams.forEach(item => {
    if (expectedTeamKeys.has(`${item.clubId}::${item.teamId}`)) return
    findings.push(finding({
      type: 'stale_projection',
      target: LEAGUE_AUDIT_TARGET.CLUBS_CENTER,
      documentId,
      field: `clubsById.${item.clubId}.teamsById.${item.teamId}`,
      reason: 'ClubsCenter still exposes a team removed from the canonical League table.',
      expected: null,
      actual: item.team,
    }))
  })
}

const compactLoadedSnapshot = snapshot => ({
  teamUrl: clean(snapshot && snapshot.teamUrl),
  clubLevel: snapshot && snapshot.clubLevel === undefined ? null : snapshot.clubLevel,
  clubStrengthLevel: snapshot && snapshot.clubStrengthLevel === undefined
    ? null
    : snapshot.clubStrengthLevel,
  officialTable: {
    rank: snapshot && snapshot.officialTable && snapshot.officialTable.rank !== undefined
      ? snapshot.officialTable.rank
      : null,
    points: snapshot && snapshot.officialTable && snapshot.officialTable.points !== undefined
      ? snapshot.officialTable.points
      : null,
    goalsFor: snapshot && snapshot.officialTable && snapshot.officialTable.goalsFor !== undefined
      ? snapshot.officialTable.goalsFor
      : null,
    goalsAgainst: snapshot && snapshot.officialTable && snapshot.officialTable.goalsAgainst !== undefined
      ? snapshot.officialTable.goalsAgainst
      : null,
    teamGamePlayed: snapshot && snapshot.officialTable && snapshot.officialTable.teamGamePlayed !== undefined
      ? snapshot.officialTable.teamGamePlayed
      : null,
  },
  updatedAt: snapshot && snapshot.updatedAt ? snapshot.updatedAt : null,
})

const compactEmptySnapshot = snapshot => ({
  ...compactLoadedSnapshot(snapshot),
  clubStrengthLevel: snapshot && snapshot.clubStrengthLevel === undefined
    ? null
    : snapshot.clubStrengthLevel,
})

const compareCompetitionSnapshots = ({ expected, actual, findings }) => {
  const expectedByDocumentId = new Map(
    (expected.teamSeasonCompetitionSnapshots || [])
      .map(item => [item.teamSeasonDocumentId, item])
  )
  const emptyExpected = buildEmptyCompetitionSnapshot(expected.projectionUpdatedAt || null)

  ;(actual || []).forEach(teamSeason => {
    const documentId = clean(teamSeason.id)
    const expectedSnapshot = expectedByDocumentId.get(documentId)
    const actualSnapshot = teamSeason.competitionSnapshot || {}

    if (expectedSnapshot) {
      const compactActual = compactLoadedSnapshot(actualSnapshot)
      const comparableActual = Object.fromEntries(
        Object.keys(expectedSnapshot.expectedFields).map(key => [key, compactActual[key]])
      )
      // Roster writes can advance this timestamp without changing League facts.
      compareValue({
        findings,
        target: LEAGUE_AUDIT_TARGET.TEAM_SEASON_COMPETITION_SNAPSHOTS,
        documentId,
        field: 'competitionSnapshot',
        expected: expectedSnapshot.expectedFields,
        actual: comparableActual,
        reason: 'Existing Team Season competitionSnapshot does not match canonical League and ClubProfile.',
      })
      return
    }

    const compactActual = compactEmptySnapshot(actualSnapshot)
    if (!same(emptyExpected, compactActual)) {
      findings.push(finding({
        type: 'stale_projection',
        target: LEAGUE_AUDIT_TARGET.TEAM_SEASON_COMPETITION_SNAPSHOTS,
        documentId,
        field: 'competitionSnapshot',
        expected: emptyExpected,
        actual: compactActual,
        reason: expected.seasonExists
          ? 'Team Season removed from the canonical League table still has a League competitionSnapshot.'
          : 'Team Season from a missing or deleted League season still has a League competitionSnapshot.',
      }))
    }
  })
}

export const compareLeagueAudit = ({ expected = {}, actual = {} } = {}) => {
  const findings = []

  compareLeaguesCenter({
    expected,
    actual: actual.leaguesCenter,
    findings,
  })
  compareClubsCenter({
    expected,
    actual: actual.clubsCenter,
    findings,
  })
  compareCompetitionSnapshots({
    expected,
    actual: actual.teamSeasons,
    findings,
  })

  return findings
}
