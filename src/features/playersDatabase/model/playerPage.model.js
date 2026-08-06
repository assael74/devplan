// features/playersDatabase/model/playerPage.model.js

import { resolveAgeGroupLabel } from '../catalog/ageGroups.catalog.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../catalog/clubs.catalog.js'
import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../catalog/leagues.catalog.js'
import {
  selectPlayerScoutDisplay,
  selectPlayerScoutProfiles,
} from '../domain/index.js'
import { cleanValue } from './value.model.js'

const RELIABILITY_LABELS = {
  high: 'גבוהה',
  medium: 'בינונית',
  low: 'נמוכה',
}

const resolveReliabilityLabel = reliability => {
  const level = cleanValue(reliability?.level || reliability)
  return RELIABILITY_LABELS[level.toLowerCase()] || cleanValue(reliability?.label) || level || '-'
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

const buildSeasonContextView = season => {
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
    seasonKey: cleanValue(
      season?.season?.seasonKey || season?.season?.seasonId || '-'
    ),
    isCurrentSeason: season?.lifecycle?.type === 'current',
    lifecycle: season?.lifecycle,
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
    leagueId: cleanValue(season?.team?.leagueId),
    leagueName: cleanValue(
      league?.name || season?.team?.leagueId || '-'
    ),
    games: Number(stats.games) || 0,
    starts: Number(stats.starts) || 0,
    minutes: Number(stats.minutes) || 0,
    goals: Number(stats.goals) || 0,
    yellowCards: Number(stats.yellowCards) || 0,
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
  reliability: '-',
  certainty: '-',
  minutes: 0,
  goals: 0,
  goalsPerGame: '0.00',
  startsPct: 0,
  scoutProfiles: [],
  scoutProfileDisplay: {
    type: 'none',
    id: '',
    label: '',
    reliability: {},
    baseProfiles: [],
  },
  seasonContexts: [],
  reasons: ['לא נמצא מסמך שחקן מתאים.'],
})

export const buildPlayerPageView = playerDomain => {
  if (!playerDomain?.activeSeason) return null

  const season = playerDomain.activeSeason
  const stats = season.stats?.actual || {}
  const profiles = selectPlayerScoutProfiles(season)
  const display = selectPlayerScoutDisplay(season)
  const games = Number(stats.games) || 0
  const starts = Number(stats.starts) || 0
  const goals = Number(stats.goals) || 0
  const minutes = Number(stats.minutes) || 0
  const league = getLeague(season.team?.leagueId)
  const seasonContexts = (playerDomain.seasons || []).map(buildSeasonContextView)
  const reliability = resolveReliabilityLabel(display.reliability)

  return {
    domain: playerDomain,
    activeSeason: season,
    id: cleanValue(
      playerDomain.identity?.playerDocumentId ||
      playerDomain.identity?.playerId
    ),
    playerId: cleanValue(playerDomain.identity?.playerId),
    fullName: cleanValue(playerDomain.identity?.displayName || '-'),
    birthYear: playerDomain.identity?.birthYear ?? season.season?.birthYear ?? null,
    birthDate: playerDomain.identity?.birthDate ?? null,
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
    position: cleanValue(
      season.position?.primary || season.position?.layer || '-'
    ),
    reliability,
    certainty: reliability,
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
    reasons: buildReasons({ season, display }),
    avatarUrl: cleanValue(playerDomain.identity?.avatarUrl),
  }
}
