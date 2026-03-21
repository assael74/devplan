// C:\projects\devplan\src\features\hub\teamProfile\teamProfile.routes.js
import { getTabFromUrl as getTabGeneric } from '../../hub/sharedProfile/profile.routes'

export const TEAM_TABS = [
  { key: 'management', label: 'ניהול', iconKey: 'info', color: 'team' },
  { key: 'trainings', label: 'אימונים', iconKey: 'training', color: 'training' },
  { key: 'players', label: 'שחקנים', iconKey: 'players', color: 'player' },
  { key: 'games', label: 'משחקים', iconKey: 'games', color: 'team' },
  { key: 'performance', label: 'ביצועים', iconKey: 'performance', color: 'player' },
  { key: 'abilities', label: 'יכולות', iconKey: 'abilities', color: 'player' },
  { key: 'videos', label: 'וידאו', iconKey: 'videos', color: 'videoAnalysis' },
]

export const DEFAULT_TAB = 'management'

export function getTabFromUrl({ tabKeyParam, searchParams }) {
  return getTabGeneric({
    tabs: TEAM_TABS,
    defaultTab: DEFAULT_TAB,
    tabKeyParam,
    searchParams,
  })
}
