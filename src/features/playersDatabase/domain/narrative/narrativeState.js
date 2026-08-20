// src/features/playersDatabase/domain/narrative/narrativeState.js

import {
  NARRATIVE_VERSION,
  createEmptyNarrativeContent,
  createEmptyNarrativeProfileRef,
  createEmptyNarrativeSnapshot,
} from './narrative.contract.js'

const clean = value => String(value || '').trim()

export const createEmptyPlayerNarrative = () => ({
  version: NARRATIVE_VERSION,
  seasons: [],
  career: null,
})

const normalizeProfileRef = value => {
  const source = value && typeof value === 'object' ? value : {}
  const empty = createEmptyNarrativeProfileRef()

  return {
    ...empty,
    ...source,
    birthTeamSlot: Number(source.birthTeamSlot || 0),
  }
}

const hasNarrativeContent = content => (
  Boolean(clean(content?.title))
  || Boolean(clean(content?.summary))
  || Boolean(content?.conclusion)
  || Boolean(clean(content?.whyInteresting))
  || Boolean(clean(content?.professionalContext))
  || (Array.isArray(content?.strengths) && content.strengths.length > 0)
  || (Array.isArray(content?.unknowns) && content.unknowns.length > 0)
  || Boolean(content?.action)
  || (Array.isArray(content?.evidenceRefs) && content.evidenceRefs.length > 0)
)

const normalizeNarrativeContent = value => {
  const source = value && typeof value === 'object' ? value : {}
  const empty = createEmptyNarrativeContent()

  return {
    ...empty,
    title: clean(source.title),
    summary: clean(source.summary),
    conclusion: source.conclusion && typeof source.conclusion === 'object'
      ? source.conclusion
      : null,
    whyInteresting: clean(source.whyInteresting),
    professionalContext: clean(source.professionalContext),
    strengths: Array.isArray(source.strengths)
      ? source.strengths.map(clean).filter(Boolean)
      : [],
    unknowns: Array.isArray(source.unknowns)
      ? source.unknowns.map(clean).filter(Boolean)
      : [],
    action: source.action && typeof source.action === 'object'
      ? source.action
      : null,
    evidenceRefs: Array.isArray(source.evidenceRefs)
      ? [...new Set(source.evidenceRefs.map(clean).filter(Boolean))]
      : [],
  }
}

export const normalizeNarrativeSnapshot = value => {
  if (!value || typeof value !== 'object') return null

  const empty = createEmptyNarrativeSnapshot()
  const contentSource = value.content && typeof value.content === 'object'
    ? value.content
    : value
  const content = normalizeNarrativeContent(contentSource)
  const hasSnapshot = Boolean(
    clean(value.inputHash)
    || value.generatedAt
    || value.approvedAt
    || hasNarrativeContent(content)
  )

  if (!hasSnapshot) return null

  return {
    ...empty,
    ...value,
    seasonKeys: Array.isArray(value.seasonKeys) ? value.seasonKeys : [],
    profileRefs: (Array.isArray(value.profileRefs) ? value.profileRefs : [])
      .map(normalizeProfileRef),
    generator: {
      ...empty.generator,
      ...(value.generator || {}),
    },
    content,
  }
}

const normalizeSeasonNarrative = value => ({
  seasonId: value?.seasonId || '',
  seasonKey: value?.seasonKey || '',
  approved: normalizeNarrativeSnapshot(
    value?.approved || value?.state?.approved
  ),
})

export const normalizePlayerNarrative = value => {
  const source = value && typeof value === 'object' ? value : {}
  const empty = createEmptyPlayerNarrative()
  const career = source.career?.approved || source.career

  return {
    ...empty,
    ...source,
    seasons: (Array.isArray(source.seasons) ? source.seasons : [])
      .map(normalizeSeasonNarrative),
    career: normalizeNarrativeSnapshot(career),
  }
}

export const buildApprovedNarrative = snapshot => (
  normalizeNarrativeSnapshot(snapshot)
)
