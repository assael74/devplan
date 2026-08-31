// features/playersDatabase/ui/logic/scout/index.js

/**
 * Scout display logic
 *
 * scoutDisplay.constants.js
 * - תוויות, tones ומפות תצוגה קבועות.
 * - מיפוי הקשרי עמדה, מדדים ואופרטורים.
 *
 * scoutDisplay.utils.js
 * - פונקציות נרמול ופתרון תוויות משותפות.
 *
 * scoutRules.logic.js
 * - פורמט חוקים ופרמטרים של פרופיל סקאוט.
 *
 * scoutProfileDisplay.logic.js
 * - Tooltip, תיאור ושדות תצוגה של פרופיל.
 *
 * scoutOptions.logic.js
 * - בניית אפשרויות בחירה לפרופילים, שילובים ועדיפויות.
 *
 * scoutPriority.logic.js
 * - פתרון עדיפות ופורמט מדדי אחוזים.
 */

export {
  SCOUT_PRIORITY_DISPLAY,
  SCOUT_REVIEW_DISPLAY,
  TEAM_FILTER_DISPLAY,
} from './scoutDisplay.constants.js'

export {
  DEFAULT_SCOUT_PROFILE_TOOLTIP_FIELDS,
  SCOUT_PROFILE_TOOLTIP_FIELDS,
  buildScoutProfileTooltip,
  buildScoutProfileTooltipItems,
} from './scoutProfileDisplay.logic.js'

export {
  buildPlayerScoutProfileOptions,
  buildTeamScoutPriorityOptions,
} from './scoutOptions.logic.js'

export {
  formatRate,
  resolveScoutPriority,
} from './scoutPriority.logic.js'
