// shared/games/insights/player/targets/playerPositionTargets.js

export const PLAYER_POSITION_TARGETS = {
  attack: {
    id: 'attack',
    label: 'התקפה',
    contributionPerGame: {
      greenMin: 0.6,
      redBelow: 0.25,
    },
    goalsPerGame: {
      greenMin: 0.35,
      redBelow: 0.15,
    },
    teamGoalsSharePct: {
      greenMin: 15,
      redBelow: 7,
    },
    defensiveGoalsAgainstPerGame: null,
  },

  atMidfield: {
    id: 'atMidfield',
    label: 'קישור התקפי',
    contributionPerGame: {
      greenMin: 0.45,
      redBelow: 0.18,
    },
    goalsPerGame: {
      greenMin: 0.25,
      redBelow: 0.1,
    },
    assistsPerGame: {
      greenMin: 0.2,
      redBelow: 0.08,
    },
    teamGoalsSharePct: {
      greenMin: 10,
      redBelow: 5,
    },
    defensiveGoalsAgainstPerGame: null,
  },

  midfield: {
    id: 'midfield',
    label: 'קישור',
    contributionPerGame: {
      greenMin: 0.25,
      redBelow: null,
    },
    goalsPerGame: {
      greenMin: 0.12,
      redBelow: null,
    },
    assistsPerGame: {
      greenMin: 0.12,
      redBelow: null,
    },
    teamGoalsSharePct: {
      greenMin: 6,
      redBelow: null,
    },
    defensiveGoalsAgainstPerGame: null,
  },

  dmMid: {
    id: 'dmMid',
    label: 'קישור אחורי / מגן',
    contributionPerGame: {
      greenMin: 0.18,
      redBelow: null,
    },
    assistsPerGame: {
      greenMin: 0.1,
      redBelow: null,
    },
    teamGoalsSharePct: {
      greenMin: 4,
      redBelow: null,
    },
    defensiveGoalsAgainstPerGame: {
      compareToTeamTarget: true,
    },
  },

  defense: {
    id: 'defense',
    label: 'הגנה',
    contributionPerGame: {
      greenMin: 0.12,
      redBelow: null,
    },
    goalsPerGame: {
      greenMin: 0.08,
      redBelow: null,
    },
    defensiveGoalsAgainstPerGame: {
      compareToTeamTarget: true,
    },
  },

  goalkeeper: {
    id: 'goalkeeper',
    label: 'שוער',
    contributionPerGame: null,
    goalsPerGame: null,
    assistsPerGame: null,
    teamGoalsSharePct: null,
    defensiveGoalsAgainstPerGame: {
      compareToTeamTarget: true,
    },
    cleanSheetPct: {
      greenMin: 35,
      redBelow: 15,
    },
  },
}

export function getPlayerPositionTarget(layerKey) {
  return PLAYER_POSITION_TARGETS[layerKey] || null
}

export function getPlayerPositionTargetLabel(layerKey) {
  return getPlayerPositionTarget(layerKey)?.label || 'לא הוגדרה עמדה'
}
