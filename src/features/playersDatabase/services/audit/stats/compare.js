// src/features/playersDatabase/services/audit/stats/compare.js

import { compareTeamSignalSummaries } from '../signals/compareTeamSignalSummaries.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})
const normalizeTime = value => {
  if (value && typeof value.toMillis === 'function') return { __timestampMs: value.toMillis() }
  if (value instanceof Date) return { __timestampMs: value.getTime() }
  if (value && typeof value === 'object') {
    const seconds = Number(value.seconds !== undefined ? value.seconds : value._seconds)
    const nanoseconds = Number(value.nanoseconds !== undefined ? value.nanoseconds : value._nanoseconds)
    if (Number.isFinite(seconds) && Number.isFinite(nanoseconds)) {
      return { __timestampMs: (seconds * 1000) + Math.floor(nanoseconds / 1000000) }
    }
  }
  return null
}

const normalize = value => {
  if (value === undefined || value === null) return null
  const time = normalizeTime(value)
  if (time) return time
  if (Array.isArray(value)) return value.map(normalize)
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .filter(key => (
        !['teamTaskSignals', 'teamTaskAvailability'].includes(key) &&
        (key !== 'teamGamePlayedAtLoad' || (value[key] !== null && value[key] !== undefined))
      ))
      .sort()
      .reduce((result, key) => {
        result[key] = normalize(value[key])
        return result
      }, {})
  }
  return value
}

const same = (left, right) => JSON.stringify(normalize(left)) === JSON.stringify(normalize(right))
export const sameStatsAuditValue = same

const finding = ({ target, documentId, field, expected, actual, type = 'projection_mismatch' }) => ({
  type,
  target,
  documentId: clean(documentId),
  field,
  expected,
  actual,
})

const compareField = ({ findings, target, documentId, field, expected, actual }) => {
  if (same(expected, actual)) return
  findings.push(finding({ target, documentId, field, expected, actual }))
}

