// src/shared/scouting/players/verification/playerVerification.js

import { SCOUT_PROFILES } from '../profiles.js'

import {
  PLAYER_VERIFICATION_ANSWER,
  PLAYER_VERIFICATION_EFFECT,
  PLAYER_VERIFICATION_PRIORITY,
} from './playerVerification.model.js'

import { PLAYER_VERIFICATION_QUESTIONS } from './playerVerification.questions.js'

const PRIORITY_SCORE = {
  [PLAYER_VERIFICATION_PRIORITY.HIGH]: 30,
  [PLAYER_VERIFICATION_PRIORITY.MEDIUM]: 20,
  [PLAYER_VERIFICATION_PRIORITY.LOW]: 10,
}

const normalizeAnswer = value => {
  const answer = String(value || '').trim().toLowerCase()

  if (answer === PLAYER_VERIFICATION_ANSWER.YES) return PLAYER_VERIFICATION_ANSWER.YES
  if (answer === PLAYER_VERIFICATION_ANSWER.NO) return PLAYER_VERIFICATION_ANSWER.NO

  return PLAYER_VERIFICATION_ANSWER.UNKNOWN
}

const normalizeAnswers = value => {
  if (Array.isArray(value)) {
    return Object.fromEntries(
      value
        .filter(item => item?.questionId)
        .map(item => [item.questionId, normalizeAnswer(item.answer)])
    )
  }

  if (!value || typeof value !== 'object') return {}

  return Object.fromEntries(
    Object.entries(value).map(([questionId, answer]) => [
      questionId,
      normalizeAnswer(answer?.answer || answer),
    ])
  )
}

const resolveEffects = (question, answer) => {
  if (answer === PLAYER_VERIFICATION_ANSWER.YES) {
    return Array.isArray(question.yesEffects) ? question.yesEffects : []
  }

  if (answer === PLAYER_VERIFICATION_ANSWER.NO) {
    return Array.isArray(question.noEffects) ? question.noEffects : []
  }

  return []
}

const aggregateDimensions = checks => {
  const dimensions = {}

  checks.forEach(check => {
    check.effects.forEach(effect => {
      const current = dimensions[effect.dimension] || {
        supports: 0,
        reduces: 0,
        net: 0,
        direction: PLAYER_VERIFICATION_EFFECT.NEUTRAL,
      }

      if (effect.direction === PLAYER_VERIFICATION_EFFECT.SUPPORTS) {
        current.supports += effect.weight
      }

      if (effect.direction === PLAYER_VERIFICATION_EFFECT.REDUCES) {
        current.reduces += effect.weight
      }

      current.net = current.supports - current.reduces
      current.direction = current.net > 0
        ? PLAYER_VERIFICATION_EFFECT.SUPPORTS
        : current.net < 0
          ? PLAYER_VERIFICATION_EFFECT.REDUCES
          : PLAYER_VERIFICATION_EFFECT.NEUTRAL

      dimensions[effect.dimension] = current
    })
  })

  return dimensions
}

const resolveDynamicPriorityScore = ({ question, context }) => {
  let score = PRIORITY_SCORE[question.priority] || 0
  const actionStatus = context.opportunity?.actionStatus || ''

  if (['immediate', 'priority'].includes(actionStatus)) score += 10

  if (
    question.category === 'position' &&
    context.signals.some(signal => Boolean(signal.positionContext))
  ) {
    score += 20
  }

  if (
    question.category === 'production' &&
    Number(context.player?.goals || 0) >= 5
  ) {
    score += 15
  }

  if (question.category === 'market' && actionStatus === 'immediate') score += 10

  return score
}

const buildCheck = ({ question, answer, context }) => ({
  questionId: question.id,
  label: question.label,
  category: question.category,
  inputMode: question.inputMode,
  answerType: question.answerType,
  priority: question.priority,
  answer,
  answered: answer !== PLAYER_VERIFICATION_ANSWER.UNKNOWN,
  effects: resolveEffects(question, answer),
  recommendationScore: resolveDynamicPriorityScore({ question, context }),
})

export const buildPlayerVerification = ({
  player = {},
  signals = [],
  candidateSignals = [],
  opportunity = {},
  answers = {},
  profiles = SCOUT_PROFILES,
} = {}) => {
  const safeSignals = Array.isArray(signals) ? signals : []
  const safeCandidateSignals = Array.isArray(candidateSignals) ? candidateSignals : []
  const safeProfiles = Array.isArray(profiles) ? profiles : SCOUT_PROFILES
  const normalizedAnswers = normalizeAnswers(answers)
  const context = {
    player,
    signals: safeSignals,
    candidateSignals: safeCandidateSignals,
    opportunity,
    profiles: safeProfiles,
  }
  const checks = PLAYER_VERIFICATION_QUESTIONS
    .filter(question => question.appliesTo(context))
    .map(question => buildCheck({
      question,
      answer: normalizedAnswers[question.id] || PLAYER_VERIFICATION_ANSWER.UNKNOWN,
      context,
    }))
  const missingChecks = checks
    .filter(check => !check.answered)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
  const answeredChecks = checks.filter(check => check.answered)

  return {
    checks,
    answeredChecks,
    missingChecks,
    nextBestCheck: missingChecks[0] || null,
    dimensions: aggregateDimensions(answeredChecks),
    completion: {
      answered: answeredChecks.length,
      total: checks.length,
      complete: checks.length > 0 && answeredChecks.length === checks.length,
    },
  }
}
