// src/features/playersDatabase/domain/identity/seasonIdentity.js

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const SEASON_ID_PATTERN = /^\d{4}_\d{4}$/

export const normalizeSeasonIdentity = ({
  seasonId = '',
  seasonKey = '',
} = {}) => ({
  seasonId: clean(seasonId),
  seasonKey: clean(seasonKey),
})

export const requireSeasonId = value => {
  const seasonId = clean(value)
  if (!seasonId) throw new Error('Missing seasonId')
  if (!SEASON_ID_PATTERN.test(seasonId)) throw new Error('Invalid seasonId')

  return seasonId
}
