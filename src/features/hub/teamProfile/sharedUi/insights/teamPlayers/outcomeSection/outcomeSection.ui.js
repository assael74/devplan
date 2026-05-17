// TEAMPROFILE/sharedUi/insights/teamPlayers/outcomeSection/outcomeSection.ui.js

const emptyArray = []

const baseMetrics = [
  {
    id: 'usage',
    label: 'שימוש',
    value: '-',
    sub: 'דקות ופתיחות',
  },
  {
    id: 'production',
    label: 'תפוקה',
    value: '-',
    sub: 'שערים, בישולים ומעורבות',
  },
  {
    id: 'impact',
    label: 'השפעה',
    value: '-',
    sub: 'מדד יעילות ו־TVA',
  },
]

const roleGroups = [
  {
    id: 'key',
    label: 'שחקני מפתח',
    icon: 'keyPlayer',
    value: '-',
    tone: 'neutral',
    sub: 'ציון קבוצתי למקבץ שחקני המפתח',
  },
  {
    id: 'core',
    label: 'שחקנים מרכזיים',
    icon: 'corePlayer',
    value: '-',
    tone: 'neutral',
    sub: 'ציון קבוצתי למקבץ השחקנים המרכזיים',
  },
  {
    id: 'rotation',
    label: 'רוטציה',
    icon: 'rotation',
    value: '-',
    tone: 'neutral',
    sub: 'ציון קבוצתי למקבץ שחקני הרוטציה',
  },
  {
    id: 'fringe',
    label: 'אחרון בסגל',
    icon: 'fringe',
    value: '-',
    tone: 'neutral',
    sub: 'ציון קבוצתי למקבץ קצה הסגל',
  },
]

const positionGroups = [
  {
    id: 'attack',
    label: 'התקפה',
    icon: 'attack',
    value: '-',
    tone: 'neutral',
    sub: 'ציון קבוצתי לשחקני ההתקפה',
  },
  {
    id: 'midfield',
    label: 'קישור',
    icon: 'midfield',
    value: '-',
    tone: 'neutral',
    sub: 'ציון קבוצתי לשחקני הקישור',
  },
  {
    id: 'defense',
    label: 'הגנה',
    icon: 'defense',
    value: '-',
    tone: 'neutral',
    sub: 'ציון קבוצתי לשחקני ההגנה',
  },
  {
    id: 'goalkeeper',
    label: 'שוער',
    icon: 'goalkeeper',
    value: '-',
    tone: 'neutral',
    sub: 'ציון קבוצתי לעמדת השוער',
  },
]

const withDefaults = group => {
  return {
    metrics: baseMetrics,
    players: emptyArray,
    details: [
      {
        id: 'basis',
        label: 'בסיס החישוב',
        text: 'בהמשך יחושב ציון אחד למקבץ השחקנים לפי דקות, תפוקה, מדד יעילות ו־TVA.',
      },
      {
        id: 'drilldown',
        label: 'דרילדאון',
        text: 'לחיצה על קבוצה תציג את השחקנים שמרכיבים את הציון ואת התרומה האישית שלהם.',
      },
    ],
    ...group,
  }
}

const buildBlock = block => {
  return {
    ...block,
    groups: (block.groups || emptyArray).map(withDefaults),
  }
}

export const buildOutcomeUiModel = model => {
  if (model?.role?.groups || model?.position?.groups) {
    return {
      role: buildBlock(model.role || {}),
      position: buildBlock(model.position || {}),
    }
  }

  return {
    role: buildBlock({
      id: 'role',
      title: 'תפקוד לפי מעמד',
      icon: 'keyPlayer',
      status: {
        label: 'בבנייה',
        color: 'neutral',
      },
      groups: roleGroups,
    }),

    position: buildBlock({
      id: 'position',
      title: 'תפקוד לפי עמדה',
      icon: 'positions',
      status: {
        label: 'בבנייה',
        color: 'neutral',
      },
      groups: positionGroups,
    }),
  }
}
