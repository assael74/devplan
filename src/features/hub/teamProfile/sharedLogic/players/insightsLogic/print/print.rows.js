// TEAMPROFILE/sharedLogic/players/insightsLogic/print/print.rows.js

import {
  asText,
  formatNumber,
  formatSignedNumber,
} from './print.utils.js'

import {
  getPositionLabel,
  getRoleLabel,
  PROFILE_SORT_ORDER,
} from './print.constants.js'

const emptyArray = []

const arr = value => {
  return Array.isArray(value) ? value : emptyArray
}

export const getRoleId = row => {
  return row?.role || row?.squadRole || 'none'
}

export const getProfileId = row => {
  return row?.scopedInsightId ||
    row?.insightId ||
    row?.profile?.id ||
    'out_of_sample'
}

export const getProfileLabel = row => {
  return row?.scopedInsightLabel ||
    row?.insightLabel ||
    row?.profile?.label ||
    'מחוץ למדגם'
}

export const getRatingValue = row => {
  const rating = Number(row?.ratingRaw)

  return Number.isFinite(rating) ? rating : 0
}

export const getTvaValue = row => {
  const tva = Number(row?.tva)

  return Number.isFinite(tva) ? tva : 0
}

export const getTvaTone = value => {
  const number = Number(value)

  if (!Number.isFinite(number)) return 'neutral'
  if (number > 0) return 'positive'
  if (number < 0) return 'negative'

  return 'neutral'
}

export const isPositiveTva = row => {
  return getTvaValue(row) > 0
}

export const isNegativeTva = row => {
  return getTvaValue(row) < 0
}

export const isOutOfSample = row => {
  return getProfileId(row) === 'out_of_sample' ||
    row?.scopedMissing ||
    Number(row?.games) <= 0
}

const getInitials = value => {
  const text = asText(value, '')
    .trim()
    .replace(/\s+/g, ' ')

  if (!text) return '-'

  return text
    .split(' ')
    .slice(0, 2)
    .map(part => part[0])
    .join('')
}

const getProfileRank = row => {
  const profileId = getProfileId(row)

  return PROFILE_SORT_ORDER[profileId] || 99
}

const getPrintSubStatus = value => {
  const text = asText(value, '')

  if (!text) return ''

  return text
    .replace('יציב, אבל במינוס', 'יציב במינוס')
    .replace('לא נמצא במדגם המשחקים שנבחר', 'לא במדגם')
}

export const sortRows = rows => {
  return arr(rows).slice().sort((a, b) => {
    const profileDiff = getProfileRank(a) - getProfileRank(b)

    if (profileDiff !== 0) {
      return profileDiff
    }

    const tvaDiff = getTvaValue(b) - getTvaValue(a)

    if (tvaDiff !== 0) {
      return tvaDiff
    }

    return getRatingValue(b) - getRatingValue(a)
  })
}

export const buildPrintRow = (row, index) => {
  const name = asText(row.playerFullName)

  return {
    id: row.playerId || row.id || `${name}_${index}`,

    index: index + 1,
    name,
    photo: row.photo,
    initials: getInitials(name),

    roleId: getRoleId(row),
    role: getRoleLabel(getRoleId(row)),
    position: getPositionLabel(row.positionLayer),

    profileId: getProfileId(row),
    profile: asText(getProfileLabel(row)),

    rating: formatNumber({
      value: row.ratingRaw,
      digits: 3,
    }),

    tva: formatSignedNumber({
      value: row.tva,
      digits: 2,
    }),

    tvaTone: getTvaTone(row.tva),

    games: formatNumber({
      value: row.games,
      digits: 0,
    }),

    minutes: formatNumber({
      value: row.minutes,
      digits: 0,
    }),

    goals: formatNumber({
      value: row.goals,
      digits: 0,
    }),

    assists: formatNumber({
      value: row.assists,
      digits: 0,
    }),

    subStatus: getPrintSubStatus(row.subStatus),
  }
}
