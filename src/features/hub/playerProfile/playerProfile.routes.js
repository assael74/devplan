// src/features/players/playerProfile/playerProfile.routes.js
import { getTabFromUrl as getTabGeneric } from '../../hub/sharedProfile/profile.routes'

const LABELS = {
  info: '\u05de\u05d9\u05d3\u05e2',
  abilities: '\u05d9\u05db\u05d5\u05dc\u05d5\u05ea',
  games: '\u05de\u05e9\u05d7\u05e7\u05d9\u05dd',
  performance: '\u05d1\u05d9\u05e6\u05d5\u05e2\u05d9\u05dd',
  videos: '\u05e0\u05d9\u05ea\u05d5\u05d7\u05d9 \u05d5\u05d9\u05d3\u05d0\u05d5',
  meetings: '\u05de\u05e4\u05d2\u05e9\u05d9\u05dd',
  trainings: '\u05d0\u05d9\u05de\u05d5\u05e0\u05d9\u05dd',
  payments: '\u05ea\u05e9\u05dc\u05d5\u05de\u05d9\u05dd',
  activity: '\u05e2\u05d3\u05db\u05d5\u05e0\u05d9\u05dd \u05d5\u05de\u05e2\u05e7\u05d1',
}

export const PLAYER_PROJECT_TABS = [
  { key: 'info', label: LABELS.info, iconKey: 'info', color: 'player' },
  { key: 'abilities', label: LABELS.abilities, iconKey: 'abilities', color: 'player' },
  { key: 'games', label: LABELS.games, iconKey: 'games', color: 'team' },
  { key: 'performance', label: LABELS.performance, iconKey: 'performance', color: 'team' },
  { key: 'videoAnalysis', label: LABELS.videos, iconKey: 'videos', color: 'videoAnalysis' },
  { key: 'meetings', label: LABELS.meetings, iconKey: 'meetings', color: 'training' },
  { key: 'trainings', label: LABELS.trainings, iconKey: 'training', color: 'training' },
  { key: 'payments', label: LABELS.payments, iconKey: 'payments', color: 'project' },
]

export const PRIVATE_PLAYER_TABS = [
  { key: 'info', label: LABELS.info, iconKey: 'info', color: 'player' },
  { key: 'abilities', label: LABELS.abilities, iconKey: 'abilities', color: 'player' },
  { key: 'games', label: LABELS.games, iconKey: 'games', color: 'team' },
  { key: 'performance', label: LABELS.performance, iconKey: 'performance', color: 'team' },
  { key: 'videoAnalysis', label: LABELS.videos, iconKey: 'videos', color: 'videoAnalysis' },
  { key: 'meetings', label: LABELS.meetings, iconKey: 'meetings', color: 'training' },
  { key: 'payments', label: LABELS.payments, iconKey: 'payments', color: 'project' },
  { key: 'activity', label: LABELS.activity, iconKey: 'tasks', color: 'task' },
]

export const PLAYER_TABS = [
  { key: 'info', label: LABELS.info, iconKey: 'info', color: 'player' },
  { key: 'abilities', label: LABELS.abilities, iconKey: 'abilities', color: 'player' },
  { key: 'games', label: LABELS.games, iconKey: 'games', color: 'team' },
  { key: 'performance', label: LABELS.performance, iconKey: 'performance', color: 'team' },
  { key: 'videoAnalysis', label: LABELS.videos, iconKey: 'videos', color: 'videoAnalysis' },
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
