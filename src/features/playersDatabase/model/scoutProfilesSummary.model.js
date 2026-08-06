// features/playersDatabase/model/scoutProfilesSummary.model.js

const clean = value => String(value || '').trim()

const resolvePlayerProfiles = player => {
  if (Array.isArray(player?.scoutProfiles)) return player.scoutProfiles
  if (Array.isArray(player?.scoutSignals)) return player.scoutSignals
  return []
}

export const buildScoutProfilesSummary = (players = []) => {
  const profileCounts = {}
  let total = 0

  ;(Array.isArray(players) ? players : []).forEach(player => {
    const profiles = resolvePlayerProfiles(player)
    if (!profiles.length) return

    total += 1
    profiles.forEach(profile => {
      const profileId = clean(profile?.profileId)
      if (!profileId) return

      profileCounts[profileId] = (profileCounts[profileId] || 0) + 1
    })
  })

  return {
    total,
    profileCounts,
  }
}
