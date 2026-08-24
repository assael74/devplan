// src/features/playersDatabase/ui/logic/scout/scoutStoryDisplay.logic.js

import {
  PLAYER_VERIFICATION_QUESTIONS,
  PROFILE_DISTANCE_THRESHOLD,
  PROFILE_DISTANCE_TREND,
  SCOUT_PROFILES,
} from '../../../../../shared/scouting/players/index.js'
import { POSITION_CONTEXT_LABELS } from './scoutDisplay.constants.js'
import {
  PLAYER_SCOUT_MEASUREMENT_HISTORY_EVENT,
} from '../../../model/playerScoutMeasurement.model.js'

const clean = value => String(value || '').trim()

const PROFILE_LABELS = (Array.isArray(SCOUT_PROFILES) ? SCOUT_PROFILES : []).reduce((map, profile) => {
  if (profile?.id) map[profile.id] = profile.label || profile.id
  return map
}, {})

const QUESTION_LABELS = (Array.isArray(PLAYER_VERIFICATION_QUESTIONS)
  ? PLAYER_VERIFICATION_QUESTIONS
  : []).reduce((map, question) => {
  if (question?.id) map[question.id] = question.label || ''
  return map
}, {})

const ACTION_LABELS = {
  immediate: 'פעולה מיידית',
  priority: 'עדיפות גבוהה',
  watch: 'מעקב',
  exposed: 'חשיפה גבוהה',
}

const ACTION_SENTENCES = {
  immediate: 'הסיגנל חזק מספיק כדי להצדיק בדיקה מיידית.',
  priority: 'השחקן מצדיק קדימות גבוהה בתהליך הסקאוטינג.',
  watch: 'הסיגנל מעניין, אך נכון כרגע להמשיך במעקב לפני פעולה.',
  exposed: 'השחקן נמצא בסביבה עם חשיפה גבוהה ולכן ההזדמנות לגילוי מוקדם נמוכה יותר.',
}

const EXPOSURE_LABELS = {
  high: 'גבוהה',
  medium: 'בינונית',
  low: 'נמוכה',
  unknown: 'לא ידועה',
}

const COMPETITION_LABELS = {
  plays_above_club_level: 'משחק בסביבת תחרות חזקה מרמת המועדון',
  plays_at_club_level: 'רמת התחרות תואמת לרמת המועדון',
  plays_below_club_level: 'משחק בסביבת תחרות נמוכה מרמת המועדון',
  unavailable: 'אין מספיק מידע להשוואת רמת הליגה לרמת המועדון',
}

const TEAM_GATE_LABELS = {
  open_context: 'ההקשר פתוח — רמת הליגה או המועדון מאפשרת לפרופיל לעבור ללא חסימת Team Context',
  legacy_filter: 'הפרופיל נבדק גם מול מסנן ההקשר הקבוצתי',
  unavailable: 'לא ניתן לקבוע את שער ההקשר הקבוצתי',
}

const SPOTLIGHT_LABELS = {
  early_breakthrough: 'פריצה מוקדמת',
  underexposed: 'חשיפה נמוכה',
  hidden_performer: 'ביצוע חזק מתחת לרדאר',
  positional_outlier: 'חריגה מעניינת ביחס לעמדה',
  plays_above_club_level: 'מתמודד מעל רמת המועדון',
  plays_below_club_level: 'מתמודד מתחת לרמת המועדון',
  adverse_team_context: 'בולט למרות הקשר קבוצתי חלש',
  strong_team_context: 'הקשר קבוצתי חזק',
  future_level_risk: 'סיכון בעליית רמת התחרות',
  future_level_upside: 'פוטנציאל בסביבת התחרות הבאה',
  transferred_up: 'מעבר לרמה גבוהה יותר',
  transferred_down: 'מעבר לרמה נמוכה יותר',
  multi_season_growth: 'מגמת שיפור רב־עונתית',
}

const SPOTLIGHT_EFFECT_LABELS = {
  supports_action: 'מחזק את הצורך בפעולה',
  reduces_immediacy: 'מוריד את הדחיפות',
  context_only: 'מוסיף הקשר לפרופיל',
}

