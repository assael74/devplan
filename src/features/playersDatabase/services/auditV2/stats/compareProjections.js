import {
  normalizeComparableValue,
} from '../../shared/valueComparison.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const same = (left, right) => (
  JSON.stringify(normalizeComparableValue(left)) ===
  JSON.stringify(normalizeComparableValue(right))
)

const pickExpectedFields = (actual, expected) => {
  if (Array.isArray(expected)) return actual

  if (
    expected &&
    typeof expected === 'object' &&
    !Array.isArray(expected)
  ) {
    return Object.keys(expected).reduce(
      (result, key) => ({
        ...result,
        [key]: pickExpectedFields(actual?.[key], expected[key]),
      }),
      {}
    )
  }

  return actual
}

const resolveLeagueSeason = ({
  league = {},
  expected = {},
} = {}) => {
  if (clean(expected.sourceTarget) === 'current') {
    return league.current || null
  }

  return (Array.isArray(league.history) ? league.history : [])
    .find(row => (
      clean(row?.seasonKey || row?.seasonId) ===
      clean(expected.seasonKey)
    )) || null
}

const resolveLeagueTeam = ({
  league = {},
  expected = {},
} = {}) => {
  const season = resolveLeagueSeason({
    league,
    expected,
  })

  return (Array.isArray(season?.tableRank)
    ? season.tableRank
    : []).find(row => (
    [
      row?.birthTeamDocumentId,
      row?.birthTeamId,
      row?.teamDocumentId,
      row?.teamId,
    ].map(clean).includes(clean(expected.birthTeamDocumentId))
  )) || null
}

export function compareStatsProjectionsV2({
  expected = {},
  actual = {},
} = {}) {
  const findings = []
  const actualPlayers = new Map(
    (actual.playerSearchIndexes || [])
      .map(row => [clean(row.id), row])
  )

  ;(expected.playerSearchIndexes || []).forEach(row => {
    const current = actualPlayers.get(clean(row.docId))

    if (!current) {
      findings.push({
        type: 'missing_projection',
        target: 'playerSearchIndex',
        documentId: clean(row.docId),
        reason: 'Stats Player SearchIndex is missing.',
        expected: row.fields,
        actual: null,
      })
      return
    }

    const actualOwned = pickExpectedFields(
      current,
      row.fields
    )

    if (!same(actualOwned, row.fields)) {
      findings.push({
        type: 'projection_mismatch',
        target: 'playerSearchIndex',
        documentId: clean(row.docId),
        reason: 'Stats-owned Player SearchIndex fields do not match canonical Team Season.',
        expected: row.fields,
        actual: actualOwned,
      })
    }
  })

  const teamExpected = expected.teamSearchIndex || {}
  if (!actual.teamSearchIndex) {
    findings.push({
      type: 'missing_projection',
      target: 'teamSearchIndex',
      documentId: clean(teamExpected.docId),
      reason: 'Stats Team SearchIndex is missing.',
      expected: teamExpected.fields,
      actual: null,
    })
  } else {
    const actualOwned = pickExpectedFields(
      actual.teamSearchIndex,
      teamExpected.fields || {}
    )

    if (!same(actualOwned, teamExpected.fields || {})) {
      findings.push({
        type: 'projection_mismatch',
        target: 'teamSearchIndex',
        documentId: clean(teamExpected.docId),
        reason: 'Stats-owned Team SearchIndex fields do not match canonical Team Season.',
        expected: teamExpected.fields,
        actual: actualOwned,
      })
    }
  }

  const leagueExpected = expected.leagueMetadata || {}
  const actualTeam = resolveLeagueTeam({
    league: actual.league || {},
    expected: leagueExpected,
  })

  if (!actualTeam) {
    findings.push({
      type: 'missing_projection',
      target: 'leagueMetadata',
      documentId: clean(leagueExpected.leagueId),
      reason: 'Stats League team metadata row is missing.',
      expected: leagueExpected.fields,
      actual: null,
    })
  } else {
    const actualOwned = pickExpectedFields(
      actualTeam,
      leagueExpected.fields || {}
    )

    if (!same(actualOwned, leagueExpected.fields || {})) {
      findings.push({
        type: 'projection_mismatch',
        target: 'leagueMetadata',
        documentId: clean(leagueExpected.leagueId),
        reason: 'Stats-owned League metadata does not match canonical Team Season.',
        expected: leagueExpected.fields,
        actual: actualOwned,
      })
    }
  }

  return findings
}
