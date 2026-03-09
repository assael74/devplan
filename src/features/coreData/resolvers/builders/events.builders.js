import {
  safeArr,
  safeId,
  safeStr,
  toMillis,
  getWeekStartFromDate,
  getWeekEndFromStart,
  buildWeekIdFromStart,
} from '../../utils/data.utils.js'
import { uniqBy } from '../../utils/map.utils.js'

const resolveWeekId = ({ weekId, eventDate, weekStart }) =>
  safeStr(weekId) || buildWeekIdFromStart(weekStart || getWeekStartFromDate(eventDate))

const sortByDateDesc = (arr) =>
  safeArr(arr).slice().sort((a, b) => {
    const at = Number(a?.eventSortTime || a?.weekStart || 0)
    const bt = Number(b?.eventSortTime || b?.weekStart || 0)
    return bt - at
  })

const getMeetingDate = (meeting) =>
  meeting?.meetingDate ||
  meeting?.date ||
  meeting?.createdAt ||
  meeting?.updatedAt ||
  0

const getGameDate = (game) =>
  game?.gameDate ||
  game?.date ||
  game?.gameInfo?.date ||
  game?.createdAt ||
  game?.updatedAt ||
  0

export const normalizeTrainingWeek = (week, { teamId = null } = {}) => {
  const raw = week || {}
  const rawWeekStart =
    raw?.weekStart ||
    raw?.startDate ||
    getWeekStartFromDate(raw?.date || raw?.createdAt || raw?.updatedAt || 0)

  const weekStart = rawWeekStart ? toMillis(rawWeekStart) : 0
  const weekEnd = getWeekEndFromStart(weekStart)
  const weekId = resolveWeekId({
    weekId: raw?.weekId,
    eventDate: raw?.date,
    weekStart,
  })

  return {
    ...raw,
    id: safeId(raw?.id || raw?.weekId || weekId),
    eventType: 'trainingWeek',
    sourceType: 'trainingWeek',
    teamId: safeId(raw?.teamId || teamId),
    weekId,
    weekStart,
    weekEnd,
    weekStatus: safeStr(raw?.status),
    eventDate: weekStart,
    eventSortTime: weekStart,
  }
}

export const normalizeMeetingEvent = (
  meeting,
  { source = 'team', teamId = null, playerId = null } = {}
) => {
  const raw = meeting || {}
  const eventDate = toMillis(getMeetingDate(raw))
  const weekStart = getWeekStartFromDate(eventDate)
  const weekId = resolveWeekId({
    weekId: raw?.weekId,
    eventDate,
    weekStart,
  })

  return {
    ...raw,
    id: safeId(raw?.id),
    eventType: 'meeting',
    sourceType: source === 'personal' ? 'playerMeeting' : 'teamMeeting',
    eventSource: source,
    teamId: safeId(raw?.teamId || teamId),
    playerId: safeId(raw?.playerId || playerId),
    weekId,
    weekStart,
    weekEnd: getWeekEndFromStart(weekStart),
    eventDate,
    eventSortTime: eventDate,
  }
}

export const normalizeGameEvent = (game, { teamId = null } = {}) => {
  const raw = game || {}
  const eventDate = toMillis(getGameDate(raw))
  const weekStart = getWeekStartFromDate(eventDate)
  const weekId = resolveWeekId({
    weekId: raw?.weekId,
    eventDate,
    weekStart,
  })

  return {
    ...raw,
    id: safeId(raw?.id),
    eventType: 'game',
    sourceType: 'teamGame',
    eventSource: 'team',
    teamId: safeId(raw?.teamId || raw?.team?.id || teamId),
    weekId,
    weekStart,
    weekEnd: getWeekEndFromStart(weekStart),
    eventDate,
    eventSortTime: eventDate,
  }
}

const ensureBucket = (map, item, { teamId = null, playerId = null } = {}) => {
  const key = safeStr(item?.weekId)
  if (!key) return null

  if (!map.has(key)) {
    map.set(key, {
      weekId: key,
      weekStart: Number(item?.weekStart || 0),
      weekEnd: Number(item?.weekEnd || 0),
      teamId: safeId(item?.teamId || teamId),
      playerId: safeId(item?.playerId || playerId),
      weekStatus: '',
      trainingWeek: null,
      teamGames: [],
      teamMeetings: [],
      playerMeetings: [],
      events: [],
    })
  }

  const bucket = map.get(key)

  if (item?.eventType === 'trainingWeek') {
    bucket.trainingWeek = item
    bucket.weekStatus = safeStr(item?.weekStatus || item?.status || '')
  } else if (item?.sourceType === 'teamGame') {
    bucket.teamGames.push(item)
  } else if (item?.sourceType === 'teamMeeting') {
    bucket.teamMeetings.push(item)
  } else if (item?.sourceType === 'playerMeeting') {
    bucket.playerMeetings.push(item)
  }

  return bucket
}

