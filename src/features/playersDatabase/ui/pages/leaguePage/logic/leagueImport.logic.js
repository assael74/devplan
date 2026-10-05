// src/features/playersDatabase/ui/pages/leaguePage/logic/leagueImport.logic.js

import { formatLtrNumber } from '../../../../../../shared/format/direction.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../catalog/clubs.catalog.js'
import { resolvePlayersDatabaseLeagueGameTime } from '../../../../catalog/leagues.catalog.js'
import { buildLeagueTablePastePreview } from '../../../../import/logic/leagueTablePastePreview.js'

import { pickDefinedValue } from '../../../../model/shared/value.model.js'
const clean = value => String(value === null || value === undefined ? '' : value).trim()

const toNumber = value => {
  const nextValue = Number(clean(value).replace(/\u200E/g, ''))
  return Number.isFinite(nextValue) ? nextValue : 0
}

const normalizeName = value => clean(value)
  .toLowerCase()
  .replace(/["׳״']/g, '')
  .replace(/\s+/g, ' ')

const stripTrailingSlot = teamName =>
  clean(teamName).replace(/\s+[2-3]$/, '').trim()

const buildExistingTeamUrlKey = ({ clubId = '', teamSlot = '' } = {}) => (
  `${clean(clubId)}::${clean(teamSlot)}`
)

export const resolveExistingLeagueTeamUrl = ({
  existingTeamsById = {},
  clubId = '',
  teamSlot = '',
} = {}) => {
  const targetKey = buildExistingTeamUrlKey({ clubId, teamSlot })
  const entries = existingTeamsById && typeof existingTeamsById === 'object'
    ? Object.values(existingTeamsById)
    : []

  return clean(entries.find(row => buildExistingTeamUrlKey({
    clubId: row && row.clubId,
    teamSlot: row && row.teamSlot,
  }) === targetKey)?.teamUrl)
}

export const normalizeSignedNumberText = value => {
  const text = clean(value).replace(/\u200E/g, '')
  if (!text) return ''

  if (/^\d+(?:\.\d+)?-$/.test(text)) {
    return `-${text.slice(0, -1)}`
  }

  if (/^\d+(?:\.\d+)?\+$/.test(text)) {
    return text.slice(0, -1)
  }

  return text
}

export const formatGoalDifference = value =>
  formatLtrNumber(normalizeSignedNumberText(value))

const getClubById = clubId =>
  PLAYERS_DATABASE_CLUBS_CATALOG.find(club => club.id === clean(clubId)) || null

const getClubNameById = clubId => getClubById(clubId)?.name || ''

export const buildServiceLeague = ({ league = {}, leagueDoc = {} } = {}) => ({
  leagueId: clean(leagueDoc.leagueId || league.id),
  names: {
    official: clean(leagueDoc.names?.official || league.name),
    display: clean(leagueDoc.names?.display || league.name),
    short: clean(leagueDoc.names?.short || league.name),
    source: clean(leagueDoc.names?.source || league.name),
  },
  ageGroupId: clean(leagueDoc.ageGroupId || league.ageGroupId),
  ageGroupLabel: clean(leagueDoc.ageGroupLabel || league.ageGroup),
  level: toNumber(leagueDoc.level || league.level),
  region: clean(leagueDoc.region || league.region),
})

export const resolveLeagueImportGameDuration = ({
  league = {},
  leagueDoc = {},
  selectedSeasonOption = {},
} = {}) => {
  const season = selectedSeasonOption && selectedSeasonOption.season
    ? selectedSeasonOption.season
    : {}
  const existingValue = Number(season.gameDurationMinutes)

  if (Number.isFinite(existingValue) && existingValue > 0) return existingValue

  return resolvePlayersDatabaseLeagueGameTime(clean(leagueDoc.ageGroupId || league.ageGroupId))
}

export const buildServiceSeason = ({
  league = {},
  leagueDoc = {},
  selectedSeasonOption = {},
  seasonStatus = '',
  gameDurationMinutes = null,
} = {}) => {
  const season = selectedSeasonOption?.season || {}
  const resolvedGameDurationMinutes = gameDurationMinutes === null ||
    gameDurationMinutes === undefined ||
    gameDurationMinutes === ''
    ? resolveLeagueImportGameDuration({ league, leagueDoc, selectedSeasonOption })
    : toNumber(gameDurationMinutes)

  return {
    seasonId: clean(season.seasonId),
    seasonKey: clean(season.seasonKey || league.seasonKey),
    birthYear: toNumber(season.birthYear || league.birthYear),
    leagueTotalRound: toNumber(season.leagueTotalRound || league.leagueTotalRound),
    seasonStatus: clean(seasonStatus),
    seasonUrl: clean(season.seasonUrl),
    gameDurationMinutes: resolvedGameDurationMinutes,
    competitionRules: season.competitionRules && typeof season.competitionRules === 'object'
      ? season.competitionRules
      : { configured: false },
  }
}

export const buildServiceRows = ({ rows = [] } = {}) => (
  (Array.isArray(rows) ? rows : []).map(row => ({
    clubId: clean(row.clubId),
    teamSlot: toNumber(row.teamSlot),
    teamUrl: clean(row.pastedTeamUrl || row.displayTeamUrl || row.teamUrl),
    officialTable: {
      rank: toNumber(row.rank),
      points: toNumber(row.points),
      goalsFor: toNumber(row.goalsFor),
      goalsAgainst: toNumber(row.goalsAgainst),
      teamGamePlayed: toNumber(row.games),
    },
  })).filter(row => row.clubId && row.teamSlot)
)

const getExpectedTeamDisplayName = row => {
  const clubName = row.clubName || getClubNameById(row.clubId)
  const slot = clean(row.teamSlot)

  if (!clubName || !slot) return ''
  if (slot === '1') return clubName

  return `${clubName} ${slot}`
}

export const shouldShowDisplayName = row => {
  const sourceName = stripTrailingSlot(row.teamName)
  const expectedName = stripTrailingSlot(getExpectedTeamDisplayName(row))

  if (!sourceName) return false
  if (!expectedName) return true

  return normalizeName(sourceName) !== normalizeName(expectedName)
}

const mapPreviewRow = ({ row, existingTeamsById = {} } = {}) => {
  const data = row.data || {}
  const teamSlot = clean(data.teamSlot) || '1'
  const pastedTeamUrl = clean(data.teamUrl)

  return {
    id: `league_table_${row.displayIndex}`,
    rank: pickDefinedValue(data.leaguePosition, ''),
    clubId: data.clubId || '',
    clubName: data.clubCatalogName || data.clubName || '',
    teamSlot,
    teamName: data.clubName || data.clubCatalogName || '',
    teamUrl: pastedTeamUrl,
    displayTeamUrl: pastedTeamUrl || resolveExistingLeagueTeamUrl({
      existingTeamsById,
      clubId: data.clubId,
      teamSlot,
    }),
    pastedTeamUrl,
    games: pickDefinedValue(data.games, ''),
    wins: pickDefinedValue(data.wins, ''),
    draws: pickDefinedValue(data.draws, ''),
    losses: pickDefinedValue(data.losses, ''),
    goalsFor: pickDefinedValue(data.goalsFor, ''),
    goalsAgainst: pickDefinedValue(data.goalsAgainst, ''),
    goalDifference: formatGoalDifference(pickDefinedValue(data.goalDifference, '')),
    points: pickDefinedValue(data.points, ''),
    valid: row.valid,
    errors: row.errors || [],
  }
}

export const buildLeagueImportPreview = ({
  text = '',
  league = {},
  leagueDoc = {},
  selectedSeasonOption = {},
} = {}) => {
  const serviceLeague = buildServiceLeague({
    league,
    leagueDoc,
  })
  const serviceSeason = buildServiceSeason({
    league,
    leagueDoc,
    selectedSeasonOption,
  })
  const preview = buildLeagueTablePastePreview(text, {
    leagueId: serviceLeague.leagueId,
    leagueName: clean(serviceLeague.names && (serviceLeague.names.display || serviceLeague.names.official)),
    leagueLevel: serviceLeague.level,
    ageGroupId: serviceLeague.ageGroupId,
    ageGroupLabel: serviceLeague.ageGroupLabel,
    seasonId: serviceSeason.seasonId,
    expectedRows: 0,
  })

  return {
    ...preview,
    rows: (preview.rows || []).map(row => mapPreviewRow({
      row,
      existingTeamsById: selectedSeasonOption?.season?.table?.teamsById || {},
    })),
  }
}
