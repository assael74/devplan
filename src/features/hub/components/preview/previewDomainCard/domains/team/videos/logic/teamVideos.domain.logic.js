// preview/PreviewDomainCard/domains/team/videos/teamVideos.domain.logic.js

import { DOMAIN_STATE, getDomainState } from '../../../../preview.state'
import { getFullDateIl } from '../../../../../../../../shared/format/dateUtiles.js'

const safe = (v) => (v == null ? '' : String(v))
const asArr = (v) => (Array.isArray(v) ? v : [])
const norm = (v) => safe(v).trim().toLowerCase()
const hasText = (v) => safe(v).trim().length > 0

const normalizeIds = (v) => {
  if (Array.isArray(v)) return v.map((x) => safe(x)).filter(Boolean)
  const id = safe(v)
  return id ? [id] : []
}

export const getMonthKey = (v) => {
  const y = String(v?.year || '').padStart(4, '0')
  const m = String(v?.month || '').padStart(2, '0')

  if (y !== '0000' && m !== '00') return `${y}-${m}`

  const raw = v?.videoDate || v?.date || v?.createdAt || v?.meetingDate || v?.ts
  if (!raw) return ''

  const dt = new Date(raw)
  if (Number.isNaN(dt.getTime())) {
    const s = safe(raw)
    return s.length >= 7 ? s.slice(0, 7) : ''
  }

  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
}

export const getMonthLabel = (key) => {
  const [yy, mm] = safe(key).split('-')
  const y = Number(yy)
  const m = Number(mm)

  if (!y || !m) return 'כל החודשים'
  return `${String(m).padStart(2, '0')}/${y}`
}

const pickVideoDate = (video) =>
  safe(video?.videoDate || video?.date || video?.createdAt || video?.meetingDate || video?.ts)

const pickVideoUrl = (video) =>
  safe(video?.videoUrl || video?.url || video?.vLink || video?.link)

const pickVideoTitle = (video) =>
  safe(video?.title || video?.videoTitle || video?.name || 'קטע וידאו')

const pickVideoNotes = (video) =>
  safe(video?.notes || video?.videoNotes || video?.description)

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

const buildTagsMap = (tagsArr) => {
  const map = new Map()

  for (const tag of tagsArr || []) {
    if (!tag) continue

    const id = safe(tag?.id || tag?.tagId)
    const slug = safe(tag?.slug)

    if (id) map.set(id, tag)
    if (slug) map.set(slug, tag)
  }

  return map
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

const resolveTagsFullForVideo = (video, tagsMap) => {
  const pre = asArr(video?.tagsFull).filter(Boolean).filter((t) => t?.isActive !== false)
  if (pre.length) return pre

  const ids = getTagIdsFromVideo(video)
  if (!ids.length || !tagsMap) return []

  return ids
    .map((id) => tagsMap.get(safe(id)) || null)
    .filter(Boolean)
    .filter((t) => t?.isActive !== false)
}

const buildTagCounters = (videos, tagsMap) => {
  const counts = new Map()

  for (const video of videos || []) {
    const ids = getTagIdsFromVideo(video)

    for (const id of ids) {
      const tagId = safe(id)
      if (!tagId) continue

      const model = tagsMap ? tagsMap.get(tagId) : null
      if (model?.isActive === false) continue

      counts.set(tagId, (counts.get(tagId) || 0) + 1)
    }
  }

  return counts
}

const topTagModels = (countsMap, tagsMap, limit = 4) =>
  Array.from(countsMap.entries())
    .map(([id, count]) => ({
      id,
      count,
      tag: tagsMap ? tagsMap.get(id) || null : null,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)

export function resolveTeamVideosDomain(entity, filters = {}, deps = {}) {
  const team = entity || null
  const videosAll = asArr(team?.videos)

  const state =
    team == null
      ? DOMAIN_STATE.PARTIAL
      : getDomainState({
          count: videosAll.length,
          isLocked: false,
          isStale: false,
        })

  const f = {
    q: hasText(filters.q) ? safe(filters.q) : '',
    month: hasText(filters.month) ? safe(filters.month) : '',
    onlyTagged: filters.onlyTagged === true || filters.onlyTagged === 'true',
    onlyKey: filters.onlyKey === true || filters.onlyKey === 'true',
  }

  const qn = norm(f.q)
  const keySet = pickKeyIds(team)

  const depTags = asArr(deps?.tags)
  const fallbackTags = uniqTags(collectTagsFromVideos(videosAll))
  const tagsArr = depTags.length ? depTags : fallbackTags
  const tagsMap = tagsArr.length ? buildTagsMap(tagsArr) : null

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

  const tagCountsAll = buildTagCounters(videosFiltered, tagsMap)
  const topTagsAll = topTagModels(tagCountsAll, tagsMap, 4)

  const playerIdsWithVideos = new Set()
  let keyPlayersWithVideos = 0

  const keyPlayersUsed = new Set()

  const videos = videosFiltered
    .slice()
    .sort((a, b) => pickVideoDate(b).localeCompare(pickVideoDate(a)))
    .map((video, index) => {
      const playerId = pickVideoPlayerId(video)
      const player = playerId ? playersById.get(playerId) || null : null
      const isKey = playerId ? keySet.has(playerId) : false
      const date = pickVideoDate(video)
      const monthKey = getMonthKey(video)
      const tagIds = getTagIdsFromVideo(video)

      if (playerId) {
        playerIdsWithVideos.add(playerId)
        if (isKey && !keyPlayersUsed.has(playerId)) {
          keyPlayersUsed.add(playerId)
          keyPlayersWithVideos += 1
        }
      }

      return {
        id:
          safe(video?.id) ||
          `${pickVideoUrl(video)}_${date}_${index}`,
        video,
        title: pickVideoTitle(video),
        notes: pickVideoNotes(video),
        date,
        dateLabel: date ? getFullDateIl(date) : '—',
        month: monthKey,
        monthLabel: monthKey ? getMonthLabel(monthKey) : '—',
        player,
        playerId,
        playerName: player ? pickPlayerName(player) : 'ללא שיוך שחקן',
        isKey,
        videoUrl: pickVideoUrl(video),
        hasLink: !!pickVideoUrl(video),
        tagIds,
        tagsFull: resolveTagsFullForVideo(video, tagsMap),
        tagsCount: tagIds.length,
      }
    })

  const summary = {
    totalVideos: videos.length,
    totalVideosAll: videosAll.length,
    playersWithVideos: playerIdsWithVideos.size,
    keyPlayersWithVideos,
    taggedVideos: videos.filter((x) => x.tagsCount > 0).length,
    untaggedVideos: videos.filter((x) => x.tagsCount === 0).length,
    monthsCount: new Set(videos.map((x) => x.month).filter(Boolean)).size,
    topTagsAll,
    month: f.month || '',
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
