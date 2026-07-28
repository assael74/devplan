// features/playersDatabase/services/write/searchIndex/team/teamSeasonIndex.rebuild.js

import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { clean } from '../../leagues/leagueDoc.js'
import { upsertTeamSeasonSearchIndexMany } from './teamSeasonIndex.upsert.js'

const buildLeagueIdentity = (leagueData = {}, leagueDocumentId = '') => ({
  ...leagueData,
  id: clean(leagueData.id || leagueData.leagueId || leagueDocumentId),
})

const collectLeagueSeasons = leagueData => {
  const rows = []

  if (leagueData?.current) {
    rows.push({
      target: 'current',
      season: leagueData.current,
    })
  }

  ;(Array.isArray(leagueData?.history) ? leagueData.history : []).forEach(season => {
    rows.push({
      target: 'history',
      season,
    })
  })

  return rows
}

const isRebuildableSeason = season => (
  Boolean(clean(season?.seasonId)) &&
  Array.isArray(season?.tableRank) &&
  season.tableRank.length > 0
)

export async function rebuildTeamSeasonSearchIndexesFromLeagues({
  dryRun = false,
} = {}) {
  const leaguesSnapshot = await getDocs(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.leagues)
  )
  const result = {
    scannedLeaguesCount: leaguesSnapshot.docs.length,
    scannedSeasonsCount: 0,
    skippedSeasonsCount: 0,
    teamRowsCount: 0,
    updatedRowsCount: 0,
    dryRun: Boolean(dryRun),
  }

  for (const leagueDocument of leaguesSnapshot.docs) {
    const leagueData = leagueDocument.data() || {}
    const league = buildLeagueIdentity(leagueData, leagueDocument.id)
    const seasonEntries = collectLeagueSeasons(leagueData)

    for (const { target, season } of seasonEntries) {
      result.scannedSeasonsCount += 1

      if (!league.id || !isRebuildableSeason(season)) {
        result.skippedSeasonsCount += 1
        continue
      }

      const rows = season.tableRank
      result.teamRowsCount += rows.length

      if (dryRun) continue

      const writeResult = await upsertTeamSeasonSearchIndexMany({
        league,
        season,
        target,
        rows,
      })

      result.updatedRowsCount += Number(writeResult?.rowsCount) || 0
    }
  }

  return result
}
