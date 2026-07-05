// features/playersDatabase/components/summary/logic/summarySeason.logic.js

const hasValue = value => value !== undefined && value !== null

export const getSummaryDisplayValue = (value, fallbackValue = '-') => (
  hasValue(value) ? value : fallbackValue
)

export const getSummarySeasonStatus = season => {
  const snapshotsCount = Number(season.snapshotsCount) || 0
  const loadedClubsCount = Number(season.loadedClubsCount) || 0
  const clubsCount = Number(season.clubsCount) || 0

  if (snapshotsCount > 0) {
    return { label: 'פעילה', color: 'success' }
  }

  if (loadedClubsCount > 0 || clubsCount > 0) {
    return { label: 'טיוטה', color: 'warning' }
  }

  return { label: 'אין צילום', color: 'neutral' }
}
