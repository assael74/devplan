// src/features/playersDatabase/domain/orchestration/buildTeamScoutShadowAudit.js

import {
  buildTeamScoutLeagueModel,
  TEAM_SCOUT_NORMALIZATION_MODE,
  TEAM_SCOUT_SORT_MODE,
} from '../../../../shared/scouting/teams/index.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../catalog/clubs.catalog.js'

const clean = value => String(value || '').trim()

const resolveRowKey = row => clean(
  row.birthTeamId ||
  row.teamId ||
  row.teamDocumentId ||
  row.clubId ||
  row.id ||
  row.rank
)

const clubById = new Map(
  PLAYERS_DATABASE_CLUBS_CATALOG.map(club => [clean(club.id), club])
)

const enrichRowClubStrength = row => {
  const club = clubById.get(clean(row.clubId)) || null
  const clubLevel = row.clubLevel || club?.clubLevel || null
  const clubStrengthLevel = row.clubStrengthLevel || club?.clubStrengthLevel || clubLevel

  return {
    ...row,
    clubLevel,
    clubStrengthLevel,
  }
}

const buildWindowCounts = rows => rows.reduce((counts, row) => {
  const window = clean(row.recruitmentWindow) || 'unavailable'

  return {
    ...counts,
    [window]: (counts[window] || 0) + 1,
  }
}, {})

export const buildTeamScoutShadowAudit = ({ league = {}, season = {}, rows = [] } = {}) => {
  const safeRows = (Array.isArray(rows) ? rows : []).map(enrichRowClubStrength)
  const result = buildTeamScoutLeagueModel({
    leagueLevel: league.level,
    leagueNumGames: season.leagueTotalRound || 30,
    rows: safeRows,
    normalizationMode: TEAM_SCOUT_NORMALIZATION_MODE.AUTO,
    sortMode: TEAM_SCOUT_SORT_MODE.TABLE,
  })
  const auditRows = (Array.isArray(result.rows) ? result.rows : []).map(row => ({
    teamId: resolveRowKey(row),
    teamName: clean(row.teamName),
    clubLevel: row.clubLevel || null,
    clubStrengthLevel: row.clubStrengthLevel || row.clubLevel || null,
    offensePriorityLevel: clean(row?.offense?.priorityLevel),
    defensePriorityLevel: clean(row?.defense?.priorityLevel),
    competitionRelation: clean(row?.scoutContext?.competition?.relation),
    recruitmentWindow: clean(row?.recruitmentOpportunity?.window),
    needs: (Array.isArray(row?.needs) ? row.needs : [])
      .filter(need => need?.active)
      .map(need => ({
        id: clean(need.id),
        level: clean(need.level),
      })),
  }))

  return {
    engineVersion: 'scouting-v2',
    mode: 'primary-diagnostics',
    status: 'complete',
    legacyComparisonAvailable: false,
    totalTeams: auditRows.length,
    recruitmentWindowCounts: buildWindowCounts(auditRows),
    rows: auditRows,
  }
}
