// src/features/playersDatabase/domain/narrative/narrativePlan.js

import { buildCareerFallback, buildSeasonFallback } from './narrativeFallback.js'
import { buildCareerHash, buildSeasonHash } from './narrativeHash.js'
import { buildNarrativeInput } from './narrativeInput.js'
import { buildNarrativeMeaning } from './narrativeMeaning.js'
import { resolveNarrativeAction } from './narrativeDecision.js'
import { isNarrativeEligible } from './narrativeEligibility.js'
import { normalizePlayerNarrative } from './narrativeState.js'

const findSeasonState = ({ narrative, season }) => (
  narrative.seasons.find(item => (
    (season.seasonKey && item.seasonKey === season.seasonKey) ||
    (season.seasonId && item.seasonId === season.seasonId)
  ))?.approved || null
)

export const buildNarrativePlan = source => {
  const input = buildNarrativeInput(source)
  const eligible = isNarrativeEligible({
    player: input.player,
    seasons: input.seasons,
  })

  if (!eligible) {
    return {
      eligible: false,
      reason: 'notEligible',
      input,
      meaning: null,
      seasons: [],
      career: null,
    }
  }

  const meaning = buildNarrativeMeaning(input)
  const narrative = normalizePlayerNarrative(source?.narrative)
  const seasons = input.seasons.map((season, index) => {
    const seasonMeaning = meaning.seasons[index]
    const inputHash = buildSeasonHash(seasonMeaning)
    const current = findSeasonState({ narrative, season })

    return {
      seasonId: season.seasonId,
      seasonKey: season.seasonKey,
      inputHash,
      action: resolveNarrativeAction({ current, inputHash }),
      fallback: buildSeasonFallback(season),
    }
  })
  const careerHash = buildCareerHash(meaning.career)

  return {
    eligible: true,
    input,
    meaning,
    seasons,
    career: {
      inputHash: careerHash,
      action: resolveNarrativeAction({
        current: narrative.career,
        inputHash: careerHash,
      }),
      fallback: buildCareerFallback(input),
    },
  }
}
