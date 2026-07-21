// features/playersDatabase/model/season.model.js

import {
  cleanValue,
  pickFirstValue,
} from './value.model.js'

export const buildSeasonKey = seasonId =>
  cleanValue(seasonId).replace(/[^0-9a-zA-Z]+/g, '_')

export const normalizeSeasonLookupKey = value => {
  const key = cleanValue(value)
  if (!key) return ''

  const fullMatch = key.match(/^20(\d{2})\s*[\/_-]\s*20(\d{2})$/)
  if (fullMatch) return `${fullMatch[1]}/${fullMatch[2]}`

  const shortMatch = key.match(/^(\d{2})\s*[\/_-]\s*(\d{2})$/)
  if (shortMatch) return `${shortMatch[1]}/${shortMatch[2]}`

  return key.replace(/_/g, '/')
}

export const normalizeSeasonIdentity = ({
  season = {},
  fallback = {},
} = {}) => {
  const seasonId = cleanValue(pickFirstValue(
    season.seasonId,
    fallback.seasonId
  ))
  const suppliedSeasonKey = cleanValue(pickFirstValue(
    season.seasonKey,
    fallback.seasonKey
  ))
  const seasonKey = suppliedSeasonKey || buildSeasonKey(seasonId)

  return {
    seasonId: seasonId || seasonKey,
    seasonKey,
  }
}

export const resolveSeasonId = value =>
  normalizeSeasonIdentity({ season: value }).seasonId

export const resolveSeasonKey = value =>
  normalizeSeasonIdentity({ season: value }).seasonKey

export const resolveSeasonLookupKey = value => {
  const identity = normalizeSeasonIdentity({ season: value })

  return normalizeSeasonLookupKey(
    identity.seasonKey || identity.seasonId
  )
}

export const isSameSeason = (left = {}, right = {}) => {
  const leftSeason = normalizeSeasonIdentity({ season: left })
  const rightSeason = normalizeSeasonIdentity({ season: right })
  const leftLookupKey = resolveSeasonLookupKey(left)
  const rightLookupKey = resolveSeasonLookupKey(right)

  return Boolean(
    (
      leftLookupKey &&
      rightLookupKey &&
      leftLookupKey === rightLookupKey
    ) ||
    (
      leftSeason.seasonKey &&
      rightSeason.seasonKey &&
      leftSeason.seasonKey === rightSeason.seasonKey
    ) ||
    (
      leftSeason.seasonId &&
      rightSeason.seasonId &&
      leftSeason.seasonId === rightSeason.seasonId
    )
  )
}
