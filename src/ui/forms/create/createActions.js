// ui/forms/create/createActions.js

import { upsertAbilitiesHistory } from '../../../services/firestore/shorts/abilities/abilitiesUpsertHistory.js'
import { createGameStatsDoc } from '../../../services/firestore/shorts/gameStats/index.js'
import { upsertTrainingWeek } from '../../../services/firestore/shorts/trainings/trainingsShorts.service.js'
import { buildGameInfoItem, buildGameTimeItem, buildGameResultItem } from '../helpers/gameForm.helpers.js'
import { buildPlayerInfoItem, buildPlayerNamesItem, buildPlayerTeamItem } from '../helpers/playerForm.helpers.js'
import { buildTaskCreateItem } from '../helpers/tasksForm.helpers.js'
import { buildMeetingStartAtMs } from '../helpers/meetingForm.helpers.js'
import { createShort } from '../../../services/firestore/shorts/shortsCreate'

import {
  createExternalGameShorts,
  createExternalGamesShorts,
  createGameShorts,
  createGamesShorts,
} from './logic/games/index.js'

import { makeId } from '../../../utils/id.js'

const pickIfaLink = (draft) => {
  const v = String(draft?.ifaLink || '').trim()
  return v ? v : null
}

const clean = (value) => String(value ?? '').trim()

const toNum = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const toBool = (value, fallback = false) => {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

const omitEmpty = (obj = {}) =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined))

