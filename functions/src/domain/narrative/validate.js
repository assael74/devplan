// C:\projects\devplan\functions\src\domain\narrative\validate.js

function clean(value) {
  return String(value || '').trim()
}

function cleanUserText(value) {
  return clean(value)
    .replace(/סיגנלים/g, 'סימנים')
    .replace(/סיגנאלים/g, 'סימנים')
    .replace(/סיגנל/g, 'סימן')
    .replace(/סיגנאל/g, 'סימן')
    .replace(/המנוע/g, 'מודל הסקאוט')
    .replace(/מנוע/g, 'מודל הסקאוט')
}

function buildEvidenceIds(input = {}) {
  return new Set(
    (Array.isArray(input.evidence) ? input.evidence : [])
      .map(item => clean(item.id))
      .filter(Boolean)
  )
}

function uniqueText(values = []) {
  return [...new Set(
    (Array.isArray(values) ? values : [])
      .map(clean)
      .filter(Boolean)
  )]
}

function resolveDecisionMeaningEntry(input = {}) {
  const seasonKey = clean(input.decision?.seasonKey)
  const entries = Array.isArray(input.meaning?.entries) ? input.meaning.entries : []

  if (seasonKey) {
    const match = entries.find(entry => clean(entry.seasonKey) === seasonKey)
    if (match) return match
  }

  return entries.find(entry => clean(entry.sourceTarget) === 'current') || entries[0] || null
}

function buildDeterministicConclusion(input = {}, text = '') {
  const entry = resolveDecisionMeaningEntry(input)
  const primary = entry?.profiles?.primary || null

  return {
    primaryProfile: primary ? {
      profileId: clean(primary.profileId),
      profileLabel: clean(primary.profileLabel),
    } : null,
    profileStrength: primary?.profileStrength || null,
    caseStrength: entry?.profiles?.caseStrength || null,
    interestLevel: clean(input.decision?.playerInterestLevel || input.decision?.interestLevel),
    playerInterestLevel: clean(input.decision?.playerInterestLevel || input.decision?.interestLevel),
    profileInterestLevel: clean(input.decision?.profileInterestLevel),
    combinationInterestLevel: clean(input.decision?.combinationInterestLevel),
    immediacy: clean(input.decision?.actionStatus),
    text: clean(text),
  }
}

function resolveActionSentence(status) {
  const labels = {
    immediate: 'בדיקה מקצועית מיידית.',
    priority: 'עדיפות לבדיקה בזמן הקרוב.',
    watch: 'המשך מעקב.',
    exposed: 'המשך מעקב כאשר רמת החשיפה גבוהה ומפחיתה את יתרון התזמון.',
  }

  return labels[clean(status)] || 'לא נקבעה כרגע המלצת פעולה מצד מודל הסקאוט.'
}

function buildDeterministicAction(input = {}) {
  const isManual = Boolean(input.decision?.hasManualDecision)
  const text = resolveActionSentence(input.decision?.actionStatus)

  return {
    status: clean(input.decision?.actionStatus),
    automaticStatus: clean(input.decision?.automaticActionStatus),
    manualStatus: clean(input.decision?.manualActionStatus),
    isManual,
    text: isManual ? `החלטה ידנית: ${text}` : text,
  }
}

function buildCompatibilitySummary({
  conclusionText,
  whyInteresting,
  professionalContext,
  strengths,
  unknowns,
  actionText,
}) {
  return [
    conclusionText,
    whyInteresting,
    professionalContext,
    strengths.join(' '),
    unknowns.join(' '),
    actionText,
  ].map(cleanUserText).filter(Boolean).join('\n\n')
}

function normalizeLegacyDraft(draft = {}) {
  const summary = clean(draft.summary)

  return {
    conclusionText: summary,
    whyInteresting: summary,
    professionalContext: '',
    strengths: [],
    unknowns: [],
  }
}

function validateDraft({ input = {}, draft = {} } = {}) {
  const title = cleanUserText(draft.title)
  const hasStructuredDraft = [
    draft.conclusionText,
    draft.whyInteresting,
    draft.professionalContext,
  ].some(value => clean(value)) || Array.isArray(draft.strengths) || Array.isArray(draft.unknowns)
  const legacy = hasStructuredDraft ? null : normalizeLegacyDraft(draft)
  const conclusionText = cleanUserText(draft.conclusionText || legacy?.conclusionText)
  const whyInteresting = cleanUserText(draft.whyInteresting || legacy?.whyInteresting)
  const professionalContext = cleanUserText(
    draft.professionalContext || legacy?.professionalContext
  )
  const strengths = uniqueText(draft.strengths || legacy?.strengths).map(cleanUserText)
  const unknowns = uniqueText(draft.unknowns || legacy?.unknowns).map(cleanUserText)
  const evidenceRefs = Array.isArray(draft.evidenceRefs)
    ? [...new Set(draft.evidenceRefs.map(clean).filter(Boolean))]
    : []

  if (!title || !conclusionText || !whyInteresting) {
    throw Object.assign(new Error('invalid narrative draft'), { status: 502 })
  }

  const evidenceIds = buildEvidenceIds(input)
  const invalidRefs = evidenceRefs.filter(ref => !evidenceIds.has(ref))

  if (invalidRefs.length) {
    throw Object.assign(new Error('invalid narrative evidence refs'), {
      status: 502,
      details: { invalidRefs },
    })
  }

  const action = buildDeterministicAction(input)

  return {
    title,
    summary: buildCompatibilitySummary({
      conclusionText,
      whyInteresting,
      professionalContext,
      strengths,
      unknowns,
      actionText: action.text,
    }),
    conclusion: buildDeterministicConclusion(input, conclusionText),
    whyInteresting,
    professionalContext,
    strengths,
    unknowns,
    action,
    evidenceRefs,
  }
}

module.exports = { validateDraft }
