// src/features/home/home.selectors.js

export function buildHomeSnapshot({
  players = [],
  scouting = [],
  videos = [],
  teams = [],
  notes = [],
} = {}) {
  return [
    {
      key: 'players',
      iconId: 'players',
      value: players.length,
      label: 'שחקנים',
    },
    {
      key: 'scouting',
      iconId: 'scouting',
      value: scouting.length,
      label: 'שחקנים במעקב',
    },
    {
      key: 'videos',
      iconId: 'video',
      value: videos.length,
      label: 'סרטונים במאגר',
    },
    {
      key: 'teams',
      iconId: 'teams',
      value: teams.length,
      label: 'קבוצות פעילות',
    },
    {
      key: 'notes',
      iconId: 'stats',
      value: notes.length,
      label: 'תובנות',
    },
  ]
}

// מחזיר עד 5 פריטים אחרונים “שקטים” לכל ישות
export function buildEntityItems(entityKey, data = {}) {
  const { players = [], videos = [], teams = [], notes = [], scouting = [] } = data

  const pick = (arr) => (Array.isArray(arr) ? arr : [])
  const takeRecent = (arr, n = 5) => pick(arr).slice(0, n)

  const mapRow = (x) => ({
    id: x?.id || x?._id || x?.uid || String(Math.random()),
    title: x?.name || x?.title || x?.displayName || 'ללא שם',
    subtitle: x?.updatedAtLabel || x?.lastUpdatedLabel || x?.meta || '',
    rightMeta: x?.tag || x?.statusLabel || '',
  })

  if (entityKey === 'players') return takeRecent(players).map(mapRow)
  if (entityKey === 'scouting') return takeRecent(scouting).map(mapRow)
  if (entityKey === 'videos') return takeRecent(videos).map(mapRow)
  if (entityKey === 'teams') return takeRecent(teams).map(mapRow)
  if (entityKey === 'notes') return takeRecent(notes).map(mapRow)
  return []
}
