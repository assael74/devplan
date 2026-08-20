// src/features/playersDatabase/model/playerPage.model.js

import { resolveAgeGroupLabel } from '../catalog/ageGroups.catalog.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../catalog/clubs.catalog.js'
import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../catalog/leagues.catalog.js'
import {
  selectPlayerScoutDisplay,
  selectPlayerScoutProfiles,
} from '../domain/index.js'
import { normalizeSeasonLookupKey } from './season.model.js'
import {
  cleanValue,
  pickFirstValue,
} from './value.model.js'


function findPlayerActiveSeason(playerDomain, selectedSeasonKey, selectedTeamId) {
  const seasons = Array.isArray(playerDomain?.seasons)
    ? playerDomain.seasons
    : []
  const seasonKey = normalizeSeasonLookupKey(selectedSeasonKey)
  const teamId = cleanValue(selectedTeamId)

  if (seasonKey) {
    const seasonMatches = seasons.filter(item => (
      normalizeSeasonLookupKey(
        item?.season?.seasonKey || item?.season?.seasonId
      ) === seasonKey
    ))
    const teamMatch = seasonMatches.find(item => (
      cleanValue(item?.team?.teamId) === teamId
    ))

    return teamMatch || seasonMatches[0] || null
  }

  if (teamId) {
    const teamMatch = seasons.find(item => (
      cleanValue(item?.team?.teamId) === teamId
    ))

    if (teamMatch) return teamMatch
  }

  return playerDomain?.activeSeason || seasons[0] || null
}

const getClub = clubId => PLAYERS_DATABASE_CLUBS_CATALOG.find(
  club => cleanValue(club.id) === cleanValue(clubId)
) || null

const getLeague = leagueId => PLAYERS_DATABASE_LEAGUES_CATALOG.find(
  league => cleanValue(league.id) === cleanValue(leagueId)
) || null

const getClubShortName = clubId => {
  const club = getClub(clubId)
  return cleanValue(club?.shortName || club?.name || '')
}

const hasPerformanceValue = performance => {
  if (!performance || typeof performance !== 'object') return false

  const hasNumber = value => (
    value !== null &&
    value !== undefined &&
    cleanValue(value) !== '' &&
    Number.isFinite(Number(value))
  )
  const level = cleanValue(performance.priorityLevel)

  return (
    hasNumber(performance.scoutPriorityScore) ||
    hasNumber(performance.rank) ||
    Boolean(level && level !== 'unavailable')
  )
}

const pickPerformance = (...values) => (
  values.find(hasPerformanceValue) || null
)

const buildReasons = ({ season, display }) => {
  const stats = season?.stats?.actual || {}
  const reasons = []

  if (display?.label) {
    reasons.push(`זוהה בפרופיל ${display.label}.`)
  }

  if (stats.minutes > 0) {
    reasons.push(`צבר ${stats.minutes} דקות משחק בעונה הנבחרת.`)
  }

  if (stats.starts > 0) {
    reasons.push(`פתח בהרכב ב־${stats.starts} משחקים.`)
  }

  if (stats.goals > 0) {
    reasons.push(`כבש ${stats.goals} שערים במסגרת נתוני העונה.`)
  }

  if (cleanValue(season?.metadata?.notes)) {
    reasons.push(cleanValue(season.metadata.notes))
  }

  return reasons.length
    ? reasons.slice(0, 4)
    : ['השחקן מופיע במאגר, אך עדיין אין מספיק נתונים להסבר מפורט.']
}

const buildSeasonContextView = (season, identity = {}) => {
  const stats = season?.stats?.actual || {}
  const display = selectPlayerScoutDisplay(season)
  const profiles = selectPlayerScoutProfiles(season)
  const league = getLeague(season?.team?.leagueId)

  return {
    id: [
      season?.season?.seasonKey || season?.season?.seasonId,
      season?.team?.teamId,
      season?.team?.clubId,
    ].filter(Boolean).join('_'),
    seasonId: cleanValue(
      season?.season?.seasonId || season?.season?.seasonKey || '-'
    ),
    seasonKey: cleanValue(
      season?.season?.seasonKey || season?.season?.seasonId || '-'
    ),
    target: season?.lifecycle?.type === 'current'
      ? 'current'
      : 'history',
    isCurrentSeason: season?.lifecycle?.type === 'current',
    lifecycle: season?.lifecycle,
    playerId: cleanValue(identity.playerId),
    playerDocumentId: cleanValue(
      identity.playerDocumentId || identity.playerId
    ),
    externalPlayerId: cleanValue(identity.externalPlayerId),
    fullName: cleanValue(identity.displayName),
    playerUrl: cleanValue(season?.metadata?.playerUrl || season?.playerUrl),
    clubId: cleanValue(season?.team?.clubId),
    clubName: getClubShortName(season?.team?.clubId) || '-',
    teamId: cleanValue(season?.team?.teamId),
    birthTeamId: cleanValue(season?.team?.teamId),
    birthTeamDocumentId: cleanValue(season?.team?.teamDocumentId),
    teamName: resolveAgeGroupLabel({
      ageGroupId: season?.team?.ageGroupId,
      ageGroupLabel: season?.team?.ageGroupLabel,
    }),
    ageGroupId: cleanValue(season?.team?.ageGroupId),
    ageGroupLabel: resolveAgeGroupLabel({
      ageGroupId: season?.team?.ageGroupId,
      ageGroupLabel: season?.team?.ageGroupLabel,
    }),
    birthTeamSlot: Number(season?.team?.birthTeamSlot) || 0,
    isYoungerAgeGroup: Boolean(season?.scout?.profileHierarchy?.primarySignal?.metrics?.isYoungerAgeGroup),
    leagueId: cleanValue(season?.team?.leagueId),
    leagueName: cleanValue(
      league?.name || season?.team?.leagueId || '-'
    ),
    games: Number(stats.games) || 0,
    starts: Number(stats.starts) || 0,
    minutes: Number(stats.minutes) || 0,
    goals: Number(stats.goals) || 0,
    yellowCards: Number(stats.yellowCards) || 0,
    teamGames: Number(season?.stats?.context?.teamGames) || 0,
    teamRank: Number(season?.stats?.context?.teamRank) || 0,
    teamGoalsFor: Number(season?.stats?.context?.teamGoalsFor) || 0,
    teamGoalsAgainst: Number(season?.stats?.context?.teamGoalsAgainst) || 0,
    teamAttackPerformance: pickPerformance(
      season?.stats?.context?.teamAttackPerformance,
      season?.teamPerformance?.offense
    ),
    teamDefensePerformance: pickPerformance(
      season?.stats?.context?.teamDefensePerformance,
      season?.teamPerformance?.defense
    ),
    minutesPct: season?.scout?.profileHierarchy?.primarySignal?.metrics?.minutesPct,
    clubLevel: Number(season?.team?.clubLevel) || 0,
    clubStrengthLevel: Number(season?.team?.clubStrengthLevel) || 0,
    leagueLevel: Number(season?.team?.leagueLevel) || 0,
    seasonStatus: cleanValue(season?.season?.seasonStatus),
    teamAttackRank: Number(season?.teamPerformance?.offense?.rank) || 0,
    teamDefenseRank: Number(season?.teamPerformance?.defense?.rank) || 0,
    teamAttackLevel: cleanValue(season?.teamPerformance?.offense?.priorityLevel),
    teamDefenseLevel: cleanValue(season?.teamPerformance?.defense?.priorityLevel),
    projectedStats: season?.stats?.projected || null,
    scoutProfiles: profiles,
    scoutProfileDisplay: display,
    scout: season?.scout,
    placeholder: false,
  }
}

