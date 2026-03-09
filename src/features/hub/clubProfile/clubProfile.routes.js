// clubProfile\clubProfile.routes.js
import { getTabFromUrl as getTabGeneric } from '../../hub/sharedProfile/profile.routes'

export const CLUB_TABS = [
  { key: 'management', label: 'ניהול', iconKey: 'info', color: 'club' },
  { key: 'teams', label: 'קבוצות', iconKey: 'teams', color: 'team' },
  { key: 'players', label: 'שחקנים', iconKey: 'players', color: 'player' },
]

export const DEFAULT_TAB = 'management'

export function getTabFromUrl({ tabKeyParam, searchParams }) {
  return getTabGeneric({
    tabs: CLUB_TABS,
    defaultTab: DEFAULT_TAB,
    tabKeyParam,
    searchParams,
  })
}
