// src/features/playersDatabase/domain/clubIdentity.js

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const list = value => Array.isArray(value) ? value : []

export const normalizeClubName = value => clean(value)
  .toLowerCase()
  .replace(/[״"׳'`‘’“”.]/g, '')
  .replace(/\s+/g, ' ')

const withoutGenericSuffix = value => normalizeClubName(value)
  .replace(/\s*\(?נוער\)?\s*$/, '')
  .replace(/\s*\(?צו פיוס\)?\s*$/, '')
  .trim()

export const clubIdentityNames = club => [
  club.names?.official, club.names?.display, club.names?.short,
  club.name, club.shortName,
  ...list(club.aliases), ...list(club.searchAliases),
].map(clean).filter(Boolean)

export const buildClubChoices = directory => Object.entries(directory?.clubsById || {}).map(([id, club]) => ({
  ...club,
  id,
  name: clean(club.names?.display || club.names?.official),
  shortName: clean(club.names?.short),
}))

export const matchClubIdentity = (name, clubs) => {
  const key = normalizeClubName(name)
  if (!key) return null
  const exact = clubs.filter(club => clubIdentityNames(club).some(value => normalizeClubName(value) === key))
  const candidates = exact.length ? exact : clubs.filter(club => (
    clubIdentityNames(club).some(value => withoutGenericSuffix(value) === withoutGenericSuffix(name))
  ))
  if (candidates.length !== 1) return null
  const club = candidates[0]
  return { matched: true, id: club.id, name: club.name, confidence: 'alias', item: club }
}

export const uniqueClubAliases = values => {
  const byName = new Map()
  list(values).map(clean).filter(Boolean).forEach(value => {
    const key = normalizeClubName(value)
    if (key && !byName.has(key)) byName.set(key, value)
  })
  return [...byName.values()]
}

export const assertClubNamesAvailable = ({ clubId, names, clubsById }) => {
  const keys = new Set(names.map(normalizeClubName).filter(Boolean))
  Object.entries(clubsById).forEach(([id, club]) => {
    if (id === clubId) return
    const collision = clubIdentityNames(club).find(name => keys.has(normalizeClubName(name)))
    if (collision) throw new Error(`השם „${collision}” כבר משויך למועדון ${club.names?.display || club.name || id}`)
  })
}

export const appendClubAliases = ({ profile, aliases }) => {
  const known = new Set(clubIdentityNames(profile).map(normalizeClubName))
  const additions = uniqueClubAliases(aliases).filter(alias => !known.has(normalizeClubName(alias)))
  return additions.length ? [...list(profile.aliases), ...additions] : list(profile.aliases)
}
