import { doc, serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import {
  trackedGetDoc,
  trackedRunTransaction,
} from '../../../../../services/firestore/usage/index.js'
import { invalidateTeamDocumentCache } from '../../cache/index.js'
import { getLeagueById } from '../../read/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { teamDocRef } from '../../write/teams/teamDoc.js'
import {
  updateTeamSeasonPlayersScoutContext,
  updateTeamSeasonPlayerStats,
} from '../../write/teams/index.js'
import {
  updateTeamSeasonSearchIndexRosterMeta,
} from '../../write/searchIndex/team/index.js'
import { buildTeamSeasonSearchMetrics } from '../../../domain/projections/searchIndexNormalization.projection.js'
import {
  buildLeagueTeamPerformanceProjection,
  buildTeamSearchIndexPerformanceProjection,
} from '../../../domain/projections/teamPerformance.projection.js'
import {
  buildCanonicalLeagueTeamScoutContext,
} from '../../write/shared/leagueTeamScoutContext.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const resolveDisplayName = ({ teamSeasons = [], teamSearchIndexes = [] } = {}) => {
  const names = new Set([
    ...(Array.isArray(teamSeasons) ? teamSeasons : []).map(item => (
      clean(item?.identity?.displayName || item?.displayName || item?.teamName)
    )),
    ...(Array.isArray(teamSearchIndexes) ? teamSearchIndexes : []).map(item => (
      clean(item?.displayName || item?.teamName)
    )),
  ].filter(Boolean))

  return names.size === 1 ? [...names][0] : ''
}

// This repair is deliberately root-only. It does not touch seasons, players,
// league rows or indexes, and refuses ambiguous display-name sources.
export async function repairTeamRootDisplayName({
  teamDocument = {},
  teamSeasons = [],
  teamSearchIndexes = [],
} = {}) {
  const teamId = clean(
    teamDocument?.id ||
    teamDocument?.birthTeamDocumentId ||
    teamDocument?.birthTeamId
  )
  const displayName = resolveDisplayName({ teamSeasons, teamSearchIndexes })

  if (!teamId) throw new Error('חסר מזהה קבוצה לתיקון')
  if (!displayName) {
    throw new Error('לא נמצא שם קבוצה יחיד וברור לעדכון')
  }

  const ref = teamDocRef(teamId)

  const result = await trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) throw new Error('מסמך הקבוצה לא נמצא')

    if (clean(snapshot.data()?.displayName) === displayName) {
      return { changed: false, displayName }
    }

    transaction.update(ref, {
      displayName,
      updatedAt: serverTimestamp(),
    })

    return { changed: true, displayName }
  })

  invalidateTeamDocumentCache(teamId)
  return result
}

// This repair has one source of truth: the selected League table. It only
// rebuilds the selected Team Season and its matching Team SearchIndex.
export async function repairTeamSeasonStatsFromLeague({
  issue = {},
  teamDocument = {},
  teamSeasons = [],
  leagueDocument = {},
  selectedLeagueSeason = null,
} = {}) {
  const teamId = clean(
    teamDocument?.id ||
    teamDocument?.birthTeamDocumentId ||
    teamDocument?.birthTeamId
  )
  const league = leagueDocument || {}
  const season = selectedLeagueSeason?.season || {}
  const target = clean(selectedLeagueSeason?.target) || 'current'
  const expectedSeasonKey = clean(issue?.seasonKey)
  const actualSeasonKey = clean(season?.seasonKey || season?.seasonId)

  if (!teamId) throw new Error('חסר מזהה קבוצה לתיקון')
  if (!clean(league?.id)) throw new Error('מסמך הליגה אינו זמין לתיקון')
  if (!actualSeasonKey || actualSeasonKey !== expectedSeasonKey) {
    throw new Error('יש לפתוח את אותה עונה שבה נמצאה התקלה')
  }
  const teamSeason = (Array.isArray(teamSeasons) ? teamSeasons : [])
    .find(item => clean(item?.seasonKey || item?.seasonId) === expectedSeasonKey)
  if (!teamSeason) throw new Error('מסמך עונת הקבוצה אינו זמין לתיקון')

  const teamContextInput = buildCanonicalLeagueTeamScoutContext({
    league,
    season,
    target,
    team: {
      ...(teamSeason.identity || {}),
      birthTeamId: teamId,
      birthTeamDocumentId: teamId,
      teamId,
      teamDocumentId: teamId,
    },
  })
  if (!teamContextInput) {
    throw new Error('הקבוצה לא נמצאה בטבלת הליגה של העונה')
  }

  const seasonResult = await updateTeamSeasonPlayersScoutContext({
    league,
    season,
    teamContextInput,
  })
  if (seasonResult.skipped) {
    throw new Error('מסמך עונת הקבוצה אינו קיים לתיקון')
  }

  await updateTeamSeasonSearchIndexRosterMeta({
    league,
    season,
    target,
    team: {
      ...teamContextInput.row,
      birthTeamId: teamId,
      birthTeamDocumentId: teamId,
      teamId,
      teamDocumentId: teamId,
    },
    playersCount: seasonResult.playersCount,
    scoutProfilesSummary: seasonResult.scoutProfilesSummary,
    teamBalance: seasonResult.teamBalance,
    teamPerformance: teamContextInput.teamPerformance,
    teamSeasonDocumentId: seasonResult.teamSeasonDocumentId,
  })

  invalidateTeamDocumentCache(teamId)
  return {
    changed: seasonResult.changed,
    seasonKey: actualSeasonKey,
  }
}

