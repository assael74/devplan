/**
 * שלב יצירת אינדקסים (Index Stage)
 *
 * אחריות:
 * - יצירת Maps ואינדקסים מהירים לנתונים
 * - הכנת מבני נתונים שמאפשרים חיפוש מהיר לפי id
 * - חישוב מבני נתונים עזר עבור stages הבאים
 *
 * דוגמאות לאינדקסים שנוצרים כאן:
 * clubById
 * teamById
 * meetingsById
 * paymentsById
 * gamesWithStats
 * videosByMeetingId
 * videosByPlayerId
 * videosByTeamId
 *
 * המטרה:
 * לאפשר גישה מהירה לנתונים בלי לבצע חיפושים חוזרים במערכים.
 */
 // src/features/coreData/resolve/index-stage.js
import {
  buildVideosByMeetingId,
  buildVideosByPlayerId,
  buildVideosByTeamId,
  buildRolesWithEntities,
  buildRolesByClubId,
  buildRolesByTeamId,
  buildMeetingsByPlayerId,
  buildMeetingsByTeamId,
  buildPaymentIdsByPlayerId,
  buildTrainingWeeksByTeamId,
  buildGamesByTeamId,
} from '../resolvers/builders'

const safeId = (v) => (v == null ? '' : String(v))
const safeArr = (v) => (Array.isArray(v) ? v : [])
const safeNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const uniqById = (arr = []) => {
  const map = new Map()

  for (const item of safeArr(arr)) {
    const id = safeId(item?.id)
    if (!id) continue
    if (!map.has(id)) map.set(id, item)
  }

  return Array.from(map.values())
}

const normalizeIds = (value) => {
  if (Array.isArray(value)) return value.map(safeId).filter(Boolean)
  const id = safeId(value)
  return id ? [id] : []
}

const buildGamesByPlayerId = (games = []) => {
  const map = new Map()

  for (const game of safeArr(games)) {
    const ids = [
      ...normalizeIds(game?.playerId),
      ...normalizeIds(game?.playersId),
      ...normalizeIds(game?.playerIds),
    ]

    const uniqueIds = Array.from(new Set(ids))

    for (const playerId of uniqueIds) {
      if (!map.has(playerId)) map.set(playerId, [])
      map.get(playerId).push(game)
    }
  }

  for (const [playerId, list] of map.entries()) {
    map.set(playerId, uniqById(list))
  }

  return map
}

const buildTagUseCountMap = (videosArr = []) => {
  const counts = new Map()

  for (const video of safeArr(videosArr)) {
    const ids = Array.isArray(video?.tagIds)
      ? video.tagIds
      : Array.isArray(video?.tags)
      ? video.tags
      : []

    for (const id of ids) {
      const tagId = safeId(id)
      if (!tagId) continue
      counts.set(tagId, (counts.get(tagId) || 0) + 1)
    }
  }

  return counts
}

const getTagLabel = (tag) => String(tag?.label || tag?.tagName || tag?.name || '').trim()

const buildTagUiChild = (tag) => ({
  id: String(tag?.id || ''),
  label: getTagLabel(tag),
  kind: String(tag?.kind || ''),
  slug: String(tag?.slug || ''),
  parentId: tag?.parentId ? String(tag.parentId) : null,
  useCount: safeNum(tag?.useCount),
  order: Number.isFinite(Number(tag?.order)) ? Number(tag.order) : 0,
})

const sortTagsByOrderAndLabel = (a, b) => {
  const ao = Number.isFinite(Number(a?.order)) ? Number(a.order) : 0
  const bo = Number.isFinite(Number(b?.order)) ? Number(b.order) : 0

  if (ao !== bo) return ao - bo
  return String(a?.label || '').localeCompare(String(b?.label || ''), 'he')
}

const buildTagsHierarchy = (tags = []) => {
  const base = safeArr(tags).map((tag) => ({
    ...tag,
    id: String(tag?.id || ''),
    slug: String(tag?.slug || ''),
    kind: String(tag?.kind || ''),
    tagType: String(tag?.tagType || ''),
    label: getTagLabel(tag),

    isActive: tag?.isActive !== false,
    parentId: tag?.parentId ? String(tag.parentId) : null,

    parentLabel: '',
    parentKind: '',
    parentSlug: '',

    childrenIds: [],
    children: [],
  }))

  const byId = new Map(base.map((tag) => [tag.id, tag]))

  for (const tag of base) {
    if (!tag.parentId) continue

    const parent = byId.get(tag.parentId)
    if (!parent) continue

    tag.parentLabel = getTagLabel(parent)
    tag.parentKind = String(parent?.kind || '')
    tag.parentSlug = String(parent?.slug || '')

    parent.childrenIds.push(tag.id)
    parent.children.push(buildTagUiChild(tag))
  }

  return base.map((tag) => ({
    ...tag,
    childrenIds: Array.from(new Set(tag.childrenIds)),
    children: [...tag.children].sort(sortTagsByOrderAndLabel),
  }))
}

