// src/shared/liveTagging/events/liveEvent.builder.js

import { LIVE_ACTIONS_BY_ID } from '../actions/index.js'
import { buildEventFieldFromZone } from '../pitch/index.js'

const getNow = () => Date.now()

const buildEventSubject = ({ subjectType, playerId, teamId }) => ({
  type: subjectType || 'team',
  playerId: subjectType === 'player' ? playerId || null : null,
  teamId: teamId || null,
})

const buildEventAction = (actionId) => {
  const action = LIVE_ACTIONS_BY_ID[actionId]

  if (!action) {
    return {
      id: actionId || null,
      baseId: null,
      label: '-',
      shortLabel: '',
      side: null,
      group: null,
      scope: null,
      idIcon: null,
      stats: null,
    }
  }

  return {
    id: action.id,
    baseId: action.baseId,
    label: action.label,
    shortLabel: action.shortLabel,
    side: action.side,
    group: action.group,
    scope: action.scope,
    idIcon: action.idIcon || null,
    stats: action.stats || null,
  }
}

export const buildLiveEvent = ({
  sessionId,
  gameId,
  teamId,
  playerId,
  subjectType,
  actionId,
  zoneNumber,
  clock,
  note = '',
}) => {
  const createdAt = getNow()

  return {
    id: `evt_${createdAt}`,
    sessionId: sessionId || null,
    gameId: gameId || null,
    teamId: teamId || null,

    subject: buildEventSubject({
      subjectType,
      playerId,
      teamId,
    }),

    clock: {
      period: clock?.period || 1,
      minute: clock?.minute || 0,
      second: clock?.second || 0,
      ms: clock?.ms || 0,
    },

    action: buildEventAction(actionId),
    field: buildEventFieldFromZone(zoneNumber),

    note,

    meta: {
      source: 'live',
      createdAt,
    },
  }
}
