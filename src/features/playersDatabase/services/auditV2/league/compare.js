import { cleanValue } from '../../../model/shared/value.model.js'

const clean = cleanValue
const normalize = value => {
  if (Array.isArray(value)) return value.map(normalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== 'updatedAt' && key !== 'createdAt')
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, normalize(nestedValue)])
    )
  }
  return value
}
const same = (left, right) => JSON.stringify(normalize(left)) === JSON.stringify(normalize(right))

const pickIdentityEntry = entry => ({
  clubId: clean(entry?.clubId),
  ageGroupId: clean(entry?.ageGroupId),
  teamId: clean(entry?.teamId),
  teamSlot: Number(entry?.teamSlot) || 1,
  leagueId: clean(entry?.leagueId),
  leagueName: clean(entry?.leagueName),
  leagueLevel: Number(entry?.leagueLevel) || 0,
})

const finding = ({ type, target, documentId, reason, expected, actual, ...rest }) => ({
  type,
  target,
  documentId,
  reason,
  expected,
  actual,
  ...rest,
})

const valueAt = (value, path) => path.split('.').reduce(
  (current, key) => current && typeof current === 'object' ? current[key] : undefined,
  value
)

const compareFields = ({ target, documentId, teamId, expected, actual, fields }) => {
  const findings = []
  fields.forEach(field => {
    const expectedValue = valueAt(expected, field)
    const actualValue = valueAt(actual, field)
    if (same(expectedValue, actualValue)) return
    findings.push(finding({
      type: 'projection_mismatch',
      target,
      documentId,
      teamId,
      reason: `League-owned field does not match canonical League: ${field}`,
      expected: expectedValue,
      actual: actualValue,
      field,
    }))
  })
  return findings
}

const findClubAgeSeason = ({ club, expected }) => (
  (Array.isArray(club?.ageGroups) ? club.ageGroups : [])
    .find(group => clean(group?.ageGroupId) === clean(expected.ageGroupId))
    ?.seasons?.find(season => (
      clean(season?.teamId) === clean(expected.teamId)
      && clean(season?.seasonKey || season?.seasonId) === clean(expected.seasonKey)
      && clean(season?.league?.leagueId) === clean(expected.leagueId)
    )) || null
)

const findClubCompetitionSeason = ({ club, expected }) => (
  (Array.isArray(club?.competitionPaths) ? club.competitionPaths : [])
    .find(path => Number(path?.birthYear) === Number(expected.birthYear))
    ?.seasons?.find(season => (
      clean(season?.teamId) === clean(expected.teamId)
      && clean(season?.seasonKey || season?.seasonId) === clean(expected.seasonKey)
      && clean(season?.leagueId) === clean(expected.leagueId)
    )) || null
)

const compactLeagueOwnedPerformance = performance => ({
  tableRank: performance?.tableRank === undefined ? null : performance.tableRank,
  points: Number(performance?.points) || 0,
  teamGamePlayed: Number(performance?.teamGamePlayed) || 0,
  goalsFor: Number(performance?.goalsFor) || 0,
  goalsAgainst: Number(performance?.goalsAgainst) || 0,
  goalsForPerGame: performance?.goalsForPerGame === undefined
    ? null
    : performance.goalsForPerGame,
  goalsAgainstPerGame: performance?.goalsAgainstPerGame === undefined
    ? null
    : performance.goalsAgainstPerGame,
})

const compactClubSeasonLeagueFields = season => ({
  teamId: clean(season?.teamId),
  teamSlot: Number(season?.teamSlot) || null,
  seasonId: clean(season?.seasonId),
  seasonKey: clean(season?.seasonKey),
  seasonStatus: clean(season?.seasonStatus),
  birthYear: Number(season?.birthYear) || 0,
  league: {
    leagueId: clean(season?.league?.leagueId),
    leagueName: clean(season?.league?.leagueName),
    region: clean(season?.league?.region),
    leagueLevel: Number(season?.league?.leagueLevel) || null,
  },
  performance: compactLeagueOwnedPerformance(season?.performance),
})


