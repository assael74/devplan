// preview/PreviewDomainCard/domains/team/videos/teamVideos.domain.logic.js

import { DOMAIN_STATE, getDomainState } from '../../../../../preview.state'
import { getFullDateIl } from '../../../../../../../../../../shared/format/dateUtiles.js'
import { buildVideoInsights } from '../../../../../../../../../../shared/videoAnalysis/insights/videoInsights.build.js'
import { VIDEO_INSIGHTS_DEFAULT_TAG_TYPE } from '../../../../../../../../../../shared/videoAnalysis/insights/videoInsights.constants.js'
import { buildTagsByIdObject, getVideoType } from '../../../../../../../../../../shared/videoAnalysis/insights/videoInsights.helpers.js'
import { resolveVideoMonthKey } from '../../../../../../../../../../shared/videoAnalysis/insights/videoInsights.months.js'

const safe = (v) => (v == null ? '' : String(v))
const asArr = (v) => (Array.isArray(v) ? v : [])
const norm = (v) => safe(v).trim().toLowerCase()
const hasText = (v) => safe(v).trim().length > 0

const normalizeIds = (v) => {
  if (Array.isArray(v)) return v.map((x) => safe(x)).filter(Boolean)
  const id = safe(v)
  return id ? [id] : []
}

export const getMonthKey = (video) => resolveVideoMonthKey(video)

export const getMonthLabel = (key) => {
  const [yy, mm] = safe(key).split('-')
  const y = Number(yy)
  const m = Number(mm)

  if (!y || !m) return 'כל החודשים'
  return `${String(m).padStart(2, '0')}/${y}`
}

const pickVideoDate = (video) =>
  safe(video?.videoDate || video?.date || video?.createdAt || video?.meetingDate || video?.ts)

const pickVideoUrl = (video) => safe(video?.link || video?.videoUrl)

const pickVideoTitle = (video) => safe(video?.name || video?.title || 'קטע וידאו')

const pickVideoNotes = (video) => safe(video?.notes)

const pickPlayerId = (player) => safe(player?.id || player?.playerId)

const pickVideoPlayerId = (video) => {
  const single = safe(video?.playerId)
  if (single) return single

  const many = asArr(video?.playerIds)
  return safe(many[0])
}

const pickPlayerName = (player) => {
  const first = safe(player?.playerFirstName || player?.firstName)
  const last = safe(player?.playerLastName || player?.lastName)
  const full = `${first} ${last}`.trim()

  return full || safe(player?.fullName || player?.name || player?.id)
}

const pickKeyIds = (team) => {
  const arr = asArr(team?.keyPlayers)
  return new Set(arr.map((x) => safe(x?.id || x?.playerId)).filter(Boolean))
}

const collectTagsFromVideos = (videos) => {
  const pool = []

  for (const video of videos || []) {
    const tagsFull = asArr(video?.tagsFull)
    for (const tag of tagsFull) {
      if (tag) pool.push(tag)
    }
  }

  return pool
}

const uniqTags = (tags) => {
  const byKey = new Map()

  for (const tag of tags || []) {
    if (!tag) continue

    const id = safe(tag?.id || tag?.tagId)
    const slug = safe(tag?.slug)
    const key = id || slug

    if (!key) continue
    if (!byKey.has(key)) byKey.set(key, tag)
  }

  return Array.from(byKey.values())
}

const getTagIdsFromVideo = (video) => {
  const raw = video?.tagIds ?? video?.tags
  return normalizeIds(raw)
}

const resolveTagsFullForVideo = (video, tagsById = {}) => {
  const pre = asArr(video?.tagsFull).filter(Boolean).filter((t) => t?.isActive !== false)
  if (pre.length) return pre

  const ids = getTagIdsFromVideo(video)
  if (!ids.length) return []

  return ids
    .map((id) => tagsById[String(id)] || null)
    .filter(Boolean)
    .filter((t) => t?.isActive !== false)
}

const getSeasonStartYear = (team, videos = []) => {
  const direct =
    Number(team?.seasonStartYear) ||
    Number(team?.season?.startYear) ||
    Number(team?.seasonStart)

  if (direct) return direct

  const monthKeys = asArr(videos)
    .map((video) => getMonthKey(video))
    .filter(Boolean)
    .sort()

  if (!monthKeys.length) return null

  const firstKey = monthKeys[0]
  const [yearStr, monthStr] = firstKey.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)

  if (!year || !month) return null
  return month >= 8 ? year : year - 1
}

const buildRecentActivity = (monthlyActivity = [], limit = 2) => {
  return asArr(monthlyActivity)
    .filter((item) => item?.hasActivity)
    .slice(-limit)
    .reverse()
    .map((item) => ({
      key: item.monthKey,
      label: item.monthLabel,
      count: Number(item.totalVideos || 0),
      analysis: Number(item.analysisVideos || 0),
      meeting: Number(item.meetingVideos || 0),
    }))
}

function pickAssignmentType(video) {
  const contextType = norm(video?.contextType)
  const videoType = getVideoType(video)

  if (contextType === 'entity') return 'entity'
  if (videoType === 'meeting') return 'meeting'
  return 'none'
}

function pickAssignmentText(video) {
  const type = pickAssignmentType(video)

  if (type === 'entity') return 'ניתוח קבוצה'

  if (type === 'meeting') {
    const rawMeetingDate = safe(video?.meetingDate || video?.date || '')
    return rawMeetingDate
      ? `פגישה בתאריך ${getFullDateIl(rawMeetingDate)}`
      : 'פגישה'
  }

  return 'ללא שיוך'
}

