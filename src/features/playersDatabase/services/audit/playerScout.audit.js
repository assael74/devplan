// features/playersDatabase/services/audit/playerScout.audit.js

import {
  collection,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { trackedGetDocs } from '../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const getProfiles = source => (
  Array.isArray(source?.scoutProfiles)
    ? source.scoutProfiles
    : Array.isArray(source?.scoutSignals)
      ? source.scoutSignals
      : []
)

const getCombinations = source => (
  Array.isArray(source?.scoutCombinations)
    ? source.scoutCombinations
    : []
)

const getProfileIds = source => {
  const profiles = getProfiles(source)

  return [...new Set(
    profiles
      .map(profile => clean(profile?.profileId))
      .filter(Boolean)
  )].sort()
}

const getSeasonKey = row => clean(row.seasonKey || row.seasonId)
const getTeamId = row => clean(row.birthTeamId || row.teamId)
const getPlayerId = row => clean(
  row.playerDocumentId || row.playerId || row.externalPlayerId
)

const buildKey = row => [
  getPlayerId(row),
  getSeasonKey(row),
  getTeamId(row),
].filter(Boolean).join('::')

const flattenTeamDocs = snapshots => snapshots.flatMap(snapshot => {
  const data = snapshot.data() || {}
  const rows = []

  ;['current', 'history'].forEach(target => {
    const seasons = Array.isArray(data[target]) ? data[target] : []

    seasons.forEach(season => {
      const players = Array.isArray(season.teamPlayers)
        ? season.teamPlayers
        : []

      players.forEach(player => {
        rows.push({
          source: 'dbBirthTeams',
          sourceDocumentId: snapshot.id,
          sourceTarget: target,
          playerId: getPlayerId(player),
          playerDocumentId: clean(player.playerDocumentId),
          fullName: clean(player.fullName),
          seasonId: clean(season.seasonId),
          seasonKey: clean(season.seasonKey),
          teamId: clean(data.birthTeamId || data.teamId || snapshot.id),
          birthTeamId: clean(data.birthTeamId || data.teamId || snapshot.id),
          rosterStatus: clean(player.rosterStatus),
          scoutCalculationStatus: clean(player.scoutCalculationStatus),
          profileIds: getProfileIds(player),
          scoutProfiles: getProfiles(player),
          scoutCombinations: getCombinations(player),
        })
      })
    })
  })

  return rows
})

const flattenPlayerDocs = snapshots => snapshots.flatMap(snapshot => {
  const data = snapshot.data() || {}
  const rows = []

  ;['current', 'history'].forEach(target => {
    const seasons = Array.isArray(data[target]) ? data[target] : []

    seasons.forEach(season => {
      rows.push({
        source: 'dbPlayers',
        sourceDocumentId: snapshot.id,
        sourceTarget: target,
        playerId: clean(data.playerId || data.id || snapshot.id),
        playerDocumentId: snapshot.id,
        fullName: clean(data.fullName),
        seasonId: clean(season.seasonId),
        seasonKey: clean(season.seasonKey),
        teamId: getTeamId(season),
        birthTeamId: getTeamId(season),
        profileIds: getProfileIds(season),
        scoutProfiles: getProfiles(season),
        scoutCombinations: getCombinations(season),
      })
    })
  })

  return rows
})

const flattenSearchDocs = snapshots => snapshots.map(snapshot => {
  const data = snapshot.data() || {}

  return {
    source: 'dbSearchIndexes',
    sourceDocumentId: snapshot.id,
    sourceTarget: clean(data.sourceTarget),
    playerId: getPlayerId(data),
    playerDocumentId: clean(data.playerDocumentId),
    fullName: clean(data.displayName || data.fullName),
    seasonId: clean(data.seasonId),
    seasonKey: clean(data.seasonKey),
    teamId: getTeamId(data),
    birthTeamId: getTeamId(data),
    profileIds: Array.isArray(data.scoutProfileIds)
      ? [...new Set(data.scoutProfileIds.map(clean).filter(Boolean))].sort()
      : getProfileIds(data),
  }
})

const sameIds = (left = [], right = []) => (
  left.length === right.length &&
  left.every((value, index) => value === right[index])
)

const indexRows = rows => {
  const index = new Map()

  rows.forEach(row => {
    const key = buildKey(row)
    if (!key) return

    if (!index.has(key)) index.set(key, [])
    index.get(key).push(row)
  })

  return index
}

