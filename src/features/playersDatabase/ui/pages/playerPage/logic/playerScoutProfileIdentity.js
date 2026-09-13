import { SCOUT_PROFILES } from '../../../../../../shared/scouting/players/profiles.js'
import { clean } from './playerScoutView.utils.js'

export const resolveProfileId = profile => clean(
  profile?.profileId ||
  profile?.id ||
  ''
)

const resolveProfileDefinition = profile => {
  const profileId = resolveProfileId(profile)

  return SCOUT_PROFILES.find(item => item.id === profileId) || null
}

export const resolveProfileLabel = profile => {
  const profileDefinition = resolveProfileDefinition(profile)

  return clean(
    profile?.label ||
    profile?.profileLabel ||
    profileDefinition?.label ||
    resolveProfileId(profile)
  )
}

const resolveProfileIdentity = profile => {
  const profileDefinition = resolveProfileDefinition(profile)

  return clean(
    profile?.profileIdentity ||
    profile?.identity ||
    profileDefinition?.profileIdentity
  ).toLowerCase()
}

export const isCoreProfile = profile => resolveProfileIdentity(profile) === 'core'

