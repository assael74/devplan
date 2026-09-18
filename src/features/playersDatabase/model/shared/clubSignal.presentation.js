import { CLUB_SPOTLIGHT_TYPE } from '../../domain/clubIntelligence/index.js'

export const getClubSignalTitle = type => ({
  [CLUB_SPOTLIGHT_TYPE.FUTURE_LEAGUE_PATH_RISE]: 'עלייה צפויה ברמת הליגה',
  [CLUB_SPOTLIGHT_TYPE.FUTURE_LEAGUE_PATH_DROP]: 'ירידה צפויה ברמת הליגה',
  [CLUB_SPOTLIGHT_TYPE.LEAGUE_ABOVE_CLUB_LEVEL]: 'הליגה מעל רמת המועדון',
  [CLUB_SPOTLIGHT_TYPE.LEAGUE_BELOW_CLUB_LEVEL]: 'הליגה מתחת לרמת המועדון',
  [CLUB_SPOTLIGHT_TYPE.OFFENSE_SQUAD_TASK]: 'נדרש חיזוק התקפי',
  [CLUB_SPOTLIGHT_TYPE.DEFENSE_SQUAD_TASK]: 'נדרש חיזוק הגנתי',
}[type] || 'אין מידע')
