// src/shared/players/targets/playerRoleTargets.js

export const PLAYER_ROLE_TARGETS = {
  key: {
    id: 'key',
    label: 'שחקן מפתח',
    minutesRange: [70, 100],
    startsRange: [65, 100],
    trustDifficulty: {
      easy: 'expected',
      equal: 'expected',
      hard: 'expected',
    },
  },

  core: {
    id: 'core',
    label: 'שחקן מרכזי',
    minutesRange: [50, 70],
    startsRange: [40, 75],
    trustDifficulty: {
      easy: 'expected',
      equal: 'expected',
      hard: 'partial',
    },
  },

  rotation: {
    id: 'rotation',
    label: 'רוטציה',
    minutesRange: [25, 50],
    startsRange: [10, 45],
    trustDifficulty: {
      easy: 'expected',
      equal: 'partial',
      hard: 'bonus',
    },
  },

  fringe: {
    id: 'fringe',
    label: 'אחרון בסגל',
    minutesRange: [0, 25],
    startsRange: [0, 20],
    trustDifficulty: {
      easy: 'partial',
      equal: 'bonus',
      hard: 'bonus',
    },
  },
}

export function getPlayerRoleTarget(roleId) {
  return PLAYER_ROLE_TARGETS[roleId] || null
}

export function getPlayerRoleTargetLabel(roleId) {
  return getPlayerRoleTarget(roleId)?.label || 'לא הוגדר יעד מעמד'
}
