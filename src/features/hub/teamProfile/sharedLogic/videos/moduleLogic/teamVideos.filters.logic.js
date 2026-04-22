// teamProfile/sharedLogic/videos/moduleLogic/teamVideos.filters.logic.js

import { getFullDateIl } from '../../../../../../shared/format/dateUtiles.js'

const safe = (v) => (v == null ? '' : String(v))
const asArr = (v) => (Array.isArray(v) ? v : [])
const norm = (v) => safe(v).trim().toLowerCase()

const MONTHS_HE = {
  1: 'ינואר',
  2: 'פברואר',
  3: 'מרץ',
  4: 'אפריל',
  5: 'מאי',
  6: 'יוני',
  7: 'יולי',
  8: 'אוגוסט',
  9: 'ספטמבר',
  10: 'אוקטובר',
  11: 'נובמבר',
  12: 'דצמבר',
}

export const VIDEO_SCOPE_OPTIONS = [
  { id: 'all', label: 'כל הסוגים', count: 0 },
  { id: 'analysis', label: 'ניתוחי וידאו', count: 0 },
  { id: 'meeting', label: 'מפגשי וידאו', count: 0 },
]

export const createInitialTeamVideosFilters = () => ({
  search: '',
  periodKey: '',
  scope: 'all',
  categoryKey: '',
  topicKey: '',
})

const getVideoDateRaw = (video) =>
  safe(video?.videoDate || video?.date || video?.createdAt || video?.meetingDate || video?.ts)

const getVideoName = (video) => safe(video?.name)
const getVideoNotes = (video) => safe(video?.notes)

const getMonthKeyFromDate = (raw) => {
  if (!raw) return ''

  const s = safe(raw)

  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
    const [, mm, yyyy] = s.split('-')
    return `${yyyy}-${mm}`
  }

  const dt = new Date(raw)
  if (!Number.isNaN(dt.getTime())) {
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
  }

  return s.length >= 7 ? s.slice(0, 7) : ''
}

export const getVideoMonthKey = (video) => {
  const year = Number(video?.year || 0)
  const month = Number(video?.month || 0)

  if (year && month) {
    return `${year}-${String(month).padStart(2, '0')}`
  }

  return getMonthKeyFromDate(getVideoDateRaw(video))
}

export const getMonthKeyLabel = (monthKey) => {
  const [yy, mm] = safe(monthKey).split('-')
  const y = Number(yy)
  const m = Number(mm)

  if (!y || !m) return 'כל החודשים'
  return `${MONTHS_HE[m] || String(m).padStart(2, '0')} ${y}`
}

export const buildSeasonMonthOptions = (videos = [], preferredYear) => {
  const monthKeysFromData = asArr(videos).map(getVideoMonthKey).filter(Boolean)

  const years = monthKeysFromData
    .map((key) => Number(key.split('-')[0]))
    .filter(Boolean)

  const baseYear =
    Number(preferredYear) ||
    (years.length ? Math.max(...years) : new Date().getFullYear())

  const seasonMonths = [
    `${baseYear}-08`,
    `${baseYear}-09`,
    `${baseYear}-10`,
    `${baseYear}-11`,
    `${baseYear}-12`,
    `${baseYear + 1}-01`,
    `${baseYear + 1}-02`,
    `${baseYear + 1}-03`,
    `${baseYear + 1}-04`,
  ]

  const counts = new Map()
  for (const key of monthKeysFromData) {
    counts.set(key, (counts.get(key) || 0) + 1)
  }

  return seasonMonths.map((key) => ({
    id: key,
    value: key,
    label: getMonthKeyLabel(key),
    count: counts.get(key) || 0,
  }))
}

const getVideoScope = (video) => {
  const raw = norm(video?.contextType)
  if (raw === 'meeting') return 'meeting'
  if (raw === 'entity') return 'analysis'
  return 'analysis'
}

const normalizeTagModel = (tag) => {
  if (!tag) return null

  const id = safe(tag?.id || tag?.tagId || tag?.slug)
  if (!id) return null

  const parentId = safe(tag?.parentId || '')

  const rawKind = norm(tag?.kind || '')
  const rawType = norm(tag?.type || tag?.tagType || '')

  let resolvedType = 'topic'

  if (rawKind === 'group') resolvedType = 'category'
  else if (rawKind === 'tag') resolvedType = 'topic'
  else if (rawType === 'category') resolvedType = 'category'
  else if (rawType === 'topic') resolvedType = 'topic'
  else resolvedType = parentId ? 'topic' : 'category'

  return {
    id,
    slug: safe(tag?.slug),
    label: safe(tag?.label || tag?.labelH || tag?.name || tag?.title || tag?.tagName || id),
    type: resolvedType,
    kind: rawKind,
    parentId,
    isActive: tag?.isActive !== false,
    raw: tag,
  }
}

