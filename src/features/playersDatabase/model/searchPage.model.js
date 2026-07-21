// features/playersDatabase/model/searchPage.model.js

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../catalog/clubs.catalog.js'
import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../catalog/leagues.catalog.js'
import { buildTeamDisplayName } from '../catalog/teamDisplay.js'
import { cleanValue, toNumberOrZero } from './value.model.js'

const RELIABILITY_LABELS = {
  high: 'גבוהה',
  medium: 'בינונית',
  low: 'נמוכה',
}

const formatProfileLabel = value => cleanValue(value)
  .replace(/[_-]+/g, ' ')

const resolveReliabilityLabel = value => {
  const safeValue = cleanValue(value)

  return RELIABILITY_LABELS[safeValue.toLowerCase()] || safeValue || '-'
}

const getClub = clubId => PLAYERS_DATABASE_CLUBS_CATALOG.find(
  club => cleanValue(club.id) === cleanValue(clubId)
) || null

const getLeague = leagueId => PLAYERS_DATABASE_LEAGUES_CATALOG.find(
  league => cleanValue(league.id) === cleanValue(leagueId)
) || null

const buildTeamName = row => {
  const club = getClub(row.clubId)

  return buildTeamDisplayName({
    clubName: club?.name || row.clubName,
    clubId: row.clubId,
    teamId: row.birthTeamId || row.teamId,
    teamSlot: row.birthTeamSlot,
  }) || cleanValue(row.birthTeamId || row.teamId || '-')
}

export const normalizeSearchResultRow = row => ({
  ...row,
  id: cleanValue(row.id || row.entityId),
  playerName: cleanValue(row.displayName || row.fullName || '-'),
  teamName: buildTeamName(row),
  leagueName: cleanValue(
    getLeague(row.leagueId)?.name || row.leagueName || row.leagueId || '-'
  ),
  primaryProfile: formatProfileLabel(row.primaryScoutProfileId) || '-',
  secondaryProfile: formatProfileLabel(row.secondaryScoutProfileId) || '-',
  reliability: resolveReliabilityLabel(row.primaryScoutReliabilityLevel),
  score: toNumberOrZero(row.primaryScoutScore),
  note: cleanValue(row.notes || row.seasonNotes || '-'),
  avatarUrl: cleanValue(row.avatarUrl),
  favorite: Boolean(row.favorite),
  leagueId: cleanValue(row.leagueId),
  teamId: cleanValue(row.birthTeamId || row.teamId),
  seasonKey: cleanValue(row.seasonKey),
})

export const buildSearchPageView = (rows = []) => {
  const results = (Array.isArray(rows) ? rows : [])
    .filter(row => cleanValue(row.primaryScoutProfileId))
    .map(normalizeSearchResultRow)
    .sort((left, right) => right.score - left.score)

  const highReliability = results.filter(row => row.reliability === 'גבוהה').length
  const interesting = results.filter(row => row.score >= 80).length
  const saved = results.filter(row => row.favorite).length

  return {
    results,
    summary: {
      total: results.length,
      highReliability,
      saved,
      interesting,
    },
    activityItems: [
      {
        label: 'מקור נתונים',
        value: 'Search Index',
      },
      {
        label: 'שחקנים עם פרופיל',
        value: `${results.length}`,
      },
      {
        label: 'אמינות גבוהה',
        value: `${highReliability}`,
      },
      {
        label: 'ציון 80 ומעלה',
        value: `${interesting}`,
      },
    ],
  }
}
