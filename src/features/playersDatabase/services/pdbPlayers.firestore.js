// src/features/playersDatabase/services/pdbPlayers.firestore.js

import {
  collection,
  doc,
  documentId,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'

import { db } from '../../../services/firebase/firebase.js'
import {
  buildScoutMetrics,
  buildPlayerScoutSignals,
  TEAM_FILTER,
} from '../../../shared/players/scouting/index.js'
import {
  trackFirestoreRead,
  trackFirestoreTransaction,
} from '../../../services/firestore/usage/index.js'
import { buildTeamSlotId } from '../catalog/teamIdentity.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../constants/playersDatabase.constants.js'

const clean = value => String(value ?? '').trim()
const FEATURE = 'playersDatabase'
const PROVIDER = 'football_org_il'
const hasOwn = (obj, key) =>
  Object.prototype.hasOwnProperty.call(obj || {}, key)

const playersRef = () =>
  collection(db, PLAYERS_DATABASE_COLLECTIONS.players)

const playerSeasonsRef = () =>
  collection(db, PLAYERS_DATABASE_COLLECTIONS.playerSeasons)

const playerStatsRef = () =>
  collection(db, PLAYERS_DATABASE_COLLECTIONS.playerStats)

const playerSearchRef = () =>
  collection(db, PLAYERS_DATABASE_COLLECTIONS.playerSearch)

const leagueDocRef = leagueId =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.leagues, clean(leagueId))

const toNumberOrNull = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const splitList = value => {
  if (Array.isArray(value)) return value.map(clean).filter(Boolean)
  return clean(value).split(/[,\s/|]+/).map(clean).filter(Boolean)
}

const unique = values =>
  Array.from(new Set(values.map(clean).filter(Boolean)))

const chunks = (items, size) => {
  const result = []
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size))
  }
  return result
}

const uniqueRowsById = rows => {
  const rowsById = new Map()
  rows.forEach(row => {
    if (row?.id) rowsById.set(row.id, row)
  })
  return Array.from(rowsById.values())
}

const normalizeTeamLookup = teamOrKey => {
  if (typeof teamOrKey === 'string') {
    return {
      teamSeasonKey: clean(teamOrKey),
    }
  }

  const team = teamOrKey || {}
  const builtTeamSlotId = buildTeamSlotId({
    clubId: team.clubId,
    ageGroupId: team.ageGroupId,
    teamSlot: team.teamSlot,
  })

  return {
    teamSeasonKey: clean(team.teamSeasonKey),
    teamSlotId: clean(team.teamSlotId || team.teamId || team.teamCatalogId || builtTeamSlotId),
    externalTeamId: clean(team.externalTeamId),
    seasonId: clean(team.seasonId),
    ageGroupId: clean(team.ageGroupId),
    leagueId: clean(team.leagueId),
    teamSlot: clean(team.teamSlot),
  }
}

const sameIfProvided = (expected, actual) => {
  const value = clean(expected)
  if (!value) return true
  return clean(actual) === value
}

const isSameTeamSeason = (row, lookup) => (
  sameIfProvided(lookup.seasonId, row.seasonId) &&
  sameIfProvided(lookup.ageGroupId, row.ageGroupId) &&
  sameIfProvided(lookup.teamSlot, row.teamSlot)
)

