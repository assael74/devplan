// src/application/actions/entities/deleteEntity.handlers.js

import { deleteShortItemsById, deleteShortItemsByIds } from '../../../services/firestore/shorts/shortsDelete.js'
import { debugLog } from '../../../services/firestore/shorts/shortsDebug.utils.js'
import { SHORTS_DEBUG } from '../../../services/firestore/shorts/shortsDebug.config.js'
import { deleteImageByUrl } from '../../../services/firestore/storage/deleteImageByUrl.js'
import { doc, getDoc } from 'firebase/firestore'

import { db } from '../../../services/firebase/firebase.js'
import { shortsRefs } from '../../../services/firestore/shorts/shorts.refs.js'
import { shortsUpdateRouterMap } from '../../../services/firestore/shorts/shortsUpdateRouter.js'

const PLAYER_SHORT_KEYS = [
  'players.playersInfo',
  'players.playersNames',
  'players.playersParents',
  'players.playersTeam',
  'players.playersProInfo',
  'players.playersAbilities',
]

const TEAM_SHORT_KEYS = ['teams.teamsInfo', 'teams.teamsTraining']
const CLUB_SHORT_KEYS = ['clubs.clubsInfo']
const STAFF_SHORT_KEYS = ['roles.rolesInfo', 'roles.rolesContact']
const SCOUTING_SHORT_KEYS = ['scouting.playersInfo', 'scouting.playersGames']

const GAME_SHORT_KEYS = [
  'games.gameInfo',
  'games.gameResult',
  'games.gameTime',
  'games.gamePlayers',
]

const EXTERNAL_GAME_SHORT_KEYS = [
  'externalGames.gameInfo',
  'externalGames.gamePlayers',
]

const VIDEO_ANALYSIS_SHORT_KEYS = [
  'videoAnalysis.analysisInfo',
  'videoAnalysis.analysisNotes',
  'videoAnalysis.analysisTags',
]

const VIDEO_GENERAL_SHORT_KEYS = [
  'videos.videoInfo',
  'videos.videoNotes',
  'videos.videoTags',
]

const TASK_SHORT_KEYS = ['tasks.tasksInfo']

function cleanIds(ids = []) {
  return Array.from(new Set((ids || []).filter(Boolean)))
}

function toRouterEntityType(entityType) {
  if (entityType === 'player') return 'players'
  if (entityType === 'team') return 'teams'
  if (entityType === 'club') return 'clubs'
  if (entityType === 'role') return 'roles'
  if (entityType === 'scouting') return 'scouting'
  if (entityType === 'task') return 'tasks'
  return null
}

function resolvePhotoShortKey(routerEntityType) {
  return shortsUpdateRouterMap?.[routerEntityType]?.photo?.shortKey || null
}

function resolveShortMeta(shortKey) {
  const [group, docName] = String(shortKey || '').split('.')
  return shortsRefs?.[group]?.[docName] || null
}

async function readShortItems(shortKey) {
  const meta = resolveShortMeta(shortKey)

  if (!meta?.collection || !meta?.docId) return []

  const refDoc = doc(db, meta.collection, meta.docId)
  const snap = await getDoc(refDoc)

  if (!snap.exists()) return []

  const data = snap.data() || {}
  return Array.isArray(data.list) ? data.list : []
}

async function readPhotoUrlFromShorts({ shortKey, id }) {
  if (!shortKey || !id) return ''

  const list = await readShortItems(shortKey)
  const item = list.find(row => row?.id === id)

  return String(item?.photo || '')
}

async function readPlayerPhotoUrls(ids = []) {
  const idSet = new Set(cleanIds(ids))
  const list = await readShortItems('players.playersInfo')

  return Array.from(new Set(
    list
      .filter(player => idSet.has(player?.id))
      .map(player => String(player?.photo || '').trim())
      .filter(Boolean)
  ))
}

async function deletePhotoUrls(urls = []) {
  const results = await Promise.all(urls.map(url => deleteImageByUrl(url)))

  return {
    total: urls.length,
    deleted: results.filter(result => result?.ok && !result?.skipped).length,
    skipped: results.filter(result => result?.skipped).length,
    failed: results.filter(result => result?.ok === false).length,
    results,
  }
}

