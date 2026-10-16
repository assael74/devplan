// src/features/playersDatabase/ui/pages/teamPage/information/model/teamFutureCompetition.presentation.js

const UNAVAILABLE_REASON_LABELS = {
  RULES_NOT_CONFIGURED: 'לא הוגדרו חוקי עלייה וירידה לליגה',
  SEASON_BEFORE_HALFWAY: 'טרם הושלמו 50% ממשחקי העונה',
  TEAM_NOT_IN_TABLE: 'קבוצת המקור חסרה בטבלת הליגה',
  SCHEDULE_MISSING: 'חסר מספר משחקי העונה הצפוי',
  LEAGUE_UNAVAILABLE: 'נתוני ליגת המקור לא זמינים',
  LEAGUE_SEASON_MISSING: 'חסרים נתוני העונה בליגת המקור',
}

export const buildFutureCompetitionInsight = (view, clubIntelligence) => {
  const group = clubIntelligence?.birthYearTeams?.find(item => Number(item.birthYear) === Number(view?.team?.birthYear))
  const teams = group?.seasons?.current?.teams || []
  const teamId = view?.team?.birthTeamId || view?.team?.id || view?.team?.teamId
  const matches = teamId ? teams.filter(team => team.teamId === teamId)
    : teams.filter(team => Number(team.teamSlot) === Number(view?.team?.birthTeamSlot))
  const competition = matches.length === 1 ? matches[0].futureCompetition : null
  const available = competition?.availability?.availability === 'available'
  const source = competition?.sourceTeamId
    ? `שנתון ${competition.sourceBirthYear} · קבוצה ${competition.sourceTeamSlot}` : ''

  if (!available) {
    const reasons = (competition?.unavailableReasons || []).map(reason => UNAVAILABLE_REASON_LABELS[reason]).filter(Boolean)
    const summary = reasons.length
      ? `שנתון ${competition.sourceBirthYear}: ${reasons.join(' · ')}`
      : competition?.reason === 'SOURCE_CURRENT_LEVEL_ONLY'
      ? `שנתון ${competition.sourceBirthYear}: צפי טרם זמין — סיבת החסימה לא זמינה`
      : competition?.reason === 'SOURCE_AMBIGUOUS'
        ? 'לא ניתן לזהות באופן חד־משמעי את הקבוצה המשפיעה'
        : competition?.reason === 'SOURCE_MISSING'
          ? 'חסרים נתוני השנתון המשפיע לעונה הבאה'
          : 'צפי התחרות טרם זמין'
    return { status: 'limited', label: 'צפי טרם זמין', summary, reliability: source ? `מקור: ${source} · אין תחזית זמינה` : 'זמינות נתונים: אין בסיס מספק לצפי' }
  }

  const down = competition.direction === 'down'
  const up = competition.direction === 'up'
  const label = down ? 'סכנת ירידת תחרות' : up ? 'אפשרות לעליית תחרות' : 'ללא שינוי צפוי'
  return {
    status: down ? 'risk' : up ? 'upside' : 'none',
    label,
    summary: `${label} בעונת ${competition.seasonKey} · מרמה ${competition.currentLeagueLevel} לרמה ${competition.projectedNextLeagueLevel}`,
    reliability: `מקור: ${source} · ${{
      PROMOTED_CONFIRMED: 'קבוצת המקור הבטיחה עלייה',
      RELEGATED_CONFIRMED: 'ירידת קבוצת המקור נקבעה',
      SAFE_CONFIRMED: 'קבוצת המקור הבטיחה הישארות',
    }[competition.status] || 'צפי לפי קצב הנקודות וחוקי הליגה'}`,
  }
}
