// src/features/playersDatabase/ui/pages/DataOpsPage/logic/focusedAuditSourceReload.js

import { normalizeSeasonLookupKey } from '../../../../model/shared/season.model.js'

export const getFocusedAuditSourceReload = ({ scope = {}, finding = {} } = {}) => {
  if (!['missing_canonical', 'missing_canonical_dependency'].includes(finding.type)) return null
  if (finding.target === 'clubProfile') {
    return {
      route: '/players-database/data-ops/system-audit',
      label: 'פתח השלמת מקור מועדון',
      description: 'באודיט המערכת יש להריץ בדיקה ולפתוח את כרטיס המועדון החסר להשלמת פרטי המקור.',
    }
  }
  const { leagueId, seasonId, teamId } = scope
  if (!leagueId || !seasonId) return null
  const seasonKey = normalizeSeasonLookupKey(scope.seasonKey || seasonId)
  const context = { leagueId, seasonId, seasonKey, repairReload: true }
  if (finding.field === 'missing_team_season' && teamId) {
    return {
      route: `/players-database/leagues/${encodeURIComponent(leagueId)}/teams/${encodeURIComponent(teamId)}?auditSeason=${encodeURIComponent(seasonKey)}&openRosterImport=1&repairReload=1`,
      context: { ...context, teamId },
      label: 'פתח טעינת סגל',
      description: 'מסמך עונת הקבוצה חסר. יש להזין ולאשר מחדש את נתוני הסגל ממקור.',
    }
  }
  if (finding.field === 'missing_league') {
    return {
      route: `/players-database/leagues?openLeague=${encodeURIComponent(leagueId)}&auditSeasonId=${encodeURIComponent(seasonId)}&repairReload=1`,
      context,
      label: 'פתח טעינת ליגה',
      description: 'מקור הליגה חסר. יש להזין ולאשר מחדש את נתוני הליגה והעונה.',
    }
  }
  return null
}
