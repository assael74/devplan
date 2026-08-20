// src/features/playersDatabase/domain/narrative/narrativeReview.js

import {
  NARRATIVE_SCOPE,
  NARRATIVE_VERSION,
  createEmptyNarrativeContent,
  createEmptyNarrativeSnapshot,
} from './narrative.contract.js'

const clean = value => String(value || '').trim()


const normalizeApprovedContent = value => {
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

const getScopeSeasons = ({ input, scope, seasonKey }) => {
  const seasons = Array.isArray(input?.seasons) ? input.seasons : []
  if (scope !== NARRATIVE_SCOPE.SEASON) return seasons

  return seasons.filter(season => clean(season?.seasonKey) === clean(seasonKey))
}

const buildSeasonKeys = seasons => [...new Set(
  seasons
    .map(season => clean(season?.seasonKey))
    .filter(Boolean)
)]

const buildProfileRefs = seasons => {
  const refs = []
  const seen = new Set()

  seasons.forEach(season => {
    const entries = Array.isArray(season?.entries) ? season.entries : []

    entries.forEach(entry => {
      const contractProfiles = entry?.scout?.contract?.profiles || {}
      const matchedProfiles = [
        contractProfiles.primary,
        ...(Array.isArray(contractProfiles.supporting) ? contractProfiles.supporting : []),
      ].filter(Boolean)
      const profileIds = matchedProfiles
        .map(profile => clean(profile?.id))
        .filter(Boolean)

      profileIds.forEach(profileId => {
        const ref = {
          seasonKey: clean(entry?.seasonKey || season?.seasonKey),
          birthTeamId: clean(entry?.team?.teamId),
          birthTeamDocumentId: clean(entry?.team?.teamDocumentId),
          birthTeamSlot: Number(entry?.team?.teamSlot || 0),
          profileId: clean(profileId),
        }
        const key = [
          ref.seasonKey,
          ref.birthTeamDocumentId || ref.birthTeamId,
          ref.birthTeamSlot,
          ref.profileId,
        ].join('|')

        if (!ref.profileId || seen.has(key)) return

        seen.add(key)
        refs.push(ref)
      })
    })
  })

  return refs
}

export const buildNarrativeRequest = ({ input, scope, seasonKey = '', inputHash = '', draft = null, instruction = '' } = {}) => ({
  input,
  scope,
  seasonKey,
  inputHash,
  draft,
  instruction: String(instruction || '').trim(),
})

export const buildApprovedSnapshot = ({
  session,
  input,
  meta = null,
  generatedAt = null,
  approvedAt = null,
  generator = {},
  source = 'ai',
} = {}) => {
  if (!session?.draft || !session?.inputHash) return null

  const empty = createEmptyNarrativeSnapshot()
  const seasons = getScopeSeasons({
    input,
    scope: session.scope,
    seasonKey: session.seasonKey,
  })
  const seasonKeys = Array.isArray(meta?.seasonKeys)
    ? meta.seasonKeys
    : buildSeasonKeys(seasons)
  const profileRefs = Array.isArray(meta?.profileRefs)
    ? meta.profileRefs
    : buildProfileRefs(seasons)

  return {
    ...empty,
    version: NARRATIVE_VERSION,
    inputHash: session.inputHash,
    scope: session.scope || '',
    seasonKeys,
    profileRefs,
    revision: Number(session.revision || 1),
    generatedAt,
    approvedAt,
    source,
    generator: {
      ...empty.generator,
      ...generator,
    },
    content: normalizeApprovedContent(session.draft),
  }
}
