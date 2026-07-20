// features/playersDatabase/services/write/searchIndex/teamSeasonIndex.js

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../catalog/clubs.catalog.js'
import { buildTeamDisplayName } from '../../../catalog/teamDisplay.js'
import { buildSeasonKey, clean, toNumberOrZero } from '../leagues/leagueDoc.js'

const normalizeText = value =>
  clean(value).toLowerCase()

const resolveClubLevel = ({ clubId = '', clubLevel = null } = {}) => {
  const directClubLevel = Number(clubLevel)
  if (Number.isFinite(directClubLevel) && directClubLevel > 0) return directClubLevel

  const club = PLAYERS_DATABASE_CLUBS_CATALOG.find(item => item.id === clean(clubId))
  return toNumberOrZero(club?.clubLevel)
}

const roundNumber = (value, digits = 3) => {
  const nextValue = Number(value)
  if (!Number.isFinite(nextValue)) return 0

  const factor = 10 ** digits
  return Math.round(nextValue * factor) / factor
}

export const buildTeamSeasonIndexId = ({
  leagueId = '',
  seasonKey = '',
  teamId = '',
  clubId = '',
} = {}) =>
  [
    'birthTeamSeason',
    clean(leagueId),
    buildSeasonKey(seasonKey),
    clean(teamId || clubId),
  ].filter(Boolean).join('__')

const getRowTableRank = row =>
  toNumberOrZero(row.position ?? row.rank ?? row.leaguePosition)

const getRowGames = row =>
  toNumberOrZero(row.games ?? row.teamGamePlayed ?? row.teamStats?.teamGamePlayed)

const getRowGoalsFor = row =>
  toNumberOrZero(row.goalsFor ?? row.teamStats?.goalsFor)

const getRowGoalsAgainst = row =>
  toNumberOrZero(row.goalsAgainst ?? row.teamStats?.goalsAgainst)

const getRowPoints = row =>
  toNumberOrZero(row.points ?? row.teamStats?.points)

const buildRankMap = ({
  rows = [],
  valueGetter,
  direction = 'desc',
} = {}) => {
  const sortedRows = [...rows].sort((a, b) => {
    const valueA = valueGetter(a)
    const valueB = valueGetter(b)
    if (valueA !== valueB) return direction === 'asc' ? valueA - valueB : valueB - valueA

    return getRowTableRank(a) - getRowTableRank(b)
  })

  return sortedRows.reduce((acc, row, index) => {
    const key = clean(row.birthTeamId || row.teamId || row.teamSlotId || row.clubId)
    if (!key) return acc

    acc[key] = index + 1
    return acc
  }, {})
}

const resolveSeasonDataStatus = target =>
  clean(target) === 'history' ? 'historical' : 'current'

const resolveSeasonDataCompleteness = target =>
  clean(target) === 'history' ? 'complete' : 'partial'

const buildTeamSeasonIndexDoc = ({
  league = {},
  season = {},
  target = 'current',
  row = {},
  tableAttackRank = 0,
  tableDefenseRank = 0,
} = {}) => {
  const leagueId = clean(league.id || season.leagueId || row.leagueId)
  const rawSeasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(rawSeasonId)
  const seasonId = rawSeasonId || seasonKey
  const clubId = clean(row.clubId)
  const teamId = clean(row.birthTeamId || row.teamId || row.teamSlotId)
  const id = buildTeamSeasonIndexId({ leagueId, seasonKey, teamId, clubId })
  const games = getRowGames(row)
  const goalsFor = getRowGoalsFor(row)
  const goalsAgainst = getRowGoalsAgainst(row)
  const displayName = buildTeamDisplayName({
    clubName: row.clubName || row.displayName,
    clubId,
    teamId,
    teamSlot: row.birthTeamSlot || row.teamSlot,
  })

  return {
    id,
    entityType: 'birthTeamSeason',
    entityId: id,

    displayName,
    normalizedDisplayName: normalizeText(displayName),

    leagueId,
    seasonId,
    seasonKey,
    clubId,
    clubLevel: resolveClubLevel({ clubId, clubLevel: row.clubLevel }),
    birthTeamId: teamId,
    birthTeamDocumentId: clean(row.birthTeamDocumentId || row.teamDocumentId || teamId),
    birthTeamSlot: toNumberOrZero(row.birthTeamSlot || row.teamSlot) || 1,
    teamId,
    teamDocumentId: clean(row.birthTeamDocumentId || row.teamDocumentId || teamId),
    teamUrl: clean(row.teamUrl),
    seasonUrl: clean(season.seasonUrl),

    ageGroupId: clean(row.ageGroupId || league.ageGroupId),
    ageGroupLabel: clean(row.ageGroupLabel || league.ageGroupLabel),
    birthYear: toNumberOrZero(season.birthYear),
    leagueTotalRound: toNumberOrZero(season.leagueTotalRound),
    leagueLevel: toNumberOrZero(league.level),
    region: clean(league.region),
    seasonDataStatus: resolveSeasonDataStatus(target),
    seasonDataCompleteness: resolveSeasonDataCompleteness(target),

    tableRank: getRowTableRank(row),
    tableAttackRank: toNumberOrZero(tableAttackRank),
    tableDefenseRank: toNumberOrZero(tableDefenseRank),

    points: getRowPoints(row),
    goalsFor,
    goalsAgainst,
    goalsForPerGame: games ? roundNumber(goalsFor / games) : 0,
    goalsAgainstPerGame: games ? roundNumber(goalsAgainst / games) : 0,
    teamGamePlayed: games,
    scoutProfiledPlayersCount: toNumberOrZero(
      row.scoutProfiledPlayersCount ?? row.scoutProfilesSummary?.total
    ),

    sourceCollection: 'leagues',
    sourceDocumentId: leagueId,
    sourceTarget: clean(target) === 'history' ? 'history' : 'current',

    updatedAt: serverTimestamp(),
  }
}

