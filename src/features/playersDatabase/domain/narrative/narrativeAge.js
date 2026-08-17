// src/features/playersDatabase/domain/narrative/narrativeAge.js

import { normalizeSeasonLookupKey } from '../../model/season.model.js'

const resolveSeasonStartYear = season => {
  const key = normalizeSeasonLookupKey(
    season?.seasonKey || season?.seasonId
  )
  const match = key.match(/^(\d{2,4})\/(\d{2,4})$/)

  if (!match) return null

  const value = Number(match[1])
  if (!Number.isFinite(value)) return null

  return value < 100 ? 2000 + value : value
}

export const buildAgeContext = ({ playerBirthYear, groupBirthYear, season } = {}) => {
  const birthYear = Number(playerBirthYear)
  const ageGroupBirthYear = Number(groupBirthYear)
  const seasonStartYear = resolveSeasonStartYear(season)
  const hasBirthYear = Number.isFinite(birthYear) && birthYear > 0
  const hasGroupYear = Number.isFinite(ageGroupBirthYear) && ageGroupBirthYear > 0

  return {
    birthYear: hasBirthYear ? birthYear : null,
    age: hasBirthYear && seasonStartYear
      ? seasonStartYear - birthYear
      : null,
    groupBirthYear: hasGroupYear ? ageGroupBirthYear : null,
    isPlayingUp: hasBirthYear && hasGroupYear
      ? birthYear > ageGroupBirthYear
      : null,
    ageGap: hasBirthYear && hasGroupYear
      ? birthYear - ageGroupBirthYear
      : null,
  }
}
