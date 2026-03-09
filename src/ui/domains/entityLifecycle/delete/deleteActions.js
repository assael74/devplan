// src/ui/entityLifecycle/delete/deleteActions.js
import { deleteShortItemsById } from '../../../../services/firestore/shorts/shortsDelete.js'
import { debugLog } from '../../../../services/firestore/shorts/shortsDebug.utils.js'
import { SHORTS_DEBUG } from '../../../../services/firestore/shorts/shortsDebug.config.js'
import { doc, getDoc } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { db } from '../../../../services/firebase/firebase.js'
import { storage } from '../../../../services/firebase/firebase.js'
import { shortsRefs } from '../../../../services/firestore/shorts/shorts.refs.js'
import { shortsUpdateRouterMap } from '../../../../services/firestore/shorts/shortsUpdateRouter.js'

const PLAYER_SHORT_KEYS = [
  'players.playersInfo',
  'players.playersNames',
  'players.playersParents',
  'players.playersPaymentsId',
  'players.playersTeam',
  'players.playersMeettings',
  'players.playersProInfo',
  'players.playersAbilities',
]

const TEAM_SHORT_KEYS = [
  'teams.teamsInfo',
  'teams.teamsMeeting',
  'teams.teamsTraining',
]

const CLUB_SHORT_KEYS = [
  'clubs.clubsInfo',
]

const STAFF_SHORT_KEYS = [
  'roles.rolesInfo',
  'roles.rolesContact',
]

const SCOUTING_SHORT_KEYS = [
  'scouting.playersInfo',
  'scouting.playersGames',
]

const TAGS_SHORT_KEYS = [
  'tags.tagInfo',
]

const VIDEO_ANALYSIS_SHORT_KEYS = [
  'videoAnalysis.analysisNotes',
  'videoAnalysis.analysisInfo',
  'videoAnalysis.analysisNotes'
]

const VIDEO_SHORT_KEYS = [
  'videos.',
]

const toRouterEntityType = (entityType) => {
  if (entityType === 'player') return 'players'
  if (entityType === 'team') return 'teams'
  if (entityType === 'club') return 'clubs'
  if (entityType === 'role') return 'roles'
  if (entityType === 'scouting') return 'scouting'
  if (entityType === 'tag') return 'tags'
  return null
}

const resolvePhotoShortKey = (routerEntityType) => {
  return shortsUpdateRouterMap[routerEntityType]?.photo?.shortKey || null
}

const readPhotoUrlFromShorts = async ({ shortKey, id }) => {
  if (!shortKey || !id) return ''

  const [group, docName] = String(shortKey).split('.')
  const meta = shortsRefs[group][docName]
  if (!meta?.collection || !meta?.docId) return ''

  const refDoc = doc(db, meta.collection, meta.docId)
  const snap = await getDoc(refDoc)
  if (!snap.exists()) return ''

  const data = snap.data() || {}
  const list = Array.isArray(data?.list) ? data.list : []
  const item = list.find((x) => x?.id === id) || null
  return String(item?.photo || '')
}

const deletePhotoFromStorage = async (url) => {
  if (!url) return
  try {
    const r = ref(storage, url)
    await deleteObject(r)
  } catch (err) {
    // best-effort
    console.warn('[deleteActions] delete storage failed', err)
  }
}

const run = async ({ entityType, id, shortKeys }) => {
  if (SHORTS_DEBUG.enabled) debugLog(`UI_DELETE:${entityType}:start`, { id, shortKeys })

  const routerEntityType = toRouterEntityType(entityType)
  if (routerEntityType) {
    const photoShortKey = resolvePhotoShortKey(routerEntityType)
    const photoUrl = await readPhotoUrlFromShorts({ shortKey: photoShortKey, id })
    await deletePhotoFromStorage(photoUrl)
  }

  return deleteShortItemsById({
    shortKeys,
    id,
    requireAnyFound: true,
    requireAllFound: false,
  })
}

export const deleteActions = {
  player: async ({ id }) => run({ entityType: 'player', id, shortKeys: PLAYER_SHORT_KEYS }),
  team: async ({ id }) => run({ entityType: 'team', id, shortKeys: TEAM_SHORT_KEYS }),
  club: async ({ id }) => run({ entityType: 'club', id, shortKeys: CLUB_SHORT_KEYS }),
  role: async ({ id }) => run({ entityType: 'role', id, shortKeys: STAFF_SHORT_KEYS }),
  scouting: async ({ id }) => run({ entityType: 'scouting', id, shortKeys: SCOUTING_SHORT_KEYS }),
  tag: async ({ id }) => run({ entityType: 'tag', id, shortKeys: TAGS_SHORT_KEYS }),
  videoAnalysis: async ({ id }) => run({ entityType: 'videoAnalysis', id, shortKeys: VIDEO_ANALYSIS_SHORT_KEYS }),
}
