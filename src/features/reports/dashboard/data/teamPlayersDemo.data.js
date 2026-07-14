// src/features/reports/dashboard/data/teamPlayersDemo.data.js

import {
  SEASON_PLAN_STATUS,
} from '../../../../shared/players/players.constants.js'

const DEMO_PLAYERS = [
  {
    id: 'demo-player-1',
    playerFullName: 'נועם כהן',
    birthLabel: '2008',
    age: 18,
    photo: '',
    positions: ['GK'],
    primaryPosition: 'GK',
    generalPositionKey: 'goalkeeper',
  },
  {
    id: 'demo-player-2',
    playerFullName: 'עידו לוי',
    birthLabel: '2007',
    age: 19,
    photo: '',
    positions: ['DCR', 'DCL'],
    primaryPosition: 'DCR',
    generalPositionKey: 'defense',
  },
  {
    id: 'demo-player-3',
    playerFullName: 'תומר אזולאי',
    birthLabel: '2007',
    age: 19,
    photo: '',
    positions: ['DM', 'MCR'],
    primaryPosition: 'DM',
    generalPositionKey: 'dmMid',
  },
  {
    id: 'demo-player-4',
    playerFullName: 'אורי מזרחי',
    birthLabel: '2008',
    age: 18,
    photo: '',
    positions: ['S'],
    primaryPosition: 'S',
    generalPositionKey: 'attack',
  },
]

export const TEAM_PLAYERS_DEMO_TEAM = {
  id: 'demo-team',
  teamDisplayName: 'קבוצת הדגמה',
  teamName: 'קבוצת הדגמה',
  name: 'קבוצת הדגמה',
  clubName: 'DevPlan FC',
  coachName: 'מאמן הדגמה',
  teamYear: '2008',
  seasonLabel: '2026/2027',
  photo: '',
}

export function buildSeasonPlanDemoRows() {
  return DEMO_PLAYERS.map((player, index) => {
    const data = [
      {
        seasonPlanStatus: SEASON_PLAN_STATUS.IN_SQUAD,
        squadRole: 'key',
        level: 5,
        projectStatus: 'base',
      },
      {
        seasonPlanStatus: SEASON_PLAN_STATUS.WANTS_TO_LEAVE,
        squadRole: 'core',
        level: 4,
        projectStatus: 'candidate',
      },
      {
        seasonPlanStatus: SEASON_PLAN_STATUS.UNDER_REVIEW,
        squadRole: 'rotation',
        level: 3,
        projectStatus: 'base',
      },
      {
        seasonPlanStatus: SEASON_PLAN_STATUS.NOT_SUITABLE,
        squadRole: 'fringe',
        level: 2,
        projectStatus: 'candidate',
      },
    ]

    const item = data[index]

    return {
      ...player,
      ...item,
      projectChipMeta: {
        labelH: item.projectStatus === 'candidate' ? 'מועמד' : 'בסיס',
        idIcon: item.projectStatus === 'candidate' ? 'candidate' : 'noneType',
        tone: item.projectStatus === 'candidate' ? 'warning' : 'neutral',
      },
    }
  })
}

export function buildMinutesPlanDemoRows() {
  const roles = ['key', 'core', 'rotation', 'fringe']

  return DEMO_PLAYERS.map((player, index) => ({
    ...player,
    squadRole: roles[index],
  }))
}

export function buildPerformanceDemoRows() {
  return DEMO_PLAYERS.map((player, index) => {
    const performanceItems = [
      {
        profileId: 'anchor',
        profileLabel: 'עוגן',
        ratingLabel: '8.4',
        tvaLabel: '+1.2',
        goals: 0,
        assists: 1,
        minutesPctLabel: '92%',
      },
      {
        profileId: 'progressor',
        profileLabel: 'מתקדם',
        ratingLabel: '7.8',
        tvaLabel: '+0.8',
        goals: 2,
        assists: 1,
        minutesPctLabel: '84%',
      },
      {
        profileId: 'builder',
        profileLabel: 'בונה',
        ratingLabel: '7.2',
        tvaLabel: '+0.4',
        goals: 3,
        assists: 5,
        minutesPctLabel: '76%',
      },
      {
        profileId: 'anchor',
        profileLabel: 'עוגן',
        ratingLabel: '8.1',
        tvaLabel: '+1.0',
        goals: 14,
        assists: 4,
        minutesPctLabel: '89%',
      },
    ]

    const item = performanceItems[index]
    const defensive = ['goalkeeper', 'defense', 'dmMid'].includes(player.generalPositionKey)

    return {
      ...player,
      targets: {
        mainItems: defensive
          ? [
              {
                id: 'goalsAgainst',
                value: 26,
                icon: 'defense',
                metricKey: 'defense',
              },
            ]
          : [
              {
                id: 'goals',
                value: 12,
                icon: 'goal',
                metricKey: 'goals',
              },
              {
                id: 'assists',
                value: 8,
                icon: 'assists',
                metricKey: 'assists',
              },
            ],
      },
      performance: {
        profileId: item.profileId,
        profile: {
          id: item.profileId,
          shortLabel: item.profileLabel,
          label: item.profileLabel,
          icon: 'insights',
          tone: index === 0 || index === 3 ? 'success' : 'primary',
        },
        ratingLabel: item.ratingLabel,
        tvaLabel: item.tvaLabel,
        impactLabel: item.tvaLabel,
        impactColor: index === 0 || index === 3 ? 'success' : 'primary',
        goals: item.goals,
        assists: item.assists,
        minutesPctLabel: item.minutesPctLabel,
      },
    }
  })
}
