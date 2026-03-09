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

  const tags = tagsBase
    .map((tag) => ({
      ...tag,
      id: String(tag?.id || ''),
      slug: String(tag?.slug || ''),
      tagType: String(tag?.tagType || ''),
      isActive: tag?.isActive !== false,
      parentId: tag?.parentId ? String(tag.parentId) : null,
      useCount: safeNum(tagUseCountById.get(String(tag?.id || ''))),
      order: Number.isFinite(Number(tag?.order)) ? Number(tag.order) : 0,
    }))
    .filter((tag) => Boolean(tag.id))

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