export const compareStatsAudit = ({
  actual = {},
  expectedState = {},
  approvedState = null,
  seasonId = '',
  expectedSignalSummary,
} = {}) => {
  const findings = []
  const teamSeason = actual.teamSeason
  const expected = expectedState.expected
  if (expectedState.complete && expectedState.applicable === false) return findings
  if (!expectedState.complete || !expected) {
    findings.push(finding({
      type: 'missing_canonical_dependency',
      target: 'statsAudit',
      documentId: approvedState && approvedState.teamSeasonDocumentId,
      field: expectedState.reason || 'canonical',
      expected: 'present',
      actual: 'missing',
    }))
    return findings
  }

  if (approvedState && expected.canonicalTeamSeason) {
    compareField({ findings, target: 'teamSeason', documentId: approvedState.teamSeasonDocumentId, field: 'stats', expected: expected.canonicalTeamSeason.stats, actual: teamSeason && teamSeason.stats })
    compareField({ findings, target: 'teamSeason', documentId: approvedState.teamSeasonDocumentId, field: 'scouting', expected: expected.canonicalTeamSeason.scouting, actual: teamSeason && teamSeason.scouting })
  }

  ;(expected.counterpartPatches || []).forEach(patch => {
    const counterpart = object(actual.counterpartTeamSeasonsById)[patch.documentId]
    if (!counterpart) {
      findings.push(finding({
        type: 'missing_document',
        target: 'counterpartTeamSeason',
        documentId: patch.documentId,
        field: 'document',
        expected: 'present',
        actual: 'missing',
      }))
      return
    }
    compareField({
      findings,
      target: 'counterpartTeamSeason',
      documentId: patch.documentId,
      field: 'movement',
      expected: patch.movement,
      actual: counterpart.movement,
    })
  })

  ;(expected.playerRootPlans || []).forEach(plan => {
    const root = object(actual.playerRootsById)[plan.playerId]
    if (plan.action === 'delete') {
      if (root) {
        findings.push(finding({ type: 'unexpected_document', target: 'playerRoot', documentId: plan.playerId, field: 'document', expected: 'missing', actual: 'present' }))
      }
      return
    }
    if (!root) {
      findings.push(finding({ type: 'missing_document', target: 'playerRoot', documentId: plan.playerId, field: 'document', expected: 'present', actual: 'missing' }))
      return
    }
    const expectedRef = plan.action === 'create'
      ? object(plan.document.seasonRefsById)[approvedState.seasonId]
      : plan.seasonRefsById
        ? object(plan.seasonRefsById)[approvedState.seasonId]
        : plan.seasonRef
    compareField({ findings, target: 'playerRoot', documentId: plan.playerId, field: `seasonRefsById.${approvedState.seasonId}`, expected: expectedRef, actual: object(root.seasonRefsById)[approvedState.seasonId] })
  })

  Object.entries(expected.playerSeasonsById).forEach(([playerId, projection]) => {
    const row = object(actual.playerSeasonsById)[playerId]
    if (!row) {
      findings.push(finding({ type: 'missing_document', target: 'playerSeason', documentId: projection.playerSeasonDocumentId, field: 'document', expected: 'present', actual: 'missing' }))
      return
    }
    const teamId = projection.teamId
    const actualTeam = object(object(row.teamsById)[teamId])
    compareField({ findings, target: 'playerSeason', documentId: projection.playerSeasonDocumentId, field: `teamsById.${teamId}.stats`, expected: projection.team.stats, actual: actualTeam.stats })
    compareField({ findings, target: 'playerSeason', documentId: projection.playerSeasonDocumentId, field: `teamsById.${teamId}.scouting`, expected: projection.team.scouting, actual: actualTeam.scouting })
    compareField({ findings, target: 'playerSeason', documentId: projection.playerSeasonDocumentId, field: `teamsById.${teamId}.roster.numShirt`, expected: object(projection.team.roster).numShirt, actual: object(actualTeam.roster).numShirt })
  })

  Object.entries(expected.playerSearchIndexesById).forEach(([playerId, projection]) => {
    const row = object(actual.playerSearchIndexesById)[playerId]
    if (!row) {
      findings.push(finding({ type: 'missing_document', target: 'playerSearchIndex', documentId: projection.documentId, field: 'document', expected: 'present', actual: 'missing' }))
      return
    }
    ;['expectedLevelDelta', 'scoutEffectiveImmediacyStatus', 'scoutProfileIds', 'scoutCombinationIds', 'scoutProfileSearchIds', 'stats', 'scout', 'scoutEvidence'].forEach(field => {
      compareField({ findings, target: 'playerSearchIndex', documentId: projection.documentId, field, expected: projection[field], actual: row[field] })
    })
    compareField({ findings, target: 'playerSearchIndex', documentId: projection.documentId, field: 'player.statsStatus', expected: projection.player.statsStatus, actual: object(row.player).statsStatus })
    compareField({ findings, target: 'playerSearchIndex', documentId: projection.documentId, field: 'player.numShirt', expected: projection.player.numShirt, actual: object(row.player).numShirt })
  })

  const identity = object(teamSeason && teamSeason.identity)
  const leagueTeam = object(
    object(
      object(
        object(actual.league && actual.league.seasonsById)[seasonId]
      ).table
    ).teamsById
  )[identity.teamId]
  compareField({ findings, target: 'leagueMetadata', documentId: actual.league && actual.league.id, field: 'stats', expected: expected.leagueTeamPatch.stats, actual: leagueTeam && leagueTeam.stats })
  compareField({ findings, target: 'leagueMetadata', documentId: actual.league && actual.league.id, field: 'scouting', expected: expected.leagueTeamPatch.scouting, actual: Object.fromEntries(
    Object.keys(expected.leagueTeamPatch.scouting || {}).map(key => [key, leagueTeam?.scouting?.[key]])
  ) })

  const leaguesCenterTeam = object(
    object(
      object(
        object(
          object(actual.leaguesCenter).leaguesById
        )[identity.leagueId]
      ).seasonsById
    )[seasonId]
  ).teamsById
  const actualLeaguesCenterTeam = object(leaguesCenterTeam)[identity.teamId]
  if (!actualLeaguesCenterTeam) {
    findings.push(finding({
      type: 'missing_projection',
      target: 'leaguesCenter',
      documentId: 'all',
      field: 'team',
      expected: expected.leaguesCenterTeam,
      actual: null,
    }))
  } else {
    ;['documentationState', 'documentationStateUpdatedAt'].forEach(field => {
      compareField({ findings, target: 'leaguesCenter', documentId: 'all', field, expected: expected.leaguesCenterTeam[field], actual: actualLeaguesCenterTeam[field] })
    })
  }

  const actualClubsCenterTeam = object(
    object(
      object(
        object(actual.clubsCenter).clubsById
      )[identity.clubId]
    ).teamsById
  )[identity.teamId]
  if (!actualClubsCenterTeam) {
    findings.push(finding({
      type: 'missing_projection',
      target: 'clubsCenter',
      documentId: seasonId,
      field: 'team',
      expected: expected.clubsCenterTeam,
      actual: null,
    }))
  } else {
    ;['documentationState', 'documentationStateUpdatedAt', 'transfers'].forEach(field => {
      compareField({ findings, target: 'clubsCenter', documentId: seasonId, field, expected: expected.clubsCenterTeam[field], actual: actualClubsCenterTeam[field] })
    })
  }

  ;(expected.counterpartClubsCenterProjections || []).forEach(projection => {
    const actualTeam = object(
      object(
        object(
          object(actual.clubsCenter).clubsById
        )[projection.clubId]
      ).teamsById
    )[projection.teamId]
    compareField({
      findings,
      target: 'clubsCenter',
      documentId: projection.seasonId,
      field: `clubsById.${projection.clubId}.teamsById.${projection.teamId}.transfers`,
      expected: object(projection.team).transfers,
      actual: object(actualTeam).transfers,
    })
  })

  findings.push(...compareTeamSignalSummaries({
    teamId: identity.teamId, clubId: identity.clubId, seasonId,
    leagueTeam, teamSeason, leaguesCenterTeam: actualLeaguesCenterTeam, clubsCenterTeam: actualClubsCenterTeam,
    expectedSummary: expectedSignalSummary,
  }))
  return findings
}
