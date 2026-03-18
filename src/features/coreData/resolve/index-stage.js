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
 import {
   buildGamesWithStats,
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
   buildGamesByTeamId
 } from '../resolvers/builders'

const safeId = (v) => (v == null ? '' : String(v))
const safeNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const buildTagUseCountMap = (videosArr = []) => {
  const counts = new Map()

  for (const video of videosArr) {
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
  const base = tags.map((tag) => ({
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
    meetingsBase = [],
    paymentsBase = [],
    gamesBase = [],
    rolesBase = [],
    videosBase = [],
    videoAnalysisBase = [],
    tagsBase = [],
  } = merged

  const clubById = new Map(clubs.map((club) => [safeId(club.id), club]))
  const teamBaseById = new Map(teamsBase.map((team) => [safeId(team.id), team]))
  const meetingsById = new Map(meetingsBase.map((meeting) => [safeId(meeting.id), meeting]))
  const paymentsById = new Map(paymentsBase.map((payment) => [safeId(payment.id), payment]))

  const gamesWithStats = gamesBase
  const teamGamesByTeamId = buildGamesByTeamId(gamesBase)
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

  const rawTags = tagsBase
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
    meetingsById,
    paymentsById,
    gamesWithStats,
    teamGamesByTeamId,
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
