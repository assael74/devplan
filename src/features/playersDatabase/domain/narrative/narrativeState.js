// src/features/playersDatabase/domain/narrative/narrativeState.js

import {
  NARRATIVE_VERSION,
  createEmptyNarrativeProfileRef,
  createEmptyNarrativeSnapshot,
} from './narrative.contract.js'

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

export const normalizeNarrativeSnapshot = value => {
  if (!value || typeof value !== 'object') return null

  const empty = createEmptyNarrativeSnapshot()

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
    content: {
      ...empty.content,
      ...(value.content || {}),
    },
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
