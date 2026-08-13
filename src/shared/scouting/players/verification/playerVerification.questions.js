// src/shared/scouting/players/verification/playerVerification.questions.js

import { SCOUT_REVIEW } from '../ids.js'

import {
  PLAYER_VERIFICATION_ANSWER_TYPE,
  PLAYER_VERIFICATION_DIMENSION,
  PLAYER_VERIFICATION_EFFECT,
  PLAYER_VERIFICATION_INPUT_MODE,
  PLAYER_VERIFICATION_PRIORITY,
  PLAYER_VERIFICATION_QUESTION,
} from './playerVerification.model.js'

const effect = (dimension, direction, weight = 1) => ({
  dimension,
  direction,
  weight,
})

const hasReview = (signals, reviewId) => signals.some(signal => (
  Array.isArray(signal.requiredReview) && signal.requiredReview.includes(reviewId)
))

const hasPositionContext = signals => signals.some(signal => (
  Boolean(signal.positionContext) ||
  signal.spotlights?.some(spotlight => spotlight.id === 'positional_outlier')
))

const hasAttackingProfile = ({ signals, candidateSignals, profiles }) => {
  const candidateProfileIds = new Set(
    candidateSignals.map(signal => signal.profileId).filter(Boolean)
  )

  return profiles.some(profile => {
    const isAttacking = ['attack', 'attack_creation'].includes(profile.group)
    const isMatched = signals.some(signal => signal.profileId === profile.id)
    const isCandidate = candidateProfileIds.has(profile.id)

    return isAttacking && (isMatched || isCandidate)
  })
}

const hasActionableSignal = ({ signals, candidateSignals }) => (
  signals.length > 0 || candidateSignals.length > 0
)

const isHighActionStatus = opportunity => [
  'immediate',
  'priority',
].includes(opportunity?.actionStatus)

