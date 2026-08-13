// src/features/playersDatabase/domain/contracts/playerDocumentState.contract.js

import {
  cleanDomainValue,
  toDomainArray,
} from './domainValue.contract.js'

export const PLAYER_TRACKING_REASON = Object.freeze({
  PROFILE: 'PROFILE',
  FAVORITE: 'FAVORITE',
  WATCHLIST: 'WATCHLIST',
  MANUAL: 'MANUAL',
  TRANSFER: 'TRANSFER',
})

const TRACKING_REASON_VALUES = new Set(
  Object.values(PLAYER_TRACKING_REASON)
)

const VERIFICATION_ANSWERS = new Set([
  'yes',
  'no',
  'unknown',
])

const normalizeTrackingReason = value => {
  const reason = cleanDomainValue(value).toUpperCase()
  return TRACKING_REASON_VALUES.has(reason) ? reason : ''
}

const hasProfiles = playerDocument => {
  const current = toDomainArray(playerDocument.current)
  const history = toDomainArray(playerDocument.history)
  const rootProfiles = toDomainArray(playerDocument.scoutProfiles)

  return [
    ...current,
    ...history,
  ].some(season => (
    toDomainArray(season?.scoutProfiles).length > 0 ||
    toDomainArray(season?.scoutSignals).length > 0
  )) || rootProfiles.length > 0
}

export const normalizePlayerTrackingState = (playerDocument = {}) => {
  const tracking = playerDocument.tracking && typeof playerDocument.tracking === 'object'
    ? playerDocument.tracking
    : {}
  const favorite = tracking.favorite === true || playerDocument.favorite === true
  const watchlist = tracking.watchlist === true || playerDocument.watchlist === true
  const trackingReasons = toDomainArray(tracking.trackingReasons)
    .map(normalizeTrackingReason)
    .filter(Boolean)

  if (favorite) trackingReasons.push(PLAYER_TRACKING_REASON.FAVORITE)
  if (watchlist) trackingReasons.push(PLAYER_TRACKING_REASON.WATCHLIST)
  if (hasProfiles(playerDocument)) trackingReasons.push(PLAYER_TRACKING_REASON.PROFILE)

  return {
    favorite,
    watchlist,
    firstTrackedAt: tracking.firstTrackedAt || null,
    trackingReasons: [...new Set(trackingReasons)],
  }
}

export const normalizePlayerVerificationState = playerDocument => {
  const source = playerDocument && typeof playerDocument === 'object'
    ? playerDocument
    : {}
  const verification = source.verification && typeof source.verification === 'object'
    ? source.verification
    : {}
  const rawAnswers = Array.isArray(verification.answers)
    ? verification.answers
    : toDomainArray(source.verificationAnswers)
  const answersByQuestion = new Map()

  rawAnswers.forEach(item => {
    if (!item || typeof item !== 'object') return

    const questionId = cleanDomainValue(item.questionId)
    if (!questionId) return

    const rawAnswer = cleanDomainValue(item.answer).toLowerCase()
    answersByQuestion.set(questionId, {
      questionId,
      answer: VERIFICATION_ANSWERS.has(rawAnswer) ? rawAnswer : 'unknown',
      sourceType: cleanDomainValue(item.sourceType),
      sourceLabel: cleanDomainValue(item.sourceLabel),
      answeredAt: item.answeredAt || null,
      reviewAfter: item.reviewAfter || null,
    })
  })

  return {
    mode: cleanDomainValue(verification.mode) || 'manual',
    answers: [...answersByQuestion.values()],
    updatedAt: verification.updatedAt || null,
  }
}

export const normalizePlayerEventsState = playerDocument => (
  toDomainArray(playerDocument?.events)
    .filter(event => event && typeof event === 'object')
    .map(event => ({ ...event }))
)
