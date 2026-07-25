// features/playersDatabase/ui/logic/scout/scoutDisplay.utils.js

import {
  POSITION_CONTEXT_LABELS,
  POSITION_LABEL_BY_CODE,
  SCOUT_PROFILE_GROUP_LABELS,
} from './scoutDisplay.constants.js'

export const cleanScoutDisplayValue = value => String(value || '').trim()

export const resolveScoutDisplayLabel = (displayMap, value) => (
  displayMap[value]?.label || cleanScoutDisplayValue(value)
)

export const resolvePositionContextLabel = value => (
  POSITION_CONTEXT_LABELS[value] ||
  POSITION_LABEL_BY_CODE[value] ||
  SCOUT_PROFILE_GROUP_LABELS[value] ||
  cleanScoutDisplayValue(value)
)

export const countScoutItems = values => (Array.isArray(values) ? values.length : 0)
