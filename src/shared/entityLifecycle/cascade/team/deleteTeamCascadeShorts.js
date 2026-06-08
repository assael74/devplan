// src/shared/entityLifecycle/cascade/team/deleteTeamCascadeShorts.js

import { deleteShortItemsByIds } from '../../../../services/firestore/shorts/shortsDelete.js'
import { TEAM_CASCADE_DELETE_KEYS } from './teamCascadeDelete.keys.js'

const emptyResult = label => ({
  label,
  skipped: true,
  ids: [],
  totalRemoved: 0,
})

const removeByIds = async ({ label, shortKeys, ids, requireAnyFound = false }) => {
  const cleanIds = Array.from(new Set((ids || []).filter(Boolean)))

  if (!cleanIds.length) return emptyResult(label)

  const res = await deleteShortItemsByIds({
    shortKeys,
    ids: cleanIds,
    requireAnyFound,
    requireAllFound: false,
  })

  return {
    label,
    skipped: false,
    ...res,
  }
}

export async function deleteTeamGamesShorts({ plan }) {
  return removeByIds({
    label: 'games',
    shortKeys: TEAM_CASCADE_DELETE_KEYS.games,
    ids: plan?.gameIds,
    requireAnyFound: false,
  })
}

export async function deleteTeamMeetingsShorts({ plan }) {
  return removeByIds({
    label: 'meetings',
    shortKeys: TEAM_CASCADE_DELETE_KEYS.meetings,
    ids: plan?.meetingIds,
    requireAnyFound: false,
  })
}

export async function deleteTeamPlayersShorts({ plan }) {
  return removeByIds({
    label: 'players',
    shortKeys: TEAM_CASCADE_DELETE_KEYS.players,
    ids: plan?.playerIds,
    requireAnyFound: false,
  })
}

export async function deleteTeamRootShorts({ plan }) {
  return removeByIds({
    label: 'team',
    shortKeys: TEAM_CASCADE_DELETE_KEYS.team,
    ids: [plan?.teamId],
    requireAnyFound: true,
  })
}
