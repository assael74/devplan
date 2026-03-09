// preview/PreviewDomainCard/domains/player/videos/playerVideos.domain.logic.js
import { getFullDateIl } from '../../../../../../../../shared/format/dateUtiles.js'
import { DOMAIN_STATE, getDomainState } from '../../../../preview.state'

const safe = (v) => (v == null ? '' : String(v))
const asArr = (v) => (Array.isArray(v) ? v : [])
const norm = (s) => safe(s).trim().toLowerCase()
const hasText = (v) => safe(v).trim().length > 0

export const getMonthKey = (v) => {
  const y = String(v?.year || '').padStart(4, '0')
  const m = String(v?.month || '').padStart(2, '0')
  if (y && m && y !== '0000' && m !== '00') return `${y}-${m}`
  const d = v?.date || v?.videoDate || v?.createdAt
  if (!d) return 'unknown'
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return 'unknown'
  const yy = String(dt.getFullYear())
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  return `${yy}-${mm}`
}

export const getMonthLabel = (key) => {
  const [yy, mm] = String(key || '').split('-')
  const y = Number(yy)
  const m = Number(mm)
  if (!y || !m) return key || 'לא ידוע'
  const d = new Date(y, m - 1, 1)
  return `${String(m).padStart(2,'0')}/${y}`
}

const normalizeIds = (v) => {
  const pick = (x) => {
    if (x == null) return ''
    if (typeof x === 'string' || typeof x === 'number') return safe(x)
    if (typeof x === 'object') return safe(x?.id || x?.tagId || x?.slug || x?.value || '')
    return ''
  }

  if (Array.isArray(v)) return v.map(pick).filter(Boolean)
  const one = pick(v)
  return one ? [one] : []
}

const getTagIdsFromVideo = (video) => normalizeIds(video?.tagIds ?? video?.tags)

const pickVideoDateKey = (video) => {
  const d = video?.videoDate || video?.createdAt || video?.date || video?.meetingDate || video?.ts || ''
  const s = safe(d)
  return s.length >= 7 ? s.slice(0, 7) : '' // YYYY-MM
}

const buildTagsMap = (tagsArr) => {
  const m = new Map()
  for (const t of tagsArr || []) {
    if (!t) continue
    const id = safe(t?.id || t?.tagId)
    if (id) m.set(id, t)
    const slug = safe(t?.slug)
    if (slug) m.set(slug, t)
  }
  return m
}

// fallback: derive "universe" of full tags from entity.videos[].tagsFull
const collectTagsFromVideos = (videos) => {
  const pool = []
  for (const v of videos || []) {
    const tf = Array.isArray(v?.tagsFull) ? v.tagsFull : []
    for (const t of tf) if (t) pool.push(t)
  }
  return pool
}

const uniqTags = (tags) => {
  const byKey = new Map()
  for (const t of tags || []) {
    if (!t) continue
    const id = safe(t?.id || t?.tagId)
    const slug = safe(t?.slug)
    const key = id || slug
    if (!key) continue
    if (!byKey.has(key)) byKey.set(key, t)
    if (id && !byKey.has(id)) byKey.set(id, t)
    if (slug && !byKey.has(slug)) byKey.set(slug, t)
  }
  return Array.from(new Set(byKey.values()))
}

const resolveTagsFullForVideo = (video, tagsMap) => {
  const pre = Array.isArray(video?.tagsFull) ? video.tagsFull : null
  if (pre && pre.length) return pre.filter(Boolean).filter((t) => t?.isActive !== false)

  const ids = getTagIdsFromVideo(video)
  if (!ids.length || !tagsMap) return []
  return ids
    .map((id) => tagsMap.get(safe(id)) || null)
    .filter(Boolean)
    .filter((t) => t?.isActive !== false)
}

const buildTagCounters = (videos, tagsMap) => {
  const counts = new Map()
  for (const v of videos || []) {
    const ids = getTagIdsFromVideo(v)
    for (const id of ids) {
      const tid = safe(id)
      if (!tid) continue
      if (tagsMap) {
        const t = tagsMap.get(tid)
        if (t && t?.isActive === false) continue
      }
      counts.set(tid, (counts.get(tid) || 0) + 1)
    }
  }
  return counts
}

const topTagModels = (countsMap, tagsMap, limit = 4) => {
  return Array.from(countsMap.entries())
    .map(([id, count]) => ({ id, count, tag: tagsMap ? tagsMap.get(id) || null : null }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function resolvePlayerVideosDomain(entity, filters = {}, deps = {}) {
  const player = entity || null
  const videosAll = asArr(player?.videos)

  const state =
    player == null
      ? DOMAIN_STATE.PARTIAL
      : getDomainState({ count: videosAll.length, isLocked: false, isStale: false })

  const f = {
    q: hasText(filters.q) ? safe(filters.q) : '',
    month: hasText(filters.month) ? safe(filters.month) : '', // YYYY-MM
    onlyTagged: filters.onlyTagged === true || filters.onlyTagged === 'true',
  }

  const qn = norm(f.q)

  // tags: prefer deps.tags; fallback to videos[].tagsFull
  const videoTags = uniqTags(collectTagsFromVideos(videosAll))
  const tagsArr = videoTags
  const tagsMap = tagsArr.length ? buildTagsMap(tagsArr) : null

  const videosFiltered = videosAll.filter((v) => {
    if (!v) return false

    if (f.month) {
      const mk = pickVideoDateKey(v)
      if (mk && mk !== f.month) return false
    }

    if (f.onlyTagged) {
      const ids = getTagIdsFromVideo(v)
      if (!ids.length) return false
    }

    if (!qn) return true
    const title = norm(v?.title || v?.videoTitle || v?.name || '')
    const note = norm(v?.notes || v?.videoNotes || '')
    return title.includes(qn) || note.includes(qn)
  })

  const tagCountsAll = buildTagCounters(videosFiltered, tagsMap)
  const topTagsAll = topTagModels(tagCountsAll, tagsMap, 4)

  const summary = {
    totalVideos: videosFiltered.length,
    totalVideosAll: videosAll.length,
    topTagsAll,
    month: f.month || '',
  }

  // Modal needs “videos” list
  const videos = videosFiltered
    .slice()
    .sort((a, b) => {
      const ad = safe(a?.videoDate || a?.createdAt || a?.date || '')
      const bd = safe(b?.videoDate || b?.createdAt || b?.date || '')
      return bd.localeCompare(ad)
    })
    .map((v) => ({
      id: safe(v?.id) || `${safe(v?.videoUrl || v?.url || '')}_${safe(v?.createdAt || '')}`,
      video: v,
      title: safe(v?.title || v?.videoTitle || v?.name || 'קטע וידאו'),
      date: safe(v?.videoDate || v?.createdAt || v?.date || v?.meetingDate || ''),
      month: pickVideoDateKey(v),
      tagIds: getTagIdsFromVideo(v),
      tagsFull: resolveTagsFullForVideo(v, tagsMap),
    }))

  return {
    state,
    filters: f,
    options: {
      months: Array.from(new Set(videosAll.map(pickVideoDateKey).filter(Boolean))).sort().reverse(),
    },
    summary,
    videos,
  }
}
