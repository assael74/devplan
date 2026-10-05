// src/features/playersDatabase/domain/club/bootstrapClubCatalog.builder.js

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const cleanList = value => [
  ...new Set((Array.isArray(value) ? value : []).map(clean).filter(Boolean)),
]

const requireList = ({ value, label }) => {
  if (value === null || value === undefined) return []
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`)
  return cleanList(value)
}

const requireHttpUrl = ({ value, clubId }) => {
  const url = clean(value)
  if (!url) return ''

  let parsed
  try {
    parsed = new URL(url)
  } catch (error) {
    throw new Error(`Catalog clubUrl is invalid: ${clubId}`)
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Catalog clubUrl is invalid: ${clubId}`)
  }
  return url
}

const numberOrNull = value => (
  value === null || value === undefined || value === ''
    ? null
    : Number.isFinite(Number(value))
      ? Number(value)
      : null
)

const buildProfile = club => {
  const clubId = clean(club && club.id)
  const officialName = clean(club && club.name)
  if (!clubId) throw new Error('Catalog clubId is required')
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clubId)) {
    throw new Error(`Catalog clubId is invalid: ${clubId}`)
  }
  if (!officialName) throw new Error(`Catalog club name is required: ${clubId}`)

  const clubLevel = numberOrNull(club.clubLevel)
  const clubStrengthLevel = numberOrNull(club.clubStrengthLevel)
  if (clubLevel === null || clubLevel <= 0) {
    throw new Error(`Catalog clubLevel is invalid: ${clubId}`)
  }
  if (clubStrengthLevel === null || clubStrengthLevel <= 0) {
    throw new Error(`Catalog clubStrengthLevel is invalid: ${clubId}`)
  }

  return {
    clubId,
    externalClubId: clean(club.externalClubId),
    clubUrl: requireHttpUrl({ value: club.clubUrl, clubId }),
    names: {
      official: officialName,
      display: clean(club.displayName) || officialName,
      short: clean(club.shortName) || officialName,
      source: clean(club.sourceName) || officialName,
    },
    aliases: requireList({ value: club.aliases, label: `Catalog aliases for ${clubId}` }),
    searchAliases: requireList({
      value: club.searchAliases,
      label: `Catalog searchAliases for ${clubId}`,
    }),
    clubLevel,
    clubStrengthLevel,
  }
}

const buildDirectoryEntry = profile => ({
  names: {
    official: profile.names.official,
    display: profile.names.display,
    short: profile.names.short,
  },
  aliases: [...profile.aliases],
  searchAliases: [...profile.searchAliases],
  clubUrl: profile.clubUrl,
  clubLevel: profile.clubLevel,
  clubStrengthLevel: profile.clubStrengthLevel,
})

const comparableProfile = profile => ({
  clubId: clean(profile && (profile.clubId || profile.id)),
  externalClubId: clean(profile && profile.externalClubId),
  clubUrl: clean(profile && profile.clubUrl),
  names: {
    official: clean(profile && profile.names && profile.names.official),
    display: clean(profile && profile.names && profile.names.display),
    short: clean(profile && profile.names && profile.names.short),
    source: clean(profile && profile.names && profile.names.source),
  },
  aliases: cleanList(profile && profile.aliases),
  searchAliases: cleanList(profile && profile.searchAliases),
  clubLevel: numberOrNull(profile && profile.clubLevel),
  clubStrengthLevel: numberOrNull(profile && profile.clubStrengthLevel),
})

const same = (left, right) => JSON.stringify(left) === JSON.stringify(right)

const resolveMode = ({ profiles, directory, existingProfiles, existingDirectory }) => {
  const currentProfiles = Array.isArray(existingProfiles) ? existingProfiles : []
  const hasDirectory = Boolean(existingDirectory)
  if (!currentProfiles.length && !hasDirectory) return 'create'

  if (currentProfiles.length !== profiles.length || !hasDirectory) {
    throw new Error('Club bootstrap requires an empty database or an exact previous result')
  }

  const currentById = new Map(currentProfiles.map(profile => [
    clean(profile && (profile.id || profile.clubId)),
    profile,
  ]))
  const profilesMatch = profiles.every(profile => same(
    comparableProfile(currentById.get(profile.clubId)),
    comparableProfile(profile),
  ))
  const existingEntries = existingDirectory.clubsById || {}
  const directoryMatches = Object.keys(existingEntries).length === profiles.length
    && profiles.every(profile => same(
      comparableProfile({ clubId: profile.clubId, ...existingEntries[profile.clubId] }),
      comparableProfile({ clubId: profile.clubId, ...directory.clubsById[profile.clubId] }),
    ))

  if (!profilesMatch || !directoryMatches) {
    throw new Error('Existing club data differs from the bootstrap catalog')
  }
  return 'alreadyApplied'
}

export const buildClubBootstrapExpectedState = ({ catalog = [] } = {}) => {
  if (!Array.isArray(catalog) || !catalog.length) {
    throw new Error('Club bootstrap catalog is empty')
  }

  const profiles = catalog.map(buildProfile)
  const ids = profiles.map(profile => profile.clubId)
  if (new Set(ids).size !== ids.length) throw new Error('Catalog clubId values must be unique')
  const names = profiles.map(profile => profile.names.official)
  if (new Set(names).size !== names.length) {
    throw new Error('Catalog official club names must be unique')
  }

  const directory = {
    clubsById: Object.fromEntries(profiles.map(profile => [
      profile.clubId,
      buildDirectoryEntry(profile),
    ])),
  }
  return Object.freeze({
    kind: 'clubBootstrapApprovedState',
    mode: 'audit',
    profiles,
    directory,
    summary: { clubsCount: profiles.length },
  })
}

export const buildClubBootstrapApprovedState = ({
  catalog = [],
  existingProfiles = [],
  existingDirectory = null,
} = {}) => {
  const expected = buildClubBootstrapExpectedState({ catalog })
  const mode = resolveMode({
    profiles: expected.profiles,
    directory: expected.directory,
    existingProfiles,
    existingDirectory,
  })

  return Object.freeze({
    ...expected,
    mode,
  })
}

export const compareClubBootstrapState = ({ approvedState, profiles, directory }) => {
  try {
    resolveMode({
      profiles: approvedState.profiles,
      directory: approvedState.directory,
      existingProfiles: profiles,
      existingDirectory: directory,
    })
    return []
  } catch (error) {
    return [{
      type: 'club_bootstrap_mismatch',
      target: 'clubProfilesAndDirectory',
      reason: error instanceof Error ? error.message : 'Club bootstrap mismatch',
    }]
  }
}
