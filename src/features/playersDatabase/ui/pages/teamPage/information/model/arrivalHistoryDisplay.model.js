// src/features/playersDatabase/ui/pages/teamPage/information/model/arrivalHistoryDisplay.model.js

export const buildArrivalHistoryDisplay = ({ history, playerId }) => {
  if (!history) return null

  const profileId = history.scoutStatus === 'available' ? history.primaryProfileId : ''
  const profileIds = [...new Set([
    profileId,
    ...(history.professionalProfileIds || []),
    ...(history.preliminaryProfileIds || []),
  ].filter(Boolean))]

  return {
    player: {
      playerId,
      scoutProfiles: profileIds.map(id => ({
        profileId: id,
        depthPct: (history.profileDepthsById || {})[id] !== undefined
          ? history.profileDepthsById[id]
          : id === profileId ? history.primaryProfileDepthPct : null,
      })),
      profile: profileId,
    },
    classification: history.lineStatus === 'available' ? { line: history.line } : null,
    primaryPosition: '',
    positionLayer: '',
    isGoalkeeper: false,
  }
}