const resolveLeagueSeason = ({ league = {}, seasonKey = '' } = {}) => {
  const safeSeasonKey = clean(seasonKey)
  const current = league?.current || null
  const history = Array.isArray(league?.history) ? league.history : []
  const currentKey = clean(current?.seasonKey || current?.seasonId)

  if (current && currentKey === safeSeasonKey) {
    return { season: current, target: 'current' }
  }

  const historical = history.find(item => (
    clean(item?.seasonKey || item?.seasonId) === safeSeasonKey
  ))

  return historical ? {
    season: {
      ...historical,
      // Old rows did not always persist this field; their presence in
      // history is the authoritative completed lifecycle.
      seasonStatus: clean(historical.seasonStatus) || 'completed',
    },
    target: 'history',
  } : null
}

// This repair creates exactly one missing Team Season from its League row and
// links that season to the root team document. It never copies data from the
// orphaned index and never changes any other season.
export async function repairOrphanTeamSearchIndex({
  issue = {},
  teamDocument = {},
  teamSeasons = [],
  teamSearchIndexes = [],
} = {}) {
  const teamId = clean(
    teamDocument?.id ||
    teamDocument?.birthTeamDocumentId ||
    teamDocument?.birthTeamId
  )
  const seasonKey = clean(issue?.seasonKey)
  const existingSeason = (Array.isArray(teamSeasons) ? teamSeasons : [])
    .find(item => clean(item?.seasonKey || item?.seasonId) === seasonKey)
  const index = (Array.isArray(teamSearchIndexes) ? teamSearchIndexes : [])
    .find(item => clean(item?.seasonKey || item?.seasonId) === seasonKey)
  const leagueId = clean(index?.leagueId)

  if (!teamId || !seasonKey || !leagueId) {
    throw new Error('חסרים נתוני זיהוי ליצירת עונת הקבוצה')
  }
  if (existingSeason) {
    throw new Error('עונת הקבוצה כבר קיימת ואין צורך ליצור אותה')
  }

  const league = await getLeagueById(leagueId)
  const leagueSeason = resolveLeagueSeason({ league, seasonKey })
  if (!leagueSeason) {
    throw new Error('העונה לא נמצאה במסמך הליגה')
  }
  if (!['active', 'completed'].includes(clean(leagueSeason.season?.seasonStatus))) {
    throw new Error('מצב העונה בליגה אינו מאפשר עדיין יצירת עונת קבוצה')
  }

  const teamContextInput = buildCanonicalLeagueTeamScoutContext({
    league,
    season: leagueSeason.season,
    target: leagueSeason.target,
    team: {
      birthTeamId: teamId,
      birthTeamDocumentId: teamId,
      teamId,
      teamDocumentId: teamId,
    },
  })
  if (!teamContextInput) {
    throw new Error('הקבוצה לא נמצאה בטבלת הליגה של העונה')
  }

  const team = {
    ...teamContextInput.row,
    birthTeamId: teamId,
    birthTeamDocumentId: teamId,
    teamId,
    teamDocumentId: teamId,
  }
  const seasonResult = await updateTeamSeasonPlayerStats({
    season: leagueSeason.season,
    team,
    players: [],
    teamPerformance: teamContextInput.teamPerformance,
    teamPoints: teamContextInput.row?.teamStats?.points || teamContextInput.row?.points,
  })

  await updateTeamSeasonSearchIndexRosterMeta({
    league,
    season: leagueSeason.season,
    target: leagueSeason.target,
    team,
    playersCount: seasonResult.playersCount,
    scoutProfilesSummary: seasonResult.seasonDocument?.scoutProfilesSummary,
    teamBalance: seasonResult.teamBalance,
    teamPerformance: teamContextInput.teamPerformance,
    teamSeasonDocumentId: seasonResult.teamSeasonDocumentId,
  })

  invalidateTeamDocumentCache(teamId)
  return {
    changed: seasonResult.changed,
    seasonKey,
  }
}

