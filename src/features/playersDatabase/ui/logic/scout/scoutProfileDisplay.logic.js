// features/playersDatabase/ui/logic/scout/scoutProfileDisplay.logic.js

import {
  DEPENDENCY_DISPLAY,
  SCOUT_PROFILE_GROUP_LABELS,
  SCOUT_REVIEW_DISPLAY,
  TEAM_FILTER_DISPLAY,
} from './scoutDisplay.constants.js'
import {
  cleanScoutDisplayValue,
  resolvePositionContextLabel,
  resolveScoutDisplayLabel,
} from './scoutDisplay.utils.js'
import {
  buildProfileRuleItems,
  buildProfileRulesLabel,
  buildProfileRulesTooltip,
} from './scoutRules.logic.js'

export const SCOUT_PROFILE_TOOLTIP_FIELDS = {
  parameters: {
    label: 'פרמטרים לסימון',
    resolve: profile => buildProfileRulesTooltip(profile),
  },
  group: {
    label: 'מנטליות',
    resolve: profile => SCOUT_PROFILE_GROUP_LABELS[profile?.group] || '',
  },
  teamFilter: {
    label: 'הקשר ביצוע קבוצתי',
    resolve: profile => resolveScoutDisplayLabel(TEAM_FILTER_DISPLAY, profile?.teamFilter),
  },
  positionContext: {
    label: 'הקשר עמדה',
    resolve: profile => resolvePositionContextLabel(profile?.positionContext),
  },
  positionDependency: {
    label: 'תלות עמדה',
    resolve: profile => DEPENDENCY_DISPLAY[profile?.deps?.position] || cleanScoutDisplayValue(profile?.deps?.position),
  },
  reviews: {
    label: 'בדיקות',
    resolve: profile => (Array.isArray(profile?.reviews) ? profile.reviews : [])
      .map(review => resolveScoutDisplayLabel(SCOUT_REVIEW_DISPLAY, review))
      .filter(Boolean)
      .join(', '),
  },
}

export const DEFAULT_SCOUT_PROFILE_TOOLTIP_FIELDS = [
  'parameters',
  'group',
  'teamFilter',
  'positionContext',
  'positionDependency',
  'reviews',
]

export const buildScoutProfileTooltip = profile => {
  const groupLabel = SCOUT_PROFILE_GROUP_LABELS[profile?.group] || ''
  const reviews = (Array.isArray(profile?.reviews) ? profile.reviews : [])
    .map(review => resolveScoutDisplayLabel(SCOUT_REVIEW_DISPLAY, review))
    .filter(Boolean)
    .join(', ')
  const tooltipItems = [
    groupLabel ? `מנטליות: ${groupLabel}` : '',
    profile?.teamFilter ? `הקשר ביצוע קבוצתי: ${resolveScoutDisplayLabel(TEAM_FILTER_DISPLAY, profile.teamFilter)}` : '',
    profile?.positionContext ? `הקשר עמדה: ${resolvePositionContextLabel(profile.positionContext)}` : '',
    profile?.deps?.position ? `תלות עמדה: ${DEPENDENCY_DISPLAY[profile.deps.position] || profile.deps.position}` : '',
    buildProfileRulesLabel(profile),
    reviews ? `בדיקות: ${reviews}` : '',
  ]

  return tooltipItems.filter(Boolean).join(' · ')
}

export const buildScoutProfileTooltipFromFields = profile => (
  DEFAULT_SCOUT_PROFILE_TOOLTIP_FIELDS
    .map(fieldKey => {
      const field = SCOUT_PROFILE_TOOLTIP_FIELDS[fieldKey]
      const value = cleanScoutDisplayValue(field.resolve(profile))
      if (!value) return ''

      return `${field.label}: ${value}`
    })
    .filter(Boolean)
    .join(' · ')
)

export const resolveScoutProfileDescription = profile => {
  const groupLabel = SCOUT_PROFILE_GROUP_LABELS[profile?.group] || ''

  return groupLabel || 'פרופיל נבחר'
}

export const buildScoutProfileTooltipItems = ({
  profile = {},
  fields = DEFAULT_SCOUT_PROFILE_TOOLTIP_FIELDS,
} = {}) => (
  (Array.isArray(fields) ? fields : DEFAULT_SCOUT_PROFILE_TOOLTIP_FIELDS)
    .map(fieldKey => {
      const field = SCOUT_PROFILE_TOOLTIP_FIELDS[fieldKey]
      if (!field) return null

      if (fieldKey === 'parameters') {
        const items = buildProfileRuleItems(profile)
        if (!items.length) return null

        return {
          key: fieldKey,
          label: field.label,
          items,
        }
      }

      const value = cleanScoutDisplayValue(field.resolve(profile))
      if (!value) return null

      return {
        key: fieldKey,
        label: field.label,
        value,
      }
    })
    .filter(Boolean)
)