export async function upsertTeamSeasonSearchIndexMany({
  league = {},
  season = {},
  target = 'current',
  rows = [],
} = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonId = clean(season.seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')

  const safeRows = Array.isArray(rows) ? rows : []
  const tableAttackRanks = buildRankMap({
    rows: safeRows,
    valueGetter: getRowGoalsFor,
    direction: 'desc',
  })
  const tableDefenseRanks = buildRankMap({
    rows: safeRows,
    valueGetter: getRowGoalsAgainst,
    direction: 'asc',
  })

  const batch = writeBatch(db)
  const docs = safeRows
    .map(row => {
      const rowKey = clean(row.birthTeamId || row.teamId || row.teamSlotId || row.clubId)
      return buildTeamSeasonIndexDoc({
        league,
        season,
        target,
        row,
        tableAttackRank: tableAttackRanks[rowKey],
        tableDefenseRank: tableDefenseRanks[rowKey],
      })
    })
    .filter(row => row.id && row.leagueId && row.seasonId && (row.teamId || row.clubId))

  docs.forEach(indexDoc => {
    batch.set(
      doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, indexDoc.id),
      indexDoc,
      { merge: true }
    )
  })

  if (docs.length) {
    await batch.commit()
  }

  return {
    entityType: 'birthTeamSeason',
    rowsCount: docs.length,
  }
}

