import { upsertAbilitiesHistory } from '../../../services/firestore/shorts/abilities/abilitiesUpsertHistory.js'
import { upsertTrainingWeek } from '../../../services/firestore/shorts/trainings/trainingsShorts.service.js'
import { buildGameInfoItem, buildGameTimeItem, buildGameResultItem } from '../helpers/gameForm.helpers.js'
import {
  buildPlayerInfoItem,
  buildPlayerNamesItem,
  buildPlayerTeamItem,
} from '../helpers/playerForm.helpers.js'
import { createShort } from '../../../services/firestore/shorts/shortsCreate'
import { makeId } from '../../../utils/id.js'

const pickIfaLink = (draft) => {
  const v = String(draft?.ifaLink || '').trim()
  return v ? v : null
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

    await createShort({
      shortKey: 'players.playersInfo',
      item: infoItem,
    })

    await createShort({
      shortKey: 'players.playersNames',
      item: namesItem,
    })

    await createShort({
      shortKey: 'players.playersTeam',
      item: teamItem,
    })

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

    return {
      ...infoItem,
    }
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

      await createShort({
        shortKey: 'players.playersInfo',
        item: infoItem,
      })

      await createShort({
        shortKey: 'players.playersNames',
        item: namesItem,
      })

      await createShort({
        shortKey: 'players.playersTeam',
        item: teamItem,
      })

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

    const meetingDateItem = {
      id,
      meetingDate: draft.meetingDate,
      meetingFor: draft.meetingFor,
      meetingHour: draft.meetingHour,
    }

    const meetingPlayerItem = {
      id,
      playerId: draft.playerId,
      status: {
        current: initialStatus,
        history: [initialStatus],
      },
      type: draft.type,
    }

    await createShort({
      shortKey: 'meetings.meetingDate',
      item: meetingDateItem,
    })

    await createShort({
      shortKey: 'meetings.meetingPlayer',
      item: meetingPlayerItem,
    })

    return {
      ...meetingDateItem,
      ...meetingPlayerItem,
    }
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

    await createShort({
      shortKey: 'payments.paymentProfit',
      item: paymentProfitItem,
    })

    await createShort({
      shortKey: 'payments.paymentOperative',
      item: paymentOperativeItem,
    })

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

    await createShort({
      shortKey: 'games.gameInfo',
      item: gameInfoItem,
    })

    await createShort({
      shortKey: 'games.gameTime',
      item: gameTimeItem,
    })

    await createShort({
      shortKey: 'games.gameResult',
      item: gameResultItem,
    })

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

      await createShort({
        shortKey: 'games.gameInfo',
        item: gameInfoItem,
      })

      await createShort({
        shortKey: 'games.gameTime',
        item: gameTimeItem,
      })

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

  externalGame: async ({ draft }) => {
    const id = makeId()
    const now = Date.now()

    const gameInfoItem = {
      ...buildGameInfoItem({ id, draft, now }),
      ...buildGameTimeItem({ id, draft }),
      ...buildGameResultItem({ id, draft }),
      gameSource: 'external',
      isExternalGame: true,
    }

    const gamePlayersItem = {
      id,
      playerId: draft?.playerId || null,
      isSelected: draft?.isSelected === true,
      isStarting: draft?.isStarting === true,
      goals: Number(draft?.goals || 0),
      assists: Number(draft?.assists || 0),
      timePlayed: Number(draft?.timePlayed || 0),
    }

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
    const teamId = String(draft?.teamId || '').trim()
    const weekId = String(draft?.weekId || draft?.weekKey || draft?.weekStartDate || '').trim()

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
}
