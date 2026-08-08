// features/playersDatabase/services/write/searchIndex/team/teamSeasonIndex.rebuild.js

import { collection } from 'firebase/firestore'
import { trackedGetDocs } from '../../../../../../services/firestore/usage/index.js'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { clean } from '../../leagues/leagueDoc.js'
import { buildTeamSeasonIndexDoc } from './teamSeasonIndex.model.js'
import { upsertTeamSeasonSearchIndexMany } from './teamSeasonIndex.upsert.js'
import {
  buildExpectedLevelDelta,
  buildExpectedLevelKey,
} from '../shared/expectedLevelDelta.model.js'

const readSearchIndexes = queryRef => trackedGetDocs(queryRef, {
  feature: 'playersDatabase',
  collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
  action: 'teamSeasonIndex-rebuild',
  operationSubtype: 'maintenance-query',
})

const buildLeagueIdentity = (leagueData = {}, leagueDocumentId = '') => ({
  ...leagueData,
  id: clean(leagueData.id || leagueData.leagueId || leagueDocumentId),
})

const hasSeasonTable = season => (
  Boolean(clean(season?.seasonId)) &&
  Array.isArray(season?.tableRank) &&
  season.tableRank.length > 0
)

const resolveSeasonOrderValue = season => {
  const seasonKey = clean(season?.seasonKey)
  const yearMatch = seasonKey.match(/(?:19|20)\d{2}/)
  if (yearMatch) return Number(yearMatch[0])

  const seasonId = Number(season?.seasonId)
  return Number.isFinite(seasonId) ? seasonId : Number.NEGATIVE_INFINITY
}

const resolveLatestHistorySeason = history => (
  [...(Array.isArray(history) ? history : [])]
    .filter(hasSeasonTable)
    .sort((left, right) => resolveSeasonOrderValue(right) - resolveSeasonOrderValue(left))[0] || null
)

const collectLeagueSeasons = leagueData => {
  const rows = []
  const current = leagueData?.current || null
  const history = Array.isArray(leagueData?.history) ? leagueData.history : []
  const latestHistorySeason = resolveLatestHistorySeason(history)
  const latestHistorySeasonId = clean(latestHistorySeason?.seasonId)

  if (current) {
    rows.push({
      target: 'current',
      season: current,
      calculateExpectedLevelDelta: hasSeasonTable(current),
    })
  }

  history.forEach(season => {
    rows.push({
      target: 'history',
      season,
      calculateExpectedLevelDelta: Boolean(
        latestHistorySeasonId &&
        clean(season?.seasonId) === latestHistorySeasonId &&
        hasSeasonTable(season)
      ),
    })
  })

  return rows
}

const isRebuildableSeason = hasSeasonTable

const collectRebuildEntries = leaguesSnapshot => {
  const entries = []
  let scannedSeasonsCount = 0
  let skippedSeasonsCount = 0

  leaguesSnapshot.docs.forEach(leagueDocument => {
    const leagueData = leagueDocument.data() || {}
    const league = buildLeagueIdentity(leagueData, leagueDocument.id)

    collectLeagueSeasons(leagueData).forEach(({ target, season, calculateExpectedLevelDelta }) => {
      scannedSeasonsCount += 1

      if (!league.id || !isRebuildableSeason(season)) {
        skippedSeasonsCount += 1
        return
      }

      season.tableRank.forEach(row => {
        const indexDoc = buildTeamSeasonIndexDoc({
          league,
          season,
          target,
          row,
        })
        if (!indexDoc.id || !indexDoc.clubId || !indexDoc.seasonId || !indexDoc.birthYear) return

        entries.push({
          league,
          season,
          target,
          row,
          indexDoc,
          calculateExpectedLevelDelta,
        })
      })
    })
  })

  return {
    entries,
    scannedSeasonsCount,
    skippedSeasonsCount,
  }
}

const attachExpectedLevelDelta = entries => {
  const sourceByKey = new Map(entries.map(entry => [
    buildExpectedLevelKey(entry.indexDoc),
    entry.indexDoc,
  ]))
  const teamDeltaByKey = new Map()
  let teamDeltaCalculatedCount = 0
  let teamDeltaUnknownCount = 0

  entries.forEach(entry => {
    const current = entry.indexDoc
    const nextTeam = entry.calculateExpectedLevelDelta
      ? sourceByKey.get(buildExpectedLevelKey({
      seasonId: current.seasonId,
      clubId: current.clubId,
      birthYear: Number(current.birthYear) - 1,
      birthTeamSlot: current.birthTeamSlot,
    })) || null
      : null
    const expectedLevelDelta = entry.calculateExpectedLevelDelta
      ? buildExpectedLevelDelta({
        currentLevel: current.leagueLevel,
        nextLevel: nextTeam?.leagueLevel,
      })
      : null

    entry.row = {
      ...entry.row,
      expectedLevelDelta,
    }
    entry.indexDoc = {
      ...entry.indexDoc,
      expectedLevelDelta,
    }
    teamDeltaByKey.set(buildExpectedLevelKey(current), expectedLevelDelta)

    if (expectedLevelDelta === null) teamDeltaUnknownCount += 1
    else teamDeltaCalculatedCount += 1
  })

  return {
    teamDeltaByKey,
    teamDeltaCalculatedCount,
    teamDeltaUnknownCount,
  }
}

export async function rebuildTeamSeasonSearchIndexesFromLeagues({
  dryRun = false,
} = {}) {
  const leaguesSnapshot = await readSearchIndexes(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.leagues)
  )
  const collected = collectRebuildEntries(leaguesSnapshot)
  const deltaResult = attachExpectedLevelDelta(collected.entries)
  const result = {
    scannedLeaguesCount: leaguesSnapshot.docs.length,
    scannedSeasonsCount: collected.scannedSeasonsCount,
    skippedSeasonsCount: collected.skippedSeasonsCount,
    teamRowsCount: collected.entries.length,
    updatedRowsCount: 0,
    teamDeltaCalculatedCount: deltaResult.teamDeltaCalculatedCount,
    teamDeltaUnknownCount: deltaResult.teamDeltaUnknownCount,
    teamDeltaByKey: deltaResult.teamDeltaByKey,
    dryRun: Boolean(dryRun),
  }

  if (dryRun) return result

  const groups = new Map()
  collected.entries.forEach(entry => {
    const key = `${entry.league.id}::${entry.season.seasonId}::${entry.target}`
    if (!groups.has(key)) {
      groups.set(key, {
        league: entry.league,
        season: entry.season,
        target: entry.target,
        rows: [],
      })
    }
    groups.get(key).rows.push(entry.row)
  })

  for (const group of groups.values()) {
    const writeResult = await upsertTeamSeasonSearchIndexMany(group)
    result.updatedRowsCount += Number(writeResult?.rowsCount) || 0
  }

  return result
}
