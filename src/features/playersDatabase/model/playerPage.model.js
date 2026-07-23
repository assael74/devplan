// features/playersDatabase/model/playerPage.model.js

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../catalog/clubs.catalog.js'
import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../catalog/leagues.catalog.js'
import { normalizePlayerStats } from './playerStats.model.js'
import { cleanValue, toNumberOrZero } from './value.model.js'
import {
  buildScoutProfileCombinations,
  SCOUT_PROFILES,
} from '../../../shared/players/scouting/index.js'

const RELIABILITY_LABELS = {
  high: 'גבוהה',
  medium: 'בינונית',
  low: 'נמוכה',
}

const resolveReliabilityLabel = value => {
  const safeValue = cleanValue(value)

  return RELIABILITY_LABELS[safeValue.toLowerCase()] || safeValue || '-'
}

const formatProfileLabel = value => cleanValue(value)
  .replace(/[_-]+/g, ' ')

const getClub = clubId => PLAYERS_DATABASE_CLUBS_CATALOG.find(
  club => cleanValue(club.id) === cleanValue(clubId)
) || null

const getLeague = leagueId => PLAYERS_DATABASE_LEAGUES_CATALOG.find(
  league => cleanValue(league.id) === cleanValue(leagueId)
) || null

const SCOUT_PROFILE_BY_ID = SCOUT_PROFILES.reduce((map, profile) => {
  map[profile.id] = profile
  return map
}, {})

const resolveScoutProfileLabel = profile => {
  const profileId = cleanValue(profile?.profileId || profile?.id)

  if (!profileId) return ''

  return cleanValue(
    profile?.label ||
    SCOUT_PROFILE_BY_ID[profileId]?.label ||
    profileId
  )
}

const buildScoutProfileDisplay = (row = {}) => {
  const scoutProfiles = Array.isArray(row.scoutProfiles)
    ? row.scoutProfiles
    : []
  const signals = scoutProfiles
    .map(profile => ({
      ...profile,
      profileId: cleanValue(profile?.profileId || profile?.id),
    }))
    .filter(profile => profile.profileId)
  const combinations = buildScoutProfileCombinations({ signals })
  const combination = combinations[0] || null

  if (combination) {
    return {
      type: 'combination',
      id: cleanValue(combination.id),
      label: cleanValue(combination.label),
      reliability: cleanValue(
        scoutProfiles[0]?.reliabilityLevel ||
        scoutProfiles[0]?.profileReliability
      ),
      baseProfiles: (combination.matchedProfileIds || []).map(profileId => ({
        id: profileId,
        label: SCOUT_PROFILE_BY_ID[profileId]?.label || profileId,
      })),
    }
  }

  const primaryProfile = scoutProfiles[0] || null

  if (!primaryProfile) {
    return {
      type: 'none',
      id: '',
      label: '',
      reliability: '',
      baseProfiles: [],
    }
  }

  return {
    type: 'profile',
    id: cleanValue(primaryProfile.profileId || primaryProfile.id),
    label: resolveScoutProfileLabel(primaryProfile),
    reliability: cleanValue(
      primaryProfile.reliabilityLevel ||
      primaryProfile.profileReliability
    ),
    baseProfiles: [],
  }
}

const getClubShortName = clubId => {
  const club = getClub(clubId)
  return cleanValue(club?.shortName || club?.name || '')
}

const buildScoutProfiles = row => {
  const profiles = [
    {
      id: cleanValue(row.primaryScoutProfileId),
      label: formatProfileLabel(row.primaryScoutProfileId),
      score: toNumberOrZero(row.primaryScoutScore),
      reliability: resolveReliabilityLabel(row.primaryScoutReliabilityLevel),
    },
    {
      id: cleanValue(row.secondaryScoutProfileId),
      label: formatProfileLabel(row.secondaryScoutProfileId),
      score: toNumberOrZero(row.secondaryScoutScore),
      reliability: resolveReliabilityLabel(row.secondaryScoutReliabilityLevel),
    },
  ]

  return profiles.filter(profile => profile.id)
}

const buildReasons = ({ stats, profiles, row, scoutProfileDisplay }) => {
  const reasons = []

  if (scoutProfileDisplay?.label) {
    reasons.push(`זוהה בפרופיל ${scoutProfileDisplay.label}.`)
  } else if (profiles[0]) {
    reasons.push(`זוהה בפרופיל ${profiles[0].label} בציון ${profiles[0].score}.`)
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

  if (cleanValue(row.notes || row.seasonNotes)) {
    reasons.push(cleanValue(row.notes || row.seasonNotes))
  }

  return reasons.length
    ? reasons.slice(0, 4)
    : ['השחקן מופיע במאגר, אך עדיין אין מספיק נתונים להסבר מפורט.']
}

export const buildEmptyPlayerPageView = playerId => ({
  id: cleanValue(playerId),
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
  minutes: 0,
  goals: 0,
  goalsPerGame: '0.00',
  startsPct: 0,
  scoutProfiles: [],
  scoutProfileDisplay: {
    type: 'none',
    id: '',
    label: '',
    reliability: '',
    baseProfiles: [],
  },
  reasons: ['לא נמצא מסמך Search Index מתאים לשחקן המבוקש.'],
})

export const buildPlayerPageView = row => {
  if (!row) return null

  const stats = normalizePlayerStats(row)
  const profiles = buildScoutProfiles(row)
  const scoutProfileDisplay = buildScoutProfileDisplay(row)
  const games = stats.games
  const startsPct = games
    ? Math.round((stats.starts / games) * 100)
    : 0

  return {
    ...row,
    id: cleanValue(row.id || row.entityId),
    fullName: cleanValue(row.displayName || row.fullName || '-'),
    clubName: getClubShortName(row.clubId) || cleanValue(row.clubName || '-'),
    teamName: cleanValue(row.ageGroupLabel || row.teamName || '-'),
    leagueName: cleanValue(
      getLeague(row.leagueId)?.name || row.leagueName || row.leagueId || '-'
    ),
    leagueId: cleanValue(row.leagueId),
    teamId: cleanValue(row.birthTeamId || row.teamId),
    seasonKey: cleanValue(row.seasonKey),
    ageLabel: row.birthYear ? `שנתון ${row.birthYear}` : '-',
    position: cleanValue(row.primaryPosition || row.positionLayer || '-'),
    reliability: profiles[0]?.reliability || '-',
    minutes: stats.minutes,
    goals: stats.goals,
    goalsPerGame: games ? (stats.goals / games).toFixed(2) : '0.00',
    startsPct,
    scoutProfiles: profiles,
    scoutProfileDisplay,
    reasons: buildReasons({ stats, profiles, row, scoutProfileDisplay }),
    avatarUrl: cleanValue(row.avatarUrl),
  }
}
