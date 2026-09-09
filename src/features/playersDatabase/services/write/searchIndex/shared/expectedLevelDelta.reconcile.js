// Keeps the age-progression projection consistent regardless of league-load order.

import { rebuildTeamSeasonSearchIndexesFromLeagues } from '../team/teamSeasonIndex.rebuild.js'
import { upsertTeamSeasonSearchIndexMany } from '../team/teamSeasonIndex.upsert.js'
import { updatePlayerSeasonSearchIndexScoutContextMany } from '../player/playerSeasonIndex.patch.js'
import { updateTeamSeasonPlayersScoutContext } from '../../teams/teamSeasonScoutContext.js'
import { syncPlayerScoutProfileDocsMany } from '../../players/playerScoutProfiles.js'
import {
  buildCanonicalLeagueTeamScoutContext,
} from '../../shared/leagueTeamScoutContext.js'

const normalizeBirthYears = birthYear => {
  const current = Number(birthYear)
  return Number.isFinite(current) ? [current, current + 1] : []
}

const groupReconciledRows = entries => {
  const groups = new Map()

  ;(Array.isArray(entries) ? entries : []).forEach(entry => {
    const key = [
      entry.league?.id,
      entry.season?.seasonId,
      entry.target,
    ].join('::')

    if (!groups.has(key)) {
      groups.set(key, {
        league: entry.league,
        season: entry.season,
        target: entry.target || 'current',
        rows: [],
      })
    }

    groups.get(key).rows.push(entry.row)
  })

  return [...groups.values()]
}

const buildReconciliationTeamContext = entry => {
  const context = buildCanonicalLeagueTeamScoutContext({
    league: entry.league,
    season: entry.season,
    target: entry.target,
    team: entry.row,
  })

  if (!context) {
    throw new Error('Missing canonical league team context')
  }

  return {
    ...context,
    // expectedLevelDelta is calculated across birth years and therefore is
    // attached by the reconciler rather than stored in the League table.
    row: {
      ...context.row,
      expectedLevelDelta: entry.row.expectedLevelDelta,
    },
  }
}

// A loaded birth year affects its own next-age comparison and the younger
// birth year that uses it as its next-age source. The league collection is
// embedded by season, therefore the rebuild resolves the relationship from
// the complete persisted league snapshot before applying the scoped writes.
export async function reconcileExpectedLevelDeltaAfterLeagueLoad({
  birthYear,
  syncTeamSeasonContexts = true,
} = {}) {
  const birthYears = normalizeBirthYears(birthYear)
  if (!birthYears.length) {
    return {
      skipped: true,
      reason: 'missingBirthYear',
      updatedTeamSeasonsCount: 0,
      updatedPlayerDocumentsCount: 0,
      failedCount: 0,
      failures: [],
    }
  }

  // Read the league snapshot only to calculate the two affected birth years.
  // A league import must never launch the global SearchIndex normalization:
  // that maintenance action scans and rewrites every player index and keeps
  // the import dialog in its loading state long after the table is saved.
  const rebuiltTeams = await rebuildTeamSeasonSearchIndexesFromLeagues({
    dryRun: true,
    birthYears,
  })
  const failures = []
  let updatedTeamSeasonsCount = 0
  let updatedPlayerDocumentsCount = 0

  if (syncTeamSeasonContexts) {
    for (const entry of rebuiltTeams.reconciledEntries) {
      try {
        const teamContextInput = buildReconciliationTeamContext(entry)
        const contextResult = await updateTeamSeasonPlayersScoutContext({
          league: entry.league,
          season: entry.season,
          teamContextInput,
        })

        if (!contextResult?.updated || contextResult?.skipped || !contextResult.changed) continue
        updatedTeamSeasonsCount += 1

        const playerResult = await syncPlayerScoutProfileDocsMany({
          season: {
            ...entry.season,
            seasonId: contextResult.seasonId,
            seasonKey: contextResult.seasonKey,
            seasonStatus: contextResult.teamContext?.seasonStatus,
            leagueLevel: contextResult.teamContext?.leagueLevel,
            expectedLevelDelta: contextResult.teamContext?.expectedLevelDelta,
          },
          team: contextResult.teamContext || {},
          target: contextResult.target || entry.target || 'current',
          players: contextResult.players || [],
          teamSeasonDocument: contextResult.seasonDocument || null,
        })

        updatedPlayerDocumentsCount += Number(playerResult?.rowsCount) || 0
        ;(Array.isArray(playerResult?.failures) ? playerResult.failures : [])
          .forEach(failure => failures.push({
            ...failure,
            birthTeamDocumentId: contextResult.teamDocumentId,
          }))

        await updatePlayerSeasonSearchIndexScoutContextMany({
          league: entry.league,
          season: {
            ...entry.season,
            seasonId: contextResult.seasonId,
            seasonKey: contextResult.seasonKey,
            seasonStatus: contextResult.teamContext?.seasonStatus,
            leagueLevel: contextResult.teamContext?.leagueLevel,
            leagueTotalRound: contextResult.teamContext?.leagueTotalRound,
          },
          team: contextResult.teamContext || {},
          players: contextResult.players || [],
        })
      } catch (error) {
        failures.push({
          leagueId: entry.league?.id || '',
          seasonId: entry.season?.seasonId || '',
          birthTeamId: entry.indexDoc?.birthTeamId || '',
          message: error?.message || 'Expected-level reconciliation failed',
        })
      }
    }
  }

  // Write the calculated cross-birth-year delta in a small batch per league
  // season. This preserves the progression context for not-started seasons
  // without recreating player documents or triggering global maintenance.
  for (const group of groupReconciledRows(rebuiltTeams.reconciledEntries)) {
    try {
      await upsertTeamSeasonSearchIndexMany(group)
    } catch (error) {
      failures.push({
        leagueId: group.league?.id || '',
        seasonId: group.season?.seasonId || '',
        message: error?.message || 'Expected-level team index sync failed',
      })
    }
  }

  return {
    skipped: false,
    birthYears,
    teamSeasonContextSyncSkipped: !syncTeamSeasonContexts,
    reconciledTeamRowsCount: rebuiltTeams.teamRowsCount,
    updatedTeamSeasonsCount,
    updatedPlayerDocumentsCount,
    failedCount: failures.length,
    failures,
  }
}