const compactCompetitionLeagueFields = season => ({
  teamId: clean(season?.teamId),
  teamSlot: Number(season?.teamSlot) || null,
  seasonId: clean(season?.seasonId),
  seasonKey: clean(season?.seasonKey),
  seasonStatus: clean(season?.seasonStatus),
  ageGroupId: clean(season?.ageGroupId),
  leagueId: clean(season?.leagueId),
  leagueName: clean(season?.leagueName),
  leagueLevel: Number(season?.leagueLevel) || null,
  competitionProjection: {
    automatic: season?.competitionProjection?.automatic || {},
  },
})

const flattenClubsMasterTeams = master => (
  (Array.isArray(master?.clubs) ? master.clubs : []).flatMap(club => (
    (Array.isArray(club?.ageGroups) ? club.ageGroups : []).flatMap(group => (
      ['current', 'previous'].flatMap(bucket => (
        (Array.isArray(group?.[bucket]) ? group[bucket] : []).map(season => ({
          clubId: clean(club?.clubId),
          ageGroupId: clean(group?.ageGroupId),
          teamId: clean(season?.teamId),
          seasonKey: clean(season?.seasonKey || season?.seasonId),
          leagueId: clean(season?.league?.leagueId),
          season,
        }))
      ))
    ))
  ))
)

const masterLeagueSeasonFields = season => ({
  teamId: clean(season?.teamId),
  teamSlot: Number(season?.teamSlot) || null,
  seasonId: clean(season?.seasonId),
  seasonKey: clean(season?.seasonKey),
  seasonStatus: clean(season?.seasonStatus),
  birthYear: Number(season?.birthYear) || 0,
  league: {
    leagueId: clean(season?.league?.leagueId),
    leagueName: clean(season?.league?.leagueName),
    leagueLevel: Number(season?.league?.leagueLevel) || null,
  },
  performance: compactLeagueOwnedPerformance(season?.performance),
})


