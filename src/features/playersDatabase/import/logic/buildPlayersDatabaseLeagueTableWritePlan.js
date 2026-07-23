const clean = (value) => String(value ?? '').trim()

const toNumOrNull = (value) => {
  const text = clean(value)
  if (!text) return null

  const n = Number(text)
  return Number.isFinite(n) ? n : null
}

const uniq = (items = []) => Array.from(new Set(items.filter(Boolean)))

const seasonKey = (seasonId) => `s${clean(seasonId).replace(/[^0-9a-zA-Z]+/g, '_')}`

const leagueIdFrom = (context = {}) => {
  const existingLeagueId = clean(context.leagueId)
  if (existingLeagueId) return existingLeagueId

  const catalogId = clean(context.leagueCatalogId)
  if (catalogId) {
    return catalogId.replace(/^([0-9]{4}-[0-9]{4})_/, '')
  }

  return [
    clean(context.leagueName).toLowerCase().replace(/\s+/g, '-'),
    clean(context.ageGroupId),
    clean(context.leagueNum),
  ].filter(Boolean).join('_')
}

const standingRow = (rowPlan) => {
  const { identity, sourceRow } = rowPlan
  const goalsFor = toNumOrNull(sourceRow.goalsFor)
  const goalsAgainst = toNumOrNull(sourceRow.goalsAgainst)
  const explicitDiff = toNumOrNull(sourceRow.goalDifference)

  return {
    rowId: clean(identity.rowId),
    leaguePosition: toNumOrNull(sourceRow.leaguePosition ?? sourceRow.position),
    clubId: clean(identity.clubMatch?.id),
    clubName: clean(identity.clubMatch?.name || identity.clubName),
    games: toNumOrNull(sourceRow.games),
    wins: toNumOrNull(sourceRow.wins),
    draws: toNumOrNull(sourceRow.draws),
    losses: toNumOrNull(sourceRow.losses),
    goalsFor,
    goalsAgainst,
    goalDifference: explicitDiff ?? (
      goalsFor === null || goalsAgainst === null ? null : goalsFor - goalsAgainst
    ),
    points: toNumOrNull(sourceRow.points),
  }
}

const leagueBase = (context, rows) => {
  const firstRow = rows[0]
  const item = firstRow?.identity?.leagueMatch?.item || {}
  const leagueId = leagueIdFrom(context)

  return {
    id: leagueId,
    catalogLeagueId: clean(context.leagueCatalogId),
    leagueName: clean(item.name || context.leagueName),
    level: item.level ?? null,
    region: clean(item.region),
    leagueNum: context.leagueNum === '' ? null : Number(context.leagueNum),
    ageGroupId: clean(item.ageGroupId || context.ageGroupId),
    ageGroupLabel: clean(item.ageGroupLabel),
  }
}

const seasonState = (context, rows) => {
  const loadedRows = rows.map(standingRow)
  const clubIds = uniq(loadedRows.map((row) => row.clubId))
  const clubsCount = context.teamsCount === '' ? loadedRows.length : Number(context.teamsCount)

  return {
    seasonId: clean(context.seasonId),
    birthYears: context.birthYear === '' ? [] : [Number(context.birthYear)],
    primaryBirthYear: context.birthYear === '' ? null : Number(context.birthYear),
    clubsCount,
    loadedClubsCount: loadedRows.length,
    clubIds,
  }
}

const leagueUpsert = (context, rows) => {
  const base = leagueBase(context, rows)
  const key = seasonKey(context.seasonId)

  return {
    ...base,
    seasons: {
      [key]: seasonState(context, rows),
    },
  }
}

export function buildPlayersDatabaseLeagueTableWritePlan(importPlan = {}) {
  const contexts = Object.values(importPlan?.indexes?.leagueContextsByKey || {})

  const writePlan = {
    flowType: 'league_table',
    leaguesToUpsert: [],
    warnings: [],
    blockedRows: [],
  }

  contexts.forEach((context) => {
    const rows = context.rows.filter((rowPlan) => rowPlan.valid)
    if (!rows.length) return

    writePlan.leaguesToUpsert.push(leagueUpsert(context, rows))
  })

  const rows = Array.isArray(importPlan?.rows) ? importPlan.rows : []
  rows.forEach((rowPlan) => {
    if (!rowPlan.valid) {
      writePlan.blockedRows.push({
        rowId: rowPlan.identity?.rowId,
        reason: 'invalid_league_table_row',
        issues: rowPlan.issues || [],
      })
      return
    }

    rowPlan.issues.forEach((issue) => {
      writePlan.warnings.push({
        rowId: rowPlan.identity?.rowId,
        type: issue,
        message: issue,
      })
    })
  })

  return {
    ...writePlan,
    summary: {
      leaguesToUpsert: writePlan.leaguesToUpsert.length,
      warnings: writePlan.warnings.length,
      blockedRows: writePlan.blockedRows.length,
    },
  }
}