export const PLAYER_VERIFICATION_QUESTIONS = [
  {
    id: PLAYER_VERIFICATION_QUESTION.POSITION_CONTEXT_VERIFIED,
    inputMode: PLAYER_VERIFICATION_INPUT_MODE.MANUAL,
    answerType: PLAYER_VERIFICATION_ANSWER_TYPE.YES_NO_UNKNOWN,
    label: 'האם העמדה אומתה ומתאימה להקשר הפרופיל?',
    category: 'position',
    priority: PLAYER_VERIFICATION_PRIORITY.HIGH,
    appliesTo: ({ signals }) => (
      hasPositionContext(signals) ||
      hasReview(signals, SCOUT_REVIEW.POSITION) ||
      hasReview(signals, SCOUT_REVIEW.VIDEO_POSITION)
    ),
    yesEffects: [
      effect(
        PLAYER_VERIFICATION_DIMENSION.PROFILE_CONFIDENCE,
        PLAYER_VERIFICATION_EFFECT.SUPPORTS,
        3
      ),
    ],
    noEffects: [
      effect(
        PLAYER_VERIFICATION_DIMENSION.PROFILE_CONFIDENCE,
        PLAYER_VERIFICATION_EFFECT.REDUCES,
        2
      ),
    ],
  },
  {
    id: PLAYER_VERIFICATION_QUESTION.TRANSFERRED_SINCE_SIGNAL,
    inputMode: PLAYER_VERIFICATION_INPUT_MODE.MANUAL,
    answerType: PLAYER_VERIFICATION_ANSWER_TYPE.YES_NO_UNKNOWN,
    label: 'האם השחקן עבר קבוצה מאז זיהוי הסיגנל?',
    category: 'market',
    priority: PLAYER_VERIFICATION_PRIORITY.HIGH,
    appliesTo: hasActionableSignal,
    yesEffects: [
      effect(
        PLAYER_VERIFICATION_DIMENSION.DISCOVERY_OPPORTUNITY,
        PLAYER_VERIFICATION_EFFECT.REDUCES,
        3
      ),
      effect(
        PLAYER_VERIFICATION_DIMENSION.ACTION_IMMEDIACY,
        PLAYER_VERIFICATION_EFFECT.REDUCES,
        2
      ),
    ],
    noEffects: [
      effect(
        PLAYER_VERIFICATION_DIMENSION.ACTION_IMMEDIACY,
        PLAYER_VERIFICATION_EFFECT.SUPPORTS,
        1
      ),
    ],
  },
  {
    id: PLAYER_VERIFICATION_QUESTION.GOALS_WELL_DISTRIBUTED,
    inputMode: PLAYER_VERIFICATION_INPUT_MODE.MANUAL,
    answerType: PLAYER_VERIFICATION_ANSWER_TYPE.YES_NO_UNKNOWN,
    label: 'האם השערים מפוזרים על פני מספר משחקים ולא מרוכזים באירוע חריג?',
    category: 'production',
    priority: PLAYER_VERIFICATION_PRIORITY.HIGH,
    appliesTo: context => (
      hasAttackingProfile(context) && Number(context.player?.goals || 0) >= 3
    ),
    yesEffects: [
      effect(
        PLAYER_VERIFICATION_DIMENSION.PRODUCTION_RELIABILITY,
        PLAYER_VERIFICATION_EFFECT.SUPPORTS,
        3
      ),
    ],
    noEffects: [
      effect(
        PLAYER_VERIFICATION_DIMENSION.PRODUCTION_RELIABILITY,
        PLAYER_VERIFICATION_EFFECT.REDUCES,
        2
      ),
    ],
  },
  {
    id: PLAYER_VERIFICATION_QUESTION.HAS_AGENT,
    inputMode: PLAYER_VERIFICATION_INPUT_MODE.MANUAL,
    answerType: PLAYER_VERIFICATION_ANSWER_TYPE.YES_NO_UNKNOWN,
    label: 'האם ידוע שלשחקן יש סוכן?',
    category: 'market',
    priority: PLAYER_VERIFICATION_PRIORITY.HIGH,
    appliesTo: hasActionableSignal,
    yesEffects: [
      effect(
        PLAYER_VERIFICATION_DIMENSION.DISCOVERY_OPPORTUNITY,
        PLAYER_VERIFICATION_EFFECT.REDUCES,
        3
      ),
      effect(
        PLAYER_VERIFICATION_DIMENSION.ACTION_IMMEDIACY,
        PLAYER_VERIFICATION_EFFECT.REDUCES,
        1
      ),
    ],
    noEffects: [
      effect(
        PLAYER_VERIFICATION_DIMENSION.DISCOVERY_OPPORTUNITY,
        PLAYER_VERIFICATION_EFFECT.SUPPORTS,
        2
      ),
    ],
  },
  {
    id: PLAYER_VERIFICATION_QUESTION.VISUAL_SIGNAL_CONFIRMED,
    inputMode: PLAYER_VERIFICATION_INPUT_MODE.MANUAL,
    answerType: PLAYER_VERIFICATION_ANSWER_TYPE.YES_NO_UNKNOWN,
    label: 'האם צפייה ויזואלית חיזקה את הסיגנל?',
    category: 'video',
    priority: PLAYER_VERIFICATION_PRIORITY.HIGH,
    appliesTo: hasActionableSignal,
    yesEffects: [
      effect(
        PLAYER_VERIFICATION_DIMENSION.VISUAL_CONFIDENCE,
        PLAYER_VERIFICATION_EFFECT.SUPPORTS,
        3
      ),
    ],
    noEffects: [
      effect(
        PLAYER_VERIFICATION_DIMENSION.VISUAL_CONFIDENCE,
        PLAYER_VERIFICATION_EFFECT.REDUCES,
        2
      ),
    ],
  },
  {
    id: PLAYER_VERIFICATION_QUESTION.HIGHER_LEVEL_PERFORMANCE_CONFIRMED,
    inputMode: PLAYER_VERIFICATION_INPUT_MODE.MANUAL,
    answerType: PLAYER_VERIFICATION_ANSWER_TYPE.YES_NO_UNKNOWN,
    label: 'האם יש אישור שהשחקן מתפקד היטב מול יריבות ברמה גבוהה יותר?',
    category: 'competition',
    priority: PLAYER_VERIFICATION_PRIORITY.MEDIUM,
    appliesTo: ({ signals, candidateSignals, opportunity }) => (
      hasActionableSignal({ signals, candidateSignals }) &&
      isHighActionStatus(opportunity)
    ),
    yesEffects: [
      effect(
        PLAYER_VERIFICATION_DIMENSION.COMPETITION_VALIDATION,
        PLAYER_VERIFICATION_EFFECT.SUPPORTS,
        2
      ),
    ],
    noEffects: [],
  },
]
