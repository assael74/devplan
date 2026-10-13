// src/features/playersDatabase/domain/roster/rosterHistory.js

export const previousRosterSeasonRef = ({ teamRoot, seasonId }) => Object.entries(
  teamRoot?.seasonRefsById || {}
).filter(([id]) => id < seasonId)
  .sort(([left], [right]) => right.localeCompare(left))
  .map(([id, ref]) => ({ ...ref, seasonId: id }))[0] || null
