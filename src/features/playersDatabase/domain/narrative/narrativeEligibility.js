// src/features/playersDatabase/domain/narrative/narrativeEligibility.js

export const isNarrativeEligible = ({ player = {}, seasons = [] } = {}) => {
  const playerDocumentId = (
    player?.identity?.playerDocumentId ||
    player?.playerDocumentId ||
    ''
  )

  return Boolean(
    playerDocumentId &&
    Array.isArray(seasons) &&
    seasons.length > 0
  )
}
