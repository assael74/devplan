// features/playersDatabase/services/write/searchIndex/shared/teamScoutPrioritySearch.model.js

const cleanPriorityValue = value =>
  String(value || '').trim().toLowerCase()

const PRIORITY_ALIAS_TO_ID = {
  elite: 'elite',
  leadingtarget: 'elite',
  leading_target: 'elite',
  target: 'elite',
  'יעד מוביל': 'elite',

  high: 'high',
  highpriority: 'high',
  high_priority: 'high',
  'עדיפות גבוהה': 'high',
  'גבוהה': 'high',

  positive: 'positive',
  positivepriority: 'positive',
  positive_priority: 'positive',
  'חיובי': 'positive',

  neutral: 'neutral',
  regular: 'neutral',
  normal: 'neutral',
  'רגיל': 'neutral',

  low: 'low',
  lowpriority: 'low',
  low_priority: 'low',
  'עדיפות נמוכה': 'low',
  'נמוכה': 'low',
}

export const normalizeTeamScoutPrioritySearchId = value => {
  const cleaned = cleanPriorityValue(value)
  if (!cleaned) return ''

  const compact = cleaned.replace(/[\s-]+/g, '')
  return (
    PRIORITY_ALIAS_TO_ID[cleaned] ||
    PRIORITY_ALIAS_TO_ID[compact] ||
    ''
  )
}

export const buildTeamScoutPrioritySearchIds = values => (
  [...new Set(
    (Array.isArray(values) ? values : [])
      .map(normalizeTeamScoutPrioritySearchId)
      .filter(Boolean)
  )]
)


const PRIORITY_QUERY_VALUES_BY_ID = {
  elite: ['elite', 'leadingTarget', 'leading_target', 'target', 'יעד מוביל'],
  high: ['high', 'highPriority', 'high_priority', 'עדיפות גבוהה', 'גבוהה'],
  positive: ['positive', 'positivePriority', 'positive_priority', 'חיובי'],
  neutral: ['neutral', 'regular', 'normal', 'רגיל'],
  low: ['low', 'lowPriority', 'low_priority', 'עדיפות נמוכה', 'נמוכה'],
}

export const buildTeamScoutPriorityQueryValues = values => (
  [...new Set(
    buildTeamScoutPrioritySearchIds(values)
      .flatMap(value => PRIORITY_QUERY_VALUES_BY_ID[value] || [value])
  )]
)