const CONFIDENCE_LABELS = {
  high: 'ודאות גבוהה',
  medium: 'ודאות בינונית',
  low: 'ודאות נמוכה',
}

const TREND_LABELS = {
  closing_fast: 'מתקרב במהירות לפרופיל',
  closing: 'מתקרב לפרופיל',
  stable: 'ללא שינוי משמעותי',
  moving_away: 'מתרחק מהפרופיל',
  unknown: 'מגמה עדיין לא נקבעה',
}

const FULL_STATS_TRANSITION = Object.freeze({
  GAINED_PROFILE: 'gained_profile',
  LOST_PROFILE: 'lost_profile',
  RETAINED_PROFILE: 'retained_profile',
  DISTANCE_TREND: 'distance_trend',
  INCOMPARABLE: 'incomparable',
})

const FULL_STATS_TRANSITION_PRIORITY = Object.freeze({
  [FULL_STATS_TRANSITION.LOST_PROFILE]: 100,
  [FULL_STATS_TRANSITION.GAINED_PROFILE]: 95,
  [PROFILE_DISTANCE_TREND.CLOSING_FAST]: 90,
  [PROFILE_DISTANCE_TREND.CLOSING]: 85,
  [PROFILE_DISTANCE_TREND.MOVING_AWAY]: 80,
  [FULL_STATS_TRANSITION.RETAINED_PROFILE]: 70,
  [PROFILE_DISTANCE_TREND.STABLE]: 60,
  [FULL_STATS_TRANSITION.INCOMPARABLE]: 40,
  [PROFILE_DISTANCE_TREND.UNKNOWN]: 10,
})

const FULL_STATS_STORY_DESCRIPTION = 'המגמה מבוססת על שתי טעינות הסטטיסטיקה המלאות האחרונות; שינוי תפקיד או הקשר קבוצתי אינו משנה את נקודת ההשוואה.'

const FULL_STATS_STALE_NOTE = 'המדידה נשמרה כהיסטורית, אך הפרופיל כבר אינו רלוונטי במצב הסקאוטינג הנוכחי ולכן המגמה אינה מוצגת כפעילה.'

const FULL_STATS_HISTORY_DESCRIPTION = 'רצף המדידות המלא נשמר מרגע שנוצר לשחקן מסמך מעקב ומציג שינויים שחזרו על עצמם לאורך כמה טעינות סטטיסטיקה מלאות.'

const TRANSFER_MOVE_LABELS = {
  upgrade: 'שדרוג מקצועי',
  downgrade: 'מעבר לסביבה נמוכה יותר',
  lateral: 'מעבר רוחבי',
  mixed: 'מעבר מעורב — שיפור במדד אחד וירידה באחר',
  unknown: 'כיוון המעבר עדיין לא נקבע',
}

const formatLevel = value => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) && numberValue > 0
    ? String(numberValue)
    : 'לא ידוע'
}

const signedPct = value => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return ''

  const pct = Math.round(numberValue * 100)
  return `${pct > 0 ? '+' : ''}${pct}%`
}

const toFiniteNumber = value => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

const toPctText = value => {
  const numberValue = toFiniteNumber(value)
  if (!Number.isFinite(numberValue)) return ''

  return `${Math.round(numberValue * 100)}%`
}

const buildMeasurementStateMap = measurement => {
  const states = Array.isArray(measurement?.profileStates)
    ? measurement.profileStates
    : []

  return new Map(
    states
      .map(state => [clean(state?.profileId), state])
      .filter(([profileId]) => profileId)
  )
}

const resolveDistanceTrend = ({ previousDistance, currentDistance }) => {
  const previous = toFiniteNumber(previousDistance)
  const current = toFiniteNumber(currentDistance)

  if (!Number.isFinite(previous) || !Number.isFinite(current)) {
    return PROFILE_DISTANCE_TREND.UNKNOWN
  }

  const delta = current - previous
  const absoluteDelta = Math.abs(delta)

  if (absoluteDelta <= PROFILE_DISTANCE_THRESHOLD.STABLE_DELTA) {
    return PROFILE_DISTANCE_TREND.STABLE
  }

  if (delta <= -PROFILE_DISTANCE_THRESHOLD.FAST_CLOSING_DELTA) {
    return PROFILE_DISTANCE_TREND.CLOSING_FAST
  }

  if (delta < 0) return PROFILE_DISTANCE_TREND.CLOSING

  return PROFILE_DISTANCE_TREND.MOVING_AWAY
}

