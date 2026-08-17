// src/features/playersDatabase/domain/narrative/narrativeSession.js

import {
  NARRATIVE_SCOPE,
  NARRATIVE_SESSION_VERSION,
  createEmptyNarrativeContent,
} from './narrative.contract.js'

export const NARRATIVE_SESSION_STATUS = {
  IDLE: 'idle',
  GENERATING: 'generating',
  REVIEW: 'review',
  FAILED: 'failed',
}

const normalizeContent = value => ({
  ...createEmptyNarrativeContent(),
  ...(value || {}),
})

export const createNarrativeSession = ({ scope, seasonId = '', seasonKey = '', inputHash = '' } = {}) => ({
  version: NARRATIVE_SESSION_VERSION,
  scope: scope || NARRATIVE_SCOPE.SEASON,
  seasonId,
  seasonKey,
  inputHash,
  status: NARRATIVE_SESSION_STATUS.IDLE,
  revision: 0,
  draft: null,
  lastInstruction: '',
  error: '',
})

export const startNarrativeGeneration = session => ({
  ...session,
  status: NARRATIVE_SESSION_STATUS.GENERATING,
  error: '',
})

export const setNarrativeDraft = ({ session, content, instruction = '' } = {}) => ({
  ...session,
  status: NARRATIVE_SESSION_STATUS.REVIEW,
  revision: Number(session?.revision || 0) + 1,
  draft: normalizeContent(content),
  lastInstruction: instruction,
  error: '',
})

export const failNarrativeGeneration = ({ session, error = '' } = {}) => ({
  ...session,
  status: NARRATIVE_SESSION_STATUS.FAILED,
  error: String(error || ''),
})

export const canRefineNarrative = session => (
  session?.status === NARRATIVE_SESSION_STATUS.REVIEW &&
  Boolean(session?.draft)
)