export function resolveTeamVideosDomain(entity, filters = {}, deps = {}) {
  const team = entity || null
  const videosAll = asArr(team?.videos)

  const state = team == null ? DOMAIN_STATE.PARTIAL : getDomainState({ count: videosAll.length, isLocked: false, isStale: false })

  const passedTags = asArr(deps?.tags)
  const passedSeasonStartYear = Number(deps?.seasonStartYear) || null
  const tagType = deps?.tagType || VIDEO_INSIGHTS_DEFAULT_TAG_TYPE

  const f = {
    q: hasText(filters.q) ? safe(filters.q) : '',
    month: hasText(filters.month) ? safe(filters.month) : '',
    onlyTagged: filters.onlyTagged === true || filters.onlyTagged === 'true',
    onlyKey: filters.onlyKey === true || filters.onlyKey === 'true',
  }

  const qn = norm(f.q)
  const keySet = pickKeyIds(team)

  const fallbackTags = uniqTags(collectTagsFromVideos(videosAll))
  const tagsArr = passedTags.length ? passedTags : fallbackTags
  const tagsById = buildTagsByIdObject(tagsArr)

  const playersById = new Map()
  for (const player of asArr(team?.players)) {
    const pid = pickPlayerId(player)
    if (pid) playersById.set(pid, player)
  }

  const videosFiltered = videosAll.filter((video) => {
    if (!video) return false

    const monthKey = getMonthKey(video)
    const tagIds = getTagIdsFromVideo(video)
    const playerId = pickVideoPlayerId(video)
    const player = playerId ? playersById.get(playerId) || null : null
    const playerName = player ? pickPlayerName(player) : ''

    if (f.month && monthKey !== f.month) return false
    if (f.onlyTagged && !tagIds.length) return false
    if (f.onlyKey && (!playerId || !keySet.has(playerId))) return false

    if (!qn) return true

    const title = norm(pickVideoTitle(video))
    const notes = norm(pickVideoNotes(video))
    const dateText = norm(getFullDateIl(pickVideoDate(video)))
    const monthText = norm(getMonthLabel(monthKey))
    const pName = norm(playerName)

    return (
      title.includes(qn) ||
      notes.includes(qn) ||
      pName.includes(qn) ||
      dateText.includes(qn) ||
      monthText.includes(qn)
    )
  })

  const playerIdsWithVideos = new Set()
  const keyPlayersUsed = new Set()

  const videos = videosFiltered
    .slice()
    .sort((a, b) => pickVideoDate(b).localeCompare(pickVideoDate(a)))
    .map((video) => {
      const playerId = pickVideoPlayerId(video)
      const player = playerId ? playersById.get(playerId) || null : null
      const isKey = playerId ? keySet.has(playerId) : false
      const date = pickVideoDate(video)
      const monthKey = getMonthKey(video)
      const tagIds = getTagIdsFromVideo(video)
      const hasNotes = !!safe(video?.notes).trim()
      const tagsFull = resolveTagsFullForVideo(video, tagsById)

      if (playerId) {
        playerIdsWithVideos.add(playerId)
        if (isKey) keyPlayersUsed.add(playerId)
      }

      return {
        id: video?.id,
        ...video,
        date,
        dateLabel: date ? getFullDateIl(date) : '—',
        monthKey,
        monthLabel: monthKey ? getMonthLabel(monthKey) : '—',
        player,
        playerId,
        playerName: player ? pickPlayerName(player) : 'ללא שיוך שחקן',
        isKey,
        videoUrl: pickVideoUrl(video),
        hasLink: !!pickVideoUrl(video),
        tagIds,
        hasNotes,
        tagsFull,
        tagsCount: tagIds.length,
        assignmentType: pickAssignmentType(video),
        assignmentText: pickAssignmentText(video),
        videoType: getVideoType(video),
      }
    })

  const seasonStartYear = deps?.seasonStartYear

  const insights = buildVideoInsights({
    videos,
    tags: tagsArr,
    seasonStartYear: seasonStartYear,
  })

  const taggedVideos = videos.filter((x) => x.tagsCount > 0).length
  const untaggedVideos = videos.length - taggedVideos

  const summary = {
    totalVideos: videos.length,
    totalVideosAll: videosAll.length,
    taggedVideos,
    untaggedVideos,
    playersWithVideos: playerIdsWithVideos.size,
    keyPlayersWithVideos: keyPlayersUsed.size,

    seasonStartYear,
    tagsCount: tagsArr.length,
    insights,

    analysisVideos: insights?.totals?.analysisVideos || 0,
    meetingVideos: insights?.totals?.meetingVideos || 0,
    activeMonths: insights?.totals?.activeMonths || 0,
    totalCategories: insights?.totals?.totalCategories || 0,
    totalTopics: insights?.totals?.totalTopics || 0,

    seasonMonths: insights?.pace?.seasonMonths || 0,
    avgVideosPerMonth: insights?.pace?.avgVideosPerMonth || 0,
    avgAnalysisPerMonth: insights?.pace?.avgAnalysisPerMonth || 0,
    avgMeetingsPerMonth: insights?.pace?.avgMeetingsPerMonth || 0,
    avgVideosPerActiveMonth: insights?.pace?.avgVideosPerActiveMonth || 0,

    topCategories: asArr(insights?.topCategories),
    topTopics: asArr(insights?.topTopics),
    monthlyActivity: asArr(insights?.monthlyActivity),
  }

  const options = {
    months: Array.from(new Set(videosAll.map(getMonthKey).filter(Boolean))).sort().reverse(),
  }

  return {
    state,
    filters: f,
    options,
    summary,
    videos,
  }
}
