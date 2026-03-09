import { upsertAbilitiesHistory } from '../../../services/firestore/shorts/abilities/abilitiesUpsertHistory.js'
import { upsertTrainingWeek } from '../../../services/firestore/shorts/trainings/trainingsShorts.service.js'
import { createShort } from '../../../services/firestore/shorts/shortsCreate'
import { makeId } from '../../../utils/id.js'

const pickIfaLink = (draft) => {
  const v = String(draft?.ifaLink || '').trim()
  return v ? v : null
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
    const ifaLink = pickIfaLink(draft)

    await createShort({
      shortKey: 'players.playersInfo',
      item: {
        id,
        birth: draft.birth,
        active: true,
        type: 'noneType',
        ...(ifaLink ? { ifaLink } : {}),
      },
    })

    await createShort({
      shortKey: 'players.playersNames',
      item: {
        id,
        playerLastName: draft.playerLastName,
        playerFirstName: draft.playerFirstName,
      },
    })

    await createShort({
      shortKey: 'players.playersTeam',
      item: {
        id,
        clubId: draft.clubId,
        teamId: draft.teamId,
      },
    })
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

    await createShort({
      shortKey: 'meetings.meetingDate',
      item: {
        id,
        meetingDate: draft.meetingDate,
        meetingFor: draft.meetingFor,
        meetingHour: draft.meetingHour,
      },
    })

    await createShort({
      shortKey: 'meetings.meetingPlayer',
      item: {
        id,
        playerId: draft.playerId,
        status: {
          current: initialStatus,
          history: [initialStatus],
        },
        type: draft.type,
      },
    })
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
