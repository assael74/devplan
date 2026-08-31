// features/playersDatabase/model/scoutProfilesSummary.model.js

const clean = value => String(value || '').trim()

const hasOwn = (source, key) => (
  Boolean(source) &&
  Object.prototype.hasOwnProperty.call(source, key)
)

const uniqueCleanValues = values => [
  ...new Set(
    (Array.isArray(values) ? values : [])
      .map(clean)
      .filter(Boolean)
  ),
]

const resolvePlayerProfiles = player => {
  if (Array.isArray(player?.scoutProfiles)) return player.scoutProfiles
  if (Array.isArray(player?.scoutSignals)) return player.scoutSignals
  return []
}

const resolveProfileId = profile => clean(
  typeof profile === 'string'
    ? profile
    : profile?.profileId || profile?.id
)

const resolveProfileIdentity = profile => clean(
  typeof profile === 'object'
    ? profile?.profileIdentity || profile?.identity
    : ''
)

const resolveActiveProfessionalProfileIds = player => {
  // Team players own this compact projection. Its explicit empty state must
  // not revive stale rich Team fields from older documents.
  if (hasOwn(player, 'professionalScoutProfileIds')) {
    return uniqueCleanValues(player.professionalScoutProfileIds)
  }

  const projectedPrimaryProfileId = clean(player?.primaryScoutProfileId)
  if (hasOwn(player, 'primaryScoutProfileId')) {
    return projectedPrimaryProfileId ? [projectedPrimaryProfileId] : []
  }

  const hierarchy = player?.scoutProfileHierarchy &&
    typeof player.scoutProfileHierarchy === 'object'
    ? player.scoutProfileHierarchy
    : null

  if (hierarchy) {
    return uniqueCleanValues(hierarchy.professionalProfileIds)
  }

  const preliminaryProfileIds = new Set(
    uniqueCleanValues(player?.scoutPreliminaryProfileIds)
  )

  return uniqueCleanValues(
    resolvePlayerProfiles(player)
      .filter(profile => (
        resolveProfileIdentity(profile) === 'core'
      ))
      .map(resolveProfileId)
      .filter(profileId => !preliminaryProfileIds.has(profileId))
  )
}

export const buildScoutProfilesSummary = (players = []) => {
  const profileCounts = {}
  let total = 0

  ;(Array.isArray(players) ? players : []).forEach(player => {
    const profileIds = resolveActiveProfessionalProfileIds(player)
    if (!profileIds.length) return

    total += 1
    profileIds.forEach(profileId => {
      profileCounts[profileId] = (profileCounts[profileId] || 0) + 1
    })
  })

  return {
    total,
    profileCounts,
  }
}
