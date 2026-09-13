// Updates the canonical season settings, then rebuilds every affected Club
// projection before publishing the corresponding Clubs Master entries.

import { updateLeagueSeasonSettings } from '../../leagues/index.js'
import {
  ensureRequiredClubProjectionCompleted,
  syncClubProjectionsFromLeagueTable,
} from '../../clubs/index.js'
import { buildLeagueRowsWithScoutPerformance } from '../../shared/leagueTeamScoutContext.js'
import { buildWriteFlowSyncError } from '../writeFlowSyncError.js'

export async function updateLeagueSeasonSettingsFlow(payload = {}) {
  const results = {}

  try {
    results.leagueSeasonResult = await updateLeagueSeasonSettings(payload)
    results.leagueCanonicalCommitted = true
  } catch (error) {
    throw buildWriteFlowSyncError({
      name: 'LeagueSeasonSettingsSyncError',
      fallbackMessage: 'League season settings sync failed',
      stage: 'updateLeagueSeasonSettings',
      cause: error,
      results,
    })
  }

  if (results.leagueSeasonResult?.competitionRulesChanged) {
    try {
      const seasonDocument = results.leagueSeasonResult?.seasonDocument || {}
      const rows = Array.isArray(seasonDocument.tableRank) ? seasonDocument.tableRank : []
      results.clubProjections = await syncClubProjectionsFromLeagueTable({
        league: payload.league || {},
        season: seasonDocument,
        rows: buildLeagueRowsWithScoutPerformance({
          league: payload.league || {},
          season: seasonDocument,
          target: results.leagueSeasonResult?.target || payload.target || 'current',
          rows,
        }),
        leagueSeasonDocument: seasonDocument,
        canonicalCommitted: true,
        lastWriteAction: 'UPDATE_LEAGUE_SEASON_SETTINGS',
        syncMaster: true,
      })
      ensureRequiredClubProjectionCompleted(results.clubProjections)
    } catch (error) {
      throw buildWriteFlowSyncError({
        name: 'LeagueSeasonSettingsSyncError',
        fallbackMessage: 'League Club projections sync failed',
        stage: 'clubProjections',
        cause: error,
        results,
      })
    }
  } else {
    results.clubProjections = {
      completed: true,
      updated: true,
      changed: false,
      writeSkipped: true,
      reason: 'competitionRulesUnchanged',
      rowsCount: 0,
    }
  }

  return {
    ...results,
    rowsCount: results.clubProjections?.rowsCount || 0,
    syncStatus: 'complete',
  }
}
