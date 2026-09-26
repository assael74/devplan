import { normalizeComparableValue } from '../../shared/valueComparison.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const same = (left, right) => JSON.stringify(normalizeComparableValue(left)) === JSON.stringify(normalizeComparableValue(right))

const findClubSeason = ({ club = {}, expected = {} } = {}) => {
  const ageGroup = (Array.isArray(club?.ageGroups) ? club.ageGroups : [])
    .find(row => clean(row?.ageGroupId) === clean(expected.ageGroupId))
  return (Array.isArray(ageGroup?.seasons) ? ageGroup.seasons : [])
    .find(row => clean(row?.seasonKey || row?.seasonId) === clean(expected.seasonKey) && clean(row?.teamId) === clean(expected.teamId)) || null
}

const pickOwned = season => ({
  teamId: clean(season?.teamId),
  teamSlot: season?.teamSlot === undefined || season?.teamSlot === null ? null : Number(season.teamSlot),
  seasonKey: clean(season?.seasonKey || season?.seasonId),
  playersCount: season?.playersCount === undefined || season?.playersCount === null ? undefined : Number(season.playersCount),
  transfers: season?.transfers === undefined ? undefined : season.transfers,
})

const findMasterSeason = ({ master = {}, expected = {} } = {}) => {
  const club = (Array.isArray(master?.clubs) ? master.clubs : [])
    .find(row => clean(row?.clubId) === clean(expected.clubId))
  const ageGroup = (Array.isArray(club?.ageGroups) ? club.ageGroups : [])
    .find(row => clean(row?.ageGroupId) === clean(expected.ageGroupId))
  const candidates = [
    ...(Array.isArray(ageGroup?.current) ? ageGroup.current : []),
    ...(Array.isArray(ageGroup?.previous) ? ageGroup.previous : []),
  ]
  return candidates.find(row => clean(row?.seasonKey || row?.seasonId) === clean(expected.seasonKey) && clean(row?.teamId) === clean(expected.teamId)) || null
}

const compareTarget = ({ expected = {}, actualSeason = null, target = '', documentId = '' } = {}) => {
  if (!actualSeason) return [{
    type: 'missing_projection', target, documentId,
    reason: `Roster-owned ${target} projection is missing.`,
    expected: expected.fields, actual: null,
  }]
  const actualOwned = pickOwned(actualSeason)
  if (same(actualOwned, expected.fields || {})) return []
  return [{
    type: 'projection_mismatch', target, documentId,
    reason: `Roster-owned ${target} fields do not match canonical Team Season.`,
    expected: expected.fields, actual: actualOwned,
  }]
}

export function compareRosterClubsV2({ expectedClubs = [], actual = {} } = {}) {
  const clubsById = new Map((actual.clubs || []).map(row => [clean(row?.clubId), row?.club || null]))
  const clubFindings = []
  const masterFindings = []
  ;(expectedClubs || []).forEach(expected => {
    clubFindings.push(...compareTarget({
      expected,
      actualSeason: findClubSeason({ club: clubsById.get(clean(expected.clubId)) || {}, expected }),
      target: 'club',
      documentId: clean(expected.clubId),
    }))
    if (expected.clubsMasterExpected !== false) {
      masterFindings.push(...compareTarget({
        expected,
        actualSeason: findMasterSeason({ master: actual.clubsMaster || {}, expected }),
        target: 'clubsMaster',
        documentId: 'all',
      }))
    }
  })
  return { clubFindings, masterFindings }
}
