// features/playersDatabase/ui/pages/leaguePage/logic/leagueImport.logic.js

import { formatLtrNumber } from '../../../../../../shared/format/direction.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../catalog/clubs.catalog.js'
import { buildTeamIdentity } from '../../../../catalog/teamIdentity.js'
import { buildLeagueTablePastePreview } from '../../../../import/logic/leagueTablePastePreview.js'

const clean = value => String(value ?? '').trim()

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
  id: clean(leagueDoc.id || leagueDoc.leagueId || league.id),
  name: clean(leagueDoc.name || leagueDoc.leagueName || league.name),
  leagueName: clean(leagueDoc.leagueName || leagueDoc.name || league.name),
  ageGroupId: clean(leagueDoc.ageGroupId),
  ageGroupLabel: clean(leagueDoc.ageGroupLabel || league.ageGroup),
  level: toNumber(leagueDoc.level),
  region: clean(leagueDoc.region),
})

export const buildServiceSeason = ({
  league = {},
  leagueDoc = {},
  selectedSeasonOption = {},
} = {}) => {
  const season = selectedSeasonOption?.season || {}

  return {
    ...season,
    leagueId: clean(leagueDoc.id || leagueDoc.leagueId || league.id),
    seasonId: clean(season.seasonId || season.seasonKey || league.seasonKey),
    seasonKey: clean(season.seasonKey || league.seasonKey),
    birthYear: toNumber(season.birthYear || league.birthYear),
    leagueTotalRound: toNumber(season.leagueTotalRound || league.leagueTotalRound),
  }
}

export const buildServiceRows = ({ rows = [], league = {}, season = {} } = {}) => (
  (Array.isArray(rows) ? rows : []).map(row => {
    const club = getClubById(row.clubId)
    const teamSlot = toNumber(row.teamSlot) || 1
    const identity = buildTeamIdentity({
      clubId: row.clubId,
      clubName: club?.name || row.clubName,
      ageGroupId: league.ageGroupId,
      ageGroupLabel: league.ageGroupLabel,
      birthYear: season.birthYear,
      teamSlot,
      leagueId: league.id,
      leagueName: league.name,
    })

    return {
      position: toNumber(row.rank),
      rank: toNumber(row.rank),
      clubId: clean(row.clubId),
      clubName: club?.name || row.clubName || row.teamName,
      clubLevel: toNumber(club?.clubLevel),
      displayName: clean(row.teamName),
      teamSlot,
      birthTeamId: identity.birthTeamId,
      birthTeamSlot: identity.birthTeamSlot,
      birthYear: identity.birthYear,
      teamSlotId: identity.teamSlotId,
      teamId: identity.teamId,
      ageGroupId: league.ageGroupId,
      ageGroupLabel: league.ageGroupLabel,
      games: toNumber(row.games),
      wins: toNumber(row.wins),
      draws: toNumber(row.draws),
      losses: toNumber(row.losses),
      goalsFor: toNumber(row.goalsFor),
      goalsAgainst: toNumber(row.goalsAgainst),
      goalDifference: toNumber(normalizeSignedNumberText(row.goalDifference)),
      points: toNumber(row.points),
    }
  }).filter(row => row.rank || row.clubId || row.teamId)
)

const getExpectedTeamDisplayName = row => {
  const clubName = row.clubName || getClubNameById(row.clubId)
  const slot = clean(row.teamSlot || '1')

  if (!clubName) return ''
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

const mapPreviewRow = row => {
  const data = row.data || {}
  const slotMatch = String(data.clubName || '').trim().match(/(?:^|\s)([2-3])$/)
  const teamSlot = slotMatch?.[1] || String(data.teamSlot || 1)

  return {
    id: `league_table_${row.displayIndex}`,
    rank: data.leaguePosition ?? '',
    clubId: data.clubId || '',
    clubName: data.clubCatalogName || data.clubName || '',
    teamSlot,
    teamName: data.clubName || data.clubCatalogName || '',
    games: data.games ?? '',
    wins: data.wins ?? '',
    draws: data.draws ?? '',
    losses: data.losses ?? '',
    goalsFor: data.goalsFor ?? '',
    goalsAgainst: data.goalsAgainst ?? '',
    goalDifference: formatGoalDifference(data.goalDifference ?? ''),
    points: data.points ?? '',
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
  const serviceLeague = buildServiceLeague({ league, leagueDoc })
  const serviceSeason = buildServiceSeason({ league, leagueDoc, selectedSeasonOption })
  const preview = buildLeagueTablePastePreview(text, {
    leagueId: serviceLeague.id,
    leagueName: serviceLeague.name,
    leagueLevel: serviceLeague.level,
    ageGroupId: serviceLeague.ageGroupId,
    ageGroupLabel: serviceLeague.ageGroupLabel,
    seasonId: serviceSeason.seasonId,
    expectedRows: 0,
  })

  return {
    ...preview,
    rows: (preview.rows || []).map(mapPreviewRow),
  }
}
