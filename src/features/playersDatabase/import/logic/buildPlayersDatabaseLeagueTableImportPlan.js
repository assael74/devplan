import { resolveClubCatalogMatch, resolveLeagueCatalogMatch, resolveTeamCatalogMatch } from '../../catalog/catalogResolvers.js'

const clean = (value) => String(value ?? '').trim()

const normalizeKey = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/\s+/g, ' ')

const pick = (row = {}, keys = []) => {
  for (const key of keys) {
    const value = clean(row?.[key])
    if (value) return value
  }

  return ''
}

const buildLeagueContext = (row = {}) => ({
  leagueId: pick(row, ['leagueId']),
  seasonId: pick(row, ['seasonId']),
  leagueName: pick(row, ['leagueName', 'currentLeagueName']),
  leagueNum: pick(row, ['leagueNum']),
  teamsCount: pick(row, ['teamsCount']),
  ageGroupId: pick(row, ['ageGroupId', 'ageGroup']),
  birthYear: pick(row, ['birthYear']),
  capturedAt: pick(row, ['capturedAt']),
})

const buildLeagueKey = (context = {}, leagueMatch = null) =>
  [
    leagueMatch?.id || normalizeKey(context.leagueName),
    normalizeKey(context.seasonId),
    normalizeKey(context.birthYear),
    normalizeKey(context.ageGroupId),
    normalizeKey(context.leagueNum),
  ].filter(Boolean).join('|')

const buildRowIdentity = (row = {}, rowIndex = 0) => {
  const clubName = pick(row, ['clubName', 'currentClubName']) || pick(row, ['teamName', 'currentTeamName'])
  const teamName = pick(row, ['teamName', 'currentTeamName']) || clubName
  const context = buildLeagueContext(row)
  const clubMatch = resolveClubCatalogMatch(clubName)
  const teamMatch = resolveTeamCatalogMatch(teamName, {
    clubCatalogId: clubMatch?.id,
    clubName: clubMatch?.name || clubName,
    club: clubMatch?.item,
    seasonId: context.seasonId,
    ageGroup: context.ageGroupId,
  })
  const leagueMatch = resolveLeagueCatalogMatch(context.leagueName, {
    seasonId: context.seasonId,
    ageGroup: context.ageGroupId,
    birthYear: context.birthYear,
  })

  return {
    rowId: clean(row.rowId) || `league-row-${rowIndex + 1}`,
    ...context,
    clubName,
    teamName,
    clubMatch,
    teamMatch,
    leagueMatch,
    leagueKey: buildLeagueKey(context, leagueMatch),
  }
}

const isValidLeagueTableRow = (identity) => {
  if (!identity.seasonId) return false
  if (!identity.leagueName) return false
  if (!identity.birthYear && !identity.ageGroupId) return false
  if (!identity.clubName && !identity.teamName) return false
  return true
}

const getIssues = (identity) => {
  const issues = []

  if (!identity.seasonId) issues.push('missing_season_id')
  if (!identity.leagueName) issues.push('missing_league_name')
  if (!identity.birthYear && !identity.ageGroupId) issues.push('missing_birth_year_or_age_group')
  if (!identity.clubName && !identity.teamName) issues.push('missing_club_or_team_name')
  if (!identity.leagueMatch) issues.push('league_catalog_match_not_found')
  if (identity.clubName && !identity.clubMatch) issues.push('club_catalog_match_not_found')
  if (identity.teamName && !identity.teamMatch) issues.push('team_slot_match_not_found')

  return issues
}

const createEmptyPlan = () => ({
  flowType: 'league_table',
  summary: {
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
    uniqueLeagueContexts: 0,
    matchedLeagues: 0,
    unmatchedLeagues: 0,
    matchedClubs: 0,
    unmatchedClubs: 0,
    matchedTeams: 0,
    unmatchedTeams: 0,
  },
  rows: [],
  indexes: {
    leagueContextsByKey: {},
  },
})

const pushLeagueContext = (plan, rowPlan) => {
  const key = rowPlan.identity.leagueKey
  if (!key) return

  if (!plan.indexes.leagueContextsByKey[key]) {
    plan.indexes.leagueContextsByKey[key] = {
      key,
      seasonId: rowPlan.identity.seasonId,
      leagueId: rowPlan.identity.leagueId,
      leagueName: rowPlan.identity.leagueName,
      leagueNum: rowPlan.identity.leagueNum,
      teamsCount: rowPlan.identity.teamsCount,
      ageGroupId: rowPlan.identity.ageGroupId,
      birthYear: rowPlan.identity.birthYear,
      leagueCatalogId: rowPlan.identity.leagueMatch?.id || '',
      rows: [],
    }
  }

  plan.indexes.leagueContextsByKey[key].rows.push(rowPlan)
}

const finalizeSummary = (plan) => {
  plan.summary.uniqueLeagueContexts = Object.keys(plan.indexes.leagueContextsByKey).length

  plan.rows.forEach((rowPlan) => {
    const { identity } = rowPlan

    if (identity.leagueMatch) plan.summary.matchedLeagues += 1
    else plan.summary.unmatchedLeagues += 1

    if (identity.clubMatch) plan.summary.matchedClubs += 1
    else plan.summary.unmatchedClubs += 1

    if (identity.teamMatch) plan.summary.matchedTeams += 1
    else plan.summary.unmatchedTeams += 1
  })
}

export function buildPlayersDatabaseLeagueTableImportPlan(rows = []) {
  const plan = createEmptyPlan()
  const safeRows = Array.isArray(rows) ? rows : []

  plan.summary.totalRows = safeRows.length

  safeRows.forEach((row, rowIndex) => {
    const identity = buildRowIdentity(row, rowIndex)
    const issues = getIssues(identity)
    const valid = isValidLeagueTableRow(identity)

    const rowPlan = {
      rowIndex,
      identity,
      sourceRow: row,
      valid,
      status: valid ? 'valid' : 'invalid',
      issues: valid ? issues.filter((issue) => issue.endsWith('_not_found')) : issues,
    }

    plan.rows.push(rowPlan)

    if (valid) {
      plan.summary.validRows += 1
      pushLeagueContext(plan, rowPlan)
    } else {
      plan.summary.invalidRows += 1
    }
  })

  finalizeSummary(plan)

  return plan
}