export async function updateTeamSeasonSearchIndexRosterMeta({
  league = {},
  season = {},
  team = {},
  target = 'current',
  playersCount = 0,
  playerSeasonIndexCount = 0,
  scoutProfiledPlayersCount = 0,
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const rawSeasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(rawSeasonId)
  const seasonId = rawSeasonId || seasonKey
  const teamId = clean(team.birthTeamId || team.teamId)
  const clubId = clean(team.clubId)
  const id = buildTeamSeasonIndexId({ leagueId, seasonKey, teamId, clubId })
  if (!id) throw new Error('Missing team season index id')

  const batch = writeBatch(db)
  batch.set(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, id),
    {
      id,
      entityType: 'birthTeamSeason',
      entityId: id,
      leagueId,
      seasonId,
      seasonKey,
      clubId,
      clubLevel: resolveClubLevel({ clubId, clubLevel: team.clubLevel }),
      birthTeamId: teamId,
      birthTeamDocumentId: clean(team.birthTeamDocumentId || team.teamDocumentId || teamId),
      birthTeamSlot: toNumberOrZero(team.birthTeamSlot || team.teamSlot) || 1,
      teamId,
      teamDocumentId: clean(team.birthTeamDocumentId || team.teamDocumentId || teamId),
      teamUrl: clean(team.teamUrl),
      seasonUrl: clean(season.seasonUrl),
      birthYear: toNumberOrZero(season.birthYear),
      leagueTotalRound: toNumberOrZero(season.leagueTotalRound),
      playersCount: toNumberOrZero(playersCount),
      playerSeasonIndexCount: toNumberOrZero(playerSeasonIndexCount),
      scoutProfiledPlayersCount: toNumberOrZero(scoutProfiledPlayersCount),
      sourceTarget: clean(target) === 'history' ? 'history' : 'current',
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )

  await batch.commit()

  return {
    entityType: 'birthTeamSeason',
    id,
    playersCount: toNumberOrZero(playersCount),
    playerSeasonIndexCount: toNumberOrZero(playerSeasonIndexCount),
  }
}

export async function updateTeamSeasonSearchIndexTeamUrl({
  league = {},
  season = {},
  team = {},
  target = 'current',
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const teamId = clean(team.birthTeamId || team.teamId)
  const clubId = clean(team.clubId)
  const id = buildTeamSeasonIndexId({ leagueId, seasonKey, teamId, clubId })
  if (!id) throw new Error('Missing team season index id')

  const ref = doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, id)
  const snapshot = await getDoc(ref)
  if (!snapshot.exists()) {
    return {
      entityType: 'birthTeamSeason',
      id,
      teamUrl: clean(team.teamUrl),
      updated: false,
      reason: 'teamSeasonIndexMissing',
    }
  }

  await updateDoc(ref, {
    teamUrl: clean(team.teamUrl),
    updatedAt: serverTimestamp(),
  })

  return {
    entityType: 'birthTeamSeason',
    id,
    teamUrl: clean(team.teamUrl),
    updated: true,
  }
}

export async function updateTeamSeasonSearchIndexScoutProfilesSummary({
  league = {},
  season = {},
  team = {},
  target = 'current',
  scoutProfilesSummary = {},
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const teamId = clean(team.birthTeamId || team.teamId)
  const clubId = clean(team.clubId)
  const id = buildTeamSeasonIndexId({ leagueId, seasonKey, teamId, clubId })
  if (!id) throw new Error('Missing team season index id')

  const ref = doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, id)
  const snapshot = await getDoc(ref)
  if (!snapshot.exists()) {
    return {
      entityType: 'birthTeamSeason',
      id,
      updated: false,
      reason: 'teamSeasonIndexMissing',
    }
  }

  await updateDoc(ref, {
    scoutProfiledPlayersCount: toNumberOrZero(scoutProfilesSummary.total),
    scoutProfilesSummary: {
      total: toNumberOrZero(scoutProfilesSummary.total),
      profileCounts: scoutProfilesSummary.profileCounts || {},
    },
    sourceTarget: clean(target) === 'history' ? 'history' : 'current',
    updatedAt: serverTimestamp(),
  })

  return {
    entityType: 'birthTeamSeason',
    id,
    updated: true,
    scoutProfiledPlayersCount: toNumberOrZero(scoutProfilesSummary.total),
  }
}

export async function updateSearchIndexesLeagueSeasonUrl({
  league = {},
  season = {},
  seasonUrl = '',
} = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonKey) throw new Error('Missing season key')

  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('leagueId', '==', leagueId),
    where('seasonKey', '==', seasonKey)
  )
  const snapshot = await getDocs(rowsQuery)
  const batch = writeBatch(db)

  snapshot.docs.forEach(indexDoc => {
    batch.set(
      indexDoc.ref,
      {
        seasonUrl: clean(seasonUrl),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  })

  if (snapshot.docs.length) {
    await batch.commit()
  }

  return {
    rowsCount: snapshot.docs.length,
    seasonUrl: clean(seasonUrl),
  }
}

export async function updateTeamSeasonSearchIndexesSeasonMeta({
  league = {},
  season = {},
  birthYear = null,
  leagueTotalRound = null,
} = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonKey) throw new Error('Missing season key')

  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('leagueId', '==', leagueId),
    where('seasonKey', '==', seasonKey),
    where('entityType', '==', 'birthTeamSeason')
  )
  const snapshot = await getDocs(rowsQuery)
  const batch = writeBatch(db)

  snapshot.docs.forEach(indexDoc => {
    batch.set(
      indexDoc.ref,
      {
        birthYear: toNumberOrZero(birthYear ?? season.birthYear),
        leagueTotalRound: toNumberOrZero(leagueTotalRound ?? season.leagueTotalRound),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  })

  if (snapshot.docs.length) {
    await batch.commit()
  }

  return {
    entityType: 'birthTeamSeason',
    rowsCount: snapshot.docs.length,
  }
}


