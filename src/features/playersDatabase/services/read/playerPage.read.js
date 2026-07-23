// features/playersDatabase/services/read/playerPage.read.js

import { collection, doc, getDoc, getDocs } from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../catalog/clubs.catalog.js'
import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../catalog/leagues.catalog.js'
import { cleanValue, toNumberOrZero } from '../../model/value.model.js'
import { buildPlayerMatchValues } from '../../model/playerIdentity.model.js'
import {
  buildScoutProfileCombinations,
  SCOUT_PROFILES,
} from '../../../../shared/players/scouting/index.js'

const playerDocRef = documentId =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.players, cleanValue(documentId))

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

const buildScoutProfileDisplay = (profiles = []) => {
  const scoutProfiles = Array.isArray(profiles) ? profiles : []
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

const getClubShortName = clubId => getClub(clubId)?.shortName || getClub(clubId)?.name || ''

const buildHistoryRow = (row, { isCurrentSeason = false } = {}) => {
  const league = getLeague(row.leagueId)
  const playerStats = row.playerStats || {}

  return {
    id: cleanValue(row.id || [
      row.seasonKey,
      row.teamId,
      row.clubId,
    ].filter(Boolean).join('_')),
    seasonKey: cleanValue(row.seasonKey || row.seasonId || '-'),
    isCurrentSeason,
    fullName: cleanValue(row.fullName || row.displayName || '-'),
    displayName: cleanValue(row.displayName || row.fullName || '-'),
    normalizedName: cleanValue(row.normalizedName),
    clubName: cleanValue(getClubShortName(row.clubId) || row.clubName || '-'),
    clubId: cleanValue(row.clubId),
    teamName: cleanValue(row.ageGroupLabel || row.ageGroupId || row.teamName || league?.ageGroupLabel || league?.ageGroupId || '-'),
    leagueName: cleanValue(league?.name || row.leagueName || row.leagueId || '-'),
    leagueId: cleanValue(row.leagueId),
    teamId: cleanValue(row.birthTeamId || row.teamId),
    birthTeamId: cleanValue(row.birthTeamId || row.teamId),
    birthTeamDocumentId: cleanValue(row.birthTeamDocumentId || row.birthTeamId || row.teamId),
    birthTeamSlot: toNumberOrZero(row.birthTeamSlot || 1) || 1,
    ageGroupId: cleanValue(row.ageGroupId),
    ageGroupLabel: cleanValue(row.ageGroupLabel || row.ageGroupId || league?.ageGroupLabel || league?.ageGroupId),
    birthYear: row.birthYear ?? null,
    birthDate: row.birthDate ?? null,
    status: cleanValue(row.status),
    favorite: Boolean(row.favorite),
    notes: cleanValue(row.notes),
    avatarUrl: cleanValue(row.avatarUrl),
    playerUrl: cleanValue(row.playerUrl),
    primaryPosition: cleanValue(row.primaryPosition),
    positionLayer: cleanValue(row.positionLayer),
    numShirt: cleanValue(row.numShirt),
    games: toNumberOrZero(playerStats.games ?? row.games),
    starts: toNumberOrZero(playerStats.starts ?? row.starts),
    minutes: toNumberOrZero(playerStats.minutes ?? row.minutes),
    goals: toNumberOrZero(playerStats.goals ?? row.goals),
    yellowCards: toNumberOrZero(playerStats.yellowCards ?? row.yellowCards),
    playerStats,
    scoutProfiles: Array.isArray(row.scoutProfiles) ? row.scoutProfiles : [],
    scoutProfileDisplay: buildScoutProfileDisplay(row.scoutProfiles),
    placeholder: Boolean(row.placeholder),
  }
}

const uniqueSeasonRows = rows => {
  const map = new Map()

  ;(Array.isArray(rows) ? rows : []).forEach(row => {
    const key = [
      cleanValue(row.seasonKey || row.seasonId),
      cleanValue(row.teamId || row.birthTeamId),
      cleanValue(row.clubId),
      cleanValue(row.leagueId),
    ].filter(Boolean).join('__')

    if (!key || map.has(key)) return

    map.set(key, row)
  })

  return [...map.values()]
}

const normalizeMatchValues = value =>
  buildPlayerMatchValues(value)
    .map(item => cleanValue(item).toLowerCase())
    .filter(Boolean)

const isSamePlayerSource = (candidate = {}, player = {}) => {
  const candidateKeys = new Set(normalizeMatchValues(candidate))
  const playerKeys = normalizeMatchValues(player)

  return playerKeys.some(key => candidateKeys.has(key))
}

const buildFallbackTeamPlayerRow = ({
  teamDoc = {},
  seasonRow = {},
  playerRow = {},
  isCurrentSeason = false,
} = {}) => {
  const league = getLeague(seasonRow.leagueId || teamDoc.leagueId)

  return {
    ...buildHistoryRow({
    ...playerRow,
    ...seasonRow,
    clubId: teamDoc.clubId || seasonRow.clubId || playerRow.clubId,
    clubName: teamDoc.clubName || seasonRow.clubName || playerRow.clubName,
    ageGroupId: seasonRow.ageGroupId || teamDoc.ageGroupId,
    ageGroupLabel: seasonRow.ageGroupLabel || teamDoc.ageGroupLabel || league?.ageGroupLabel,
    leagueId: seasonRow.leagueId || teamDoc.leagueId,
    leagueName: seasonRow.leagueName || league?.name,
    teamId: teamDoc.birthTeamId || teamDoc.teamId || seasonRow.birthTeamId || seasonRow.teamId,
    birthTeamId: teamDoc.birthTeamId || teamDoc.teamId || seasonRow.birthTeamId || seasonRow.teamId,
    birthTeamDocumentId: teamDoc.id || teamDoc.birthTeamDocumentId || seasonRow.birthTeamDocumentId,
    birthTeamSlot: teamDoc.birthTeamSlot || seasonRow.birthTeamSlot || 1,
    playerStats: playerRow.playerStats || {},
    scoutProfiles: Array.isArray(playerRow.scoutProfiles) ? playerRow.scoutProfiles : [],
  }, { isCurrentSeason }),
    fullName: cleanValue(playerRow.fullName || playerRow.displayName || playerRow.matchedPlayerName || '-'),
    displayName: cleanValue(playerRow.displayName || playerRow.fullName || playerRow.matchedPlayerName || '-'),
    normalizedName: cleanValue(playerRow.normalizedName),
    birthYear: playerRow.birthYear ?? seasonRow.birthYear ?? null,
    birthDate: playerRow.birthDate ?? null,
    status: cleanValue(playerRow.status),
    favorite: Boolean(playerRow.favorite),
    notes: cleanValue(playerRow.notes),
    avatarUrl: cleanValue(playerRow.avatarUrl),
    playerUrl: cleanValue(playerRow.playerUrl),
    primaryPosition: cleanValue(playerRow.primaryPosition),
    positionLayer: cleanValue(playerRow.positionLayer),
    numShirt: cleanValue(playerRow.numShirt),
    playerStats: playerRow.playerStats || {},
    scoutProfiles: Array.isArray(playerRow.scoutProfiles) ? playerRow.scoutProfiles : [],
  }
}

const buildFallbackPlayerDoc = async playerId => {
  const safePlayerId = cleanValue(playerId)
  if (!safePlayerId) return null

  const snapshot = await getDocs(collection(db, PLAYERS_DATABASE_COLLECTIONS.teams))
  const currentRows = []
  const historyRows = []

  snapshot.docs.forEach(teamItem => {
    const teamDoc = {
      id: teamItem.id,
      ...teamItem.data(),
    }
    ;[
      ...(Array.isArray(teamDoc.current)
        ? teamDoc.current.map(seasonRow => ({ seasonRow, isCurrentSeason: true }))
        : []),
      ...(Array.isArray(teamDoc.history)
        ? teamDoc.history.map(seasonRow => ({ seasonRow, isCurrentSeason: false }))
        : []),
    ].forEach(({ seasonRow, isCurrentSeason }) => {
      const teamPlayers = Array.isArray(seasonRow.teamPlayers) ? seasonRow.teamPlayers : []
      const playerRow = teamPlayers.find(candidate => isSamePlayerSource(candidate, { playerDocumentId: safePlayerId }))
      if (!playerRow) return

      const nextRow = buildFallbackTeamPlayerRow({
        teamDoc,
        seasonRow,
        playerRow,
        isCurrentSeason,
      })

      if (isCurrentSeason) {
        currentRows.push(nextRow)
        return
      }

      historyRows.push(nextRow)
    })
  })

  const rows = uniqueSeasonRows([
    ...currentRows,
    ...historyRows,
  ])

  if (!rows.length) return null

  const firstRow = rows[0]

  return buildFlatPlayerDoc({
    id: safePlayerId,
    fullName: firstRow.fullName || firstRow.displayName || '-',
    normalizedName: firstRow.normalizedName,
    birthYear: firstRow.birthYear,
    birthDate: firstRow.birthDate,
    current: currentRows.length ? currentRows : [firstRow],
    history: historyRows,
    status: firstRow.status,
    favorite: firstRow.favorite,
    notes: firstRow.notes,
    avatarUrl: firstRow.avatarUrl,
  })
}

const pickCurrentSeason = player => {
  const currentRows = Array.isArray(player.current) ? player.current : []
  if (currentRows.length) return currentRows[0]

  const historyRows = Array.isArray(player.history) ? player.history : []
  if (historyRows.length) return historyRows[0]

  return null
}

const buildFlatPlayerDoc = player => {
  const currentSeason = pickCurrentSeason(player) || {}
  const seasonContexts = uniqueSeasonRows([
    ...(Array.isArray(player.current)
      ? player.current.map(row => buildHistoryRow(row, { isCurrentSeason: true }))
      : []),
    ...(Array.isArray(player.history)
      ? player.history.map(row => buildHistoryRow(row, { isCurrentSeason: false }))
      : []),
  ])

  return {
    id: cleanValue(player.id),
    entityId: cleanValue(player.id),
    playerDocumentId: cleanValue(player.id),
    fullName: cleanValue(player.fullName || currentSeason.fullName || '-'),
    displayName: cleanValue(player.fullName || currentSeason.fullName || '-'),
    normalizedName: cleanValue(player.normalizedName),
    birthYear: player.birthYear ?? null,
    birthDate: player.birthDate ?? null,
    status: cleanValue(player.status),
    favorite: Boolean(player.favorite),
    notes: cleanValue(player.notes),
    avatarUrl: cleanValue(player.avatarUrl),

    leagueId: cleanValue(currentSeason.leagueId),
    leagueName: cleanValue(getLeague(currentSeason.leagueId)?.name || currentSeason.leagueName || currentSeason.leagueId || '-'),
    teamId: cleanValue(currentSeason.birthTeamId || currentSeason.teamId),
    birthTeamId: cleanValue(currentSeason.birthTeamId || currentSeason.teamId),
    birthTeamDocumentId: cleanValue(currentSeason.birthTeamDocumentId || currentSeason.birthTeamId || currentSeason.teamId),
    birthTeamSlot: toNumberOrZero(currentSeason.birthTeamSlot || 1) || 1,
    teamName: cleanValue(
      currentSeason.ageGroupLabel ||
      currentSeason.ageGroupId ||
      currentSeason.teamName ||
      getLeague(currentSeason.leagueId)?.ageGroupLabel ||
      getLeague(currentSeason.leagueId)?.ageGroupId ||
      '-'
    ),
    ageGroupLabel: cleanValue(
      currentSeason.ageGroupLabel ||
      currentSeason.ageGroupId ||
      getLeague(currentSeason.leagueId)?.ageGroupLabel ||
      getLeague(currentSeason.leagueId)?.ageGroupId ||
      ''
    ),
    seasonId: cleanValue(currentSeason.seasonId),
    seasonKey: cleanValue(currentSeason.seasonKey),
    primaryPosition: cleanValue(currentSeason.primaryPosition),
    positionLayer: cleanValue(currentSeason.positionLayer),
    numShirt: cleanValue(currentSeason.numShirt),
    playerUrl: cleanValue(currentSeason.playerUrl),
    primaryScoutProfileId: cleanValue(Array.isArray(currentSeason.scoutProfiles) ? currentSeason.scoutProfiles[0]?.profileId : ''),
    primaryScoutReliabilityLevel: cleanValue(Array.isArray(currentSeason.scoutProfiles) ? currentSeason.scoutProfiles[0]?.profileReliability || currentSeason.scoutProfiles[0]?.reliabilityLevel : ''),
    primaryScoutScore: Number.isFinite(Number(Array.isArray(currentSeason.scoutProfiles) ? currentSeason.scoutProfiles[0]?.profileScore || currentSeason.scoutProfiles[0]?.score : null))
      ? Number(Array.isArray(currentSeason.scoutProfiles) ? currentSeason.scoutProfiles[0]?.profileScore || currentSeason.scoutProfiles[0]?.score : null)
      : null,
    secondaryScoutProfileId: cleanValue(Array.isArray(currentSeason.scoutProfiles) ? currentSeason.scoutProfiles[1]?.profileId : ''),
    secondaryScoutReliabilityLevel: cleanValue(Array.isArray(currentSeason.scoutProfiles) ? currentSeason.scoutProfiles[1]?.profileReliability || currentSeason.scoutProfiles[1]?.reliabilityLevel : ''),
    secondaryScoutScore: Number.isFinite(Number(Array.isArray(currentSeason.scoutProfiles) ? currentSeason.scoutProfiles[1]?.profileScore || currentSeason.scoutProfiles[1]?.score : null))
      ? Number(Array.isArray(currentSeason.scoutProfiles) ? currentSeason.scoutProfiles[1]?.profileScore || currentSeason.scoutProfiles[1]?.score : null)
      : null,
    minutes: toNumberOrZero(currentSeason.playerStats?.minutes ?? currentSeason.minutes),
    goals: toNumberOrZero(currentSeason.playerStats?.goals ?? currentSeason.goals),
    yellowCards: toNumberOrZero(currentSeason.playerStats?.yellowCards ?? currentSeason.yellowCards),
    starts: toNumberOrZero(currentSeason.playerStats?.starts ?? currentSeason.starts),
    substituteIn: toNumberOrZero(currentSeason.playerStats?.substituteIn ?? currentSeason.substituteIn),
    substitutedOut: toNumberOrZero(currentSeason.playerStats?.substitutedOut ?? currentSeason.substitutedOut),
    playerStats: currentSeason.playerStats || {
      games: toNumberOrZero(currentSeason.games),
      goals: toNumberOrZero(currentSeason.goals),
      yellowCards: toNumberOrZero(currentSeason.yellowCards),
      minutes: toNumberOrZero(currentSeason.minutes),
      starts: toNumberOrZero(currentSeason.starts),
      substituteIn: toNumberOrZero(currentSeason.substituteIn),
      substitutedOut: toNumberOrZero(currentSeason.substitutedOut),
    },
    seasonContexts,
    history: seasonContexts,
    seasons: seasonContexts,
    scoutProfiles: Array.isArray(currentSeason.scoutProfiles) ? currentSeason.scoutProfiles : [],
    scoutProfileDisplay: buildScoutProfileDisplay(currentSeason.scoutProfiles || []),
  }
}

export async function readPlayerPageData({ playerId = '' } = {}) {
  const safePlayerId = cleanValue(playerId)
  if (!safePlayerId) return null

  const snapshot = await getDoc(playerDocRef(safePlayerId))
  if (!snapshot.exists()) {
    return buildFallbackPlayerDoc(safePlayerId)
  }

  return buildFlatPlayerDoc({
    id: snapshot.id,
    ...snapshot.data(),
  })
}
