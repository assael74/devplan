// src/features/playersDatabase/ui/pages/teamPage/yearDevelopment/model/teamYearDevelopment.presentation.js
import { resolveScoutProfileDefinition } from '../../../../../../../shared/scouting/players/profiles.js'
import { formatLtrNumber } from '../../../../../../../shared/format/direction.js'

export const buildTeamYearMetricChange = ({ metric, season, previousSeason }) => {
  if (metric.showChange === false) return null
  const rawValue = season?.[metric.key]
  const rawPreviousValue = previousSeason?.[metric.key]
  if (rawValue === null || rawValue === undefined || rawValue === '' ||
    rawPreviousValue === null || rawPreviousValue === undefined || rawPreviousValue === '') {
    return null
  }

  const value = Number(rawValue)
  const previousValue = Number(rawPreviousValue)
  if (!Number.isFinite(value) || !Number.isFinite(previousValue)) return null

  const delta = value - previousValue
  const displayDelta = metric.presentation === 'tableRank' ? -delta : delta
  const direction = displayDelta === 0 ? 'same' : displayDelta > 0 ? 'up' : 'down'
  const isImproved = direction === 'same'
    ? null
    : metric.betterDirection === 'lower'
      ? delta < 0
      : direction === 'up'
  return {
    direction,
    color: isImproved === null ? 'neutral' : isImproved ? 'success' : 'danger',
    iconId: direction === 'up' ? 'sortUp' : direction === 'down' ? 'sortDown' : 'remove',
    label: formatLtrNumber(
      metric.decimal ? Number(displayDelta.toFixed(1)) : displayDelta,
      { signed: true }
    ),
  }
}

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

export const buildMovementDirectionItems = season => (
  ['up', 'down', 'lateral', 'unknown'].map(direction => ({
    direction,
    count: season?.directionCounts?.[direction] || 0,
    ...directionPresentation(direction),
  })).filter(item => item.direction !== 'unknown' || item.count > 0)
)

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
