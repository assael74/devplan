// src/features/playersDatabase/ui/pages/teamPage/yearDevelopment/model/teamYearDevelopment.presentation.js
import { resolveScoutProfileDefinition } from '../../../../../../../shared/scouting/players/profiles.js'

export const TEAM_YEAR_METRICS = Object.freeze([
  { key: 'tableRank', label: 'מיקום בטבלה', iconId: 'league', presentation: 'tableRank', betterDirection: 'lower' },
  { key: 'games', label: 'משחקים', iconId: 'gamesCount', showChange: false },
  { key: 'successPercent', label: 'אחוז הצלחה', iconId: 'percent', percent: true },
  { key: 'goalsForPerGame', label: 'שערים למשחק', iconId: 'goals', decimal: true },
  { key: 'goalsAgainstPerGame', label: 'ספיגה למשחק', iconId: 'defensive', decimal: true, betterDirection: 'lower' },
  { key: 'professionalProfiles', label: 'פרופילים מקצועיים', iconId: 'scouting' },
  { key: 'underuseProfiles', label: 'פרופילי חוסר שימוש', iconId: 'underusedProspect', betterDirection: 'lower' },
])

export const LINE_DISTRIBUTION_COLORS = Object.freeze({
  goalkeeper: '#657684',
  defense: '#2F86C7',
  midfield: '#7C3AED',
  attack: '#D97706',
  unclassified: '#A16207',
})

export const directionPresentation = direction => ({
  up: { label: 'עבר לרמה גבוהה יותר', color: 'success', iconId: 'sortUp' },
  down: { label: 'עבר לרמה נמוכה יותר', color: 'warning', iconId: 'sortDown' },
  lateral: { label: 'עבר לרמה דומה', color: 'primary', iconId: 'swapVert' },
}[direction] || { label: 'רמת מעבר לא ידועה', color: 'neutral', iconId: 'swapVert' })

export const linePresentation = line => ({
  GOALKEEPER: { label: 'שוער', iconId: 'goalkeeping' },
  DEFENSE: { label: 'הגנה', iconId: 'defensive' },
  MIDFIELD: { label: 'קישור', iconId: 'position' },
  ATTACK: { label: 'התקפה', iconId: 'offensive' },
}[line] || { label: line === 'UNKNOWN' ? 'לא ידוע' : line, iconId: 'position' })

export const profilePresentation = profileId => {
  const definition = resolveScoutProfileDefinition(profileId)

  return {
    label: definition && (definition.shortLabel || definition.label) ? (definition.shortLabel || definition.label) : 'פרופיל סקאוט',
    iconId: definition && definition.idIcon ? definition.idIcon : 'performanceProfile',
  }
}