export function compareLeagueAuditV2({ expected = {}, actual = {}, leagueId = '', seasonKey = '' } = {}) {
  const findings = []
  const expectedTeamIds = new Set((expected.teams || []).map(item => clean(item.teamId)))

  ;(expected.teams || []).forEach(team => {
    const root = actual.teamRoots.find(item => item.teamId === team.teamId)?.document || null
    const season = actual.teamSeasons.find(item => item.teamId === team.teamId)?.document || null

    // League Contract: League load does not create Team Root/Season. If a Team Season exists,
    // its root and relation are required; if it does not exist, this is a valid League-only state.
    if (season && !root) {
      findings.push(finding({
        type: 'missing_canonical_relation',
        target: 'teams',
        documentId: team.teamDocumentId,
        teamId: team.teamId,
        reason: 'Team Season exists but its Team Root is missing.',
        expected: { exists: true },
        actual: { exists: false },
      }))
    }

    if (season) {
      findings.push(...compareFields({
        target: 'teamSeason',
        documentId: team.teamSeasonDocumentId,
        teamId: team.teamId,
        expected: team.teamSeasonLeagueFields,
        actual: season,
        fields: Object.keys(team.teamSeasonLeagueFields),
      }))
    }

    if (root && season) {
      const relationExists = (Array.isArray(root.seasons) ? root.seasons : []).some(item => (
        clean(item?.seasonKey) === clean(seasonKey)
        && clean(item?.seasonDocumentId) === clean(team.teamSeasonDocumentId)
      ))
      if (!relationExists) {
        findings.push(finding({
          type: 'relation_mismatch',
          target: 'teams',
          documentId: team.teamDocumentId,
          teamId: team.teamId,
          reason: 'Team Root does not reference its existing Team Season.',
          expected: { seasonKey, seasonDocumentId: team.teamSeasonDocumentId },
          actual: root.seasons || [],
        }))
      }
    }
  })

  ;(actual.scopedTeamSeasons || []).forEach(season => {
    const teamId = clean(season.birthTeamDocumentId || season.birthTeamId || season.id?.split('__')[0])
    if (expectedTeamIds.has(teamId)) return
    findings.push(finding({
      type: 'stale_projection',
      target: 'teamSeason',
      documentId: season.id,
      teamId,
      reason: 'Team Season still contains active League-owned data for a team no longer in the canonical table.',
      expected: { leagueId: '', seasonKey },
      actual: { leagueId: season.leagueId, seasonKey: season.seasonKey },
    }))
  })

  const actualIndexByTeam = new Map((actual.teamSearchIndexes || []).map(item => [item.teamId, item.document]))
  ;(expected.teamSearchIndexes || []).forEach(index => {
    const document = actualIndexByTeam.get(index.teamId)
    if (!document) {
      findings.push(finding({
        type: 'missing_projection', target: 'teamSearchIndex', documentId: index.id,
        teamId: index.teamId, reason: 'League-owned Team SearchIndex projection is missing.',
        expected: index.ownedFields, actual: null,
      }))
      return
    }
    Object.entries(index.ownedFields).forEach(([field, expectedValue]) => {
      if (same(expectedValue, document[field])) return
      findings.push(finding({
        type: 'projection_mismatch', target: 'teamSearchIndex', documentId: index.id,
        teamId: index.teamId, field,
        reason: `League-owned Team SearchIndex field does not match canonical League: ${field}`,
        expected: expectedValue, actual: document[field],
      }))
    })
    const teamSeasonExists = Boolean(actual.teamSeasons.find(item => item.teamId === index.teamId)?.document)
    const expectedRelation = teamSeasonExists ? index.teamSeasonDocumentId : ''
    const actualRelation = clean(document.teamSeasonDocumentId)
    if (expectedRelation !== actualRelation) {
      findings.push(finding({
        type: 'relation_mismatch', target: 'teamSearchIndex', documentId: index.id,
        teamId: index.teamId, field: 'teamSeasonDocumentId',
        reason: 'Team SearchIndex relation to Team Season does not match current canonical availability.',
        expected: expectedRelation, actual: actualRelation,
      }))
    }
  })

  ;(actual.scopedIndexes || []).forEach(index => {
    const teamId = clean(index.teamId || index.birthTeamDocumentId || index.birthTeamId)
    if (expectedTeamIds.has(teamId)) return
    findings.push(finding({
      type: 'stale_projection', target: 'teamSearchIndex', documentId: index.id, teamId,
      reason: 'Team SearchIndex still has League-owned data for a team no longer in the canonical table.',
      expected: { leagueId: '', seasonKey },
      actual: { leagueId: index.leagueId, seasonKey: index.seasonKey },
    }))
  })

  if (!actual.identity) {
    findings.push(finding({
      type: 'missing_projection', target: 'identity', documentId: expected.identity.documentId,
      reason: 'Club Season Identity Index is missing.', expected: expected.identity.entries, actual: null,
    }))
  } else {
    const actualLeagueEntries = (actual.identity.entries || [])
      .filter(entry => clean(entry?.leagueId) === clean(leagueId))
      .map(pickIdentityEntry)
    if (!same(expected.identity.entries, actualLeagueEntries)) {
      findings.push(finding({
        type: 'projection_mismatch', target: 'identity', documentId: expected.identity.documentId,
        reason: 'Identity entries for this League do not match the canonical League table.',
        expected: expected.identity.entries, actual: actualLeagueEntries,
      }))
    }
  }

  const clubsById = new Map((actual.clubs || []).map(club => [clean(club.clubId || club.id), club]))
  ;(expected.clubs || []).forEach(clubExpected => {
    const club = clubsById.get(clubExpected.clubId)
    if (!club) {
      findings.push(finding({
        type: 'missing_projection', target: 'club', documentId: clubExpected.clubId,
        teamId: clubExpected.teamId, reason: 'Expected Club projection document is missing.',
        expected: clubExpected, actual: null,
      }))
      return
    }
    const ageSeason = findClubAgeSeason({ club, expected: clubExpected })
    if (!ageSeason) {
      findings.push(finding({
        type: 'missing_projection', target: 'clubAgeGroupSeason', documentId: clubExpected.clubId,
        teamId: clubExpected.teamId, reason: 'Expected Club age-group League projection is missing.',
        expected: clubExpected.ageGroupSeason, actual: null,
      }))
    } else if (!same(clubExpected.ageGroupSeason, compactClubSeasonLeagueFields(ageSeason))) {
      findings.push(finding({
        type: 'projection_mismatch', target: 'clubAgeGroupSeason', documentId: clubExpected.clubId,
        teamId: clubExpected.teamId, reason: 'Club League-owned season projection does not match canonical League.',
        expected: clubExpected.ageGroupSeason, actual: compactClubSeasonLeagueFields(ageSeason),
      }))
    }
    const competitionSeason = findClubCompetitionSeason({ club, expected: clubExpected })
    if (!competitionSeason) {
      findings.push(finding({
        type: 'missing_projection', target: 'clubCompetitionPath', documentId: clubExpected.clubId,
        teamId: clubExpected.teamId, reason: 'Expected Club competition-path League projection is missing.',
        expected: clubExpected.competitionSeason, actual: null,
      }))
    } else if (!same(clubExpected.competitionSeason, compactCompetitionLeagueFields(competitionSeason))) {
      findings.push(finding({
        type: 'projection_mismatch', target: 'clubCompetitionPath', documentId: clubExpected.clubId,
        teamId: clubExpected.teamId, reason: 'Club competition-path League projection does not match canonical League.',
        expected: clubExpected.competitionSeason, actual: compactCompetitionLeagueFields(competitionSeason),
      }))
    }
  })

  const expectedLeaguesMasterEntry = expected.leaguesMasterEntry || null
  const rawActualLeaguesMasterEntry = (actual.leaguesMaster?.leagues || [])
    .find(entry => clean(entry?.leagueId || entry?.leagueDocumentId) === clean(leagueId)) || null
  const actualLeaguesMasterEntry = rawActualLeaguesMasterEntry
    ? {
        ...rawActualLeaguesMasterEntry,
        seasons: (rawActualLeaguesMasterEntry.seasons || []).filter(item => (
          clean(item?.seasonKey || item?.seasonId) === clean(seasonKey)
        )),
      }
    : null
  if (!actualLeaguesMasterEntry) {
    findings.push(finding({
      type: 'missing_projection', target: 'leaguesMaster', documentId: 'all',
      reason: 'Current League entry is missing from Leagues Master.',
      expected: expectedLeaguesMasterEntry, actual: null,
    }))
  } else if (!same(expectedLeaguesMasterEntry, actualLeaguesMasterEntry)) {
    findings.push(finding({
      type: 'projection_mismatch', target: 'leaguesMaster', documentId: 'all',
      reason: 'Current League entry in Leagues Master does not match its canonical League document.',
      expected: expectedLeaguesMasterEntry, actual: actualLeaguesMasterEntry,
    }))
  }


  const actualMasterTeams = flattenClubsMasterTeams(actual.clubsMaster)
  const expectedMasterTeams = expected.clubsMasterTeams || []
  expectedMasterTeams.forEach(item => {
    const actualItem = actualMasterTeams.find(candidate => (
      candidate.clubId === item.clubId
      && candidate.ageGroupId === item.ageGroupId
      && candidate.teamId === item.teamId
      && candidate.seasonKey === item.seasonKey
      && candidate.leagueId === item.leagueId
    ))
    if (!actualItem) {
      findings.push(finding({
        type: 'missing_projection', target: 'clubsMaster', documentId: 'all', teamId: item.teamId,
        reason: 'Expected League-owned Clubs Master team projection is missing.',
        expected: item.season, actual: null,
      }))
    } else if (!same(item.season, masterLeagueSeasonFields(actualItem.season))) {
      findings.push(finding({
        type: 'projection_mismatch', target: 'clubsMaster', documentId: 'all', teamId: item.teamId,
        reason: 'League-owned Clubs Master team projection does not match canonical League state.',
        expected: item.season, actual: masterLeagueSeasonFields(actualItem.season),
      }))
    }
  })

  actualMasterTeams.forEach(item => {
    if (item.leagueId !== clean(leagueId) || item.seasonKey !== clean(seasonKey)) return
    if (expectedTeamIds.has(item.teamId)) return
    findings.push(finding({
      type: 'stale_projection', target: 'clubsMaster', documentId: 'all', teamId: item.teamId,
      reason: 'Clubs Master still exposes a team removed from the canonical League table.',
      expected: null, actual: masterLeagueSeasonFields(item.season),
    }))
  })

  return findings
}
