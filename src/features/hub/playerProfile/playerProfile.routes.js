// src/features/players/playerProfile/playerProfile.routes.js
import { getTabFromUrl as getTabGeneric } from '../../hub/sharedProfile/profile.routes'

export const PLAYER_PROJECT_TABS = [
  { key: 'info', label: 'מידע', iconKey: 'info', color: 'player' },
  { key: 'abilities', label: 'יכולות', iconKey: 'abilities', color: 'player' },
  { key: 'games', label: 'משחקים', iconKey: 'games', color: 'team' },
  { key: 'performance', label: 'ביצועים', iconKey: 'performance', color: 'team' },
  { key: 'meetings', label: 'מפגשים', iconKey: 'meetings', color: 'training' },
  { key: 'trainings', label: 'אימונים', iconKey: 'training', color: 'training' },
  { key: 'videoAnalysis', label: 'ניתוחי וידאו', iconKey: 'videos', color: 'videoAnalysis' },
  { key: 'payments', label: 'תשלומים', iconKey: 'payments', color: 'project' },
]

export const PLAYER_TABS = [
  { key: 'info', label: 'מידע', iconKey: 'info', color: 'player' },
  { key: 'abilities', label: 'יכולות', iconKey: 'abilities', color: 'player' },
  { key: 'games', label: 'משחקים', iconKey: 'games', color: 'team' },
  { key: 'performance', label: 'ביצועים', iconKey: 'performance', color: 'team' },
  { key: 'videoAnalysis', label: 'ניתוחי וידאו', iconKey: 'videos', color: 'videoAnalysis' },
]

export const DEFAULT_TAB = 'info'

export function getTabFromUrl({ tabKeyParam, searchParams, isProject }) {
  return getTabGeneric({
    tabs: isProject ? PLAYER_PROJECT_TABS : PLAYER_TABS,
    defaultTab: DEFAULT_TAB,
    tabKeyParam,
    searchParams,
  })
}
