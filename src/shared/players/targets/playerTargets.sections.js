// src/shared/players/targets/playerTargets.sections.js

const DEFENSIVE_LAYERS = ['dmMid', 'defense', 'goalkeeper']

export const isDefensivePlayerTargetLayer = (layerKey) => {
  return DEFENSIVE_LAYERS.includes(layerKey)
}

export const getPlayerTargetsSectionOrder = ({
  positionLayer,
} = {}) => {
  if (isDefensivePlayerTargetLayer(positionLayer)) {
    return [
      'teamImpact',
      'defense',
      'usage',
      'attack',
      'position',
    ]
  }

  return [
    'attack',
    'teamImpact',
    'usage',
    'position',
    'defense',
  ]
}

export const PLAYER_TARGET_SECTION_META = {
  teamImpact: {
    id: 'teamImpact',
    title: 'ביצוע קבוצתי',
    subtitle: 'היעדים האישיים מחוברים ליעד הקבוצה ולתפקוד הקבוצתי',
    icon: 'team',
  },

  attack: {
    id: 'attack',
    title: 'תפוקה אישית',
    subtitle: 'שערים, בישולים ומעורבות בשערים לפי עמדה ומעמד',
    icon: 'goal',
  },

  defense: {
    id: 'defense',
    title: 'יעדי הגנה',
    subtitle: 'ספיגה, אחריות הגנתית והשפעה על שערי חובה',
    icon: 'defense',
  },

  usage: {
    id: 'usage',
    title: 'שימוש בסגל',
    subtitle: 'דקות ופתיחות לפי מעמד השחקן בסגל',
    icon: 'minutes',
  },

  position: {
    id: 'position',
    title: 'יעדי עמדה',
    subtitle: 'רף בסיס לפי שכבת העמדה המקצועית',
    icon: 'position',
  },
}