const isMeasuredProfileRelevant = state => {
  if (!state) return false
  if (state.matched === true) return true

  const distance = toFiniteNumber(state.distance)
  return Number.isFinite(distance) && distance <= PROFILE_DISTANCE_THRESHOLD.NEAR
}

const resolveCurrentRelevantProfileIds = player => {
  const profileIds = (Array.isArray(player?.scoutProfiles) ? player.scoutProfiles : [])
    .map(profile => clean(profile?.profileId || profile?.id))
    .filter(Boolean)
  const nearProfileIds = (Array.isArray(player?.scoutProfileProgression?.nearProfiles)
    ? player.scoutProfileProgression.nearProfiles
    : [])
    .map(profile => clean(profile?.profileId))
    .filter(Boolean)
  const candidateProfileIds = (Array.isArray(player?.scoutCandidateSignals)
    ? player.scoutCandidateSignals
    : [])
    .map(profile => clean(profile?.profileId))
    .filter(Boolean)

  return new Set([
    ...profileIds,
    ...nearProfileIds,
    ...candidateProfileIds,
  ])
}

const resolveMeasurementTransition = ({ profileId, previousState, currentState, comparable }) => {
  if (!comparable) {
    return {
      profileId,
      type: FULL_STATS_TRANSITION.INCOMPARABLE,
      trend: PROFILE_DISTANCE_TREND.UNKNOWN,
    }
  }

  const previousMatched = previousState?.matched === true
  const currentMatched = currentState?.matched === true

  if (!previousMatched && currentMatched) {
    return {
      profileId,
      type: FULL_STATS_TRANSITION.GAINED_PROFILE,
      trend: PROFILE_DISTANCE_TREND.CLOSING,
    }
  }

  if (previousMatched && !currentMatched) {
    return {
      profileId,
      type: FULL_STATS_TRANSITION.LOST_PROFILE,
      trend: PROFILE_DISTANCE_TREND.MOVING_AWAY,
    }
  }

  if (previousMatched && currentMatched) {
    return {
      profileId,
      type: FULL_STATS_TRANSITION.RETAINED_PROFILE,
      trend: PROFILE_DISTANCE_TREND.STABLE,
    }
  }

  const previousDistance = toFiniteNumber(previousState?.distance)
  const currentDistance = toFiniteNumber(currentState?.distance)

  if (!Number.isFinite(previousDistance) || !Number.isFinite(currentDistance)) {
    return null
  }

  return {
    profileId,
    type: FULL_STATS_TRANSITION.DISTANCE_TREND,
    trend: resolveDistanceTrend({
      previousDistance,
      currentDistance,
    }),
  }
}

