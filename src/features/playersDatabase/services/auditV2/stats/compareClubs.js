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

const findClubSeason = ({
  club = {},
  expected = {},
} = {}) => {
  const ageGroup = (Array.isArray(club?.ageGroups)
    ? club.ageGroups
    : []).find(row => (
    clean(row?.ageGroupId) ===
    clean(expected.ageGroupId)
  ))

  return (Array.isArray(ageGroup?.seasons)
    ? ageGroup.seasons
    : []).find(row => (
    clean(row?.seasonKey || row?.seasonId) ===
      clean(expected.seasonKey) &&
    clean(row?.teamId) === clean(expected.teamId)
  )) || null
}

const findMasterSeason = ({
  master = {},
  expected = {},
} = {}) => {
  const club = (Array.isArray(master?.clubs)
    ? master.clubs
    : []).find(row => (
    clean(row?.clubId) === clean(expected.clubId)
  ))
  const ageGroup = (Array.isArray(club?.ageGroups)
    ? club.ageGroups
    : []).find(row => (
    clean(row?.ageGroupId) ===
    clean(expected.ageGroupId)
  ))
  const rows = [
    ...(Array.isArray(ageGroup?.current)
      ? ageGroup.current
      : []),
    ...(Array.isArray(ageGroup?.previous)
      ? ageGroup.previous
      : []),
  ]

  return rows.find(row => (
    clean(row?.seasonKey || row?.seasonId) ===
      clean(expected.seasonKey) &&
    clean(row?.teamId) === clean(expected.teamId)
  )) || null
}

const pickExpectedFields = ({
  actual = {},
  expected = {},
} = {}) => {
  if (!expected || typeof expected !== 'object' || Array.isArray(expected)) {
    return actual
  }

  return Object.fromEntries(
    Object.entries(expected).map(([key, value]) => [
      key,
      value && typeof value === 'object' && !Array.isArray(value)
        ? pickExpectedFields({ actual: actual?.[key] || {}, expected: value })
        : actual?.[key],
    ])
  )
}

const compareOne = ({
  expected = {},
  expectedSeason = expected.season,
  actualSeason = null,
  target = '',
  documentId = '',
} = {}) => {
  if (!actualSeason) {
    return [{
      type: 'missing_projection',
      target,
      documentId,
      reason: `Stats ${target} age-group season projection is missing.`,
      expected: expectedSeason,
      actual: null,
    }]
  }

  const actualOwned = pickExpectedFields({
    actual: actualSeason,
    expected: expectedSeason,
  })

  if (same(actualOwned, expectedSeason)) return []

  return [{
    type: 'projection_mismatch',
    target,
    documentId,
    reason: `Stats ${target} age-group season does not match canonical Team Season.`,
    expected: expectedSeason,
    actual: actualOwned,
  }]
}

export function compareStatsClubsV2({
  expectedClubs = [],
  actual = {},
} = {}) {
  const clubsById = new Map(
    (actual.clubs || []).map(row => [
      clean(row?.clubId),
      row?.club || null,
    ])
  )
  const clubFindings = []
  const masterFindings = []

  ;(expectedClubs || []).forEach(expected => {
    clubFindings.push(...compareOne({
      expected,
      actualSeason: findClubSeason({
        club: clubsById.get(clean(expected.clubId)) || {},
        expected,
      }),
      target: 'club',
      documentId: clean(expected.clubId),
    }))

    masterFindings.push(...compareOne({
      expected,
      expectedSeason: expected.masterSeason || expected.season,
      actualSeason: findMasterSeason({
        master: actual.clubsMaster || {},
        expected,
      }),
      target: 'clubsMaster',
      documentId: 'all',
    }))
  })

  return {
    clubFindings,
    masterFindings,
  }
}

