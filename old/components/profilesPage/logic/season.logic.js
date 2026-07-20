// features/playersDatabase/components/profilesPage/logic/season.logic.js

import { PLAYERS_DATABASE_SEASONS_CATALOG } from '../../../catalog/seasons.catalog.js'
import { createSeasonKey } from '../../../models/league.model.js'
import { getLeagueSeasonRows } from '../../leagues/leagueUtils.js'
import { clean, unique } from './utils.js'

export const buildSeasonOptions = () =>
  PLAYERS_DATABASE_SEASONS_CATALOG.map(season => ({
    value: season.id,
    label: season.label,
    shortLabel: season.shortLabel,
  }))

export const getPrimarySeason = league =>
  getLeagueSeasonRows(league)[0] || null

export const getSeasonForId = (league, seasonId = '') => {
  const targetSeasonId = clean(seasonId)
  const targetSeasonKey = createSeasonKey(targetSeasonId)

  if (!targetSeasonId) return getPrimarySeason(league)

  return (
    getLeagueSeasonRows(league).find(season => {
      const currentSeasonId = clean(season?.seasonId)
      const currentSeasonKey = clean(season?.key)

      return (
        currentSeasonId === targetSeasonId ||
        currentSeasonKey === targetSeasonKey
      )
    }) || getPrimarySeason(league)
  )
}

export const getLeagueBirthYear = (league, seasonId = '') => {
  const season = getSeasonForId(league, seasonId)

  return clean(
    season?.primaryBirthYear ||
      season?.birthYear ||
      season?.birthYears?.[0]
  )
}

export const getLeagueSnapshotId = (league, seasonId = '') =>
  clean(getSeasonForId(league, seasonId)?.latestSnapshotId)

export const getLeagueSnapshotDate = (league, seasonId = '') =>
  clean(getSeasonForId(league, seasonId)?.latestSnapshotAt)

export const getLeagueSeasonIds = league =>
  unique([
    clean(league?.seasonId),
    ...Object.entries(league?.seasons || {}).flatMap(([key, season]) => [
      clean(season?.seasonId),
      clean(key).replace(/^s/i, '').replace(/_/g, '-'),
      clean(key),
    ]),
  ])

export const leagueMatchesSeason = (league, seasonId) => {
  const targetSeasonId = clean(seasonId)
  const targetSeasonKey = createSeasonKey(targetSeasonId)

  return (
    getLeagueSeasonIds(league).includes(targetSeasonId) ||
    Object.keys(league?.seasons || {}).includes(targetSeasonKey)
  )
}