const buildFullStatsTransitionLabel = transition => {
  const profileLabel = getScoutProfileLabel(transition.profileId)
  const previousDistance = toPctText(transition.previousState?.distance)
  const currentDistance = toPctText(transition.currentState?.distance)

  if (transition.type === FULL_STATS_TRANSITION.GAINED_PROFILE) {
    return `בטעינת הסטטיסטיקה המלאה האחרונה השחקן הגיע לפרופיל ${profileLabel}.`
  }

  if (transition.type === FULL_STATS_TRANSITION.LOST_PROFILE) {
    const distanceText = currentDistance
      ? ` וכעת נמצא במרחק ${currentDistance} מהרף`
      : ''
    return `השחקן איבד את פרופיל ${profileLabel} שהיה קיים במדידה הקודמת${distanceText}.`
  }

  if (transition.type === FULL_STATS_TRANSITION.RETAINED_PROFILE) {
    return `פרופיל ${profileLabel} נשמר בשתי טעינות הסטטיסטיקה המלאות האחרונות.`
  }

  if (transition.type === FULL_STATS_TRANSITION.INCOMPARABLE) {
    return `לא ניתן להשוות את פרופיל ${profileLabel} למדידה הקודמת מפני שגרסת מנוע הסקאוט השתנתה.`
  }

  if (!previousDistance || !currentDistance) {
    return `${profileLabel}: ${getScoutTrendLabel(transition.trend)}.`
  }

  if (
    transition.trend === PROFILE_DISTANCE_TREND.CLOSING ||
    transition.trend === PROFILE_DISTANCE_TREND.CLOSING_FAST
  ) {
    return `${profileLabel}: המרחק מהרף הצטמצם מ־${previousDistance} ל־${currentDistance}.`
  }

  if (transition.trend === PROFILE_DISTANCE_TREND.MOVING_AWAY) {
    return `${profileLabel}: המרחק מהרף גדל מ־${previousDistance} ל־${currentDistance}.`
  }

  return `${profileLabel}: המרחק מהרף נשאר כמעט ללא שינוי (${previousDistance} → ${currentDistance}).`
}

