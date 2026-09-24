// src/features/playersDatabase/services/read/entities/teamSeasonRosterHistory.js

import { compareSeasonKeys } from '../../../domain/movement/index.js'
import { getTeamById } from './team.js'
import { getTeamSeason } from './teamSeason.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export async function readTeamSeasonRosterHistory({
  birthTeamDocumentId = '',
  seasonKey = '',
  bypassCache = false,
} = {}) {
  const safeTeamId = clean(birthTeamDocumentId)
  const safeSeasonKey = clean(seasonKey)

  if (!safeTeamId || !safeSeasonKey) {
    return {
      currentSeason: null,
      previousSeason: null,
      seasons: [],
    }
  }

  const team = await getTeamById(safeTeamId, { bypassCache })
  const seasons = Array.isArray(team?.seasons) ? team.seasons : []
  const previousCandidates = seasons
    .filter(row => compareSeasonKeys(row.seasonKey, safeSeasonKey) < 0)
    .sort((left, right) => compareSeasonKeys(right.seasonKey, left.seasonKey))
  const previousSeasonKey = clean(previousCandidates[0]?.seasonKey)
  const [currentSeason, previousSeason] = await Promise.all([
    getTeamSeason({
      birthTeamDocumentId: safeTeamId,
      seasonKey: safeSeasonKey,
      bypassCache,
    }),
    previousSeasonKey
      ? getTeamSeason({
        birthTeamDocumentId: safeTeamId,
        seasonKey: previousSeasonKey,
        bypassCache,
      })
      : Promise.resolve(null),
  ])

  return {
    teamRoot: team || null,
    currentSeason,
    previousSeason,
    previousSeasonKey,
    seasons: previousSeasonKey ? [safeSeasonKey, previousSeasonKey] : [safeSeasonKey],
  }
}
