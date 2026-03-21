import { VIDEO_INSIGHTS_SEASON_MONTHS } from './videoInsights.constants.js'

const safe = (v) => (v == null ? '' : String(v))
const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export const pad2 = (v) => String(v).padStart(2, '0')

export const buildSeasonMonths = (seasonStartYear) => {
  const year = toNum(seasonStartYear)
  if (!year) return []

  return VIDEO_INSIGHTS_SEASON_MONTHS.map((month, index) => {
    const actualYear = month >= 9 ? year : year + 1
    const monthKey = `${actualYear}-${pad2(month)}`
    
    return {
      index,
      order: index + 1,
      month,
      year: actualYear,
      monthKey,
      monthLabel: `${pad2(month)}/${actualYear}`,
    }
  })
}

export const buildSeasonMonthMap = (seasonStartYear) => {
  const months = buildSeasonMonths(seasonStartYear)
  return new Map(months.map((item) => [item.monthKey, item]))
}

export const getMonthKeyFromDateLike = (value) => {
  if (!value) return ''

  if (typeof value?.toDate === 'function') {
    const d = value.toDate()
    if (Number.isNaN(d.getTime())) return ''
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`
  }

  const raw = safe(value).trim()
  if (!raw) return ''

  if (/^\d{4}-\d{2}$/.test(raw)) return raw
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 7)

  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return ''

  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`
}

export const resolveVideoMonthKey = (video) => {
  const monthKey = safe(video?.monthKey).trim()
  if (monthKey) return monthKey

  const ym = safe(video?.ym).trim()
  if (ym) return ym

  const year = Number(video?.year)
  const month = Number(video?.month)
  if (year && month) return `${year}-${pad2(month)}`

  return (
    getMonthKeyFromDateLike(video?.date) ||
    getMonthKeyFromDateLike(video?.videoDate) ||
    getMonthKeyFromDateLike(video?.createdAt) ||
    getMonthKeyFromDateLike(video?.created) ||
    getMonthKeyFromDateLike(video?.updatedAt)
  )
}

export const resolveVideoMonthLabel = (video, seasonStartYear) => {
  const monthKey = resolveVideoMonthKey(video)
  if (!monthKey) return ''

  const seasonMap = buildSeasonMonthMap(seasonStartYear)
  const seasonMonth = seasonMap.get(monthKey)
  if (seasonMonth) return seasonMonth.monthLabel

  return safe(video?.monthLabel).trim() || monthKey
}

export const isMonthInSeason = (monthKey, seasonStartYear) => {
  if (!monthKey || !seasonStartYear) return false
  const seasonMap = buildSeasonMonthMap(seasonStartYear)
  return seasonMap.has(monthKey)
}
