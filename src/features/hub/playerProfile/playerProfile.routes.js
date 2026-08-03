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

export const PRIVATE_PLAYER_TABS = [
  { key: 'info', label: 'מידע', iconKey: 'info', color: 'player' },
  { key: 'abilities', label: 'יכולות', iconKey: 'abilities', color: 'player' },
  { key: 'games', label: 'משחקים', iconKey: 'games', color: 'team' },
  { key: 'performance', label: 'ביצועים', iconKey: 'performance', color: 'team' },
  { key: 'meetings', label: 'מפגשים', iconKey: 'meetings', color: 'training' },
  { key: 'videoAnalysis', label: 'ניתוחי וידאו', iconKey: 'videos', color: 'videoAnalysis' },
  { key: 'payments', label: 'תשלומים', iconKey: 'payments', color: 'project' },
  { key: 'activity', label: 'עדכונים ומעקב', iconKey: 'tasks', color: 'task' },
]

export const PLAYER_TABS = [
  { key: 'info', label: 'מידע', iconKey: 'info', color: 'player' },
  { key: 'abilities', label: 'יכולות', iconKey: 'abilities', color: 'player' },
  { key: 'games', label: 'משחקים', iconKey: 'games', color: 'team' },
  { key: 'performance', label: 'ביצועים', iconKey: 'performance', color: 'team' },
  { key: 'videoAnalysis', label: 'ניתוחי וידאו', iconKey: 'videos', color: 'videoAnalysis' },
]

export const DEFAULT_TAB = 'info'

export function getTabFromUrl({ tabKeyParam, searchParams, isProject, isPrivatePlayer }) {
  const tabs = isProject
    ? PLAYER_PROJECT_TABS
    : isPrivatePlayer
      ? PRIVATE_PLAYER_TABS
      : PLAYER_TABS

  return getTabGeneric({
    tabs,
    defaultTab: DEFAULT_TAB,
    tabKeyParam,
    searchParams,
  })
}
