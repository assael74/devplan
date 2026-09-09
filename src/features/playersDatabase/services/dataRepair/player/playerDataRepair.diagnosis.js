import {
  hasPlayerDocumentProfileMismatch,
  hasPlayerSearchIndexProfileMismatch,
  hasTeamSeasonProfileMismatch,
  PLAYER_DATA_ISSUE_CODE,
} from './playerDataRepair.catalog.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const buildPlayerIssuesForContext = (context = {}) => {
  const teamSeason = context.teamSeason || {}
  const teamPlayer = context.teamPlayer || null
  const seasonKey = clean(teamSeason.seasonKey || teamSeason.seasonId)
  const teamName = clean(
    context.teamDocument?.displayName ||
    context.teamDocument?.name ||
    context.teamView?.displayName ||
    context.context?.teamId
  )
  const contextLabel = [teamName, seasonKey].filter(Boolean).join(' · ')

  if (!teamPlayer || !seasonKey) return [{
    severity: 'warning',
    title: 'חסר הקשר עונה מלא לבדיקת תיקונים',
    description: 'פתח את השחקן מתוך עמוד הקבוצה או בחר עונה עם נתוני קבוצה זמינים.',
    action: 'אין תיקון אוטומטי ללא מקור קבוצה.',
    context,
    contextLabel,
  }]

  const issues = []

  if (hasPlayerDocumentProfileMismatch(context)) {
    issues.push({
      severity: 'danger',
      code: PLAYER_DATA_ISSUE_CODE.PLAYER_DOCUMENT_SCOUT_PROFILE_MISMATCH,
      title: `מסמך השחקן אינו מסונכרן בעונת ${seasonKey}`,
      description: 'הפרופיל במסמך השחקן שונה מהפרופיל שנמצא במסמך עונת הקבוצה.',
      action: 'לעדכן את מסמך השחקן בלבד.',
      context,
      contextLabel,
    })
  }

  if (hasPlayerSearchIndexProfileMismatch(context)) {
    issues.push({
      severity: 'danger',
      code: PLAYER_DATA_ISSUE_CODE.PLAYER_SEARCH_INDEX_SCOUT_PROFILE_MISMATCH,
      title: `אינדקס השחקן אינו מסונכרן בעונת ${seasonKey}`,
      description: 'הפרופיל באינדקס השחקן שונה מהפרופיל שנמצא במסמך עונת הקבוצה.',
      action: 'לעדכן את אינדקס השחקן בלבד.',
      context,
      contextLabel,
    })
  }

  if (hasTeamSeasonProfileMismatch(context)) {
    issues.push({
      severity: 'danger',
      code: PLAYER_DATA_ISSUE_CODE.TEAM_SEASON_SCOUT_PROFILE_MISMATCH,
      title: `מסמך עונת הקבוצה אינו מסונכרן בעונת ${seasonKey}`,
      description: 'הפרופיל השמור בעונת הקבוצה שונה מחישוב הפרופיל על בסיס נתוני השחקן והקבוצה.',
      action: 'לעדכן את שורת השחקן במסמך עונת הקבוצה בלבד.',
      context,
      contextLabel,
    })
  }

  return issues
}

export const buildPlayerDataRepairIssues = ({ contexts = [] } = {}) => (
  (Array.isArray(contexts) && contexts.length ? contexts : [{}])
    .flatMap(buildPlayerIssuesForContext)
)
