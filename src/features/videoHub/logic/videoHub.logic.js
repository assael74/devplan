// src/features/videoHub/videoHub.logic.js

export const normalizeStr = (v) => String(v ?? '').trim()
const safeId = (v) => (v == null ? '' : String(v))
const safeStr = (v) => (v == null ? '' : String(v))
const normLower = (v) => normalizeStr(v).toLowerCase()

const includesQuery = (text, q) => {
  const query = normLower(q)
  if (!query) return true
  return normLower(text).includes(query)
}

const normalizeToArray = (val) => (Array.isArray(val) ? val : val ? [val] : [])

const extractTagIds = (v) =>
  normalizeToArray(v?.tagIds)
    .flat()
    .map((x) => String(x ?? '').trim())
    .filter(Boolean)

const toPlayerName = (p) =>
  [p?.playerFirstName, p?.playerLastName].filter(Boolean).join(' ').trim()

const toMs = (t) => {
  if (!t) return 0
  if (typeof t === 'number') return t
  if (t?.seconds) return t.seconds * 1000
  if (t?.toMillis) return t.toMillis()
  return Number(t) || 0
}

const getEffectiveTs = (v, sortBy) => {
  if (sortBy === 'createdAt') return toMs(v?.createdAt)
  return toMs(v?.updatedAt) || toMs(v?.createdAt)
}

/* -------------------- SOURCE (GENERAL) -------------------- */

export const deriveSourceFromVideo = (v) => {
  const explicit = normalizeStr(v?.source)
  if (explicit) return explicit

  const link = normLower(v?.link || v?.videoLink || '')
  if (!link) return 'other'

  if (link.includes('youtube.com') || link.includes('youtu.be')) return 'youtube'
  if (link.includes('instagram.com')) return 'instagram'
  if (link.includes('tiktok.com')) return 'tiktok'
  if (link.includes('vimeo.com')) return 'vimeo'
  if (link.includes('drive.google.com') || link.includes('docs.google.com')) return 'drive'
  return 'other'
}

/* -------------------- ANALYSIS -------------------- */

export const enrichVideoAnalysis = (items, context) => {
  const arr = Array.isArray(items) ? items : []

  const clubById =
    context?.clubById instanceof Map
      ? context.clubById
      : new Map((context?.clubs || []).map((c) => [safeId(c.id), c]))

  const teamById =
    context?.teamById instanceof Map
      ? context.teamById
      : new Map((context?.teams || []).map((t) => [safeId(t.id), t]))

  const playerById =
    context?.playerById instanceof Map
      ? context.playerById
      : new Map((context?.players || []).map((p) => [safeId(p.id), p]))

  return arr.map((v) => {
    const team = teamById.get(safeId(v?.teamId)) || null
    const club =
      clubById.get(safeId(v?.clubId)) ||
      clubById.get(safeId(team?.clubId)) ||
      null

    const playerIds = normalizeToArray(v?.playerId)
    const players = playerIds.map((id) => playerById.get(safeId(id))).filter(Boolean)

    const playerName = players.length
      ? players.map(toPlayerName).filter(Boolean).join(' · ')
      : ''

    return {
      ...v,
      teamName: safeStr(v?.teamName) || safeStr(team?.teamName),
      clubName: safeStr(v?.clubName) || safeStr(club?.clubName || club?.name),
      playerName: safeStr(v?.playerName) || playerName,
    }
  })
}

const buildSearchKeyAnalysis = (v) =>
  [
    v?.name,
    v?.title,
    v?.player?.playerFirstName,
    v?.player?.playerLastName,
    v?.team?.teamName,
    v?.player?.team?.teamName,
    v?.player?.club?.clubName,
    v?.team?.club?.clubName,
    v?.meetingDate,
  ]
    .filter(Boolean)
    .join(' ')

const matchTime = (v, f) => {
  if (!f) return true

  const ym = normalizeStr(f.ym)
  if (ym) return normalizeStr(v?.ym) === ym

  const year = f.year != null && f.year !== '' ? Number(f.year) : null
  const month = f.month != null && f.month !== '' ? Number(f.month) : null

  if (year && Number(v?.year) !== year) return false
  if (month && Number(v?.month) !== month) return false

  return true
}

const matchTags = (v, f) => {
  const selected = normalizeToArray(f?.tags)
    .map((x) => String(x ?? '').trim())
    .filter(Boolean)
  if (!selected.length) return true

  const itemTags = extractTagIds(v)
  if (!itemTags.length) return false

  const set = new Set(itemTags)
  return selected.every((id) => set.has(id))
}

const isLinked = (v) =>
  normalizeStr(v?.meetingId) ||
  normalizeStr(v?.playerId) ||
  normalizeStr(v?.teamId) ||
  normalizeStr(v?.clubId)

export const filterVideoAnalysis = (items, filters) => {
  const arr = Array.isArray(items) ? items : []
  const f = filters || {}

  return arr.filter((v) => {
    if (!includesQuery(buildSearchKeyAnalysis(v), f.q)) return false

    if (normalizeStr(f.contextType) && v?.contextType !== f.contextType) return false
    if (normalizeStr(f.objectType) && v?.objectType !== f.objectType) return false

    if (!matchTime(v, f)) return false
    if (!matchTags(v, f)) return false

    if (f.onlyUnlinked && isLinked(v)) return false

    return true
  })
}

export const sortVideoAnalysis = (items, sortBy = 'updatedAt', sortDir = 'desc') => {
  const arr = Array.isArray(items) ? items.slice() : []
  const dir = sortDir === 'asc' ? 1 : -1

  arr.sort((a, b) => {
    if (sortBy === 'name') {
      return (
        dir *
        String(a?.name || a?.title || '').localeCompare(
          String(b?.name || b?.title || ''),
          'he'
        )
      )
    }

    if (sortBy === 'meetingDate') {
      return dir * String(a?.meetingDate || '').localeCompare(String(b?.meetingDate || ''))
    }

    return dir * (getEffectiveTs(a, sortBy) - getEffectiveTs(b, sortBy))
  })

  return arr
}

/* -------------------- GENERAL -------------------- */

const buildSearchKeyGeneral = (v) =>
  [v?.name, v?.title, v?.notes, v?.comment, v?.link, v?.source].filter(Boolean).join(' ')

export const filterVideosGeneral = (items, filters) => {
  const arr = Array.isArray(items) ? items : []
  const f = filters || {}

  const src = normalizeStr(f.source)

  return arr.filter((v) => {
    if (!includesQuery(buildSearchKeyGeneral(v), f.q)) return false
    if (!matchTags(v, f)) return false

    if (src) {
      const vsrc = deriveSourceFromVideo(v)
      if (vsrc !== src) return false
    }

    return true
  })
}

export const sortVideosGeneral = (items, sortBy = 'updatedAt', sortDir = 'desc') => {
  const arr = Array.isArray(items) ? items.slice() : []
  const dir = sortDir === 'asc' ? 1 : -1

  arr.sort((a, b) => {
    if (sortBy === 'name') {
      return dir * String(a?.name || a?.title || '').localeCompare(String(b?.name || b?.title || ''), 'he')
    }
    return dir * (getEffectiveTs(a, sortBy) - getEffectiveTs(b, sortBy))
  })

  return arr
}