const buildTagsMap = (tags = []) => {
  const map = new Map()

  for (const item of tags) {
    const tag = normalizeTagModel(item)
    if (!tag || !tag.isActive) continue

    map.set(tag.id, tag)
    if (tag.slug) map.set(tag.slug, tag)
  }

  return map
}

const getVideoTagIds = (video) => {
  const raw = video?.tagIds ?? video?.tags

  if (Array.isArray(raw)) return raw.map((x) => safe(x)).filter(Boolean)

  const one = safe(raw)
  return one ? [one] : []
}

const resolveVideoTagsFull = (video, tagsMap) => {
  const full = asArr(video?.tagsFull)
    .map((item) => {
      const normalized = normalizeTagModel(item)
      if (!normalized) return null

      return tagsMap.get(normalized.id) || normalized
    })
    .filter(Boolean)
    .filter((x) => x.isActive)

  if (full.length) return full

  const ids = getVideoTagIds(video)
  if (!ids.length || !tagsMap) return []

  return ids
    .map((id) => tagsMap.get(id) || null)
    .filter(Boolean)
    .filter((x) => x.isActive)
}

const collectUnifiedTagOptions = (videos = [], depsTags = []) => {
  const map = new Map()

  for (const item of depsTags) {
    const tag = normalizeTagModel(item)
    if (!tag || !tag.isActive) continue
    map.set(tag.id, tag)
  }

  for (const video of videos) {
    for (const item of asArr(video?.tagsFull)) {
      const tag = normalizeTagModel(item)
      if (!tag || !tag.isActive) continue

      if (!map.has(tag.id)) {
        map.set(tag.id, tag)
      }
    }
  }

  return Array.from(map.values())
}

const buildTagFilterOptions = (videos = [], allTags = []) => {
  const categoryCounts = new Map()
  const topicCounts = new Map()
  const allTagsById = new Map(allTags.map((t) => [t.id, t]))

  for (const video of videos) {
    const videoTags = asArr(video?.resolvedTagsFull)
    const usedCategories = new Set()
    const usedTopics = new Set()

    for (const tag of videoTags) {
      const id = safe(tag?.id)
      const parentId = safe(tag?.parentId)
      const type = norm(tag?.type)

      if (type === 'category') {
        if (id) usedCategories.add(id)
        continue
      }

      if (id) usedTopics.add(id)
      if (parentId) usedCategories.add(parentId)
    }

    for (const id of usedCategories) {
      categoryCounts.set(id, (categoryCounts.get(id) || 0) + 1)
    }

    for (const id of usedTopics) {
      topicCounts.set(id, (topicCounts.get(id) || 0) + 1)
    }
  }

  const categoryOptions = allTags
    .filter((tag) => norm(tag.type) === 'category')
    .map((tag) => ({
      id: tag.id,
      value: tag.id,
      type: 'category',
      label: tag.label,
      count: categoryCounts.get(tag.id) || 0,
      raw: tag.raw,
    }))
    .filter((tag) => tag.count > 0)
    .sort((a, b) => a.label.localeCompare(b.label, 'he'))

  const topicOptions = allTags
    .filter((tag) => norm(tag.type) !== 'category')
    .map((tag) => ({
      id: tag.id,
      value: tag.id,
      type: 'topic',
      label: tag.label,
      count: topicCounts.get(tag.id) || 0,
      parentId: tag.parentId || '',
      parentLabel: allTagsById.get(tag.parentId)?.label || '',
      raw: tag.raw,
    }))
    .filter((tag) => tag.count > 0)
    .sort((a, b) => a.label.localeCompare(b.label, 'he'))

  return {
    categoryOptions,
    topicOptions,
  }
}

const hasCategoryMatch = (videoTagsFull, categoryKey) => {
  if (!categoryKey) return true
  if (!videoTagsFull.length) return false

  return videoTagsFull.some((tag) => {
    const tagId = safe(tag?.id)
    const parentId = safe(tag?.parentId)
    const type = norm(tag?.type)

    return tagId === categoryKey || parentId === categoryKey || (type === 'category' && tagId === categoryKey)
  })
}

const hasTopicMatch = (videoTagsFull, topicKey) => {
  if (!topicKey) return true
  if (!videoTagsFull.length) return false

  return videoTagsFull.some((tag) => safe(tag?.id) === topicKey)
}

const applyVideosFilters = (videos, filters) => {
  const q = norm(filters?.search)
  const periodKey = safe(filters?.periodKey)
  const scope = safe(filters?.scope || 'all')
  const categoryKey = safe(filters?.categoryKey)
  const topicKey = safe(filters?.topicKey)

  return videos.filter((video) => {
    if (periodKey && video.monthKey !== periodKey) return false
    if (scope !== 'all' && video.scope !== scope) return false
    if (!hasCategoryMatch(video.resolvedTagsFull, categoryKey)) return false
    if (!hasTopicMatch(video.resolvedTagsFull, topicKey)) return false

    if (!q) return true

    const name = norm(video.name)
    const notes = norm(video.notes)

    return name.includes(q) || notes.includes(q)
  })
}

