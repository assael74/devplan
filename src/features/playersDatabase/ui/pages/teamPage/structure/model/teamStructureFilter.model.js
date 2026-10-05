// src/features/playersDatabase/ui/pages/teamPage/structure/model/teamStructureFilter.model.js

export const TEAM_STRUCTURE_FILTER = Object.freeze({
  ALL_SQUAD: 'all_squad',
  GOALKEEPER: 'goalkeeper',
  DEFENSE: 'defense',
  MIDFIELD: 'midfield',
  ATTACK: 'attack',
  CLASSIFIED: 'classified',
  UNCLASSIFIED_SUFFICIENT_SAMPLE: 'unclassified_sufficient_sample',
  INSUFFICIENT_SAMPLE: 'insufficient_sample',
})

export const resolveDefaultTeamStructureFilter = ({
  structure = null,
  rows = [],
} = {}) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const hasClassifiedRows = safeRows.some(row => (
    Array.isArray(row?.structureFilterKeys) &&
    row.structureFilterKeys.includes(TEAM_STRUCTURE_FILTER.CLASSIFIED)
  ))

  if (
    !structure ||
    structure.availability === 'unavailable' ||
    structure.availabilityReason === 'stats_not_loaded' ||
    structure.availabilityReason === 'season_sample_insufficient' ||
    !hasClassifiedRows
  ) {
    return TEAM_STRUCTURE_FILTER.ALL_SQUAD
  }

  return TEAM_STRUCTURE_FILTER.CLASSIFIED
}