const normalizeName = value =>
  clean(value)
    .toLowerCase()
    .replace(/[׳'״"]/g, '')
    .replace(/\s+/g, ' ')

const nameVariants = value => {
  const name = normalizeName(value)
  const words = name.split(' ').filter(Boolean)
  const reversed = words.length > 1 ? words.slice().reverse().join(' ') : ''

  return unique([name, reversed])
}

const ratio = (value, total) => {
  const n = Number(value)
  const t = Number(total)
  return Number.isFinite(n) && Number.isFinite(t) && t > 0 ? n / t : 0
}

const teamFilterPass = ({ filter, team }) => {
  const attack = Number(team.attackEdge)
  const defense = Number(team.defenseEdge)
  const attackOk = Number.isFinite(attack) && attack > 0
  const defenseOk = Number.isFinite(defense) && defense > 0
  const clearOk =
    (Number.isFinite(attack) && attack >= 0.1) ||
    (Number.isFinite(defense) && defense >= 0.1)

  if (!filter || filter === TEAM_FILTER.ANY) return true
  if (filter === TEAM_FILTER.ANY_POSITIVE) return attackOk || defenseOk
  if (filter === TEAM_FILTER.DEFENSE_POSITIVE) return defenseOk
  if (filter === TEAM_FILTER.CLEAR_POSITIVE) return clearOk

  return false
}

const splitSignalsByTeam = ({ signals = [], team = {} }) => {
  const eligible = []
  const blocked = {}

  signals.forEach(signal => {
    if (teamFilterPass({ filter: signal.teamFilter, team })) {
      eligible.push(signal)
      return
    }

    blocked[signal.profileId] = {
      profileId: signal.profileId,
      profileLabel: signal.profileLabel,
      requiredTeamFilter: signal.teamFilter,
      reason: 'team_context_failed',
      attackEdge: toNumberOrNull(team.attackEdge),
      defenseEdge: toNumberOrNull(team.defenseEdge),
    }
  })

  return {
    eligible,
    blocked,
  }
}

const compactObject = obj =>
  Object.fromEntries(
    Object.entries(obj || {}).filter(([, value]) => value !== undefined)
  )

const buildPlayerDoc = row => {
  const source = row.source || {}

  return {
    id: row.playerDocId,
    externalPlayerId: clean(source.externalPlayerId),
    fullName: clean(source.fullName),
    normalizedName: normalizeName(source.fullName),
    birthYear: toNumberOrNull(source.birthYear),
    birthDate: clean(source.birthDate || source.dateOfBirth || source.birthDay || source.birthday),
    primaryPosition: clean(source.primaryPosition || source.positionCode || source.playerPosition),
    positions: splitList(source.positions),
    positionLayer: clean(source.positionLayer),
    status: 'active',
    source: {
      provider: PROVIDER,
      playerUrl: clean(source.profileUrl),
    },
    updatedAt: serverTimestamp(),
  }
}

const buildPlayerSeasonDoc = row => {
  const source = row.source || {}
  const team = row.teamIdentity || {}

  return {
    id: row.playerSeasonDocId,
    playerId: row.playerDocId,
    externalPlayerId: clean(source.externalPlayerId),
    fullName: clean(source.fullName),
    seasonId: clean(team.seasonId || source.seasonId),
    playerBirthYear: toNumberOrNull(source.birthYear),
    birthDate: clean(source.birthDate || source.dateOfBirth || source.birthDay || source.birthday),
    primaryPosition: clean(source.primaryPosition || source.positionCode || source.playerPosition),
    positions: splitList(source.positions),
    positionLayer: clean(source.positionLayer),
    clubId: clean(team.clubId || row.clubMatch?.id),
    clubName: clean(team.clubName || row.clubMatch?.name || source.clubName),
    ageGroupId: clean(team.ageGroupId || source.ageGroupId),
    ageGroupLabel: clean(team.ageGroupLabel || source.ageGroupLabel),
    teamSlot: toNumberOrNull(team.teamSlot),
    teamId: clean(team.teamSlotId),
    teamSlotId: clean(team.teamSlotId),
    teamCatalogId: clean(team.teamSlotId),
    teamSeasonKey: clean(team.teamSeasonKey),
    externalTeamId: clean(team.externalTeamId || source.externalTeamId),
    teamName: clean(team.clubName || row.clubMatch?.name || source.clubName),
    leagueId: clean(team.leagueId || row.leagueMatch?.id),
    leagueName: clean(team.leagueName || row.leagueMatch?.name || source.leagueName),
    sourceLeagueName: clean(source.sourceLeagueName || source.leagueName),
    sourceTeamName: clean(source.sourceTeamName),
    source: {
      provider: PROVIDER,
      playerUrl: clean(source.profileUrl),
      teamUrl: clean(source.teamUrl),
      rowNumber: toNumberOrNull(source.position),
    },
    updatedAt: serverTimestamp(),
  }
}

const playerIdFromSeason = row => {
  const playerId = clean(row.playerId || row.playerDocId)
  if (playerId) return playerId

  const externalPlayerId = clean(row.externalPlayerId)
  return externalPlayerId ? `fb_${externalPlayerId}` : ''
}

const seasonNeedsPlayerIdentity = row =>
  !clean(row.birthDate) ||
  !clean(row.primaryPosition) ||
  (
    !clean(row.positionLayer) &&
    !(Array.isArray(row.positions) && row.positions.length)
  )

const mergePlayerIntoSeason = (season = {}, player = {}) => ({
  ...player,
  ...season,
  id: season.id,
  playerDoc: player,
  fullName: clean(season.fullName) || clean(player.fullName),
  externalPlayerId: clean(season.externalPlayerId) || clean(player.externalPlayerId),
  birthYear: season.birthYear ?? player.birthYear ?? null,
  playerBirthYear: season.playerBirthYear ?? player.birthYear ?? null,
  teamId: clean(season.teamId) || clean(season.teamSlotId) || clean(season.teamSeasonKey),
  teamCatalogId: clean(season.teamCatalogId) || clean(season.teamSlotId),
  birthDate: clean(season.birthDate) || clean(player.birthDate),
  primaryPosition: hasOwn(season, 'primaryPosition')
    ? clean(season.primaryPosition)
    : clean(player.primaryPosition),
  positions: hasOwn(season, 'positions')
    ? season.positions
    : splitList(player.positions),
  positionLayer: hasOwn(season, 'positionLayer')
    ? clean(season.positionLayer)
    : clean(player.positionLayer),
})

const playerSeasonDocFromPlayer = (player = {}, team = {}, options = {}) => {
  const playerId = clean(player.id || player.playerId)
  const teamSeasonKey = clean(team.teamSeasonKey)
  const teamSlotId = clean(team.teamSlotId || team.teamId || team.teamCatalogId || buildTeamSlotId({
    clubId: team.clubId,
    ageGroupId: team.ageGroupId,
    teamSlot: team.teamSlot,
  }))
  const playerBirthYear = toNumberOrNull(player.birthYear || player.playerBirthYear)
  const teamBirthYear = toNumberOrNull(team.birthYear)

  return {
    id: `${playerId}__${teamSeasonKey}`,
    playerId,
    externalPlayerId: clean(player.externalPlayerId),
    fullName: clean(player.fullName || player.playerName),
    seasonId: clean(team.seasonId),
    playerBirthYear,
    birthDate: clean(player.birthDate),
    primaryPosition: clean(player.primaryPosition),
    positions: splitList(player.positions),
    positionLayer: clean(player.positionLayer),
    clubId: clean(team.clubId),
    clubName: clean(team.clubName || team.teamName),
    ageGroupId: clean(team.ageGroupId),
    ageGroupLabel: clean(team.ageGroupLabel),
    teamSlot: toNumberOrNull(team.teamSlot),
    teamId: teamSlotId,
    teamSlotId,
    teamCatalogId: teamSlotId,
    teamSeasonKey,
    externalTeamId: clean(team.externalTeamId),
    teamName: clean(team.clubName || team.teamName),
    leagueId: clean(team.leagueId),
    leagueName: clean(team.leagueName),
    sourceLeagueName: clean(team.sourceLeagueName || team.leagueName),
    sourceTeamName: clean(team.sourceTeamName || team.teamName || team.clubName),
    rosterStatus: clean(options.rosterStatus || 'active'),
    isPlayingUp: options.isPlayingUp ?? Boolean(playerBirthYear && teamBirthYear && playerBirthYear > teamBirthYear),
    source: {
      provider: PROVIDER,
      playerUrl: clean(player?.source?.playerUrl),
      teamUrl: clean(team.teamUrl),
      addedBy: 'statsImport',
      addedReason: clean(options.reason),
    },
    updatedAt: serverTimestamp(),
  }
}

const playerDocFromPlayer = (player = {}) => {
  const playerId = clean(player.id || player.playerId)
  const fullName = clean(player.fullName || player.playerName)

  return {
    id: playerId,
    externalPlayerId: clean(player.externalPlayerId),
    fullName,
    normalizedName: normalizeName(fullName),
    birthYear: toNumberOrNull(player.birthYear || player.playerBirthYear),
    birthDate: clean(player.birthDate),
    primaryPosition: clean(player.primaryPosition),
    positions: splitList(player.positions),
    positionLayer: clean(player.positionLayer),
    status: clean(player.status || 'active'),
    source: {
      provider: clean(player?.source?.provider || PROVIDER),
      playerUrl: clean(player?.source?.playerUrl || player.playerUrl),
    },
    updatedAt: serverTimestamp(),
  }
}

async function listPlayersByIds(playerIds = []) {
  const ids = unique(playerIds)
  if (!ids.length) return new Map()

  const docs = []

  for (const batchIds of chunks(ids, 30)) {
    const snap = await getDocs(query(
      playersRef(),
      where(documentId(), 'in', batchIds)
    ))

    docs.push(...snap.docs)
  }

  const rows = docs.map(item => ({
    id: item.id,
    ...item.data(),
  }))

  trackFirestoreRead({
    collection: PLAYERS_DATABASE_COLLECTIONS.players,
    feature: FEATURE,
    action: 'listPlayersByIds',
    docs: rows,
    docsCount: rows.length,
    meta: {
      requestedCount: ids.length,
    },
  })

  return new Map(rows.map(row => [row.id, row]))
}

export async function findPlayersByNames(names = []) {
  const keys = unique(names.flatMap(nameVariants))
  if (!keys.length) return []

  const docs = []

  for (const batchKeys of chunks(keys, 30)) {
    const snap = await getDocs(query(
      playersRef(),
      where('normalizedName', 'in', batchKeys)
    ))

    docs.push(...snap.docs)
  }

  const rows = uniqueRowsById(docs.map(item => ({
    id: item.id,
    ...item.data(),
  })))

  trackFirestoreRead({
    collection: PLAYERS_DATABASE_COLLECTIONS.players,
    feature: FEATURE,
    action: 'findPlayersByNames',
    docs: rows,
    docsCount: rows.length,
    meta: {
      requestedCount: keys.length,
    },
  })

  return rows
}

export async function addPlayerToTeam(player = {}, team = {}, options = {}) {
  const playerId = clean(player.id || player.playerId)
  const teamSeasonKey = clean(team.teamSeasonKey)

  if (!playerId || !teamSeasonKey) {
    throw new Error('missing player or team identity')
  }

  const playerDoc = playerDocFromPlayer({
    ...player,
    id: playerId,
  })
  const seasonDoc = playerSeasonDocFromPlayer({
    ...player,
    id: playerId,
  }, team, options)
  const batch = writeBatch(db)

  batch.set(
    doc(playersRef(), playerDoc.id),
    playerDoc,
    { merge: true }
  )

  batch.set(
    doc(playerSeasonsRef(), seasonDoc.id),
    seasonDoc,
    { merge: true }
  )

  await batch.commit()
  await refreshLeagueTeamIndex(team)

  trackFirestoreTransaction({
    collection: PLAYERS_DATABASE_COLLECTIONS.playerSeasons,
    feature: FEATURE,
    action: 'addPlayerToTeam',
    readsCount: 0,
    writesCount: 2,
    readPayload: null,
    writePayload: {
      player: playerDoc,
      season: seasonDoc,
    },
    meta: {
      playerId,
      teamSeasonKey,
    },
  })

  return seasonDoc
}

export async function updatePlayerSeasonPosition(row = {}, patch = {}) {
  const id = clean(row.id || row.playerSeasonId)
  if (!id) throw new Error('missing player season id')

  const payload = {
    updatedAt: serverTimestamp(),
  }
  const positionLayer = clean(patch.positionLayer)
  const primaryPosition = clean(patch.primaryPosition)

  if ('positionLayer' in patch) payload.positionLayer = positionLayer
  if ('primaryPosition' in patch) payload.primaryPosition = primaryPosition
  if ('positions' in patch) payload.positions = splitList(patch.positions)

  const batch = writeBatch(db)
  batch.set(
    doc(playerSeasonsRef(), id),
    payload,
    { merge: true }
  )

  const seasonSnap = await getDocs(query(
    playerSeasonsRef(),
    where(documentId(), '==', id)
  ))
  const baseSeason = seasonSnap.docs[0]
    ? { id: seasonSnap.docs[0].id, ...seasonSnap.docs[0].data() }
    : { id, ...row }
  const nextSeason = {
    ...baseSeason,
    ...payload,
  }
  const statsRows = await listPlayerStatsDocsBySeasonIds([id])
  const searchRows = await listPlayerSearchDocsBySeasonIds([id])
  const searchById = new Map(searchRows.map(item => [item.id, item]))
  let summaryTeam = nextSeason

  statsRows.forEach(statsDoc => {
    const existingSearch = searchById.get(statsDoc.id) || {}
    const current = statsDoc.current || statsDoc.rawStats || {}
    const teamData = teamFromSearchAndStats(existingSearch, statsDoc, row)
    summaryTeam = teamData
    const searchDoc = buildPlayerSearchDoc({
      id: statsDoc.id,
      row: {
        ...statsDoc,
        stats: current,
        playerSeasonId: id,
        playerId: clean(statsDoc.playerId || nextSeason.playerId),
      },
      season: nextSeason,
      team: teamData,
      current,
      capturedAt: clean(statsDoc.lastStatsAt || current.capturedAt) || new Date().toISOString(),
      meta: {
        snapshotType: statsDoc.lastSnapshotType || current.snapshotType,
        roundNumber: statsDoc.lastRoundNumber ?? current.roundNumber,
      },
    })

    batch.set(
      doc(playerStatsRef(), statsDoc.id),
      scoutStatsPatch(searchDoc),
      { merge: true }
    )
    batch.set(
      doc(playerSearchRef(), statsDoc.id),
      searchDoc,
      { merge: true }
    )
  })

  await batch.commit()
  await refreshLeagueTeamIndex(summaryTeam)

  trackFirestoreTransaction({
    collection: PLAYERS_DATABASE_COLLECTIONS.playerSeasons,
    feature: FEATURE,
    action: 'updatePlayerSeasonPosition',
    readsCount: 1 + statsRows.length + searchRows.length,
    writesCount: 1 + (statsRows.length * 2),
    readPayload: null,
    writePayload: {
      id,
      ...payload,
    },
    meta: {
      id,
      positionLayer: payload.positionLayer,
      primaryPosition: payload.primaryPosition,
      statsRebuiltCount: statsRows.length,
      searchRebuiltCount: statsRows.length,
    },
  })

  return {
    id,
    ...payload,
  }
}

const statNumber = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const ageGroupYear = team => {
  const explicit = toNumberOrNull(team.birthYear || team.ageGroupYear)
  if (explicit) return explicit

  const seasonStart = clean(team.seasonId).match(/^(\d{4})/)?.[1]
  const age = clean(team.ageGroupId).match(/u(\d+)/i)?.[1]
  const startYear = Number(seasonStart)
  const ageNumber = Number(age)

  if (!Number.isFinite(startYear) || !Number.isFinite(ageNumber)) return null

  return startYear - ageNumber + 1
}

const rowTeam = (row, team) =>
  row.teamContext || row.team || team

const statDocId = (row, team) => {
  const teamData = rowTeam(row, team)
  return `${clean(row.playerSeasonId)}__${clean(teamData.leagueId || 'league')}`
}

const statSnapKey = item => [
  clean(item.seasonId || item.idSeason || item.idSeasion),
  clean(item.snapshotType || 'season_current'),
  clean(item.roundNumber),
].join('__')

const mergeHistory = (history = [], current = {}) => [
  ...history.filter(item => statSnapKey(item) !== statSnapKey(current)),
  current,
]

const statsObj = (row, team, capturedAt, meta = {}) => {
  const stats = row.stats || {}
  const teamData = rowTeam(row, team)
  const seasonId = clean(teamData.seasonId)
  const snapshotType = clean(meta.snapshotType || 'season_current')
  const roundNumber = toNumberOrNull(meta.roundNumber)

  return {
    idSeason: seasonId,
    idSeasion: seasonId,
    seasonId,
    leagueId: clean(teamData.leagueId),
    teamSeasonKey: clean(teamData.teamSeasonKey),
    playerId: clean(row.playerId),
    playerSeasonId: clean(row.playerSeasonId),
    sourcePlayerName: clean(stats.playerName),
    games: statNumber(stats.games),
    goals: statNumber(stats.goals),
    yellowCards: statNumber(stats.yellowLeagueCup),
    yellowTotoCards: statNumber(stats.yellowToto),
    redCards: statNumber(stats.redCards),
    starts: statNumber(stats.starts),
    subIn: statNumber(stats.subIn),
    subOut: statNumber(stats.subOut),
    minutes: statNumber(stats.minutes),
    snapshotType,
    roundNumber,
    isSeasonFinal: snapshotType === 'season_final',
    capturedAt,
  }
}

async function listPlayerSeasonRowsByIds(ids = []) {
  const seasonIds = unique(ids)
  if (!seasonIds.length) return new Map()

  const docs = []

  for (const batchIds of chunks(seasonIds, 30)) {
    const snap = await getDocs(query(
      playerSeasonsRef(),
      where(documentId(), 'in', batchIds)
    ))

    docs.push(...snap.docs)
  }

  return new Map(docs.map(item => [
    item.id,
    {
      id: item.id,
      ...item.data(),
    },
  ]))
}

const scoutProfilesMap = signals =>
  signals.reduce((acc, signal) => {
    acc[signal.profileId] = {
      profileId: signal.profileId,
      profileLabel: signal.profileLabel,
      score: signal.score,
      reliabilityLevel: signal.reliability?.level || '',
      reliabilityScore: signal.reliability?.score ?? null,
      reasons: signal.reasons || [],
      warnings: signal.warnings || [],
      requiredReview: signal.requiredReview || [],
      metrics: signal.metrics || {},
      matchedRules: signal.matchedRules || [],
    }

    return acc
  }, {})

const buildPlayerSearchDoc = ({
  id,
  row,
  season,
  team,
  current,
  capturedAt,
  meta,
}) => {
  const stats = row.stats || {}
  const teamBirthYear = ageGroupYear(team)
  const isPlayingUp = Boolean(
    season.isPlayingUp ||
    row.isPlayingUp ||
    current.isPlayingUp ||
    clean(season?.source?.addedReason) === 'playing_up' ||
    clean(row.plannedReason) === 'playing_up'
  )
  const playingUpMinutes = isPlayingUp
    ? toNumberOrNull(current.minutes)
    : toNumberOrNull(season.playingUpMinutes || current.playingUpMinutes)
  const player = {
    ...season,
    ...current,
    id: clean(season.playerId || row.playerId),
    playerId: clean(season.playerId || row.playerId),
    playerSeasonId: clean(row.playerSeasonId),
    fullName: clean(season.fullName || stats.playerName),
    birthYear: toNumberOrNull(season.birthYear || season.playerBirthYear),
    yearOfBirth: toNumberOrNull(season.birthYear || season.playerBirthYear),
    primaryPosition: clean(season.primaryPosition),
    positionLayer: clean(season.positionLayer),
    positions: splitList(season.positions),
    isPlayingUp,
    playingUpMinutes,
  }
  const teamData = {
    ...team,
    games: toNumberOrNull(team.games),
    gamesPlayed: toNumberOrNull(team.games),
    goalsFor: toNumberOrNull(team.goalsFor),
    goalsAgainst: toNumberOrNull(team.goalsAgainst),
    teamGoals: toNumberOrNull(team.goalsFor),
    attackEdge: toNumberOrNull(team.attackEdge),
    defenseEdge: toNumberOrNull(team.defenseEdge),
    birthYear: teamBirthYear,
    ageGroupYear: teamBirthYear,
  }
  const metrics = buildScoutMetrics({
    player,
    team: teamData,
  })
  const signals = buildPlayerScoutSignals({
    player,
    team: teamData,
    perspective: clean(meta?.perspective || team.perspective),
    searchDistance: toNumberOrNull(meta?.searchDistance),
  })
  const {
    eligible,
    blocked,
  } = splitSignalsByTeam({
    signals,
    team: teamData,
  })
  const bestRawSignal = signals[0] || null
  const bestEligibleSignal = eligible[0] || null

  return compactObject({
    id,
    playerId: player.playerId,
    playerSeasonId: clean(row.playerSeasonId),
    externalPlayerId: clean(season.externalPlayerId || stats.externalPlayerId),
    fullName: player.fullName,
    normalizedName: normalizeName(player.fullName),
    birthYear: player.birthYear,
    birthDate: clean(season.birthDate),
    seasonId: clean(team.seasonId),
    idSeason: clean(team.seasonId),
    idSeasion: clean(team.seasonId),
    leagueId: clean(team.leagueId),
    leagueName: clean(team.leagueName),
    clubId: clean(team.clubId),
    clubName: clean(team.clubName || team.teamName),
    teamName: clean(team.clubName || team.teamName),
    teamSeasonKey: clean(team.teamSeasonKey),
    teamSlotId: clean(team.teamSlotId || team.teamId || team.teamCatalogId),
    teamSlot: toNumberOrNull(team.teamSlot),
    externalTeamId: clean(team.externalTeamId),
    ageGroupId: clean(team.ageGroupId),
    ageGroupLabel: clean(team.ageGroupLabel),
    teamBirthYear,
    positionLayer: player.positionLayer,
    primaryPosition: player.primaryPosition,
    positions: player.positions,
    hasPosition: metrics.hasPosition,
    statsType: 'league',
    snapshotType: clean(meta.snapshotType || 'season_current'),
    roundNumber: toNumberOrNull(meta.roundNumber),
    isSeasonFinal: clean(meta.snapshotType) === 'season_final',
    capturedAt,
    current: {
      ...current,
      ...metrics,
    },
    rawStats: current,
    teamContext: {
      games: teamData.games,
      goalsFor: teamData.goalsFor,
      goalsAgainst: teamData.goalsAgainst,
      attackEdge: toNumberOrNull(team.attackEdge),
      defenseEdge: toNumberOrNull(team.defenseEdge),
    },
    rawScoutProfileIds: signals.map(signal => signal.profileId),
    rawScoutProfiles: scoutProfilesMap(signals),
    eligibleScoutProfileIds: eligible.map(signal => signal.profileId),
    eligibleScoutProfiles: scoutProfilesMap(eligible),
    blockedScoutProfiles: blocked,
    bestRawScoutProfileId: bestRawSignal?.profileId || '',
    bestRawScoutProfileLabel: bestRawSignal?.profileLabel || '',
    bestRawScoutScore: bestRawSignal?.score ?? null,
    bestEligibleScoutProfileId: bestEligibleSignal?.profileId || '',
    bestEligibleScoutProfileLabel: bestEligibleSignal?.profileLabel || '',
    bestEligibleScoutScore: bestEligibleSignal?.score ?? null,
    scoutProfileIds: eligible.map(signal => signal.profileId),
    scoutProfiles: scoutProfilesMap(eligible),
    bestScoutProfileId: bestEligibleSignal?.profileId || '',
    bestScoutProfileLabel: bestEligibleSignal?.profileLabel || '',
    bestScoutScore: bestEligibleSignal?.score ?? null,
    bestScoutReliabilityLevel: bestEligibleSignal?.reliability?.level || bestRawSignal?.reliability?.level || '',
    bestScoutReliabilityScore: bestEligibleSignal?.reliability?.score ?? bestRawSignal?.reliability?.score ?? null,
    scoutWarnings: unique(signals.flatMap(signal => signal.warnings || [])),
    searchText: [
      player.fullName,
      season.externalPlayerId,
      team.clubName || team.teamName,
      team.leagueName,
    ].map(normalizeName).filter(Boolean),
    updatedAt: serverTimestamp(),
  })
}

export async function savePlayerStatsRows(rows = [], team = {}, meta = {}) {
  const validRows = rows.filter(row => row.valid && !row.skip && clean(row.playerSeasonId))
  if (!validRows.length) {
    throw new Error('no valid stats rows to save')
  }

  const batch = writeBatch(db)
  const ids = []
  const capturedAt = new Date().toISOString()
  const snapshotType = clean(meta.snapshotType || 'season_current')
  const roundNumber = toNumberOrNull(meta.roundNumber)
  const isSeasonFinal = snapshotType === 'season_final'
  const statRows = validRows.map(row => ({
    row,
    id: statDocId(row, team),
  }))
  const statIds = unique(statRows.map(item => item.id))
  const existingById = new Map()
  const seasonsById = await listPlayerSeasonRowsByIds(
    validRows.map(row => row.playerSeasonId)
  )

  for (const batchIds of chunks(statIds, 30)) {
    const snap = await getDocs(query(
      playerStatsRef(),
      where(documentId(), 'in', batchIds)
    ))

    snap.docs.forEach(item => {
      existingById.set(item.id, {
        id: item.id,
        ...item.data(),
      })
    })
  }

  statRows.forEach(({ row, id }) => {
    const teamData = rowTeam(row, team)
    const current = statsObj(row, teamData, capturedAt, meta)
    const existing = existingById.get(id) || {}
    const history = mergeHistory(existing.history, current)
    const season = seasonsById.get(clean(row.playerSeasonId)) || {}
    const searchDoc = buildPlayerSearchDoc({
      id,
      row,
      season,
      team: teamData,
      current,
      capturedAt,
      meta,
    })

    ids.push(id)

    batch.set(
      doc(playerStatsRef(), id),
      {
        id,
        playerId: clean(row.playerId),
        playerSeasonId: clean(row.playerSeasonId),
        teamSeasonKey: clean(teamData.teamSeasonKey),
        seasonId: clean(teamData.seasonId),
        idSeason: clean(teamData.seasonId),
        idSeasion: clean(teamData.seasonId),
        leagueId: clean(teamData.leagueId),
        clubId: clean(teamData.clubId),
        ageGroupId: clean(teamData.ageGroupId),
        teamSlot: toNumberOrNull(teamData.teamSlot),
        teamSlotId: clean(teamData.teamSlotId || teamData.teamId || teamData.teamCatalogId),
        statsType: 'league',
        lastStatsAt: capturedAt,
        lastStatsSeasonId: clean(team.seasonId),
        lastSnapshotType: snapshotType,
        lastRoundNumber: roundNumber,
        current,
        isPlayingUp: searchDoc.current?.isYoungerAgeGroup || false,
        ...(isSeasonFinal ? { seasonFinal: current } : {}),
        history,
        ...scoutStatsPatch(searchDoc),
      },
      { merge: true }
    )

    batch.set(
      doc(playerSearchRef(), id),
      searchDoc,
      { merge: true }
    )
  })

  await batch.commit()
  await refreshLeagueTeamIndex(team)

  trackFirestoreTransaction({
    collection: PLAYERS_DATABASE_COLLECTIONS.playerStats,
    feature: FEATURE,
    action: 'savePlayerStatsRows',
    readsCount: existingById.size + seasonsById.size,
    writesCount: ids.length * 2,
    readPayload: null,
    writePayload: ids,
    meta: {
      teamSeasonKey: clean(team.teamSeasonKey),
      rowsCount: validRows.length,
      snapshotType,
      roundNumber,
      searchDocsCount: ids.length,
    },
  })

  return {
    statsSaved: ids.length,
  }
}

export async function listPlayerStatsByTeam(teamOrKey) {
  const lookup = normalizeTeamLookup(teamOrKey)
  const teamSeasonKey = clean(lookup.teamSeasonKey)

  if (!teamSeasonKey) return new Map()

  const snap = await getDocs(query(
    playerStatsRef(),
    where('teamSeasonKey', '==', teamSeasonKey)
  ))

  const rows = snap.docs.map(item => ({
    id: item.id,
    ...item.data(),
  }))

  trackFirestoreRead({
    collection: PLAYERS_DATABASE_COLLECTIONS.playerStats,
    feature: FEATURE,
    action: 'listPlayerStatsByTeam',
    docs: rows,
    docsCount: rows.length,
    meta: {
      teamSeasonKey,
    },
  })

  return new Map(rows
    .filter(row => clean(row.playerSeasonId))
    .map(row => [clean(row.playerSeasonId), row])
  )
}

export async function listPlayerSearchByTeamProfile(teamOrKey, search = {}) {
  const lookup = normalizeTeamLookup(teamOrKey)
  const teamSeasonKey = clean(lookup.teamSeasonKey)
  const profileId = clean(search.profileId)
  const mode = clean(search.mode || 'eligible')
  const profileField = mode === 'raw'
    ? 'rawScoutProfileIds'
    : 'scoutProfileIds'

  if (!teamSeasonKey || !profileId) return []

  const snap = await getDocs(query(
    playerSearchRef(),
    where('teamSeasonKey', '==', teamSeasonKey),
    where(profileField, 'array-contains', profileId)
  ))

  const rows = snap.docs.map(item => {
    const docData = {
      id: item.id,
      ...item.data(),
    }
    const current = docData.current || {}

    return {
      ...docData,
      id: clean(docData.playerSeasonId) || docData.id,
      searchDocId: docData.id,
      statsDoc: docData,
      games: current.games ?? docData.games,
      goals: current.goals ?? docData.goals,
      yellowCards: current.yellowCards ?? docData.yellowCards,
      starts: current.starts ?? docData.starts,
      subIn: current.subIn ?? docData.subIn,
      subOut: current.subOut ?? docData.subOut,
      minutes: current.minutes ?? docData.minutes,
      isPlayingUp: docData.isPlayingUp || current.isYoungerAgeGroup,
    }
  }).sort((a, b) => {
    const minutesDiff = (Number(b.minutes) || -1) - (Number(a.minutes) || -1)
    if (minutesDiff) return minutesDiff

    return clean(a.fullName || a.playerName)
      .localeCompare(clean(b.fullName || b.playerName), 'he')
  })

  trackFirestoreRead({
    collection: PLAYERS_DATABASE_COLLECTIONS.playerSearch,
    feature: FEATURE,
    action: 'listPlayerSearchByTeamProfile',
    docs: rows,
    docsCount: rows.length,
    meta: {
      teamSeasonKey,
      profileId,
      mode,
      profileField,
    },
  })

  return rows
}

export async function listPlayerStatsBySeasons(playerSeasons = [], team = {}) {
  const seasonIds = unique(playerSeasons.map(row => row.id || row.playerSeasonId))
  const leagueId = clean(team.leagueId || 'league')
  const ids = unique(seasonIds.flatMap(id => [
    `${id}__${leagueId}`,
    `${id}__league`,
  ]))

  if (!ids.length) return new Map()

  const docs = []

  for (const batchIds of chunks(ids, 30)) {
    const snap = await getDocs(query(
      playerStatsRef(),
      where(documentId(), 'in', batchIds)
    ))

    docs.push(...snap.docs)
  }

  const rows = docs.map(item => ({
    id: item.id,
    ...item.data(),
  }))

  trackFirestoreRead({
    collection: PLAYERS_DATABASE_COLLECTIONS.playerStats,
    feature: FEATURE,
    action: 'listPlayerStatsBySeasons',
    docs: rows,
    docsCount: rows.length,
    meta: {
      requestedCount: ids.length,
      leagueId,
    },
  })

  return new Map(rows
    .filter(row => clean(row.playerSeasonId))
    .map(row => [clean(row.playerSeasonId), row])
  )
}

async function listDocsBySeasonIds(refFactory, seasonIds = []) {
  const ids = unique(seasonIds)
  if (!ids.length) return []

  const docs = []

  for (const batchIds of chunks(ids, 30)) {
    const snap = await getDocs(query(
      refFactory(),
      where('playerSeasonId', 'in', batchIds)
    ))

    docs.push(...snap.docs)
  }

  return docs.map(item => ({
    id: item.id,
    ...item.data(),
  }))
}

const listPlayerStatsDocsBySeasonIds = seasonIds =>
  listDocsBySeasonIds(playerStatsRef, seasonIds)

const listPlayerSearchDocsBySeasonIds = seasonIds =>
  listDocsBySeasonIds(playerSearchRef, seasonIds)

const teamFromSearchAndStats = (searchDoc = {}, statsDoc = {}, fallback = {}) => ({
  ...fallback,
  ...searchDoc,
  ...(searchDoc.teamContext || {}),
  games: searchDoc.teamContext?.games ?? statsDoc.current?.teamGames ?? searchDoc.games,
  gamesPlayed: searchDoc.teamContext?.games ?? statsDoc.current?.teamGames ?? searchDoc.gamesPlayed,
  goalsFor: searchDoc.teamContext?.goalsFor ?? statsDoc.current?.teamGoals ?? searchDoc.goalsFor,
  goalsAgainst: searchDoc.teamContext?.goalsAgainst ?? searchDoc.goalsAgainst,
  attackEdge: searchDoc.teamContext?.attackEdge ?? searchDoc.attackEdge,
  defenseEdge: searchDoc.teamContext?.defenseEdge ?? searchDoc.defenseEdge,
  seasonId: clean(searchDoc.seasonId || statsDoc.seasonId || fallback.seasonId),
  leagueId: clean(searchDoc.leagueId || statsDoc.leagueId || fallback.leagueId),
  clubId: clean(searchDoc.clubId || statsDoc.clubId || fallback.clubId),
  clubName: clean(searchDoc.clubName || fallback.clubName || fallback.teamName),
  teamName: clean(searchDoc.teamName || fallback.teamName || fallback.clubName),
  teamSeasonKey: clean(searchDoc.teamSeasonKey || statsDoc.teamSeasonKey || fallback.teamSeasonKey),
  teamSlotId: clean(searchDoc.teamSlotId || statsDoc.teamSlotId || fallback.teamSlotId || fallback.teamId),
  teamSlot: searchDoc.teamSlot ?? statsDoc.teamSlot ?? fallback.teamSlot,
  ageGroupId: clean(searchDoc.ageGroupId || statsDoc.ageGroupId || fallback.ageGroupId),
  ageGroupLabel: clean(searchDoc.ageGroupLabel || fallback.ageGroupLabel),
  externalTeamId: clean(searchDoc.externalTeamId || fallback.externalTeamId),
})

const scoutStatsPatch = searchDoc => ({
  rawScoutProfileIds: searchDoc.rawScoutProfileIds || [],
  rawScoutProfiles: searchDoc.rawScoutProfiles || {},
  eligibleScoutProfileIds: searchDoc.eligibleScoutProfileIds || [],
  eligibleScoutProfiles: searchDoc.eligibleScoutProfiles || {},
  blockedScoutProfiles: searchDoc.blockedScoutProfiles || {},
  scoutProfileIds: searchDoc.scoutProfileIds || [],
  scoutProfiles: searchDoc.scoutProfiles || {},
  bestRawScoutProfileId: searchDoc.bestRawScoutProfileId || '',
  bestRawScoutProfileLabel: searchDoc.bestRawScoutProfileLabel || '',
  bestEligibleScoutProfileId: searchDoc.bestEligibleScoutProfileId || '',
  bestEligibleScoutProfileLabel: searchDoc.bestEligibleScoutProfileLabel || '',
  bestScoutProfileId: searchDoc.bestScoutProfileId || '',
  bestScoutProfileLabel: searchDoc.bestScoutProfileLabel || '',
  bestScoutScore: searchDoc.bestScoutScore ?? null,
  bestScoutReliabilityLevel: searchDoc.bestScoutReliabilityLevel || '',
  bestScoutReliabilityScore: searchDoc.bestScoutReliabilityScore ?? null,
  scoutWarnings: searchDoc.scoutWarnings || [],
  updatedAt: serverTimestamp(),
})

const countValues = values =>
  values.reduce((acc, value) => {
    const key = clean(value)
    if (!key) return acc

    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

const teamSummaryKey = team =>
  clean(team.teamSeasonKey || team.teamId || team.teamSlotId || team.teamCatalogId)

async function refreshLeagueTeamIndex(team = {}) {
  const leagueId = clean(team.leagueId)
  const teamKey = teamSummaryKey(team)

  if (!leagueId || !teamKey) {
    return null
  }

  const { rows: seasonRows } = await findPlayerSeasonRowsByTeam(team)
  const seasonIds = seasonRows.map(row => row.id)
  const statsDocs = await listPlayerStatsDocsBySeasonIds(seasonIds)
  const searchDocs = await listPlayerSearchDocsBySeasonIds(seasonIds)
  const searchBySeason = new Map(searchDocs.map(row => [clean(row.playerSeasonId), row]))
  const statsWithSearch = statsDocs.map(row => ({
    ...row,
    searchDoc: searchBySeason.get(clean(row.playerSeasonId)) || {},
  }))
  const profileIds = statsWithSearch.flatMap(row => {
    const searchDoc = row.searchDoc || {}
    const ids = Array.isArray(searchDoc.scoutProfileIds) && searchDoc.scoutProfileIds.length
      ? searchDoc.scoutProfileIds
      : Array.isArray(row.scoutProfileIds)
        ? row.scoutProfileIds
        : []

    return ids
  })
  const rawProfileIds = statsWithSearch.flatMap(row => {
    const searchDoc = row.searchDoc || {}
    const ids = Array.isArray(searchDoc.rawScoutProfileIds) && searchDoc.rawScoutProfileIds.length
      ? searchDoc.rawScoutProfileIds
      : Array.isArray(row.rawScoutProfileIds)
        ? row.rawScoutProfileIds
        : []

    return ids
  })
  const reliabilityLevels = statsWithSearch.map(row =>
    row.searchDoc?.bestScoutReliabilityLevel ||
    row.bestScoutReliabilityLevel
  )
  const withProfilesCount = statsWithSearch.filter(row => {
    const searchDoc = row.searchDoc || {}
    const ids = Array.isArray(searchDoc.scoutProfileIds) && searchDoc.scoutProfileIds.length
      ? searchDoc.scoutProfileIds
      : row.scoutProfileIds

    return Array.isArray(ids) && ids.length > 0
  }).length
  const summary = {
    teamSeasonKey: teamKey,
    teamSlotId: clean(team.teamSlotId || team.teamId || team.teamCatalogId),
    clubId: clean(team.clubId),
    clubName: clean(team.clubName || team.teamName),
    sourceTeamName: clean(team.sourceTeamName),
    teamSlot: toNumberOrNull(team.teamSlot),
    leagueId,
    seasonId: clean(team.seasonId),
    ageGroupId: clean(team.ageGroupId),
    playersCount: seasonRows.length,
    statsCount: statsDocs.length,
    searchCount: searchDocs.length,
    scoutProfilesCount: withProfilesCount,
    profileCounts: countValues(profileIds),
    rawProfileCounts: countValues(rawProfileIds),
    reliabilityCounts: countValues(reliabilityLevels),
    updatedAt: new Date().toISOString(),
  }

  await writeBatch(db)
    .set(
      leagueDocRef(leagueId),
      {
        teamsIndex: {
          [teamKey]: summary,
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
    .commit()

  trackFirestoreTransaction({
    collection: PLAYERS_DATABASE_COLLECTIONS.leagues,
    feature: FEATURE,
    action: 'refreshLeagueTeamIndex',
    readsCount: seasonRows.length + statsDocs.length + searchDocs.length,
    writesCount: 1,
    readPayload: null,
    writePayload: summary,
    meta: {
      leagueId,
      teamSeasonKey: teamKey,
    },
  })

  return summary
}

async function listPlayerSeasonDocsByField(field, value) {
  const fieldValue = clean(value)
  if (!fieldValue) return []

  const snap = await getDocs(query(
    playerSeasonsRef(),
    where(field, '==', fieldValue)
  ))

  return snap.docs.map(item => ({
    id: item.id,
    ...item.data(),
  }))
}

async function findPlayerSeasonRowsByTeam(teamOrKey) {
  const lookup = normalizeTeamLookup(teamOrKey)
  if (!lookup.teamSeasonKey && !lookup.teamSlotId && !lookup.externalTeamId) {
    return { lookup, rows: [], matchMode: 'none' }
  }

  const bySeasonKey = await listPlayerSeasonDocsByField('teamSeasonKey', lookup.teamSeasonKey)
  const byTeamSlot = await listPlayerSeasonDocsByField('teamSlotId', lookup.teamSlotId)
  const byExternalTeam = await listPlayerSeasonDocsByField('externalTeamId', lookup.externalTeamId)
  const fallbackRows = [
    ...byTeamSlot,
    ...byExternalTeam,
  ].filter(row => isSameTeamSeason(row, lookup))

  return {
    lookup,
    rows: uniqueRowsById([
      ...bySeasonKey,
      ...fallbackRows,
    ]),
    matchMode: bySeasonKey.length && fallbackRows.length ? 'combined' : bySeasonKey.length ? 'teamSeasonKey' : 'fallback',
  }
}

export async function savePlayersImportPreview(preview = {}) {
  const rows = (Array.isArray(preview.rows) ? preview.rows : [])
    .filter(row => row.valid)

  if (!rows.length) {
    throw new Error('no valid players to save')
  }

  const batch = writeBatch(db)
  const playerIds = new Set()
  const playerSeasonIds = new Set()

  rows.forEach(row => {
    if (!row.playerDocId || !row.playerSeasonDocId) return

    playerIds.add(row.playerDocId)
    playerSeasonIds.add(row.playerSeasonDocId)

    batch.set(
      doc(playersRef(), row.playerDocId),
      buildPlayerDoc(row),
      { merge: true }
    )

    batch.set(
      doc(playerSeasonsRef(), row.playerSeasonDocId),
      buildPlayerSeasonDoc(row),
      { merge: true }
    )
  })

  await batch.commit()

  const teamsByKey = new Map()
  rows.forEach(row => {
    const team = row.teamIdentity || {}
    const key = teamSummaryKey(team)
    if (key) teamsByKey.set(key, team)
  })

  for (const team of teamsByKey.values()) {
    await refreshLeagueTeamIndex(team)
  }

  const result = {
    playersUpserted: playerIds.size,
    playerSeasonsUpserted: playerSeasonIds.size,
  }

  trackFirestoreTransaction({
    collection: PLAYERS_DATABASE_COLLECTIONS.players,
    feature: FEATURE,
    action: 'savePlayersImportPreview:players',
    readsCount: 0,
    writesCount: result.playersUpserted,
    readPayload: null,
    writePayload: Array.from(playerIds),
    meta: result,
  })

  trackFirestoreTransaction({
    collection: PLAYERS_DATABASE_COLLECTIONS.playerSeasons,
    feature: FEATURE,
    action: 'savePlayersImportPreview:playerSeasons',
    readsCount: 0,
    writesCount: result.playerSeasonsUpserted,
    readPayload: null,
    writePayload: Array.from(playerSeasonIds),
    meta: result,
  })

  return result
}

export async function listPlayerSeasonsByTeam(teamOrKey) {
  const { lookup, rows, matchMode } = await findPlayerSeasonRowsByTeam(teamOrKey)

  const playerIdsToFetch = rows
    .filter(row => playerIdFromSeason(row) && seasonNeedsPlayerIdentity(row))
    .map(playerIdFromSeason)

  const playersById = await listPlayersByIds(playerIdsToFetch)

  const mergedRows = rows
    .map(row => mergePlayerIntoSeason(row, playersById.get(playerIdFromSeason(row))))
    .sort((a, b) => {
      const aRow = Number(a?.source?.rowNumber) || 999
      const bRow = Number(b?.source?.rowNumber) || 999
      if (aRow !== bRow) return aRow - bRow

      return clean(a.fullName || a.playerName)
        .localeCompare(clean(b.fullName || b.playerName), 'he')
    })

  trackFirestoreRead({
    collection: PLAYERS_DATABASE_COLLECTIONS.playerSeasons,
    feature: FEATURE,
    action: 'listPlayerSeasonsByTeam',
    docs: mergedRows,
    docsCount: rows.length,
    meta: {
      ...lookup,
      matchMode,
    },
  })

  return mergedRows
}

const statDeleteIds = (rows = [], team = {}) => {
  const leagueId = clean(team.leagueId || 'league')
  return unique(rows.flatMap(row => {
    const id = clean(row.id || row.playerSeasonId)
    if (!id) return []

    return [
      `${id}__${leagueId}`,
      `${id}__league`,
    ]
  }))
}

export async function deletePlayerSeasons(rows = [], team = {}) {
  const seasonRows = uniqueRowsById(rows
    .map(row => ({
      id: clean(row.id || row.playerSeasonId),
      ...row,
    }))
    .filter(row => row.id))

  if (!seasonRows.length) {
    return {
      deletedCount: 0,
      statsDeletedCount: 0,
      searchDeletedCount: 0,
    }
  }

  const seasonIds = seasonRows.map(row => row.id)
  const statsDocs = await listPlayerStatsDocsBySeasonIds(seasonIds)
  const searchDocs = await listPlayerSearchDocsBySeasonIds(seasonIds)
  const legacyStatIds = statDeleteIds(seasonRows, team)
  const statsIds = unique([
    ...statsDocs.map(row => row.id),
    ...legacyStatIds,
  ])
  const searchIds = unique([
    ...searchDocs.map(row => row.id),
    ...legacyStatIds,
  ])
  const deletes = [
    ...seasonRows.map(row => ({ ref: playerSeasonsRef(), id: row.id })),
    ...statsIds.map(id => ({ ref: playerStatsRef(), id })),
    ...searchIds.map(id => ({ ref: playerSearchRef(), id })),
  ]

  for (const batchDeletes of chunks(deletes, 450)) {
    const batch = writeBatch(db)
    batchDeletes.forEach(item => {
      batch.delete(doc(item.ref, item.id))
    })

    await batch.commit()
  }

  await refreshLeagueTeamIndex(team)

  trackFirestoreTransaction({
    collection: PLAYERS_DATABASE_COLLECTIONS.playerSeasons,
    feature: FEATURE,
    action: 'deletePlayerSeasons',
    readsCount: statsDocs.length + searchDocs.length,
    writesCount: deletes.length,
    readPayload: null,
    writePayload: {
      playerSeasonIds: seasonRows.map(row => row.id),
      playerStatsIds: statsIds,
      playerSearchIds: searchIds,
    },
    meta: {
      teamSeasonKey: clean(team.teamSeasonKey),
      deletedCount: seasonRows.length,
      statsDeletedCount: statsIds.length,
      searchDeletedCount: searchIds.length,
    },
  })

  return {
    deletedCount: seasonRows.length,
    statsDeletedCount: statsIds.length,
    searchDeletedCount: searchIds.length,
  }
}

export async function deletePlayerSeasonsByTeam(teamOrKey) {
  const { lookup, rows, matchMode } = await findPlayerSeasonRowsByTeam(teamOrKey)

  if (!rows.length) {
    trackFirestoreTransaction({
      collection: PLAYERS_DATABASE_COLLECTIONS.playerSeasons,
      feature: FEATURE,
      action: 'deletePlayerSeasonsByTeam',
      readsCount: 0,
      writesCount: 0,
      readPayload: [],
      writePayload: [],
      meta: {
        ...lookup,
        matchMode,
        deletedCount: 0,
      },
    })

    return {
      deletedCount: 0,
      statsDeletedCount: 0,
      searchDeletedCount: 0,
    }
  }

  const result = await deletePlayerSeasons(rows, lookup)

  trackFirestoreTransaction({
    collection: PLAYERS_DATABASE_COLLECTIONS.playerSeasons,
    feature: FEATURE,
    action: 'deletePlayerSeasonsByTeam',
    readsCount: rows.length,
    writesCount: rows.length + result.statsDeletedCount + result.searchDeletedCount,
    readPayload: rows.map(row => row.id),
    writePayload: {
      playerSeasonIds: rows.map(row => row.id),
      statsDeletedCount: result.statsDeletedCount,
      searchDeletedCount: result.searchDeletedCount,
    },
    meta: {
      ...lookup,
      matchMode,
      deletedCount: rows.length,
      statsDeletedCount: result.statsDeletedCount,
      searchDeletedCount: result.searchDeletedCount,
    },
  })

  return result
}
