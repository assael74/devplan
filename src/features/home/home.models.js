// src/features/home/home.models.js

export const HOME_ENTITIES = {
  PLAYERS: 'players',
  VIDEOS: 'videos',
  TEAMS: 'teams',
  SCOUTING: 'scouting',
  NOTES: 'notes',
}

// סדר תצוגה – לפי מה שהגדרת
export const HOME_SECTIONS = [
  {
    key: HOME_ENTITIES.TEAMS,
    title: 'קבוצות',
    iconId: 'teams',
  },
  {
    key: HOME_ENTITIES.PLAYERS,
    title: 'שחקנים',
    iconId: 'players',
  },
  {
    key: HOME_ENTITIES.SCOUTING,
    title: 'שחקנים במעקב',
    iconId: 'scouting',
  },
  {
    key: HOME_ENTITIES.VIDEOS,
    title: 'וידאו',
    iconId: 'video',
  },
  // אופציונלי להשאיר בסוף
  {
    key: HOME_ENTITIES.NOTES,
    title: 'תובנות',
    iconId: 'stats',
  },
]
