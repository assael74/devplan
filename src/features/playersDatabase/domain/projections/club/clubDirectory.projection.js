// src/features/playersDatabase/domain/projections/club/clubDirectory.projection.js

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const toNullableNumber = value => {
  if (value === null || value === undefined || value === '') return null
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

const strings = value => (
  Array.isArray(value) ? value.map(clean).filter(Boolean) : []
)

export const buildClubDirectoryProjection = ({ profile = {}, updatedAt = null } = {}) => ({
  names: {
    official: clean(profile.names && profile.names.official),
    display: clean(profile.names && profile.names.display),
    short: clean(profile.names && profile.names.short),
  },
  aliases: strings(profile.aliases),
  searchAliases: strings(profile.searchAliases),
  clubUrl: clean(profile.clubUrl),
  clubLevel: toNullableNumber(profile.clubLevel),
  clubStrengthLevel: toNullableNumber(profile.clubStrengthLevel),
  updatedAt: updatedAt || null,
})

export default buildClubDirectoryProjection
