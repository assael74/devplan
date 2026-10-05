// src/features/playersDatabase/catalog/seasons.catalog.js
//
// The catalog defines the seasons the UI may create and filter. Firestore
// documents remain the source of truth for seasons that actually exist.

const buildSeason = (seasonId, seasonKey, target) => ({
  id: seasonKey,
  seasonId,
  seasonKey,
  label: seasonKey,
  target,
  order: Number(String(seasonKey).slice(0, 2)) || 0,
})

export const PLAYERS_DATABASE_SEASONS_CATALOG = Object.freeze([
  buildSeason('2026_2027', '26/27', 'current'),
  buildSeason('2025_2026', '25/26', 'history'),
  buildSeason('2024_2025', '24/25', 'history'),
  buildSeason('2023_2024', '23/24', 'history'),
  buildSeason('2022_2023', '22/23', 'history'),
])

export const PLAYERS_DATABASE_CURRENT_SEASON_KEY =
  PLAYERS_DATABASE_SEASONS_CATALOG.find(season => season.target === 'current')
    ?.seasonKey || ''

export const getSeasonCatalogEntry = seasonKey => {
  const key = String(seasonKey || '').trim()

  return PLAYERS_DATABASE_SEASONS_CATALOG.find(season => (
    season.seasonKey === key || season.seasonId === key || season.id === key
  )) || null
}

export const getSeasonCatalogTarget = (seasonKey, fallback = 'history') => (
  getSeasonCatalogEntry(seasonKey)?.target || fallback
)

export const getSeasonCatalogOptions = () => (
  [...PLAYERS_DATABASE_SEASONS_CATALOG]
)