export function buildCoreIndexes(merged, { gameStatsShorts = [] } = {}) {
  const {
    clubs = [],
    teamsBase = [],
    playersBase = [],
    meetingsBase = [],
    paymentsBase = [],

    gamesBase = [],
    externalGamesBase = [],
    allGamesBase = [],

    rolesBase = [],
    videosBase = [],
    videoAnalysisBase = [],
    tagsBase = [],
  } = merged

  const clubById = new Map(clubs.map((club) => [safeId(club.id), club]))
  const teamBaseById = new Map(teamsBase.map((team) => [safeId(team.id), team]))
  const playerBaseById = new Map(playersBase.map((player) => [safeId(player.id), player]))
  const meetingsById = new Map(meetingsBase.map((meeting) => [safeId(meeting.id), meeting]))
  const paymentsById = new Map(paymentsBase.map((payment) => [safeId(payment.id), payment]))

  const normalizedGamesBase = safeArr(gamesBase)
  const normalizedExternalGamesBase = safeArr(externalGamesBase)
  const normalizedAllGamesBase =
    allGamesBase?.length > 0
      ? safeArr(allGamesBase)
      : uniqById([...normalizedGamesBase, ...normalizedExternalGamesBase])

  const gamesWithStats = normalizedAllGamesBase

  const teamGamesByTeamId = buildGamesByTeamId(normalizedGamesBase)
  const externalGamesByPlayerId = buildGamesByPlayerId(normalizedExternalGamesBase)
  const allGamesByPlayerId = buildGamesByPlayerId(normalizedAllGamesBase)

  const trainingWeeksByTeamId = buildTrainingWeeksByTeamId(teamsBase)
  const teamMeetingsByTeamId = buildMeetingsByTeamId(teamsBase)

  const videosByMeetingId = buildVideosByMeetingId(videoAnalysisBase)
  const videosByPlayerId = buildVideosByPlayerId(videoAnalysisBase, meetingsById)
  const videosByTeamId = buildVideosByTeamId(videoAnalysisBase, meetingsById)

  const roles = buildRolesWithEntities(rolesBase, clubById, teamBaseById)
  const rolesByClubId = buildRolesByClubId(roles)
  const rolesByTeamId = buildRolesByTeamId(roles)

  const meetingsByPlayerId = buildMeetingsByPlayerId(meetingsBase)
  const paymentsIdsByPlayerId = buildPaymentIdsByPlayerId(paymentsBase)

  const tagUseCountById = buildTagUseCountMap([
    ...videoAnalysisBase,
    ...videosBase,
  ])

  const rawTags = safeArr(tagsBase)
    .map((tag) => ({
      ...tag,
      id: String(tag?.id || ''),
      slug: String(tag?.slug || ''),
      tagType: String(tag?.tagType || ''),
      kind: String(tag?.kind || ''),
      label: getTagLabel(tag),
      isActive: tag?.isActive !== false,
      parentId: tag?.parentId ? String(tag.parentId) : null,
      useCount: safeNum(tagUseCountById.get(String(tag?.id || ''))),
      order: Number.isFinite(Number(tag?.order)) ? Number(tag.order) : 0,
    }))
    .filter((tag) => Boolean(tag.id))

  const tags = buildTagsHierarchy(rawTags)

  return {
    clubById,
    teamBaseById,
    playerBaseById,
    meetingsById,
    paymentsById,

    gamesWithStats,
    teamGamesByTeamId,
    externalGamesByPlayerId,
    allGamesByPlayerId,

    trainingWeeksByTeamId,
    teamMeetingsByTeamId,

    videosByMeetingId,
    videosByPlayerId,
    videosByTeamId,

    roles,
    rolesByClubId,
    rolesByTeamId,

    meetingsByPlayerId,
    paymentsIdsByPlayerId,

    tags,
  }
}
