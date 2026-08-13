// src/features/playersDatabase/services/write/players/scoutingPlayerVerification.model.js

const clean = value => String(value || '').trim()

const VERIFICATION_ANSWERS = new Set([
  'yes',
  'no',
  'unknown',
])

export const normalizeScoutingPlayerVerificationAnswer = value => {
  const answer = clean(value).toLowerCase()

  return VERIFICATION_ANSWERS.has(answer)
    ? answer
    : 'unknown'
}

export const normalizeScoutingPlayerVerification = value => {
  const verification = value && typeof value === 'object'
    ? value
    : {}
  const answers = Array.isArray(verification.answers)
    ? verification.answers
    : []
  const answersByQuestion = new Map()

  answers.forEach(item => {
    const questionId = clean(item?.questionId)
    if (!questionId) return

    answersByQuestion.set(questionId, {
      questionId,
      answer: normalizeScoutingPlayerVerificationAnswer(item.answer),
      sourceType: clean(item.sourceType),
      sourceLabel: clean(item.sourceLabel),
      answeredAt: item.answeredAt || null,
      reviewAfter: item.reviewAfter || null,
    })
  })

  return {
    mode: 'manual',
    answers: [...answersByQuestion.values()],
    updatedAt: verification.updatedAt || null,
  }
}

export const buildScoutingPlayerVerification = ({
  currentVerification = {},
  questionId = '',
  answer = 'unknown',
  sourceType = '',
  sourceLabel = '',
  answeredAt = '',
  reviewAfter = null,
} = {}) => {
  const current = normalizeScoutingPlayerVerification(currentVerification)
  const normalizedQuestionId = clean(questionId)

  if (!normalizedQuestionId) return current

  const nextAnswer = {
    questionId: normalizedQuestionId,
    answer: normalizeScoutingPlayerVerificationAnswer(answer),
    sourceType: clean(sourceType),
    sourceLabel: clean(sourceLabel),
    answeredAt: answeredAt || new Date().toISOString(),
    reviewAfter: reviewAfter || null,
  }
  const answers = current.answers.filter(item => (
    item.questionId !== normalizedQuestionId
  ))

  return {
    mode: 'manual',
    answers: [
      ...answers,
      nextAnswer,
    ],
    updatedAt: nextAnswer.answeredAt,
  }
}
