// features/playersDatabase/ui/pages/playerPage/logic/playerPage.constants.js

export const PLAYER_HISTORY_FILTERS = {
  ALL: 'all',
  CURRENT: 'current',
  PREVIOUS: 'previous',
}

export const PLAYER_HISTORY_FILTER_OPTIONS = [
  {
    id: PLAYER_HISTORY_FILTERS.ALL,
    label: 'כל העונות',
  },
  {
    id: PLAYER_HISTORY_FILTERS.CURRENT,
    label: 'עונה נוכחית',
  },
  {
    id: PLAYER_HISTORY_FILTERS.PREVIOUS,
    label: 'עונות קודמות',
  },
]

export const PLAYER_HISTORY_PLACEHOLDER_ROWS = [
  {
    id: 'placeholder-current',
    seasonKey: '25/26',
    isCurrentSeason: true,
    clubName: 'מועדון נוכחי',
    teamName: 'קבוצת שנתון',
    leagueName: 'ליגה נוכחית',
    games: 0,
    starts: 0,
    minutes: 0,
    goals: 0,
    yellowCards: 0,
    scoutProfiles: [],
    placeholder: true,
  },
  {
    id: 'placeholder-history',
    seasonKey: '24/25',
    isCurrentSeason: false,
    clubName: 'מועדון קודם',
    teamName: 'קבוצה קודמת',
    leagueName: 'ליגה קודמת',
    games: 0,
    starts: 0,
    minutes: 0,
    goals: 0,
    yellowCards: 0,
    scoutProfiles: [],
    placeholder: true,
  },
]
