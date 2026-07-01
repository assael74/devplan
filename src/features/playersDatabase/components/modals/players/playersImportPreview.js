// src/features/playersDatabase/components/modals/players/playersImportPreview.js

import { buildPlayersDatabaseImportPlan } from '../../../import/logic/buildPlayersDatabaseImportPlan.js'
import { buildPlayersDatabaseWritePlan } from '../../../import/logic/buildPlayersDatabaseWritePlan.js'
import { normalizePlayersDatabaseImportRows } from '../../../import/logic/normalizePlayersDatabaseImportRows.js'
import { parsePlayersDatabasePastedTable } from '../../../import/logic/parsePlayersDatabasePastedTable.js'
import { PLAYERS_DATABASE_SEASONS_CATALOG } from '../../../catalog/seasons.catalog.js'
import { PLAYERS_DATABASE_TEAM_SLOT_TEMPLATE } from '../../../catalog/teamSlots.catalog.js'
import { buildTeamIdentity } from '../../../catalog/teamIdentity.js'

const clean = value => String(value ?? '').trim()

const normalizeSeason = value =>
  clean(value).replace(/\s+/g, '').replace('/', '-')

const normalizeDuplicateName = value =>
  clean(value)
    .replace(/[׳״'"]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()

const ageGroupIdFromLabel = value => {
  const label = clean(value)
  if (!label) return ''

  return PLAYERS_DATABASE_TEAM_SLOT_TEMPLATE.find(item => (
    item.ageGroupLabel === label ||
    item.ageGroupId === label
  ))?.ageGroupId || ''
}

const seasonExists = seasonId => (
  PLAYERS_DATABASE_SEASONS_CATALOG.some(season => season.id === seasonId)
)

const hasPathTeamContext = row => Boolean(
  clean(row.teamSeasonKey) ||
  (
    clean(row.leagueId) &&
    clean(row.seasonId) &&
    clean(row.ageGroupId) &&
    (clean(row.clubId) || clean(row.clubName)) &&
    (
      clean(row.teamSlotId) ||
      clean(row.teamId) ||
      clean(row.teamCatalogId) ||
      clean(row.externalTeamId) ||
      clean(row.teamSlot)
    )
  )
)

const normalizeLeagueName = row => {
  const leagueName = clean(row.leagueName)
  const ageGroupLabel = clean(row.ageGroupId || row.ageGroupLabel)
  const bare = leagueName
    .replace(/[׳״'"]/g, '')
    .replace(ageGroupLabel, ' ')
    .replace(/^\s*ליג[הת]\s+/, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (bare === 'על') return 'ליגת העל'
  return bare || leagueName
}

const buildCatalogReadyRows = (rows, context = {}) => rows.map(row => {
  const seasonId = normalizeSeason(row.seasonId || context.seasonId)
  const ageGroupValue = row.ageGroupId ||
    row.ageGroupLabel ||
    context.ageGroupId ||
    context.ageGroupLabel
  const ageGroupId = ageGroupIdFromLabel(ageGroupValue) ||
    clean(row.ageGroupId || context.ageGroupId)
  const teamSlot = clean(row.teamSlot || context.teamSlot)
  const slotTeamName = ageGroupId && teamSlot
    ? `${ageGroupValue} ${teamSlot}`
    : ''
  const leagueName = row.leagueName ||
    context.leagueName ||
    context.sourceLeagueName

  return {
    ...row,
    seasonId,
    birthYear: clean(row.birthYear || context.birthYear || context.playerBirthYear || context.ageGroupYear),
    ageGroupLabel: clean(row.ageGroupLabel || row.ageGroupId || context.ageGroupLabel || context.ageGroupId),
    ageGroupId,
    clubId: clean(row.clubId || context.clubId),
    clubName: clean(row.clubName || context.clubName),
    externalTeamId: clean(row.externalTeamId || context.externalTeamId),
    leagueId: clean(row.leagueId || context.leagueId),
    teamId: clean(row.teamId || context.teamId),
    teamCatalogId: clean(row.teamCatalogId || context.teamCatalogId),
    teamSlotId: clean(row.teamSlotId || context.teamSlotId || context.teamId || context.teamCatalogId),
    teamSeasonKey: clean(row.teamSeasonKey || context.teamSeasonKey),
    teamSlot,
    leagueName: normalizeLeagueName({
      ...row,
      leagueName,
      ageGroupLabel: ageGroupValue,
    }),
    sourceLeagueName: clean(row.leagueName || context.sourceLeagueName || context.leagueName),
    sourceTeamName: clean(row.teamName || context.sourceTeamName || context.teamName || context.clubName),
    teamName: clean(context.clubName || context.teamName || row.clubName || row.teamName) || slotTeamName,
  }
})

const playerDocId = row => {
  const externalId = clean(row.externalPlayerId)
  if (!externalId) return ''

  return `fb_${externalId}`
}

const playerSeasonDocId = (row, teamIdentity = {}) => {
  const playerId = playerDocId(row)
  const teamKey = clean(teamIdentity.teamSeasonKey)

  if (!playerId || !teamKey) return ''

  return `${playerId}__${teamKey}`
}

const buildExistingIdentity = existingPlayers => {
  const players = Array.isArray(existingPlayers) ? existingPlayers : []

  return {
    externalPlayerIds: new Set(
      players.map(player => clean(player.externalPlayerId)).filter(Boolean)
    ),
    names: new Set(
      players.map(player => normalizeDuplicateName(player.fullName || player.playerName)).filter(Boolean)
    ),
  }
}

const getRowIssues = (
  row,
  rowPlan = {},
  duplicateNames = new Set(),
  existingIdentity = buildExistingIdentity([])
) => {
  const issues = []
  const policy = rowPlan?.policy || {}

  if (!clean(row.externalPlayerId)) issues.push('חסר Player ID')
  if (!clean(row.fullName)) issues.push('חסר שם שחקן')
  if (!clean(row.seasonId)) issues.push('חסרה עונה')
  else if (!seasonExists(clean(row.seasonId))) {
    issues.push('העונה לא קיימת בקטלוג')
  }
  const hasContext = hasPathTeamContext(row)

  if (!hasContext && !clean(row.externalTeamId) && !clean(row.teamName)) {
    issues.push('חסר Team ID או שם קבוצה')
  }
  if (!hasContext && !policy.club?.catalogMatch?.id) {
    issues.push('המועדון לא זוהה בקטלוג')
  }
  if (!hasContext && !policy.team?.catalogMatch?.id) {
    issues.push('הקבוצה/שנתון לא זוהו ב-team slots')
  }
  if (!hasContext && !policy.league?.catalogMatch?.id) {
    issues.push('הליגה לא זוהתה בקטלוג')
  }
  if (duplicateNames.has(normalizeDuplicateName(row.fullName))) {
    issues.push('שם שחקן כפול בהדבקה')
  }
  if (existingIdentity.externalPlayerIds.has(clean(row.externalPlayerId))) {
    issues.push('השחקן כבר קיים בקבוצה לפי Player ID')
  } else if (existingIdentity.names.has(normalizeDuplicateName(row.fullName))) {
    issues.push('שם שחקן כבר קיים בקבוצה')
  }

  return issues
}

const buildPreviewRow = (row, index, rowPlan, duplicateNames, existingIdentity) => {
  const policy = rowPlan?.policy || null
  const clubMatch = policy?.club?.catalogMatch || null
  const leagueMatch = policy?.league?.catalogMatch || null
  const teamMatch = policy?.team?.catalogMatch || null
  const teamSlot = Number(row.teamSlot) ||
    Number(teamMatch?.slot?.slot) ||
    1
  const builtTeamIdentity = buildTeamIdentity({
    clubId: row.clubId || clubMatch?.id,
    clubName: row.clubName || clubMatch?.name,
    seasonId: row.seasonId,
    ageGroupId: row.ageGroupId,
    ageGroupLabel: row.ageGroupLabel,
    teamSlot,
    leagueId: row.leagueId || leagueMatch?.id,
    leagueName: row.leagueName || leagueMatch?.name,
    externalTeamId: row.externalTeamId,
  })
  const teamIdentity = {
    ...builtTeamIdentity,
    teamSeasonKey: clean(row.teamSeasonKey) || builtTeamIdentity.teamSeasonKey,
    teamSlotId: clean(row.teamSlotId) || builtTeamIdentity.teamSlotId,
    teamId: clean(row.teamId) || clean(row.teamSlotId) || builtTeamIdentity.teamSlotId,
    teamCatalogId: clean(row.teamCatalogId) || clean(row.teamSlotId) || builtTeamIdentity.teamSlotId,
  }
  const issues = getRowIssues(row, rowPlan, duplicateNames, existingIdentity)
  const seasonDocId = playerSeasonDocId(row, teamIdentity)

  if (!seasonDocId) {
    issues.push('חסר הקשר קבוצה מהנתיב')
  }

  return {
    rowId: row.rowId || `player-row-${index + 1}`,
    rowIndex: index,
    source: row,
    policy,
    clubMatch,
    leagueMatch,
    teamMatch,
    teamIdentity,
    valid: issues.length === 0,
    issues,
    playerDocId: playerDocId(row),
    playerSeasonDocId: seasonDocId,
  }
}

const buildSummary = rows => {
  const validRows = rows.filter(row => row.valid)
  const playerIds = new Set(validRows.map(row => row.playerDocId).filter(Boolean))
  const playerSeasonIds = new Set(validRows.map(row => row.playerSeasonDocId).filter(Boolean))
  const matchedClubIds = new Set(rows.map(row => (
    row.clubMatch?.id || row.teamIdentity?.clubId || row.source?.clubId
  )).filter(Boolean))
  const matchedLeagueIds = new Set(rows.map(row => (
    row.leagueMatch?.id || row.teamIdentity?.leagueId || row.source?.leagueId
  )).filter(Boolean))

  return {
    total: rows.length,
    valid: validRows.length,
    error: rows.length - validRows.length,
    uniquePlayers: playerIds.size,
    playerSeasonLinks: playerSeasonIds.size,
    matchedClubs: matchedClubIds.size,
    matchedLeagues: matchedLeagueIds.size,
  }
}

export function buildPlayersImportPreview(text = '', context = {}, existingPlayers = []) {
  const parsed = parsePlayersDatabasePastedTable(text)

  if (!parsed.ok) {
    return {
      ok: false,
      message: parsed.message,
      headers: [],
      rows: [],
      unknownHeaders: [],
      importPlan: buildPlayersDatabaseImportPlan([]),
      writePlan: buildPlayersDatabaseWritePlan({ rows: [] }),
      summary: buildSummary([]),
    }
  }

  const normalized = normalizePlayersDatabaseImportRows({
    headers: parsed.headers,
    rows: parsed.rows,
  })
  const catalogReadyRows = buildCatalogReadyRows(normalized.rows, context)
  const nameCounts = catalogReadyRows.reduce((acc, row) => {
    const key = normalizeDuplicateName(row.fullName)
    if (key) acc.set(key, (acc.get(key) || 0) + 1)
    return acc
  }, new Map())
  const duplicateNames = new Set(
    Array.from(nameCounts.entries())
      .filter(([, count]) => count > 1)
      .map(([name]) => name)
  )
  const existingIdentity = buildExistingIdentity(existingPlayers)
  const importPlan = buildPlayersDatabaseImportPlan(catalogReadyRows)
  const writePlan = buildPlayersDatabaseWritePlan(importPlan)
  const rows = catalogReadyRows.map((row, index) => (
    buildPreviewRow(row, index, importPlan.rows[index], duplicateNames, existingIdentity)
  ))
  const summary = buildSummary(rows)
  const ok = summary.total > 0 && summary.error === 0

  return {
    ok,
    message: ok ? 'השחקנים מוכנים לחיבור' : 'יש שורות שדורשות תיקון',
    headers: parsed.headers,
    rows,
    unknownHeaders: normalized.unknownHeaders,
    mappedHeaders: normalized.mappedHeaders,
    importPlan,
    writePlan,
    summary,
  }
}
