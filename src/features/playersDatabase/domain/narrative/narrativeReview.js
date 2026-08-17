// src/features/playersDatabase/domain/narrative/narrativeReview.js

import {
  NARRATIVE_SCOPE,
  createEmptyNarrativeSnapshot,
} from './narrative.contract.js'

const clean = value => String(value || '').trim()

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
      const profileIds = Array.isArray(entry?.scout?.profileIds)
        ? entry.scout.profileIds
        : []

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
    content: {
      ...empty.content,
      ...session.draft,
    },
  }
}
