// src/ui/patterns/scoring/scoringProfileInfo.model.js

import {
  getPlayerInsightProfile,
} from '../../../../shared/players/insights/insights.profiles.js'

export const SCORING_PROFILE_INFO = {
  title: 'פרופיל תפקוד',
  subtitle: 'המציאות בפועל לפי הסקורינג',
  shortText:
    'אבחנה דינמית של המודל לפי מה שהשחקן מספק בפועל ביחס לדקות, לעמדה ולמעמד שלו.',
  description:
    'פרופיל התפקוד הוא לא המעמד שהמאמן הגדיר לשחקן, אלא סיווג שהמודל קובע לפי מדדי הסקורינג בפועל בטווח הזמן שנבחר.',
  question:
    'האם השחקן מספק את הסחורה בפועל ביחס למה שנדרש ממנו?',
  note:
    'המעמד הוא הציפייה המקורית של המאמן. פרופיל התפקוד הוא תמונת המצב הנוכחית שהסקורינג מזהה.',
}

export const getScoringProfileInfo = profileId => {
  const profile = getPlayerInsightProfile(profileId)

  return {
    ...profile,
    profileTitle: SCORING_PROFILE_INFO.title,
    profileSubtitle: SCORING_PROFILE_INFO.subtitle,
    profileShortText: SCORING_PROFILE_INFO.shortText,
    profileDescription: SCORING_PROFILE_INFO.description,
    profileQuestion: SCORING_PROFILE_INFO.question,
    profileNote: SCORING_PROFILE_INFO.note,
  }
}
