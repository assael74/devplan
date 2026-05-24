// src/features/liveTagging/logic/liveTagging.model.js

import { LIVE_ACTIONS } from '../../../shared/liveTagging/index.js'

const getPlayerName = (players, playerId) => {
  const player = players.find((item) => item.id === playerId)
  return player?.name || '-'
}

export const getSelectedAction = (actionId) => {
  if (!actionId) return null
  return LIVE_ACTIONS.find((item) => item.id === actionId) || null
}

export const buildLiveTaggingHeaderModel = ({ clockText, clock }) => ({
  clockText,
  running: Boolean(clock?.running),
  speed: Number(clock?.speed) || 1,
  statusLabel: clock?.running ? 'רץ' : 'מושהה',
  actionLabel: clock?.running ? 'עצור' : 'התחל',
  actionColor: clock?.running ? 'warning' : 'primary',
})

export const buildEventRowModel = ({ event, players }) => {
  const isPlayer = event?.subject?.type === 'player'

  return {
    id: event.id,
    time: `${event.clock?.minute || 0}:${String(event.clock?.second || 0).padStart(2, '0')}`,
    subject: isPlayer
      ? getPlayerName(players, event.subject?.playerId)
      : 'קבוצה',
    action: event.action?.label || '-',
    side: event.action?.side || 'neutral',
    zone: event.field?.zoneNumber ? `אזור ${event.field.zoneNumber}` : '-',
  }
}

export const buildEventsListModel = ({ events = [], players = [] }) => {
  return events.map((event) => buildEventRowModel({ event, players }))
}
