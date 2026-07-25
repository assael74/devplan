// src/features/playersDatabase/domain/selectors/lifecycle.selectors.js

export const selectIsCurrentSeason = value => value?.lifecycle?.type === 'current'
export const selectIsFinalSeason = value => Boolean(value?.lifecycle?.isFinal)
export const selectUsesProjection = value => Boolean(value?.lifecycle?.usesProjection)
export const selectActualStats = value => value?.stats?.actual || {}
export const selectProjectedStats = value => value?.stats?.projected || null
