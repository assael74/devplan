// src/features/playersDatabase/domain/narrative/narrative.contract.js

export const NARRATIVE_VERSION = 1
export const NARRATIVE_INPUT_VERSION = 1
export const NARRATIVE_MEANING_VERSION = 1
export const NARRATIVE_SESSION_VERSION = 1

export const NARRATIVE_SCOPE = {
  SEASON: 'season',
  CAREER: 'career',
}

export const createEmptyNarrativeInput = () => ({
  version: NARRATIVE_INPUT_VERSION,
  player: {
    playerId: '',
    playerDocumentId: '',
    displayName: '',
    birthYear: null,
  },
  seasons: [],
  events: [],
  unknowns: {
    verification: null,
    openQuestions: [],
  },
})

export const createEmptyNarrativeMeaning = () => ({
  version: NARRATIVE_MEANING_VERSION,
  seasons: [],
  career: {
    transferDirections: [],
    playingUpSeasons: [],
    profileChanges: [],
  },
})

export const createEmptyNarrativeContent = () => ({
  title: '',
  summary: '',
})

export const createEmptyNarrativeProfileRef = () => ({
  seasonKey: '',
  birthTeamId: '',
  birthTeamDocumentId: '',
  birthTeamSlot: 0,
  profileId: '',
})

export const createEmptyNarrativeSnapshot = () => ({
  version: NARRATIVE_VERSION,
  inputHash: '',
  scope: '',
  seasonKeys: [],
  profileRefs: [],
  revision: 0,
  generatedAt: null,
  approvedAt: null,
  source: 'ai',
  generator: {
    model: '',
    promptVersion: '',
  },
  content: createEmptyNarrativeContent(),
})
