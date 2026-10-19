// src/features/playersDatabase/ui/pages/teamPage/information/model/teamFutureCompetition.presentation.js

import { describeUnavailableFutureCompetition } from '../../../../../model/shared/futureCompetition.presentation.js'

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
    const summary = describeUnavailableFutureCompetition(competition)
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