const collectIssues = ({ teamRows, playerRows, searchRows }) => {
  const issues = []
  const teamIndex = indexRows(teamRows)
  const playerIndex = indexRows(playerRows)
  const searchIndex = indexRows(searchRows)

  teamRows.forEach(teamRow => {
    const key = buildKey(teamRow)
    if (!key) {
      issues.push({
        type: 'missing_scope_key',
        severity: 'critical',
        row: teamRow,
      })
      return
    }

    const matchingPlayerRows = playerIndex.get(key) || []
    const matchingSearchRows = searchIndex.get(key) || []

    if (matchingPlayerRows.length > 1) {
      issues.push({
        type: 'duplicate_player_season_rows',
        severity: 'critical',
        key,
        rows: matchingPlayerRows,
      })
    }

    if (matchingSearchRows.length > 1) {
      issues.push({
        type: 'duplicate_search_index_rows',
        severity: 'critical',
        key,
        rows: matchingSearchRows,
      })
    }

    const playerRow = matchingPlayerRows[0]
    const searchRow = matchingSearchRows[0]

    if (teamRow.profileIds.length && !playerRow) {
      issues.push({
        type: 'profile_missing_from_player_document',
        severity: 'high',
        key,
        teamRow,
      })
    }

    if (teamRow.profileIds.length && !searchRow) {
      issues.push({
        type: 'profile_missing_from_search_index',
        severity: 'high',
        key,
        teamRow,
      })
    }

    if (playerRow && !sameIds(teamRow.profileIds, playerRow.profileIds)) {
      issues.push({
        type: 'team_player_profile_mismatch',
        severity: 'high',
        key,
        teamProfiles: teamRow.profileIds,
        playerProfiles: playerRow.profileIds,
      })
    }

    if (searchRow && !sameIds(teamRow.profileIds, searchRow.profileIds)) {
      issues.push({
        type: 'team_search_profile_mismatch',
        severity: 'high',
        key,
        teamProfiles: teamRow.profileIds,
        searchProfiles: searchRow.profileIds,
      })
    }

    if (
      ['transferredOut', 'retired'].includes(teamRow.rosterStatus) &&
      teamRow.profileIds.length
    ) {
      issues.push({
        type: 'excluded_player_has_profiles',
        severity: 'medium',
        key,
        teamRow,
      })
    }

    if (
      teamRow.scoutCalculationStatus &&
      teamRow.scoutCalculationStatus !== 'success'
    ) {
      issues.push({
        type: 'scout_calculation_not_successful',
        severity: 'high',
        key,
        teamRow,
      })
    }
  })

  playerRows.forEach(row => {
    const key = buildKey(row)
    if (row.profileIds.length && !(teamIndex.get(key) || []).length) {
      issues.push({
        type: 'orphan_player_profile_row',
        severity: 'medium',
        key,
        row,
      })
    }
  })

  searchRows.forEach(row => {
    const key = buildKey(row)
    if (row.profileIds.length && !(teamIndex.get(key) || []).length) {
      issues.push({
        type: 'orphan_search_profile_row',
        severity: 'medium',
        key,
        row,
      })
    }
  })

  return issues
}

const countBy = (rows, field) => rows.reduce((result, row) => {
  const key = clean(row[field]) || 'unknown'
  result[key] = (result[key] || 0) + 1
  return result
}, {})

export const readPlayerScoutAuditCollections = async () => {
  const [teamSnapshot, playerSnapshot, searchSnapshot] = await Promise.all([
    trackedGetDocs(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.teams),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.teams,
        action: 'playerScout-audit',
        operationSubtype: 'audit-read',
      }
    ),
    trackedGetDocs(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.players),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.players,
        action: 'playerScout-audit',
        operationSubtype: 'audit-read',
      }
    ),
    trackedGetDocs(
      query(
        collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
        where('entityType', '==', 'playerSeason')
      ),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
        action: 'playerScout-audit',
        operationSubtype: 'audit-query',
      }
    ),
  ])

  return {
    teamRows: flattenTeamDocs(teamSnapshot.docs),
    playerRows: flattenPlayerDocs(playerSnapshot.docs),
    searchRows: flattenSearchDocs(searchSnapshot.docs),
  }
}

export async function buildPlayerScoutAudit() {
  const rows = await readPlayerScoutAuditCollections()
  const issues = collectIssues(rows)
  const profiledTeamRows = rows.teamRows.filter(row => row.profileIds.length)

  return {
    generatedAt: new Date().toISOString(),
    mode: 'read-only',
    collections: {
      teams: PLAYERS_DATABASE_COLLECTIONS.teams,
      players: PLAYERS_DATABASE_COLLECTIONS.players,
      searchIndexes: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    },
    summary: {
      teamPlayerRows: rows.teamRows.length,
      playerSeasonRows: rows.playerRows.length,
      searchPlayerDocuments: rows.searchRows.length,
      profiledTeamRows: profiledTeamRows.length,
      profilesById: profiledTeamRows.reduce((result, row) => {
        row.profileIds.forEach(profileId => {
          result[profileId] = (result[profileId] || 0) + 1
        })
        return result
      }, {}),
      totalIssues: issues.length,
      issuesByType: countBy(issues, 'type'),
      issuesBySeverity: countBy(issues, 'severity'),
    },
    ...rows,
    issues,
  }
}

const downloadJson = ({ data, fileName }) => {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function downloadPlayerScoutAudit() {
  const audit = await buildPlayerScoutAudit()
  const date = new Date().toISOString().slice(0, 10)

  downloadJson({
    data: audit,
    fileName: `player-scout-audit-${date}.json`,
  })

  return audit.summary
}
