// ui/forms/create/createActions.js

import { upsertAbilitiesHistory } from '../../../services/firestore/shorts/abilities/abilitiesUpsertHistory.js'
import { createGameStatsDoc } from '../../../services/firestore/shorts/gameStats/index.js'
import { upsertTrainingWeek } from '../../../services/firestore/shorts/trainings/trainingsShorts.service.js'
import { buildGameInfoItem, buildGameTimeItem, buildGameResultItem } from '../helpers/gameForm.helpers.js'
import { buildPlayerInfoItem, buildPlayerNamesItem, buildPlayerTeamItem } from '../helpers/playerForm.helpers.js'
import { buildTaskCreateItem } from '../helpers/tasksForm.helpers.js'
import { buildMeetingStartAtMs } from '../helpers/meetingForm.helpers.js'
import { createShort } from '../../../services/firestore/shorts/shortsCreate'
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

const resolveResult = ({ goalsFor, goalsAgainst }) => {
  const gf = toNum(goalsFor)
  const ga = toNum(goalsAgainst)

  if (gf > ga) return 'win'
  if (gf < ga) return 'loss'

  return 'draw'
}

const buildExternalGameInfoItem = ({ id, draft, now }) => {
  return {
    ...buildGameInfoItem({ id, draft, now }),
    ...buildGameTimeItem({ id, draft }),
    ...buildGameResultItem({ id, draft }),

    playerId: clean(draft?.playerId),
    teamName: clean(draft?.teamName),
    clubName: clean(draft?.clubName),

    result: clean(draft?.result) || resolveResult({
      goalsFor: draft?.goalsFor,
      goalsAgainst: draft?.goalsAgainst,
    }),

    gameSource: 'external',
    isExternalGame: true,
  }
}

const buildExternalGamePlayersItem = ({ id, draft }) => {
  const goalsFor = toNum(draft?.goalsFor)

  return {
    id,
    playerId: clean(draft?.playerId),
    isSelected: toBool(draft?.isSelected, true),
    isStarting: toBool(draft?.isStarting, false),
    onSquad: toBool(draft?.isSelected, true),
    onStart: toBool(draft?.isStarting, false),
    goals: Math.min(toNum(draft?.goals), goalsFor),
    assists: Math.min(toNum(draft?.assists), goalsFor),
    timePlayed: toNum(draft?.timePlayed),
  }
}

const buildExternalGameDraft = ({ draft, context, row = {} }) => {
  const player = context?.player || context?.entity || {}

  const merged = {
    ...draft,
    ...row,
  }

  return {
    ...merged,
    playerId: clean(merged?.playerId || context?.playerId || player?.id),

    teamId: clean(merged?.teamId || context?.teamId || player?.teamId),
    clubId: clean(merged?.clubId || context?.clubId || player?.clubId),

    teamName: clean(merged?.teamName || player?.teamName || player?.team?.teamName),
    clubName: clean(merged?.clubName || player?.clubName || player?.club?.clubName),

    home: toBool(merged?.home, true),
    goalsFor: toNum(merged?.goalsFor),
    goalsAgainst: toNum(merged?.goalsAgainst),

    isSelected: toBool(merged?.isSelected, true),
    isStarting: toBool(merged?.isStarting, false),
    goals: toNum(merged?.goals),
    assists: toNum(merged?.assists),
    timePlayed: toNum(merged?.timePlayed),

    gameSource: 'external',
    isExternalGame: true,
  }
}

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

    await createShort({
      shortKey: 'roles.rolesInfo',
      item: {
        id,
        fullName: draft.fullName,
        active: true,
        type: draft.type,
      },
    })
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
    const id = makeId()
    const now = Date.now()

    const gameInfoItem = buildGameInfoItem({ id, draft, now })
    const gameTimeItem = buildGameTimeItem({ id, draft })
    const gameResultItem = buildGameResultItem({ id, draft })

    await createShort({ shortKey: 'games.gameInfo', item: gameInfoItem })
    await createShort({ shortKey: 'games.gameTime', item: gameTimeItem })
    await createShort({ shortKey: 'games.gameResult', item: gameResultItem })

    return {
      ...gameInfoItem,
      ...gameTimeItem,
      ...gameResultItem,
    }
  },

  games: async ({ draft }) => {
    const rows = Array.isArray(draft?.games) ? draft.games : []
    const created = []

    for (const row of rows) {
      const id = makeId()
      const now = Date.now()

      const gameDraft = {
        ...draft,
        ...row,
        type: row?.type || draft?.defaults?.type || '',
        gameDuration: row?.gameDuration || draft?.defaults?.gameDuration || '',
        home: row?.home ?? draft?.defaults?.home ?? true,
      }

      const gameInfoItem = buildGameInfoItem({ id, draft: gameDraft, now })
      const gameTimeItem = buildGameTimeItem({ id, draft: gameDraft })

      await createShort({ shortKey: 'games.gameInfo', item: gameInfoItem })
      await createShort({ shortKey: 'games.gameTime', item: gameTimeItem })

      created.push({
        ...gameInfoItem,
        ...gameTimeItem,
      })
    }

    return {
      total: created.length,
      items: created,
    }
  },

  externalGame: async ({ draft, context }) => {
    const id = makeId()
    const now = Date.now()
    const externalDraft = buildExternalGameDraft({ draft, context })

    const gameInfoItem = buildExternalGameInfoItem({
      id,
      draft: externalDraft,
      now,
    })

    const gamePlayersItem = buildExternalGamePlayersItem({
      id,
      draft: externalDraft,
    })

    await createShort({
      shortKey: 'externalGames.gameInfo',
      item: gameInfoItem,
    })

    await createShort({
      shortKey: 'externalGames.gamePlayers',
      item: gamePlayersItem,
    })

    return {
      ...gameInfoItem,
      ...gamePlayersItem,
    }
  },

  externalGames: async ({ draft, context }) => {
    const rows = Array.isArray(draft?.games) ? draft.games : []
    const created = []

    for (const row of rows) {
      const id = makeId()
      const now = Date.now()

      const rowDraft = {
        ...draft,
        ...row,
        type: row?.type || draft?.defaults?.type || '',
        gameDuration: row?.gameDuration || draft?.defaults?.gameDuration || '',
        home: row?.home ?? draft?.defaults?.home ?? true,
      }

      const externalDraft = buildExternalGameDraft({
        draft: rowDraft,
        context,
      })

      const gameInfoItem = buildExternalGameInfoItem({
        id,
        draft: externalDraft,
        now,
      })

      const gamePlayersItem = buildExternalGamePlayersItem({
        id,
        draft: externalDraft,
      })

      await createShort({
        shortKey: 'externalGames.gameInfo',
        item: gameInfoItem,
      })

      await createShort({
        shortKey: 'externalGames.gamePlayers',
        item: gamePlayersItem,
      })

      created.push({
        ...gameInfoItem,
        ...gamePlayersItem,
      })
    }

    return {
      total: created.length,
      items: created,
    }
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