export const buildScoutStatsLoadProgressionStory = player => {
  const measurements = player?.scoutStatsLoadMeasurements || {}
  const previous = measurements.previous
  const current = measurements.current

  if (!previous || !current) return null

  const previousEngineVersion = clean(previous.engineVersion)
  const currentEngineVersion = clean(current.engineVersion)
  const comparable = Boolean(
    previousEngineVersion &&
    currentEngineVersion &&
    previousEngineVersion === currentEngineVersion
  )
  const previousStates = buildMeasurementStateMap(previous)
  const currentStates = buildMeasurementStateMap(current)
  const profileIds = new Set([
    ...previousStates.keys(),
    ...currentStates.keys(),
  ])
  const currentRelevantProfileIds = resolveCurrentRelevantProfileIds(player)
  const transitions = [...profileIds]
    .map(profileId => {
      const previousState = previousStates.get(profileId) || null
      const currentState = currentStates.get(profileId) || null
      const transition = resolveMeasurementTransition({
        profileId,
        previousState,
        currentState,
        comparable,
      })

      if (!transition) return null

      const stale = isMeasuredProfileRelevant(currentState) &&
        !currentRelevantProfileIds.has(profileId)
      const priority = FULL_STATS_TRANSITION_PRIORITY[transition.type] ||
        FULL_STATS_TRANSITION_PRIORITY[transition.trend] ||
        0

      return {
        ...transition,
        previousState,
        currentState,
        stale,
        status: stale ? 'stale' : 'active',
        priority,
        label: buildFullStatsTransitionLabel({
          ...transition,
          previousState,
          currentState,
        }),
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.priority - a.priority)

  if (!transitions.length) return null

  return {
    previous,
    current,
    comparable,
    transitions,
    primaryTransition: transitions[0],
    activeTransitions: transitions.filter(transition => !transition.stale),
    staleTransitions: transitions.filter(transition => transition.stale),
    description: FULL_STATS_STORY_DESCRIPTION,
    staleNote: FULL_STATS_STALE_NOTE,
  }
}

export const buildScoutStatsLoadHistoryStory = player => {
  const events = Array.isArray(player?.scoutStatsLoadMeasurementHistoryEvents)
    ? player.scoutStatsLoadMeasurementHistoryEvents
    : []

  if (!events.length) return null

  const items = events.slice(0, 4).map(event => {
    const profileLabel = getScoutProfileLabel(event.profileId)
    const measurementCount = Number(event.measurementCount || 0)

    if (event.type === PLAYER_SCOUT_MEASUREMENT_HISTORY_EVENT.PROFILE_REGAINED) {
      return {
        id: event.id,
        label: `השחקן חזר לפרופיל ${profileLabel} לאחר שכבר הופיע בו בעבר ונעלם ממנו.`,
      }
    }

    if (event.type === PLAYER_SCOUT_MEASUREMENT_HISTORY_EVENT.PROFILE_LOST_AFTER_STREAK) {
      const retainedCount = Math.max(1, measurementCount - 1)
      return {
        id: event.id,
        label: `השחקן איבד את פרופיל ${profileLabel} לאחר שנשמר ב־${retainedCount} טעינות סטטיסטיקה מלאות רצופות.`,
      }
    }

    if (event.type === PLAYER_SCOUT_MEASUREMENT_HISTORY_EVENT.PROFILE_RETAINED_STREAK) {
      return {
        id: event.id,
        label: `פרופיל ${profileLabel} נשמר ב־${measurementCount} טעינות סטטיסטיקה מלאות רצופות.`,
      }
    }

    return null
  }).filter(Boolean)

  if (!items.length) return null

  return {
    events,
    items,
    description: FULL_STATS_HISTORY_DESCRIPTION,
  }
}

export const getScoutTransferMoveLabel = moveType => (
  TRANSFER_MOVE_LABELS[clean(moveType)] || 'מעבר קבוצה'
)

export const buildScoutTransferStory = transfer => {
  if (!transfer || typeof transfer !== 'object') return null

  const fromTeam = clean(transfer.fromTeamName || transfer.fromClubName) || 'הקבוצה הקודמת'
  const toTeam = clean(transfer.toTeamName || transfer.toClubName) || 'הקבוצה החדשה'
  const moveLabel = getScoutTransferMoveLabel(transfer.moveType)
  const impact = transfer.impact && typeof transfer.impact === 'object'
    ? transfer.impact
    : {}
  const profileChange = impact.profileChange && typeof impact.profileChange === 'object'
    ? impact.profileChange
    : {}
  const details = [
    `עבר מ־${fromTeam} ל־${toTeam}.`,
    `${moveLabel}: רמת מועדון ${formatLevel(transfer.fromClubStrengthLevel)} → ${formatLevel(transfer.toClubStrengthLevel)}, רמת ליגה ${formatLevel(transfer.fromLeagueLevel)} → ${formatLevel(transfer.toLeagueLevel)}.`,
  ]

  if (impact.minutesPctDelta) {
    details.push(`שינוי בחלק היחסי של הדקות: ${signedPct(impact.minutesPctDelta)}.`)
  }

  if (impact.startsPctDelta) {
    details.push(`שינוי בחלק היחסי של ההרכבים: ${signedPct(impact.startsPctDelta)}.`)
  }

  if (impact.roleChanged || impact.positionLayerChanged) {
    details.push('גם התפקיד המקצועי השתנה בעקבות המעבר.')
  }

  const retained = Array.isArray(profileChange.retained) ? profileChange.retained : []
  const added = Array.isArray(profileChange.added) ? profileChange.added : []
  const lost = Array.isArray(profileChange.lost) ? profileChange.lost : []

  if (retained.length) {
    details.push(`השחקן שמר על ${retained.length} פרופיל${retained.length > 1 ? 'ים' : ''} גם לאחר המעבר.`)
  }

  if (added.length) {
    details.push(`נוספו לאחר המעבר: ${added.map(getScoutProfileLabel).join(', ')}.`)
  }

  if (lost.length) {
    details.push(`פרופילים שלא נשמרו לאחר המעבר: ${lost.map(getScoutProfileLabel).join(', ')}.`)
  }

  return {
    title: moveLabel,
    items: details,
  }
}

export const getScoutProfileLabel = profileId => (
  PROFILE_LABELS[clean(profileId)] || 'פרופיל נוסף'
)

export const getScoutActionLabel = status => (
  ACTION_LABELS[clean(status)] || clean(status) || 'לא נקבע'
)

export const getScoutExposureLabel = level => (
  EXPOSURE_LABELS[clean(level)] || clean(level) || 'לא ידועה'
)

export const getScoutCompetitionLabel = classification => (
  COMPETITION_LABELS[clean(classification)] || 'הקשר התחרות עדיין לא סווג'
)

export const getScoutTeamGateLabel = mode => (
  TEAM_GATE_LABELS[clean(mode)] || 'שער ההקשר הקבוצתי עדיין לא סווג'
)

export const getScoutPositionContextLabel = value => (
  POSITION_CONTEXT_LABELS[clean(value)] || 'דורש בדיקת התאמה לעמדה'
)

export const getScoutTrendLabel = trend => (
  TREND_LABELS[clean(trend)] || 'מגמה עדיין לא נקבעה'
)

export const getScoutStatsLoadTransitionLabel = transition => {
  const type = clean(transition?.type)

  if (type === FULL_STATS_TRANSITION.GAINED_PROFILE) return 'הגיע לפרופיל'
  if (type === FULL_STATS_TRANSITION.LOST_PROFILE) return 'איבד פרופיל'
  if (type === FULL_STATS_TRANSITION.RETAINED_PROFILE) return 'פרופיל נשמר'
  if (type === FULL_STATS_TRANSITION.INCOMPARABLE) return 'נדרשת נקודת השוואה חדשה'

  return getScoutTrendLabel(transition?.trend)
}

export const getScoutQuestionLabel = question => {
  const label = clean(question?.label)
  if (label) return label

  return QUESTION_LABELS[clean(question?.questionId)] || 'נדרשת בדיקת אימות נוספת'
}

export const buildScoutSpotlightLabel = spotlight => {
  const id = clean(spotlight?.id)
  const title = SPOTLIGHT_LABELS[id] || 'סיגנל הקשר נוסף'

  const details = [
    SPOTLIGHT_EFFECT_LABELS[clean(spotlight?.effect)],
    CONFIDENCE_LABELS[clean(spotlight?.confidence)],
  ].filter(Boolean)

  return details.length ? `${title} — ${details.join(', ')}` : title
}

export const buildScoutContextItems = profile => {
  const context = profile?.scoutContext || {}
  const gate = context.teamGate || profile?.teamGate || {}
  const competition = context.competition || {}
  const items = []

  if (gate.mode) {
    items.push({
      id: 'team-gate',
      label: getScoutTeamGateLabel(gate.mode),
    })
  }

  if (competition.classification) {
    items.push({
      id: 'competition',
      label: getScoutCompetitionLabel(competition.classification),
    })
  }

  if (profile?.positionContext) {
    items.push({
      id: 'position',
      label: `הקשר עמדה: ${getScoutPositionContextLabel(profile.positionContext)}`,
    })
  }

  return items
}

export const buildScoutStorySummary = ({ primaryProfile, opportunity, nearProfile } = {}) => {
  if (!primaryProfile && nearProfile) {
    const label = clean(nearProfile.profileLabel) || getScoutProfileLabel(nearProfile.profileId)
    return `השחקן עדיין לא עבר את רף הפרופיל, אך הוא קרוב ל־${label}. כדאי לעקוב אחרי ההתקדמות ולבדוק אם הפער ממשיך להצטמצם.`
  }

  if (!primaryProfile) return ''

  const profileLabel = clean(primaryProfile.profileLabel || primaryProfile.label) ||
    getScoutProfileLabel(primaryProfile.profileId || primaryProfile.id)
  const depth = Number(primaryProfile?.profileDepth?.depthPct)
  const depthText = Number.isFinite(depth)
    ? ` עם עומק פרופיל מחושב של כ־${Math.round(Math.abs(depth) <= 1 ? depth * 100 : depth)}%`
    : ''
  const actionSentence = ACTION_SENTENCES[clean(opportunity?.effectiveActionStatus)] || ''
  const exposureLevel = clean(opportunity?.exposureLevel)
  const exposureSentence = exposureLevel === 'low'
    ? 'החשיפה שלו נמוכה, ולכן יש ערך להמשך איתור ומעקב מוקדם.'
    : exposureLevel === 'medium'
      ? 'רמת החשיפה בינונית, ולכן עדיין יש ערך לבדיקה יזומה.'
      : exposureLevel === 'high'
        ? 'רמת החשיפה גבוהה, ולכן פחות מדובר בהזדמנות סמויה.'
        : ''

  return [
    `השחקן מזוהה בעיקר כ״${profileLabel}״${depthText}.`,
    actionSentence,
    exposureSentence,
  ].filter(Boolean).join(' ')
}
