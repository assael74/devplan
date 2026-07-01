// src/ui/forms/create/logic/players/playerCreate.logic.js

import {
  buildPlayerInfoItem,
  buildPlayerNamesItem,
  buildPlayerTeamItem,
} from '../../../helpers/playerForm.helpers.js'

import { createShort } from '../../../../../services/firestore/shorts/shortsCreate.js'
import { makeId } from '../../../../../utils/id.js'

function clean(value) {
  return String(value == null ? '' : value).trim()
}

function resolveValue(primaryValue, fallbackValue) {
  if (primaryValue !== undefined && primaryValue !== null && primaryValue !== '') {
    return primaryValue
  }

  return fallbackValue
}

export function normalizePlayerCreateDraft(draft = {}) {
  return {
    playerFirstName: clean(draft.playerFirstName),
    playerLastName: clean(draft.playerLastName),
    clubId: clean(draft.clubId),
    teamId: clean(draft.teamId),
    birth: clean(resolveValue(draft.birth, draft.birthYear)),
    ifaLink: clean(draft.ifaLink),
    active: draft.active !== false,
  }
}

export function buildPlayerCreateItems({ id, draft, now }) {
  const playerDraft = normalizePlayerCreateDraft(draft)

  const infoItem = {
    ...buildPlayerInfoItem({ id, draft: playerDraft, now }),
    ...(playerDraft.ifaLink ? { ifaLink: playerDraft.ifaLink } : {}),
  }

  const namesItem = buildPlayerNamesItem({ id, draft: playerDraft })
  const teamItem = buildPlayerTeamItem({ id, draft: playerDraft })

  return {
    playerDraft,
    infoItem,
    namesItem,
    teamItem,
    mergedItem: {
      ...infoItem,
      ...namesItem,
      ...teamItem,
    },
  }
}

export async function createPlayerShorts({ draft }) {
  const id = makeId()
  const now = Date.now()

  const {
    infoItem,
    namesItem,
    teamItem,
    mergedItem,
  } = buildPlayerCreateItems({ id, draft, now })

  await Promise.all([
    createShort({ shortKey: 'players.playersInfo', item: infoItem }),
    createShort({ shortKey: 'players.playersNames', item: namesItem }),
    createShort({ shortKey: 'players.playersTeam', item: teamItem }),
  ])

  return mergedItem
}

export async function createPlayersShorts({ draft }) {
  const rows = Array.isArray(draft?.players) ? draft.players : []
  const defaults = draft?.defaults || {}
  const created = []

  for (const row of rows) {
    const playerDraft = normalizePlayerCreateDraft({
      ...defaults,
      ...row,
      clubId: resolveValue(row.clubId, resolveValue(draft.clubId, defaults.clubId)),
      teamId: resolveValue(row.teamId, resolveValue(draft.teamId, defaults.teamId)),
    })

    const item = await createPlayerShorts({ draft: playerDraft })
    created.push(item)
  }

  return {
    total: created.length,
    items: created,
  }
}