// League-only indexes are the expected representation for a not-started
// season. This repair changes only their derived lifecycle fields, using the
// exact matching League Season as the source of truth.
export async function repairTeamSearchIndexSeasonStatus({
  issue = {},
  teamDocument = {},
  teamSearchIndexes = [],
} = {}) {
  const documentTeamId = clean(
    teamDocument?.id ||
    teamDocument?.birthTeamDocumentId ||
    teamDocument?.birthTeamId
  )
  const seasonKey = clean(issue?.seasonKey)
  const issueLeagueId = clean(issue?.leagueId)
  const index = (Array.isArray(teamSearchIndexes) ? teamSearchIndexes : [])
    .find(item => (
      clean(item?.seasonKey || item?.seasonId) === seasonKey &&
      (!issueLeagueId || clean(item?.leagueId) === issueLeagueId)
    ))
  const indexId = clean(index?.id)
  const leagueId = clean(index?.leagueId)

  const teamId = documentTeamId || clean(index?.birthTeamId || index?.teamId)
  if (!teamId || !seasonKey || !indexId || !leagueId) {
    throw new Error('חסרים נתוני זיהוי לעדכון סטטוס האינדקס')
  }

  const league = await getLeagueById(leagueId)
  const leagueSeason = resolveLeagueSeason({ league, seasonKey })
  if (!leagueSeason) throw new Error('העונה לא נמצאה במסמך הליגה')

  const expected = buildTeamSeasonSearchMetrics({
    target: leagueSeason.target,
    seasonStatus: leagueSeason.season.seasonStatus,
    leagueTotalRound: leagueSeason.season.leagueTotalRound,
    teamGamePlayed: index.teamGamePlayed,
    points: index.points,
    goalsFor: index.goalsFor,
    goalsAgainst: index.goalsAgainst,
  })
  const ref = doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, indexId)
  const result = await trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) throw new Error('אינדקס הקבוצה לא נמצא')
    const current = snapshot.data() || {}
    if (
      clean(current.entityType) !== 'birthTeamSeason' ||
      clean(current.birthTeamId) !== teamId ||
      clean(current.seasonKey || current.seasonId) !== seasonKey
    ) {
      throw new Error('האינדקס השתנה ואינו תואם עוד לקבוצה ולעונה')
    }

    // The audit mismatch for this repair is lifecycle-only. Do not rebuild
    // stats or projections here: they belong to their dedicated write flows.
    const patch = {
      seasonStatus: expected.seasonStatus,
      normalizationStatus: expected.normalizationStatus,
      remainingTeamGames: expected.remainingTeamGames,
    }
    const changed = Object.entries(patch).some(([field, value]) => (
      current[field] !== value
    ))
    if (!changed) return { changed: false, seasonKey }

    transaction.update(ref, {
      ...patch,
      updatedAt: serverTimestamp(),
    })
    return { changed: true, seasonKey }
  })

  invalidateTeamDocumentCache(teamId)
  return result
}

