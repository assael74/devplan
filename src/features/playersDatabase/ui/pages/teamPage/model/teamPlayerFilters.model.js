// src/features/playersDatabase/ui/pages/teamPage/model/teamPlayerFilters.model.js

const cleanKey = value => String(value || '').trim()

export const resolveScoutProfileId = profile => cleanKey(
  profile?.profileId ||
  profile?.id
)

const resolveScoutProfileLabel = profile => cleanKey(
  profile?.profileLabel ||
  profile?.label ||
  profile?.name ||
  resolveScoutProfileId(profile)
) || 'פרופיל סקאוט'

export const buildTeamProfileFilterOptions = players => {
  const profileMap = new Map()
  let playersWithProfilesCount = 0

  players.forEach(player => {
    const profiles = Array.isArray(player.scoutProfiles)
      ? player.scoutProfiles
      : []

    if (profiles.length) playersWithProfilesCount += 1

    profiles.forEach(profile => {
      const id = resolveScoutProfileId(profile)
      if (!id) return

      const current = profileMap.get(id) || {
        value: id,
        label: resolveScoutProfileLabel(profile),
        count: 0,
      }

      profileMap.set(id, {
        ...current,
        count: current.count + 1,
      })
    })
  })

  return [
    {
      value: 'all',
      label: 'כל הפרופילים',
      count: playersWithProfilesCount,
    },
    ...Array.from(profileMap.values()).sort((left, right) => (
      right.count - left.count ||
      left.label.localeCompare(right.label, 'he')
    )),
  ]
}

export const filterTeamPlayersByProfile = ({
  players,
  profileFilterKey,
  profileOnly,
}) => players.filter(player => {
  const profiles = Array.isArray(player.scoutProfiles)
    ? player.scoutProfiles
    : []

  if (profileFilterKey !== 'all') {
    return profiles.some(profile => (
      resolveScoutProfileId(profile) === profileFilterKey
    ))
  }

  if (profileOnly) return profiles.length > 0

  return true
})
