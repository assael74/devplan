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

export function buildCoreIndexes(merged) {
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
    videoAnalysisBase = [],
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
  }
}
