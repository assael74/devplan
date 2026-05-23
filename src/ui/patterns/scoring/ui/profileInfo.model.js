// src/ui/patterns/scoring/profileInfo.model.js

import {
  getPlayerInsightProfile,
} from '../../../../shared/players/insights/insights.profiles.js'

export const PERFORMANCE_PROFILE_INFO = {
  title: 'פרופיל תפקוד',
  subtitle: 'המציאות בפועל לפי הטווח שנבחר',
  shortText:
    'אבחנה דינמית של המודל לפי מה שהשחקן מספק בפועל ביחס לדקות, לעמדה ולמעמד שלו.',
  description:
    'פרופיל התפקוד הוא לא המעמד שהמאמן הגדיר לשחקן, אלא האבחנה שהמודל קובע לפי הביצועים בפועל בטווח הזמן שנבחר.',
  question:
    'האם השחקן מספק את הסחורה בפועל ביחס למה שנדרש ממנו?',
  note:
    'המעמד הוא הציפייה המקורית של המאמן. פרופיל התפקוד הוא תמונת המצב הנוכחית שהמודל מזהה.',
}

export const getPerformanceProfileInfo = profileId => {
  const profile = getPlayerInsightProfile(profileId)

  return {
    ...profile,
    profileTitle: PERFORMANCE_PROFILE_INFO.title,
    profileSubtitle: PERFORMANCE_PROFILE_INFO.subtitle,
    profileShortText: PERFORMANCE_PROFILE_INFO.shortText,
    profileDescription: PERFORMANCE_PROFILE_INFO.description,
    profileQuestion: PERFORMANCE_PROFILE_INFO.question,
    profileNote: PERFORMANCE_PROFILE_INFO.note,
  }
}