const finalizeBucket = (bucket) => {
  const teamGames = sortByDateDesc(uniqBy(bucket.teamGames, (x) => `game__${safeId(x?.id)}`))
  const teamMeetings = sortByDateDesc(uniqBy(bucket.teamMeetings, (x) => `teamMeeting__${safeId(x?.id)}`))
  const playerMeetings = sortByDateDesc(uniqBy(bucket.playerMeetings, (x) => `playerMeeting__${safeId(x?.id)}`))

  const events = sortByDateDesc([
    ...(bucket.trainingWeek ? [bucket.trainingWeek] : []),
    ...teamGames,
    ...teamMeetings,
    ...playerMeetings,
  ])

  return {
    ...bucket,
    teamGames,
    teamMeetings,
    playerMeetings,
    events,
  }
}

export const buildTeamEventsByWeek = ({
  trainingWeeks = [],
  teamMeetings = [],
  teamGames = [],
  teamId = null,
} = {}) => {
  const buckets = new Map()

  for (const item of safeArr(trainingWeeks).map((w) => normalizeTrainingWeek(w, { teamId }))) {
    ensureBucket(buckets, item, { teamId })
  }

  for (const item of safeArr(teamMeetings).map((m) => normalizeMeetingEvent(m, { source: 'team', teamId }))) {
    ensureBucket(buckets, item, { teamId })
  }

  for (const item of safeArr(teamGames).map((g) => normalizeGameEvent(g, { teamId }))) {
    ensureBucket(buckets, item, { teamId })
  }

  return sortByDateDesc(
    Array.from(buckets.values()).map((bucket) => {
      const finalBucket = finalizeBucket(bucket)
      return {
        weekId: finalBucket.weekId,
        weekStart: finalBucket.weekStart,
        weekEnd: finalBucket.weekEnd,
        teamId: finalBucket.teamId,
        weekStatus: finalBucket.weekStatus,
        trainingWeek: finalBucket.trainingWeek,
        teamGames: finalBucket.teamGames,
        teamMeetings: finalBucket.teamMeetings,
        events: finalBucket.events,
      }
    })
  )
}

export const buildPlayerEventsByWeek = ({
  trainingWeeks = [],
  teamMeetings = [],
  teamGames = [],
  playerMeetings = [],
  teamId = null,
  playerId = null,
} = {}) => {
  const buckets = new Map()

  for (const item of safeArr(trainingWeeks).map((w) => normalizeTrainingWeek(w, { teamId }))) {
    ensureBucket(buckets, item, { teamId, playerId })
  }

  for (const item of safeArr(teamMeetings).map((m) =>
    normalizeMeetingEvent(m, { source: 'team', teamId, playerId })
  )) {
    ensureBucket(buckets, item, { teamId, playerId })
  }

  for (const item of safeArr(playerMeetings).map((m) =>
    normalizeMeetingEvent(m, { source: 'personal', teamId, playerId })
  )) {
    ensureBucket(buckets, item, { teamId, playerId })
  }

  for (const item of safeArr(teamGames).map((g) => normalizeGameEvent(g, { teamId }))) {
    ensureBucket(buckets, item, { teamId, playerId })
  }

  return sortByDateDesc(
    Array.from(buckets.values()).map((bucket) => {
      const finalBucket = finalizeBucket(bucket)
      return {
        weekId: finalBucket.weekId,
        weekStart: finalBucket.weekStart,
        weekEnd: finalBucket.weekEnd,
        teamId: finalBucket.teamId,
        playerId: finalBucket.playerId,
        weekStatus: finalBucket.weekStatus,
        trainingWeek: finalBucket.trainingWeek,
        teamGames: finalBucket.teamGames,
        teamMeetings: finalBucket.teamMeetings,
        playerMeetings: finalBucket.playerMeetings,
        events: finalBucket.events,
      }
    })
  )
}
