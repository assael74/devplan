const clean = value => String(value ?? '').trim()

export const AUDIT_SCOPE_TYPE = Object.freeze({ TEAM_SEASON: 'teamSeason', TEAM_SEASONS: 'teamSeasons', FULL_SYSTEM: 'fullSystem' })
export const AUDIT_COLLECTION_SCOPE = Object.freeze({})
export const AUDIT_RELATION_SCOPE = Object.freeze({})
export const AUDIT_SCOPE_LABELS = Object.freeze({ [AUDIT_SCOPE_TYPE.TEAM_SEASON]: 'קבוצה ועונה', [AUDIT_SCOPE_TYPE.TEAM_SEASONS]: 'העדכון האחרון', [AUDIT_SCOPE_TYPE.FULL_SYSTEM]: 'כל המערכת' })
export const AUDIT_RELATION_LABELS = Object.freeze({})

export const buildAuditTeamSeasonScope = ({ teamDocumentId, seasonKey }) => ({ type: AUDIT_SCOPE_TYPE.TEAM_SEASON, teamDocumentId: clean(teamDocumentId), seasonKey: clean(seasonKey) })
export const buildAuditTeamSeasonsScope = scopes => ({ type: AUDIT_SCOPE_TYPE.TEAM_SEASONS, scopes: (Array.isArray(scopes) ? scopes : []).map(buildAuditTeamSeasonScope).filter(scope => scope.teamDocumentId && scope.seasonKey) })
export const buildAuditCollectionScope = () => ({ type: AUDIT_SCOPE_TYPE.FULL_SYSTEM })
export const buildAuditRelationsScope = () => ({ type: AUDIT_SCOPE_TYPE.FULL_SYSTEM })

export const normalizeAuditScope = value => {
  const source = value && typeof value === 'object' ? value : {}
  if (source.type === AUDIT_SCOPE_TYPE.TEAM_SEASON) {
    const scope = buildAuditTeamSeasonScope(source)
    if (!scope.teamDocumentId || !scope.seasonKey) throw new Error('חסרים מזהה קבוצה או עונה.')
    return scope
  }
  if (source.type === AUDIT_SCOPE_TYPE.TEAM_SEASONS) {
    const scope = buildAuditTeamSeasonsScope(source.scopes)
    if (!scope.scopes.length) throw new Error('לא נמצאו קבוצות ועונות לבדיקה.')
    return scope
  }
  return { type: AUDIT_SCOPE_TYPE.FULL_SYSTEM }
}