async function run({ entityType, id, shortKeys, requireAnyFound = true, requireAllFound = false }) {
  if (SHORTS_DEBUG.enabled) {
    debugLog(`UI_DELETE:${entityType}:start`, { id, shortKeys, requireAnyFound, requireAllFound })
  }

  const routerEntityType = toRouterEntityType(entityType)

  if (routerEntityType) {
    const photoShortKey = resolvePhotoShortKey(routerEntityType)
    const photoUrl = await readPhotoUrlFromShorts({ shortKey: photoShortKey, id })
    await deleteImageByUrl(photoUrl)
  }

  return deleteShortItemsById({ shortKeys, id, requireAnyFound, requireAllFound })
}

async function runBulkDelete({ action, ids, shortKeys }) {
  const resolvedIds = cleanIds(ids)

  if (!resolvedIds.length) {
    return {
      ids: [],
      foundDocs: 0,
      totalRemoved: 0,
      skipped: true,
    }
  }

  if (SHORTS_DEBUG.enabled) {
    debugLog(`UI_DELETE:${action}:start`, { ids: resolvedIds, count: resolvedIds.length, shortKeys })
  }

  return deleteShortItemsByIds({
    shortKeys,
    ids: resolvedIds,
    requireAnyFound: true,
    requireAllFound: false,
  })
}

export const deleteEntityHandlers = {
  player: async ({ id }) => run({
    entityType: 'player',
    id,
    shortKeys: PLAYER_SHORT_KEYS,
    requireAnyFound: true,
    requireAllFound: false,
  }),

  playersBulk: async ({ ids }) => {
    const resolvedIds = cleanIds(ids)

    if (!resolvedIds.length) {
      return {
        ids: [],
        foundDocs: 0,
        totalRemoved: 0,
        images: {
          total: 0,
          deleted: 0,
          skipped: 0,
          failed: 0,
        },
        skipped: true,
      }
    }

    const photoUrls = await readPlayerPhotoUrls(resolvedIds)
    const images = await deletePhotoUrls(photoUrls)

    const deleteResult = await runBulkDelete({
      action: 'playersBulk',
      ids: resolvedIds,
      shortKeys: PLAYER_SHORT_KEYS,
    })

    return {
      ...deleteResult,
      images,
    }
  },

  team: async ({ id }) => run({
    entityType: 'team',
    id,
    shortKeys: TEAM_SHORT_KEYS,
    requireAnyFound: true,
    requireAllFound: false,
  }),

  club: async ({ id }) => run({
    entityType: 'club',
    id,
    shortKeys: CLUB_SHORT_KEYS,
    requireAnyFound: true,
    requireAllFound: false,
  }),

  role: async ({ id }) => run({
    entityType: 'role',
    id,
    shortKeys: STAFF_SHORT_KEYS,
    requireAnyFound: true,
    requireAllFound: false,
  }),

  scouting: async ({ id }) => run({
    entityType: 'scouting',
    id,
    shortKeys: SCOUTING_SHORT_KEYS,
    requireAnyFound: true,
    requireAllFound: false,
  }),

  game: async ({ id }) => run({
    entityType: 'game',
    id,
    shortKeys: GAME_SHORT_KEYS,
    requireAnyFound: false,
    requireAllFound: false,
  }),

  gamesBulk: async ({ ids }) => runBulkDelete({
    action: 'gamesBulk',
    ids,
    shortKeys: GAME_SHORT_KEYS,
  }),

  externalGame: async ({ id }) => run({
    entityType: 'externalGame',
    id,
    shortKeys: EXTERNAL_GAME_SHORT_KEYS,
    requireAnyFound: true,
    requireAllFound: false,
  }),

  videoAnalysis: async ({ id }) => run({
    entityType: 'videoAnalysis',
    id,
    shortKeys: VIDEO_ANALYSIS_SHORT_KEYS,
    requireAnyFound: true,
    requireAllFound: false,
  }),

  videosBulk: async ({ ids }) => runBulkDelete({
    action: 'videosBulk',
    ids,
    shortKeys: VIDEO_GENERAL_SHORT_KEYS,
  }),

  task: async ({ id }) => run({
    entityType: 'task',
    id,
    shortKeys: TASK_SHORT_KEYS,
    requireAnyFound: true,
    requireAllFound: false,
  }),
}
