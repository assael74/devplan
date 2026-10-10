// src/features/playersDatabase/services/audit/roster/compare.js

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const list = value => Array.isArray(value) ? value : []
const withoutSyntheticId = value => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value
  const copy = { ...value }
  delete copy.id
  return copy
}
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
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = normalize(value[key])
      return result
    }, {})
  }
  return value
}
const same = (left, right) => JSON.stringify(normalize(left)) === JSON.stringify(normalize(right))

const finding = ({ type = 'projection_mismatch', target, documentId, field, expected, actual }) => ({
  type,
  target,
  documentId: clean(documentId),
  field,
  expected,
  actual,
})

const compareField = ({ findings, target, documentId, field, expected, actual }) => {
  if (!same(expected, actual)) findings.push(finding({ target, documentId, field, expected, actual }))
}

const getLeagueTeam = ({ league, seasonId, teamId }) => {
  const season = object(object(league && league.seasonsById)[seasonId])
  return object(object(season.table).teamsById)[teamId] || null
}

const getLeaguesCenterTeam = ({ leaguesCenter, leagueId, seasonId, teamId }) => {
  const league = object(object(leaguesCenter).leaguesById)[leagueId]
  const season = object(object(league).seasonsById)[seasonId]
  return object(object(season).teamsById)[teamId] || null
}

const getClubsCenterTeam = ({ clubsCenter, clubId, teamId }) => {
  const club = object(object(clubsCenter).clubsById)[clubId]
  return object(object(club).teamsById)[teamId] || null
}

export const compareRosterAudit = ({ actual = {}, expectedState = {}, approvedState = null } = {}) => {
  const findings = []
  const state = object(approvedState)
  const expected = expectedState.expected
  if (!expectedState.complete || !expected) {
    findings.push(finding({
      type: 'missing_expected_state',
      target: 'rosterAudit',
      documentId: state.teamSeasonDocumentId,
      field: expectedState.reason || 'approvedState',
      expected: 'present',
      actual: 'missing',
    }))
    return findings
  }

  const canonical = object(expected.canonical)
  if (canonical.teamRootOperation === 'SET') compareField({ findings, target: 'teamRoot', documentId: state.teamId, field: 'document', expected: canonical.teamRoot, actual: withoutSyntheticId(actual.teamRoot) })
  if (canonical.teamRootOperation === 'DELETE' && actual.teamRoot) findings.push(finding({ type: 'unexpected_document', target: 'teamRoot', documentId: state.teamId, field: 'document', expected: 'missing', actual: 'present' }))
  if (canonical.teamSeasonOperation === 'SET') compareField({ findings, target: 'teamSeason', documentId: state.teamSeasonDocumentId, field: 'document', expected: canonical.teamSeason, actual: withoutSyntheticId(actual.teamSeason) })
  if (canonical.teamSeasonOperation === 'DELETE' && actual.teamSeason) findings.push(finding({ type: 'unexpected_document', target: 'teamSeason', documentId: state.teamSeasonDocumentId, field: 'document', expected: 'missing', actual: 'present' }))

  list(expected.counterparts).forEach(row => {
    const current = object(actual.counterparts)[row.documentId]
    compareField({ findings, target: 'counterpart', documentId: row.documentId, field: 'movement', expected: row.movement, actual: current && current.movement })
  })

  list(expected.counterpartClubsCenterProjections).forEach(projection => {
    list(object(projection).clubWrites).forEach(clubWrite => {
      const clubId = clean(clubWrite && clubWrite.clubId)
      Object.entries(object(clubWrite && clubWrite.upsertTeamsById))
        .forEach(([teamId, expectedTeam]) => {
          compareField({
            findings,
            target: 'clubsCenter',
            documentId: clean(projection && projection.seasonId),
            field: `clubsById.${clubId}.teamsById.${teamId}`,
            expected: expectedTeam,
            actual: getClubsCenterTeam({
              clubsCenter: actual.clubsCenter,
              clubId,
              teamId,
            }),
          })
        })
    })
  })

  list(expected.playerSeasons).forEach(row => {
    const current = object(actual.playerSeasons)[row.documentId]
    if (row.operation === 'DELETE') {
      if (current) findings.push(finding({ type: 'unexpected_document', target: 'playerSeason', documentId: row.documentId, field: 'document', expected: 'missing', actual: 'present' }))
      return
    }
    if (!current) {
      findings.push(finding({ type: 'missing_document', target: 'playerSeason', documentId: row.documentId, field: 'document', expected: 'present', actual: 'missing' }))
      return
    }
    if (row.operation === 'UPSERT_TEAM') compareField({ findings, target: 'playerSeason', documentId: row.documentId, field: `teamsById.${row.teamId}`, expected: row.document && row.document.teamsById && row.document.teamsById[row.teamId], actual: current.teamsById && current.teamsById[row.teamId] })
    if (row.operation === 'REMOVE_TEAM' && current.teamsById && current.teamsById[row.teamId]) findings.push(finding({ target: 'playerSeason', documentId: row.documentId, field: `teamsById.${row.teamId}`, expected: 'missing', actual: 'present' }))
  })

  list(object(expected.playerSearchIndexes).upserts).forEach(row => compareField({ findings, target: 'playerSearchIndex', documentId: row.documentId, field: 'document', expected: row.document, actual: withoutSyntheticId(object(actual.playerSearchIndexes)[row.documentId]) }))
  list(object(expected.playerSearchIndexes).deletes).forEach(documentId => {
    if (object(actual.playerSearchIndexes)[documentId]) findings.push(finding({ type: 'unexpected_document', target: 'playerSearchIndex', documentId, field: 'document', expected: 'missing', actual: 'present' }))
  })

  const leagueTeam = getLeagueTeam({ league: actual.league, seasonId: state.seasonId, teamId: state.teamId })
  compareField({ findings, target: 'leagueRoster', documentId: state.leagueId, field: 'roster', expected: object(expected.leagueProjection).roster, actual: leagueTeam && leagueTeam.roster })

  const leaguesCenterTeam = getLeaguesCenterTeam({ leaguesCenter: actual.leaguesCenter, leagueId: state.leagueId, seasonId: state.seasonId, teamId: state.teamId })
  compareField({ findings, target: 'leaguesCenter', documentId: 'all', field: `teamsById.${state.teamId}`, expected: object(expected.leaguesCenterProjection).team, actual: leaguesCenterTeam })

  const clubsCenterTeam = getClubsCenterTeam({ clubsCenter: actual.clubsCenter, clubId: state.clubId, teamId: state.teamId })
  const clubWrite = list(object(expected.clubsCenterProjection).clubWrites)[0] || {}
  const expectedClubsCenterTeam = object(object(clubWrite).upsertTeamsById)[state.teamId] || null
  compareField({ findings, target: 'clubsCenter', documentId: state.seasonId, field: `clubsById.${state.clubId}.teamsById.${state.teamId}`, expected: expectedClubsCenterTeam, actual: clubsCenterTeam })

  return findings
}

export default compareRosterAudit
