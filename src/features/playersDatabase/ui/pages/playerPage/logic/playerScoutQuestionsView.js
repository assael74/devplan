// Player review questions presentation for the player scout view model.

import { SCOUT_REVIEW } from '../../../../../../shared/scouting/players/ids.js'
import { resolveProfileId, resolveProfileLabel } from './playerScoutProfileIdentity.js'
import { clean } from './playerScoutView.utils.js'

const PLAYER_REVIEW_LABELS = {
  position: 'עמדה',
  agent_status: 'מצב סוכן',
  transfer_history: 'היסטוריית מעבר קבוצות',
  goal_distribution: 'פיזור שערים',
  minutes_distribution: 'חלוקת דקות',
  agent_path_fit: 'התאמה למסלול סוכן',
  scout_path_fit: 'התאמה למסלול סקאוט',
}

const isPlayerReviewAnswered = (fieldId, entry = {}) => {
  if (fieldId === 'position') return Boolean(clean(entry.value))

  if ([
    'agent_status',
    'agent_path_fit',
    'scout_path_fit',
  ].includes(fieldId)) {
    return Boolean(clean(entry.value) && clean(entry.value) !== 'unknown')
  }

  return clean(entry.status) === 'reviewed'
}


const buildProfileRelevanceChecks = scout => (
  (Array.isArray(scout?.profiles) ? scout.profiles : [])
    .filter(profile => (
      Array.isArray(profile?.requiredReview) &&
      profile.requiredReview.includes(SCOUT_REVIEW.PROFILE_RELEVANCE)
    ))
    .map(profile => ({
      id: `${SCOUT_REVIEW.PROFILE_RELEVANCE}:${resolveProfileId(profile)}`,
      label: `בדוק רלוונטיות של ${resolveProfileLabel(profile)}`,
      answer: 'unknown',
      answerLabel: 'דורש בדיקה',
      answered: false,
      priority: 'high',
      score: 100,
      inputMode: 'manual',
      tone: 'ask',
      profileId: resolveProfileId(profile),
      reviewId: SCOUT_REVIEW.PROFILE_RELEVANCE,
    }))
    .filter(check => check.profileId)
)

export const buildQuestions = scout => {
  const profileRelevanceChecks = buildProfileRelevanceChecks(scout)
  const verification = scout?.verification && typeof scout.verification === 'object'
    ? scout.verification
    : {}
  const verificationChecks = Array.isArray(verification.missingChecks)
    ? verification.missingChecks
    : []

  if (verificationChecks.length) {
    const checks = [
      ...profileRelevanceChecks,
      ...verificationChecks
      .slice()
      .sort((a, b) => Number(b?.recommendationScore || 0) - Number(a?.recommendationScore || 0))
      .map(check => ({
        id: clean(check.questionId),
        label: clean(check.label) || 'בדיקה מקצועית',
        answer: clean(check.answer) || 'unknown',
        answerLabel: check.answered ? 'נבדק' : 'לא ידוע',
        answered: Boolean(check.answered),
        priority: clean(check.priority),
        score: Number(check.recommendationScore || 0),
        inputMode: clean(check.inputMode),
        tone: check.answered ? 'ok' : 'ask',
      })),
    ]
    const answered = checks.filter(check => check.answered).length

    return {
      completion: {
        answered,
        total: checks.length,
        complete: answered === checks.length,
      },
      checks,
      nextBest: verification.nextBestCheck || null,
    }
  }

  const review = scout?.playerReview && typeof scout.playerReview === 'object'
    ? scout.playerReview
    : {}
  const fieldIds = Object.keys(PLAYER_REVIEW_LABELS)
  const allChecks = fieldIds.map(fieldId => {
    const entry = review[fieldId] && typeof review[fieldId] === 'object'
      ? review[fieldId]
      : {}
    const answered = isPlayerReviewAnswered(fieldId, entry)

    return {
      id: fieldId,
      label: PLAYER_REVIEW_LABELS[fieldId],
      answer: clean(entry.value || entry.status) || 'unknown',
      answerLabel: answered ? 'נבדק' : 'לא ידוע',
      answered,
      priority: '',
      score: 0,
      inputMode: 'manual',
      tone: answered ? 'ok' : 'ask',
    }
  })
  const answered = allChecks.filter(check => check.answered).length

  return {
    completion: {
      answered,
      total: allChecks.length + profileRelevanceChecks.length,
      complete: answered === allChecks.length && profileRelevanceChecks.length === 0,
    },
    checks: [
      ...profileRelevanceChecks,
      ...allChecks.filter(check => !check.answered),
    ],
    nextBest: null,
  }
}

