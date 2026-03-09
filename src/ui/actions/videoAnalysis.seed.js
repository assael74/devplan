// ui/actions/videoAnalysis.seed.js

export function buildVideoAnalysisSeed(baseSeed = {}, entityType) {
  if (!baseSeed) return {}
  // ===== Player context =====
  if (entityType === 'player' && baseSeed.playerId) {
    return {
      ...baseSeed,
      contextType: 'entity',
      objectType: 'player',

      __locks: {
        lockContextType: true,
        lockObjectType: true,
        lockPlayerId: true,
        expected: {
          contextType: 'entity',
          objectType: 'player',
          playerId: baseSeed.playerId,
        },
      },
    }
  }

  // ===== Team context =====
  if (entityType === 'team' && baseSeed.teamId) {
    return {
      ...baseSeed,
      contextType: 'entity',
      objectType: 'team',

      __locks: {
        lockContextType: true,
        lockObjectType: true,
        lockTeamId: true,
        expected: {
          contextType: 'entity',
          objectType: 'team',
          teamId: baseSeed.teamId,
        },
      },
    }
  }

  // ===== Default (hubVideo / floating) =====
  return baseSeed
}
