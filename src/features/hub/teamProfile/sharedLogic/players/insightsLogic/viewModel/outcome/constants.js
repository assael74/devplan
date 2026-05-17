// TEAMPROFILE/sharedLogic/players/insightsLogic/viewModel/outcome/constants.js

export const OUTCOME_THRESHOLDS = {
  weakRatingBelow: 5.95,
  weakTvaBelow: -0.25,
  topRatingFrom: 6.25,
  topTvaFrom: 0.75,

  highWeakRatePct: 35,
  highDamageScore: 1.5,

  minCheckedPlayers: 1,
  minGroupMinutes: 90,
}

export const OUTCOME_ASPECTS = {
  role: {
    id: 'role',
    title: 'תפקוד לפי מעמד',
    icon: 'keyPlayer',
  },

  position: {
    id: 'position',
    title: 'תפקוד לפי עמדה',
    icon: 'positions',
  },
}

export const OUTCOME_EMPTY_STATUS = {
  id: 'empty',
  label: 'אין מדגם',
  color: 'neutral',
}

export const OUTCOME_READY_STATUS = {
  id: 'ready',
  label: 'מחושב',
  color: 'success',
}