// The main audit supplies exact SearchIndex document ids. Each target is
// re-read and validated before its isolated lifecycle-only write.
export async function repairTeamSearchIndexLifecycleById({
  documentId = '',
  teamDocumentId = '',
  seasonKey = '',
} = {}) {
  const indexId = clean(documentId)
  const expectedTeamId = clean(teamDocumentId)
  const expectedSeasonKey = clean(seasonKey)
  if (!indexId || !expectedTeamId || !expectedSeasonKey) {
    throw new Error('חסרים נתוני זיהוי לתיקון אינדקס הקבוצה')
  }

  const ref = doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, indexId)
  const initial = await trackedGetDoc(ref, {
    feature: 'playersDatabase',
    action: 'team-search-index-lifecycle-repair-read',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    meta: { documentId: indexId },
  })
  if (!initial.exists()) throw new Error('אינדקס הקבוצה לא נמצא')

  const initialData = initial.data() || {}
  const leagueId = clean(initialData.leagueId)
  if (!leagueId) throw new Error('חסר מזהה ליגה באינדקס הקבוצה')

  const league = await getLeagueById(leagueId)
  const leagueSeason = resolveLeagueSeason({ league, seasonKey: expectedSeasonKey })
  if (!leagueSeason) throw new Error('העונה לא נמצאה במסמך הליגה')
  const target = clean(leagueSeason.season.seasonStatus) === 'completed' ? 'history' : 'current'
  const performance = buildLeagueTeamPerformanceProjection({
    league,
    season: leagueSeason.season,
    target,
    team: {
      ...initialData,
      birthTeamId: expectedTeamId,
      teamId: expectedTeamId,
    },
  })
  if (!performance) throw new Error('הקבוצה לא נמצאה בטבלת הליגה של העונה')
  const performancePatch = buildTeamSearchIndexPerformanceProjection(performance)

  const result = await trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) throw new Error('אינדקס הקבוצה לא נמצא')

    const current = snapshot.data() || {}
    if (
      clean(current.entityType) !== 'birthTeamSeason' ||
      clean(current.birthTeamId) !== expectedTeamId ||
      clean(current.seasonKey || current.seasonId) !== expectedSeasonKey ||
      clean(current.leagueId) !== leagueId
    ) {
      throw new Error('האינדקס השתנה ואינו תואם עוד לממצא האודיט')
    }

    const expected = buildTeamSeasonSearchMetrics({
      // The audit normalizes completed seasons as history even when the
      // League document still holds the row under `current`.
      target,
      seasonStatus: leagueSeason.season.seasonStatus,
      leagueTotalRound: leagueSeason.season.leagueTotalRound,
      teamGamePlayed: performance.teamGamePlayed,
      points: performance.points,
      goalsFor: performance.goalsFor,
      goalsAgainst: performance.goalsAgainst,
    })
    const patch = {
      ...performancePatch,
      seasonStatus: expected.seasonStatus,
      normalizationStatus: expected.normalizationStatus,
      remainingTeamGames: expected.remainingTeamGames,
    }
    const changed = Object.entries(patch).some(([field, value]) => (
      current[field] !== value
    ))
    if (!changed) return { documentId: indexId, changed: false }

    transaction.update(ref, {
      ...patch,
      updatedAt: serverTimestamp(),
    })
    return { documentId: indexId, changed: true }
  })

  // A single targeted read verifies the persisted repair. This is deliberately
  // not a full audit and prevents the UI from hiding a finding optimistically.
  const verified = await trackedGetDoc(ref, {
    feature: 'playersDatabase',
    action: 'team-search-index-lifecycle-repair-verify',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    meta: { documentId: indexId },
  })
  const verifiedData = verified.exists() ? verified.data() || {} : {}
  const verifiedExpected = buildTeamSeasonSearchMetrics({
    target,
    seasonStatus: leagueSeason.season.seasonStatus,
    leagueTotalRound: leagueSeason.season.leagueTotalRound,
    teamGamePlayed: performance.teamGamePlayed,
    points: performance.points,
    goalsFor: performance.goalsFor,
    goalsAgainst: performance.goalsAgainst,
  })
  if (
    Object.entries(performancePatch).some(([field, value]) => verifiedData[field] !== value) ||
    verifiedData.seasonStatus !== verifiedExpected.seasonStatus ||
    verifiedData.normalizationStatus !== verifiedExpected.normalizationStatus ||
    Number(verifiedData.remainingTeamGames) !== Number(verifiedExpected.remainingTeamGames)
  ) {
    throw new Error('אימות כתיבת סטטוס האינדקס נכשל')
  }

  invalidateTeamDocumentCache(expectedTeamId)
  return result
}

export async function repairTeamSearchIndexLifecycleMany({ findings = [] } = {}) {
  const targets = [...new Map(
    (Array.isArray(findings) ? findings : [])
      .filter(finding => (
        clean(finding?.entityType) === 'teamSearchIndex' &&
        clean(finding?.documentId) &&
        clean(finding?.teamDocumentId) &&
        clean(finding?.seasonKey)
      ))
      .map(finding => [clean(finding.documentId), finding])
  ).values()]
  const results = []
  const failures = []

  for (const finding of targets) {
    try {
      results.push(await repairTeamSearchIndexLifecycleById({
        documentId: finding.documentId,
        teamDocumentId: finding.teamDocumentId,
        seasonKey: finding.seasonKey,
      }))
    } catch (error) {
      failures.push({
        documentId: clean(finding.documentId),
        message: clean(error?.message) || 'תיקון אינדקס הקבוצה נכשל',
      })
    }
  }

  return {
    totalCount: targets.length,
    changedCount: results.filter(result => result.changed).length,
    unchangedCount: results.filter(result => !result.changed).length,
    results,
    failures,
  }
}
