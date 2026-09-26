export const clean = value => String(value === undefined || value === null ? '' : value).trim()
export const toNumberOrZero = value => Number.isFinite(Number(value)) ? Number(value) : 0
export const buildSeasonKey = seasonId => clean(seasonId)
