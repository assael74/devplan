import { normalizeComparableValue } from '../../shared/valueComparison.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const same = (left, right) => JSON.stringify(normalizeComparableValue(left)) ===
  JSON.stringify(normalizeComparableValue(right))

const pickExpectedFields = (actual = {}, expected = {}) => Object.keys(expected).reduce(
  (result, key) => ({ ...result, [key]: actual?.[key] }),
  {}
)

const finding = ({ type, target, documentId, reason, expected, actual }) => ({
  type,
  target,
  documentId,
  reason,
  expected,
  actual,
})

const resolveLeagueSeason = ({ league = {}, target = {} } = {}) => {
  if (clean(target.sourceTarget) === 'current') return league.current || null

  return (Array.isArray(league.history) ? league.history : [])
    .find(row => clean(row?.seasonKey || row?.seasonId) === clean(target.seasonKey)) || null
}

const resolveLeagueTeam = ({ league = {}, target = {} } = {}) => {
  const season = resolveLeagueSeason({ league, target })
  return (Array.isArray(season?.tableRank) ? season.tableRank : [])
    .find(row => clean(
      row?.birthTeamDocumentId ||
      row?.birthTeamId ||
      row?.teamDocumentId ||
      row?.teamId ||
      row?.id
    ) === clean(target.birthTeamDocumentId)) || null
}

export function compareRosterAuditV2({
  expected = {},
  actual = {},
} = {}) {
  const findings = []
  const expectedPlayers = new Map(
    (expected.playerSearchIndexes || []).map(row => [clean(row.id), row])
  )
  const actualPlayers = new Map(
    (actual.playerSearchIndexes || []).map(row => [clean(row.id), row])
  )

  expectedPlayers.forEach((row, id) => {
    const current = actualPlayers.get(id)
    if (!current) {
      findings.push(finding({
        type: 'missing_projection',
        target: 'playerSearchIndex',
        documentId: id,
        reason: 'Player Season SearchIndex expected from the canonical roster is missing.',
        expected: row.fields,
        actual: null,
      }))
      return
    }

    const actualOwned = pickExpectedFields(current, row.fields)
    if (!same(actualOwned, row.fields)) {
      findings.push(finding({
        type: 'projection_mismatch',
        target: 'playerSearchIndex',
        documentId: id,
        reason: 'Roster-owned Player Season SearchIndex fields do not match the canonical roster.',
        expected: row.fields,
        actual: actualOwned,
      }))
    }
  })

  actualPlayers.forEach((row, id) => {
    if (expectedPlayers.has(id)) return
    findings.push(finding({
      type: 'stale_projection',
      target: 'playerSearchIndex',
      documentId: id,
      reason: 'Player Season SearchIndex remains in this team-season scope but is not in the canonical roster.',
      expected: null,
      actual: row,
    }))
  })

  const expectedTeamIndex = expected.teamSearchIndex || {}
  if (!actual.teamSearchIndex) {
    findings.push(finding({
      type: 'missing_projection',
      target: 'teamSearchIndex',
      documentId: expectedTeamIndex.id,
      reason: 'Team SearchIndex expected from the canonical roster is missing.',
      expected: expectedTeamIndex.fields,
      actual: null,
    }))
  } else {
    const actualOwned = pickExpectedFields(
      actual.teamSearchIndex,
      expectedTeamIndex.fields || {}
    )
    if (!same(actualOwned, expectedTeamIndex.fields || {})) {
      findings.push(finding({
        type: 'projection_mismatch',
        target: 'teamSearchIndex',
        documentId: expectedTeamIndex.id,
        reason: 'Roster-owned Team SearchIndex fields do not match the canonical roster.',
        expected: expectedTeamIndex.fields,
        actual: actualOwned,
      }))
    }
  }

  const leagueExpected = expected.leagueRosterMetadata || {}
  const leagueTeam = resolveLeagueTeam({
    league: actual.league || {},
    target: leagueExpected.target || {},
  })
  if (!leagueTeam) {
    findings.push(finding({
      type: 'missing_projection',
      target: 'leagueRosterMetadata',
      documentId: leagueExpected.leagueId,
      reason: 'The roster team row is missing from the canonical League season.',
      expected: leagueExpected.fields,
      actual: null,
    }))
  } else {
    const actualOwned = pickExpectedFields(leagueTeam, leagueExpected.fields || {})
    if (!same(actualOwned, leagueExpected.fields || {})) {
      findings.push(finding({
        type: 'projection_mismatch',
        target: 'leagueRosterMetadata',
        documentId: leagueExpected.leagueId,
        reason: 'Roster-owned League team metadata does not match the canonical Team Season.',
        expected: leagueExpected.fields,
        actual: actualOwned,
      }))
    }
  }

  return findings
}
