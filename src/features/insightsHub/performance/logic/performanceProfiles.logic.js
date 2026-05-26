// features/insightsHub/performance/logic/performanceProfiles.logic.js

import {
  PLAYER_INSIGHT_PROFILES,
} from '../../../../shared/players/insights/insights.profiles.js'

const profileOrder = [
  'stat_anchor',
  'core_worker',
  'weak_spot',
  'joker',
  'unstable',
  'secondary_contributor',
  'out_of_sample',
]

const toProfileCard = profile => {
  return {
    id: profile.id,
    label: profile.label,
    shortLabel: profile.shortLabel,
    tone: profile.tone || 'neutral',
    iconId: profile.icon || 'performanceProfile',
    description: profile.description,
    coachText: profile.coachText,
  }
}

export const buildPerformanceProfilesBlock = () => {
  return {
    title: 'פירוט פרופילי הביצוע',
    subtitle:
      'פרופיל הביצוע הוא תרגום מילולי של מדד היעילות, מדד ההשפעה, דקות המשחק, היציבות וגודל המדגם.',
    profiles: profileOrder
      .map(id => PLAYER_INSIGHT_PROFILES[id])
      .filter(Boolean)
      .map(toProfileCard),
  }
}