export const buildEmptyPlayerPageView = playerId => ({
  id: cleanValue(playerId),
  playerId: cleanValue(playerId),
  fullName: 'שחקן לא נמצא',
  teamName: '-',
  clubName: '-',
  leagueName: '-',
  leagueId: '',
  teamId: '',
  seasonKey: '',
  ageLabel: '-',
  position: '-',
  profileStrength: null,
  minutes: 0,
  goals: 0,
  goalsPerGame: '0.00',
  startsPct: 0,
  scoutProfiles: [],
  scoutProfileDisplay: {
    type: 'none',
    id: '',
    label: '',
    profileStrength: null,
    baseProfiles: [],
  },
  seasonContexts: [],
  reasons: ['לא נמצא מסמך שחקן מתאים.'],
})

export const buildPlayerPageView = (
  playerDomain,
  selectedSeasonKey = '',
  selectedTeamId = ''
) => {
  const season = findPlayerActiveSeason(
    playerDomain,
    selectedSeasonKey,
    selectedTeamId
  )

  if (!season) return null
  const stats = season.stats?.actual || {}
  const profiles = selectPlayerScoutProfiles(season)
  const display = selectPlayerScoutDisplay(season)
  const games = Number(stats.games) || 0
  const starts = Number(stats.starts) || 0
  const goals = Number(stats.goals) || 0
  const minutes = Number(stats.minutes) || 0
  const league = getLeague(season.team?.leagueId)
  const seasonContexts = (playerDomain.seasons || []).map(seasonRow => (
    buildSeasonContextView(seasonRow, playerDomain.identity || {})
  ))
  const profileStrength = profiles.length
    ? display.profileStrength || null
    : null

  return {
    domain: playerDomain,
    activeSeason: season,
    id: cleanValue(
      playerDomain.identity?.playerDocumentId ||
      playerDomain.identity?.playerId
    ),
    playerId: cleanValue(playerDomain.identity?.playerId),
    externalPlayerId: cleanValue(playerDomain.identity?.externalPlayerId),
    fullName: cleanValue(playerDomain.identity?.displayName || '-'),
    birthYear: pickFirstValue(
      playerDomain.identity?.birthYear,
      season.season?.birthYear
    ) || null,
    birthDate: pickFirstValue(
      playerDomain.identity?.birthDate
    ) || null,
    clubName: getClubShortName(season.team?.clubId) || '-',
    teamName: resolveAgeGroupLabel({
      ageGroupId: season.team?.ageGroupId,
      ageGroupLabel: season.team?.ageGroupLabel,
    }),
    leagueName: cleanValue(league?.name || season.team?.leagueId || '-'),
    leagueId: cleanValue(season.team?.leagueId),
    teamId: cleanValue(season.team?.teamId),
    seasonKey: cleanValue(
      season.season?.seasonKey || season.season?.seasonId
    ),
    ageLabel: season.season?.birthYear
      ? `שנתון ${season.season.birthYear}`
      : '-',
    primaryPosition: cleanValue(season.position?.primary),
    positionLayer: cleanValue(season.position?.layer),
    position: cleanValue(
      season.position?.primary || season.position?.layer || '-'
    ),
    profileStrength,
    minutes,
    goals,
    goalsPerGame: games ? (goals / games).toFixed(2) : '0.00',
    startsPct: games ? Math.round((starts / games) * 100) : 0,
    scoutProfiles: profiles,
    scoutProfileDisplay: display,
    scout: season.scout,
    seasonContexts,
    history: seasonContexts,
    seasons: seasonContexts,
    reasons: buildReasons({
      season,
      display,
    }),
    avatarUrl: cleanValue(playerDomain.identity?.avatarUrl),
  }
}