const buildFilterIndicators = ({
  videosAll,
  videosFiltered,
  filters,
  periodOptions,
  scopeOptions,
  categoryOptions,
  topicOptions,
}) => {
  const indicators = []

  const searchValue = safe(filters?.search).trim()
  if (searchValue) {
    indicators.push({
      id: 'search',
      type: 'search',
      label: `חיפוש: ${searchValue}`,
      count: videosFiltered.length,
      value: searchValue,
      idIcon: 'search'
    })
  }

  if (filters?.periodKey) {
    const item = periodOptions.find((x) => x.value === filters.periodKey)
    indicators.push({
      id: 'periodKey',
      type: 'periodKey',
      label: item?.label || getMonthKeyLabel(filters.periodKey),
      count: videosAll.filter((x) => x.monthKey === filters.periodKey).length,
      value: filters.periodKey,
      idIcon: 'meetingDone'
    })
  }

  if (filters?.scope && filters.scope !== 'all') {
    const item = scopeOptions.find((x) => x.id === filters.scope)
    indicators.push({
      id: 'scope',
      type: 'scope',
      label: item?.label || filters.scope,
      count: videosAll.filter((x) => x.scope === filters.scope).length,
      value: filters.scope,
      idIcon: item.id === 'meeting' ? 'meeting' : 'videoAnalysis'
    })
  }

  if (filters?.categoryKey) {
    const item = categoryOptions.find((x) => x.value === filters.categoryKey)
    indicators.push({
      id: 'categoryKey',
      type: 'categoryKey',
      label: `קטגוריה: ${item?.label || ''}`,
      count: item?.count || 0,
      value: filters.categoryKey,
      idIcon: 'parents'
    })
  }

  if (filters?.topicKey) {
    const item = topicOptions.find((x) => x.value === filters.topicKey)
    indicators.push({
      id: 'topicKey',
      type: 'topicKey',
      label: `נושא: ${item?.label || ''}`,
      count: item?.count || 0,
      value: filters.topicKey,
      idIcon: 'children'
    })
  }

  return indicators
}

export function resolveTeamVideosFiltersDomain(entity, filters = {}, deps = {}) {
  const team = entity || {}
  const videosRaw = asArr(team?.videos)
  const normalizedFilters = {
    ...createInitialTeamVideosFilters(),
    ...filters,
  }

  const unifiedTags = collectUnifiedTagOptions(videosRaw, asArr(deps?.tags))
  const tagsMap = buildTagsMap(unifiedTags)

  const videosAll = videosRaw
    .filter(Boolean)
    .map((video) => {
      const monthKey = getVideoMonthKey(video)
      const resolvedTagsFull = resolveVideoTagsFull(video, tagsMap)
      const scope = getVideoScope(video)

      return {
        ...video,
        id: video?.id || '',
        name: getVideoName(video),
        notes: getVideoNotes(video),
        videoDate: getVideoDateRaw(video),
        videoDateLabel: getVideoDateRaw(video) ? getFullDateIl(getVideoDateRaw(video)) : '—',
        monthKey,
        monthLabel: monthKey ? getMonthKeyLabel(monthKey) : '—',
        scope,
        resolvedTagsFull,
        tagsCount: resolvedTagsFull.length,
      }
    })
    .sort((a, b) => safe(b.videoDate).localeCompare(safe(a.videoDate)))

  const periodOptions = buildSeasonMonthOptions(videosAll, deps?.seasonStartYear)

  const scopeOptions = VIDEO_SCOPE_OPTIONS.map((item) => ({
    ...item,
    count:
      item.id === 'all'
        ? videosAll.length
        : videosAll.filter((video) => video.scope === item.id).length,
  }))

  const tagOptionsPayload = buildTagFilterOptions(videosAll, unifiedTags)

  const topicOptionsFiltered = normalizedFilters.categoryKey
    ? tagOptionsPayload.topicOptions.filter((item) => item.parentId === normalizedFilters.categoryKey)
    : tagOptionsPayload.topicOptions

  const videosFiltered = applyVideosFilters(videosAll, normalizedFilters)

  const indicators = buildFilterIndicators({
    videosAll,
    videosFiltered,
    filters: normalizedFilters,
    periodOptions,
    scopeOptions,
    categoryOptions: tagOptionsPayload.categoryOptions,
    topicOptions: tagOptionsPayload.topicOptions,
  })

  const summary = {
    totalVideos: videosAll.length,
    filteredVideos: videosFiltered.length,
    activeFiltersCount: indicators.length,
  }

  return {
    filters: normalizedFilters,
    summary,
    videos: videosFiltered,
    allVideos: videosAll,
    options: {
      periodOptions,
      scopeOptions,
      tagCategoryOptions: tagOptionsPayload.categoryOptions,
      tagTopicOptions: topicOptionsFiltered,
      tagTopicOptionsAll: tagOptionsPayload.topicOptions,
    },
    indicators,
  }
}