export const createActions = {
  club: async ({ draft }) => {
    const id = makeId()
    const ifaLink = pickIfaLink(draft)

    await createShort({
      shortKey: 'clubs.clubsInfo',
      item: {
        id,
        clubName: draft.clubName,
        active: true,
        ...(ifaLink ? { ifaLink } : {}),
      },
    })
  },

  team: async ({ draft }) => {
    const id = makeId()
    const ifaLink = pickIfaLink(draft)

    await createShort({
      shortKey: 'teams.teamsInfo',
      item: {
        id,
        clubId: draft.clubId,
        teamYear: draft.teamYear,
        teamName: draft.teamName,
        project: draft.isProject || false,
        active: true,
        ...(ifaLink ? { ifaLink } : {}),
      },
    })
  },

  player: async ({ draft }) => {
    const id = makeId()
    const now = Date.now()
    const ifaLink = pickIfaLink(draft)

    const infoItem = {
      ...buildPlayerInfoItem({ id, draft, now }),
      ...(ifaLink ? { ifaLink } : {}),
    }

    const namesItem = buildPlayerNamesItem({ id, draft })
    const teamItem = buildPlayerTeamItem({ id, draft })

    await createShort({ shortKey: 'players.playersInfo', item: infoItem })
    await createShort({ shortKey: 'players.playersNames', item: namesItem })
    await createShort({ shortKey: 'players.playersTeam', item: teamItem })

    return {
      ...infoItem,
      ...namesItem,
      ...teamItem,
    }
  },

  privatePlayer: async ({ draft }) => {
    const id = makeId()
    const now = Date.now()
    const ifaLink = pickIfaLink(draft)

    const infoItem = omitEmpty({
      id,
      playerSource: 'private',
      isPrivatePlayer: true,
      active: draft?.active ?? true,
      playerFirstName: draft?.playerFirstName || '',
      playerLastName: draft?.playerLastName || '',
      birth: draft?.birth ?? draft?.birthYear ?? '',
      clubName: draft?.clubName || '',
      teamName: draft?.teamName || '',
      createdAt: now,
      updatedAt: now,
      ...(ifaLink ? { ifaLink } : {}),
    })

    await createShort({
      shortKey: 'privates.privatePlayersInfo',
      item: infoItem,
    })

    return { ...infoItem }
  },

  players: async ({ draft }) => {
    const rows = Array.isArray(draft?.players) ? draft.players : []
    const created = []

    for (const row of rows) {
      const id = makeId()
      const now = Date.now()

      const playerDraft = {
        ...draft,
        ...row,
        teamId: row?.teamId || draft?.teamId || draft?.defaults?.teamId || '',
        clubId: row?.clubId || draft?.clubId || draft?.defaults?.clubId || '',
      }

      const infoItem = buildPlayerInfoItem({ id, draft: playerDraft, now })
      const namesItem = buildPlayerNamesItem({ id, draft: playerDraft })
      const teamItem = buildPlayerTeamItem({ id, draft: playerDraft })

      await createShort({ shortKey: 'players.playersInfo', item: infoItem })
      await createShort({ shortKey: 'players.playersNames', item: namesItem })
      await createShort({ shortKey: 'players.playersTeam', item: teamItem })

      created.push({
        ...infoItem,
        ...namesItem,
        ...teamItem,
      })
    }

    return {
      total: created.length,
      items: created,
    }
  },

  role: async ({ draft }) => {
    const id = makeId()
    const now = Date.now()

    const infoItem = omitEmpty({
      id,

      userId: draft?.userId || '',
      authUid: draft?.authUid || '',

      fullName: draft?.fullName || '',
      active: draft?.active ?? true,
      status: draft?.status || 'active',
      type: draft?.type || '',

      clubsId: Array.isArray(draft?.clubsId) ? draft.clubsId.filter(Boolean) : [],
      teamsId: Array.isArray(draft?.teamsId) ? draft.teamsId.filter(Boolean) : [],

      systemAccess: draft?.systemAccess || {},
      moduleAccess: draft?.moduleAccess || {},

      source: draft?.source || 'manual',
      createdAt: now,
      updatedAt: now,
    })

    await createShort({
      shortKey: 'roles.rolesInfo',
      item: infoItem,
    })

    const contactItem = omitEmpty({
      id,
      email: draft?.email || '',
      phone: draft?.phone || '',
    })

    if (contactItem.email || contactItem.phone) {
      await createShort({
        shortKey: 'roles.rolesContact',
        item: contactItem,
      })
    }

    return {
      ...infoItem,
      ...contactItem,
    }
  },

  scouting: async ({ draft }) => {
    const id = makeId()

    await createShort({
      shortKey: 'scouting.playersInfo',
      item: {
        id,
        playerName: draft.playerName,
        active: true,
        birth: draft.birth,
        teamName: draft.teamName,
        ckubName: draft.ckubName,
      },
    })
  },

  meeting: async ({ draft }) => {
    const id = makeId()
    const now = Date.now()

    const initialStatus = { id: 'new', time: now }
    const startAtMs = buildMeetingStartAtMs(draft.meetingDate, draft.meetingHour)

    const meetingInfoItem = {
      id,
      meetingDate: clean(draft.meetingDate),
      meetingFor: clean(draft.meetingFor),
      meetingHour: clean(draft.meetingHour),
      startAtMs,
      playerId: clean(draft.type) === 'personal' ? clean(draft.playerId) : '',
      teamId: clean(draft.type) === 'team' ? clean(draft.teamId) : '',
      playersId: Array.isArray(draft?.playersId) ? draft.playersId.filter(Boolean) : [],
      createdById: clean(draft.createdById),
      createdByName: clean(draft.createdByName),
      status: {
        current: initialStatus,
        history: [initialStatus],
      },
      type: clean(draft.type),
    }

    await createShort({
      shortKey: 'meetings.meetingInfo',
      item: meetingInfoItem,
    })

    return { ...meetingInfoItem }
  },

  payment: async ({ draft }) => {
    const id = makeId()
    const now = Date.now()

    const initialStatus = { id: 'new', time: now }

    const paymentProfitItem = {
      id,
      paymentFor: draft.paymentFor,
      price: draft.price,
      type: draft.type,
    }

    const paymentOperativeItem = {
      id,
      playerId: draft.playerId,
      status: initialStatus,
    }

    await createShort({ shortKey: 'payments.paymentProfit', item: paymentProfitItem })
    await createShort({ shortKey: 'payments.paymentOperative', item: paymentOperativeItem })

    return {
      ...paymentProfitItem,
      ...paymentOperativeItem,
    }
  },

  game: async ({ draft }) => {
    return createGameShorts({ draft })
  },

  games: async ({ draft }) => {
    return createGamesShorts({ draft })
  },

  externalGame: async ({ draft, context }) => {
    return createExternalGameShorts({ draft, context })
  },

  externalGames: async ({ draft, context }) => {
    return createExternalGamesShorts({ draft, context })
  },

  gameStats: async ({ draft }) => {
    return createGameStatsDoc({ draft })
  },

  videoAnalysis: async ({ draft }) => {
    const id = makeId()
    const now = Date.now()
    const year = Number(draft.year) || null
    const month = Number(draft.month) || null
    const ym = year && month ? `${year}-${String(month).padStart(2, '0')}` : null

    const contextType = draft.contextType || null
    const objectType = draft.objectType || null

    const meetingId = contextType === 'meeting' ? (draft.meetingId || null) : null
    const teamId = objectType === 'team' ? (draft.teamId || null) : null
    const playerId = objectType === 'player' ? (draft.playerId || null) : null

    await createShort({
      shortKey: 'videoAnalysis.analysisInfo',
      item: {
        id,
        name: draft.name,
        link: draft.link,
        contextType,
        objectType,
        year,
        month,
        ym,
        clubId: draft.clubId || null,
        meetingId,
        teamId,
        playerId,
        createdAt: now,
        updatedAt: now,
      },
    })
  },

  videos: async ({ draft }) => {
    const id = makeId()
    const now = Date.now()

    await createShort({
      shortKey: 'videos.videoInfo',
      item: {
        id,
        name: draft.name,
        link: draft.link,
        createdAt: now,
        updatedAt: now,
      },
    })
  },

  tag: async ({ draft }) => {
    const id = makeId()

    await createShort({
      shortKey: 'tags.tagInfo',
      item: {
        id,
        tagName: draft.tagName,
        tagType: draft.tagType,
        notes: draft.notes || '',
        slug: draft.slug || '',
        kind: draft.kind || 'tag',
        parentId: draft.parentId || null,
      },
    })
  },

  abilities: async ({ draft }) => {
    return upsertAbilitiesHistory({ draft })
  },

  training: async ({ draft }) => {
    const teamId = clean(draft?.teamId)
    const weekId = clean(draft?.weekId || draft?.weekKey || draft?.weekStartDate)

    if (!teamId) throw new Error('missing teamId')
    if (!weekId) throw new Error('missing weekId')

    const res = await upsertTrainingWeek({
      draft: {
        ...draft,
        teamId,
        weekId,
      },
      meta: {
        source: 'createModal',
        entityType: 'team',
      },
    })

    return {
      teamId,
      weekId: res?.weekId || weekId,
      ok: true,
    }
  },

  task: async ({ draft }) => {
    const id = makeId()
    const now = Date.now()

    const item = buildTaskCreateItem({
      id,
      draft,
      now,
    })

    await createShort({
      shortKey: 'tasks.tasksInfo',
      item,
    })

    return item
  },
}
