// src/features/playersDatabase/services/write/leagues/leagueTableRank.js

import { pickDefinedValue } from '../../../model/value.model.js'


import { db } from '../../../../../services/firebase/firebase.js'
import {
  buildLeagueBaseDoc,
  buildSeasonKey,
  clean,
  cleanSeasonComputedFields,
  leagueDocRef,
  toNumberOrZero,
} from './leagueDoc.js'
import {
  buildSeasonDoc,
  updateHistorySeason,
} from './leagueSeason.js'
import { syncLeaguesMasterDocument } from './leaguesMaster.js'
import {
  isSameSeason,
  normalizeSeasonIdentity,
} from '../../../model/season.model.js'
import { normalizeTeamIdentity } from '../../../model/teamIdentity.model.js'
import { normalizeTeamStats } from '../../../model/teamStats.model.js'

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
const hasOwn = (source, key) => (
  Boolean(source) &&
  Object.prototype.hasOwnProperty.call(source, key)
)

const normalizeScoutProfilesSummary = summary => {
  const profileCounts =
    summary?.profileCounts &&
    typeof summary.profileCounts === 'object'
      ? summary.profileCounts
      : {}

  return {
    total: toNumberOrZero(summary?.total),
    profileCounts: Object.keys(profileCounts)
      .sort()
      .reduce((result, profileId) => {
        result[profileId] = toNumberOrZero(profileCounts[profileId])
        return result
      }, {}),
  }
}

const areScoutProfilesSummariesEqual = (left, right) => (
  JSON.stringify(normalizeScoutProfilesSummary(left)) ===
  JSON.stringify(normalizeScoutProfilesSummary(right))
)

const findExistingTableRankRow = ({ tableRank = [], row = {} } = {}) => {
  const identity = normalizeTeamIdentity({ team: row })
  const teamId = clean(identity.birthTeamId)
  const clubId = clean(identity.clubId)

  return (Array.isArray(tableRank) ? tableRank : []).find(existingRow => {
    const existingIdentity = normalizeTeamIdentity({ team: existingRow })
    const existingTeamId = clean(existingIdentity.birthTeamId)
    const existingClubId = clean(existingIdentity.clubId)

    if (teamId && existingTeamId) return teamId === existingTeamId

    return !teamId && clubId && existingClubId === clubId
  }) || null
}

const buildTableRankRow = ({ row = {}, existingRow = null } = {}) => {
  const rank = toNumberOrZero(pickDefinedValue(row.position, row.rank, row.leaguePosition))
  const identity = normalizeTeamIdentity({ team: row })
  const teamStats = normalizeTeamStats(row, {
    gamesCandidates: [row.games],
    goalsForCandidates: [row.goalsFor],
    goalsAgainstCandidates: [row.goalsAgainst],
    pointsCandidates: [row.points],
  })
  const existingPlayersCount = hasOwn(existingRow, 'playersCount')
    ? toNumberOrZero(existingRow.playersCount)
    : 0

  return {
    rank,
    clubId: identity.clubId,
    clubLevel: toNumberOrZero(
      pickDefinedValue(row.clubLevel, existingRow?.clubLevel)
    ),
    birthTeamId: identity.birthTeamId,
    birthTeamSlot: identity.birthTeamSlot,
    teamId: identity.birthTeamId,
    teamUrl: clean(row.teamUrl) || clean(existingRow?.teamUrl),
    playersCount: existingPlayersCount,
    hasPlayers: hasOwn(existingRow, 'hasPlayers')
      ? Boolean(existingRow.hasPlayers)
      : existingPlayersCount > 0,
    hasStats: hasOwn(existingRow, 'hasStats')
      ? Boolean(existingRow.hasStats)
      : false,
    statsComplete: hasOwn(existingRow, 'statsComplete')
      ? Boolean(existingRow.statsComplete)
      : false,
    teamStats: {
      ...(existingRow?.teamStats || {}),
      points: teamStats.points,
      goalsFor: teamStats.goalsFor,
      goalsAgainst: teamStats.goalsAgainst,
      teamGamePlayed: teamStats.gamesPlayed,
    },
    scoutProfilesSummary: {
      total: toNumberOrZero(existingRow?.scoutProfilesSummary?.total),
      profileCounts: existingRow?.scoutProfilesSummary?.profileCounts || {},
    },
    updatedAt: new Date().toISOString(),
  }
}

const buildTableRank = ({ rows = [], existingTableRank = [] } = {}) =>
  (Array.isArray(rows) ? rows : [])
    .map(row => buildTableRankRow({
      row,
      existingRow: findExistingTableRankRow({
        tableRank: existingTableRank,
        row,
      }),
    }))
    .filter(row => row.rank || row.clubId || row.birthTeamId || row.teamId)

const updateHistorySeasonTableRank = ({
  history = [],
  season = {},
  tableRank = [],
}) =>
  updateHistorySeason({
    history,
    season,
    patch: {
      birthYear: toNumberOrZero(season.birthYear),
      leagueTotalRound: toNumberOrZero(season.leagueTotalRound),
      tableRank,
      updatedAt: new Date().toISOString(),
    },
  })

export async function updateLeagueSeasonTableRank({
  league = {},
  season = {},
  target = 'current',
  rows = [],
  syncMaster = true,
} = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonId = clean(season.seasonId)
  const resolvedSeasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId && !resolvedSeasonKey) throw new Error('Missing season id')

  const ref = leagueDocRef(leagueId)

  const result = await trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const baseDoc = buildLeagueBaseDoc({
      ...league,
      id: leagueId,
    }, currentData)
    const { seasonKey } = normalizeSeasonIdentity({ season: {
      ...season,
      seasonId,
    } })
    const isHistory = clean(target) === 'history'
    const existingSeason = isHistory
      ? (Array.isArray(baseDoc.history) ? baseDoc.history : [])
          .find(row => isSameSeason(row, {
            seasonId,
            seasonKey,
          }))
      : isSameSeason(baseDoc.current, {
          seasonId,
          seasonKey,
        })
        ? baseDoc.current
        : null
    const tableRank = buildTableRank({
      rows,
      existingTableRank: existingSeason?.tableRank || [],
    })
    const nextData = isHistory
      ? {
          ...baseDoc,
          history: updateHistorySeasonTableRank({
            history: baseDoc.history,
            season: {
              ...season,
              seasonId,
              seasonKey,
            },
            tableRank,
          }),
        }
      : {
        ...baseDoc,
        current: {
          ...cleanSeasonComputedFields(baseDoc.current || buildSeasonDoc({
            ...season,
            seasonId,
            seasonKey,
          })),
          seasonId,
          seasonKey,
          birthYear: toNumberOrZero(season.birthYear),
          leagueTotalRound: toNumberOrZero(season.leagueTotalRound),
          tableRank,
          updatedAt: new Date().toISOString(),
        },
      }

    transaction.set(ref, nextData, { merge: true })

    return {
      leagueId,
      seasonId,
      seasonKey,
      target: isHistory ? 'history' : 'current',
      rowsCount: tableRank.length,
    }
  })

  if (syncMaster) {
    await syncLeaguesMasterDocument({
      leagues: [league],
    })
  }

  return result
}

const updateTableRankRowTeamUrl = ({ tableRank = [], team = {} } = {}) => {
  const teamId = normalizeTeamIdentity({ team }).birthTeamId
  const clubId = clean(team.clubId)
  const teamUrl = clean(team.teamUrl)

  return (Array.isArray(tableRank) ? tableRank : []).map(row => {
    const rowTeamId = normalizeTeamIdentity({ team: row }).birthTeamId
    const rowClubId = clean(row.clubId)
    const sameTeam = teamId && rowTeamId === teamId
    const sameClubFallback = !teamId && clubId && rowClubId === clubId

    if (!sameTeam && !sameClubFallback) return row

    return {
      ...row,
      teamUrl: teamUrl || clean(row.teamUrl),
      ...(Number.isFinite(Number(team.playersCount))
        ? { playersCount: Number(team.playersCount) }
        : {}),
      ...(hasOwn(team, 'hasPlayers')
        ? { hasPlayers: Boolean(team.hasPlayers) }
        : {}),
      ...(hasOwn(team, 'hasStats')
        ? { hasStats: Boolean(team.hasStats) }
        : {}),
      ...(hasOwn(team, 'statsComplete')
        ? { statsComplete: Boolean(team.statsComplete) }
        : {}),
      updatedAt: new Date().toISOString(),
    }
  })
}

const hasFiniteNumberValue = value => clean(value) !== '' && Number.isFinite(Number(value))

const sumTableRankPlayersCount = tableRank =>
  (Array.isArray(tableRank) ? tableRank : []).reduce(
    (total, row) => total + toNumberOrZero(row?.playersCount),
    0
  )

const hasTableRankPlayersCount = tableRank =>
  (Array.isArray(tableRank) ? tableRank : []).some(row =>
    hasFiniteNumberValue(row?.playersCount)
  )

const updateHistorySeasonTableRankTeamUrl = ({ history = [], season = {}, team = {} } = {}) =>
  updateHistorySeason({
    history,
    season,
    patch: {
      tableRank: updateTableRankRowTeamUrl({
        tableRank: (Array.isArray(history) ? history : [])
          .find(row => isSameSeason(row, season))?.tableRank || [],
        team,
      }),
      updatedAt: new Date().toISOString(),
    },
  })

const updateTableRankRowScoutProfilesSummary = ({ tableRank = [], team = {}, scoutProfilesSummary = {} } = {}) => {
  const teamId = normalizeTeamIdentity({ team }).birthTeamId
  const clubId = clean(team.clubId)

  return (Array.isArray(tableRank) ? tableRank : []).map(row => {
    const rowTeamId = normalizeTeamIdentity({ team: row }).birthTeamId
    const rowClubId = clean(row.clubId)
    const sameTeam = teamId && rowTeamId === teamId
    const sameClubFallback = !teamId && clubId && rowClubId === clubId

    if (!sameTeam && !sameClubFallback) return row

    return {
      ...row,
      scoutProfilesSummary: {
        total: toNumberOrZero(scoutProfilesSummary.total),
        profileCounts: scoutProfilesSummary.profileCounts || {},
      },
      updatedAt: new Date().toISOString(),
    }
  })
}

const updateHistorySeasonTableRankScoutProfilesSummary = ({ history = [], season = {}, team = {}, scoutProfilesSummary = {} } = {}) =>
  updateHistorySeason({
    history,
    season,
    patch: {
      tableRank: updateTableRankRowScoutProfilesSummary({
        tableRank: (Array.isArray(history) ? history : [])
          .find(row => isSameSeason(row, season))?.tableRank || [],
        team,
        scoutProfilesSummary,
      }),
      updatedAt: new Date().toISOString(),
    },
  })

export async function updateLeagueSeasonTableRankTeamUrl({ league = {}, season = {}, team = {} } = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const teamIdentity = normalizeTeamIdentity({ team })
  const birthTeamId = clean(
    teamIdentity.birthTeamId ||
    teamIdentity.teamId ||
    team.birthTeamId ||
    team.teamId ||
    team.birthTeamDocumentId ||
    team.teamDocumentId ||
    team.id
  )
  const clubId = clean(teamIdentity.clubId || team.clubId)
  const teamUrl = clean(team.teamUrl)

  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId && !seasonKey) throw new Error('Missing season id')
  if (!birthTeamId) throw new Error('Missing birth team id')

  const ref = leagueDocRef(leagueId)

  const result = await trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)

    if (!snapshot.exists()) {
      return {
        leagueId,
        seasonId,
        birthTeamId,
        teamUrl,
        updated: false,
        reason: 'leagueDocMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const currentSeason = currentData.current || null
    const history = Array.isArray(currentData.history) ? currentData.history : []
    const requestedSeason = {
      seasonId,
      seasonKey,
    }
    const currentMatches = isSameSeason(currentSeason, requestedSeason)
    const historyIndex = history.findIndex(row => isSameSeason(row, requestedSeason))
    const sourceTarget = currentMatches
      ? 'current'
      : historyIndex >= 0
        ? 'history'
        : ''
    const seasonRow = currentMatches
      ? currentSeason
      : historyIndex >= 0
        ? history[historyIndex]
        : null

    if (!seasonRow) {
      return {
        leagueId,
        seasonId,
        birthTeamId,
        teamUrl,
        updated: false,
        reason: 'leagueSeasonMissing',
      }
    }

    const tableRank = Array.isArray(seasonRow.tableRank)
      ? seasonRow.tableRank
      : []
    const teamRowIndex = tableRank.findIndex(row => {
      const rowIdentity = normalizeTeamIdentity({ team: row })
      const rowTeamId = clean(
        rowIdentity.birthTeamId ||
        rowIdentity.teamId ||
        row?.birthTeamId ||
        row?.teamId ||
        row?.birthTeamDocumentId ||
        row?.teamDocumentId ||
        row?.id
      )
      const rowClubId = clean(rowIdentity.clubId || row?.clubId)

      return (
        rowTeamId === birthTeamId ||
        (!rowTeamId && clubId && rowClubId === clubId)
      )
    })

    if (teamRowIndex === -1) {
      return {
        leagueId,
        seasonId,
        birthTeamId,
        teamUrl,
        sourceTarget,
        updated: false,
        reason: 'leagueTeamRowMissing',
      }
    }

    const currentTeamRow = tableRank[teamRowIndex] || {}
    const effectiveTeamUrl = teamUrl || clean(currentTeamRow.teamUrl)
    const effectivePlayersCount = hasFiniteNumberValue(team.playersCount)
      ? Number(team.playersCount)
      : hasFiniteNumberValue(currentTeamRow.playersCount)
        ? Number(currentTeamRow.playersCount)
        : undefined
    const effectiveHasPlayers = hasOwn(team, 'hasPlayers')
      ? Boolean(team.hasPlayers)
      : hasOwn(currentTeamRow, 'hasPlayers')
        ? Boolean(currentTeamRow.hasPlayers)
        : undefined
    const effectiveHasStats = hasOwn(team, 'hasStats')
      ? Boolean(team.hasStats)
      : hasOwn(currentTeamRow, 'hasStats')
        ? Boolean(currentTeamRow.hasStats)
        : undefined
    const effectiveStatsComplete = hasOwn(team, 'statsComplete')
      ? Boolean(team.statsComplete)
      : hasOwn(currentTeamRow, 'statsComplete')
        ? Boolean(currentTeamRow.statsComplete)
        : undefined
    const loadStatusUnchanged = (
      clean(currentTeamRow.teamUrl) === effectiveTeamUrl &&
      (
        !hasFiniteNumberValue(effectivePlayersCount) ||
        toNumberOrZero(currentTeamRow.playersCount) === Number(effectivePlayersCount)
      ) &&
      (
        effectiveHasPlayers === undefined ||
        Boolean(currentTeamRow.hasPlayers) === effectiveHasPlayers
      ) &&
      (
        effectiveHasStats === undefined ||
        Boolean(currentTeamRow.hasStats) === effectiveHasStats
      ) &&
      (
        effectiveStatsComplete === undefined ||
        Boolean(currentTeamRow.statsComplete) === effectiveStatsComplete
      )
    )

    if (loadStatusUnchanged) {
      const playersCount = sumTableRankPlayersCount(tableRank)
      const hasPlayersCount = hasTableRankPlayersCount(tableRank)

      return {
        leagueId,
        seasonId,
        seasonKey,
        birthTeamId,
        teamUrl: effectiveTeamUrl,
        playersCount: effectivePlayersCount,
        hasPlayers: effectiveHasPlayers,
        hasStats: effectiveHasStats,
        statsComplete: effectiveStatsComplete,
        seasonPlayersCount: hasPlayersCount ? playersCount : undefined,
        sourceTarget,
        updated: true,
        changed: false,
        writeSkipped: true,
      }
    }

    const nextTableRank = tableRank.map((row, index) => (
      index === teamRowIndex
        ? {
            ...row,
            teamUrl: effectiveTeamUrl,
            ...(hasFiniteNumberValue(effectivePlayersCount)
              ? { playersCount: Number(effectivePlayersCount) }
              : {}),
            ...(effectiveHasPlayers !== undefined
              ? { hasPlayers: effectiveHasPlayers }
              : {}),
            ...(effectiveHasStats !== undefined
              ? { hasStats: effectiveHasStats }
              : {}),
            ...(effectiveStatsComplete !== undefined
              ? { statsComplete: effectiveStatsComplete }
              : {}),
            updatedAt: new Date().toISOString(),
          }
        : row
    ))
    const playersCount = sumTableRankPlayersCount(nextTableRank)
    const hasPlayersCount = hasTableRankPlayersCount(nextTableRank)
    const nextSeason = {
      ...seasonRow,
      tableRank: nextTableRank,
      ...(hasPlayersCount ? { playersCount } : {}),
      updatedAt: new Date().toISOString(),
    }

    if (sourceTarget === 'current') {
      transaction.set(
        ref,
        {
          current: nextSeason,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )
    } else {
      const nextHistory = history.map((row, index) => (
        index === historyIndex ? nextSeason : row
      ))

      transaction.set(
        ref,
        {
          history: nextHistory,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )
    }

    return {
      leagueId,
      seasonId,
      seasonKey,
      birthTeamId,
      teamUrl,
      playersCount: hasFiniteNumberValue(team.playersCount)
        ? Number(team.playersCount)
        : undefined,
      hasPlayers: hasOwn(team, 'hasPlayers')
        ? Boolean(team.hasPlayers)
        : undefined,
      hasStats: hasOwn(team, 'hasStats')
        ? Boolean(team.hasStats)
        : undefined,
      statsComplete: hasOwn(team, 'statsComplete')
        ? Boolean(team.statsComplete)
        : undefined,
      seasonPlayersCount: hasPlayersCount ? playersCount : undefined,
      sourceTarget,
      updated: true,
    }
  })

  if (result.updated && !result.writeSkipped) {
    await syncLeaguesMasterDocument({
      leagues: [league],
    })
  }

  return result
}

export async function updateLeagueSeasonTableRankScoutProfilesSummary({
  league = {},
  season = {},
  target = 'current',
  team = {},
  scoutProfilesSummary = {},
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const resolvedSeasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = leagueDocRef(leagueId)

  const result = await trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)

    if (!snapshot.exists()) {
      return {
        leagueId,
        seasonId,
        seasonKey: resolvedSeasonKey,
        updated: false,
        reason: 'leagueDocMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const currentSeason = currentData.current || null
    const history = Array.isArray(currentData.history) ? currentData.history : []
    const requestedSeason = {
      seasonId,
      seasonKey: resolvedSeasonKey,
    }
    const isHistory = clean(target) === 'history'
    const sourceSeason = isHistory
      ? history.find(row => isSameSeason(row, requestedSeason)) || null
      : isSameSeason(currentSeason, requestedSeason)
        ? currentSeason
        : null

    if (!sourceSeason) {
      return {
        leagueId,
        seasonId,
        seasonKey: resolvedSeasonKey,
        target: isHistory ? 'history' : 'current',
        updated: false,
        reason: 'leagueSeasonMissing',
      }
    }

    const tableRank = Array.isArray(sourceSeason.tableRank)
      ? sourceSeason.tableRank
      : []
    const teamIdentity = normalizeTeamIdentity({ team })
    const teamId = clean(teamIdentity.birthTeamId || teamIdentity.teamId)
    const clubId = clean(teamIdentity.clubId || team.clubId)
    const teamRowExists = tableRank.some(row => {
      const rowIdentity = normalizeTeamIdentity({ team: row })
      const rowTeamId = clean(rowIdentity.birthTeamId || rowIdentity.teamId)
      const rowClubId = clean(rowIdentity.clubId || row.clubId)

      return (
        (teamId && rowTeamId === teamId) ||
        (!teamId && clubId && rowClubId === clubId)
      )
    })

    if (!teamRowExists) {
      return {
        leagueId,
        seasonId,
        seasonKey: resolvedSeasonKey,
        target: isHistory ? 'history' : 'current',
        teamId,
        updated: false,
        reason: 'leagueTeamRowMissing',
      }
    }

    const existingTeamRow = tableRank.find(row => {
      const rowIdentity = normalizeTeamIdentity({ team: row })
      const rowTeamId = clean(rowIdentity.birthTeamId || rowIdentity.teamId)
      const rowClubId = clean(rowIdentity.clubId || row.clubId)

      return (
        (teamId && rowTeamId === teamId) ||
        (!teamId && clubId && rowClubId === clubId)
      )
    }) || null
    const normalizedSummary = normalizeScoutProfilesSummary(scoutProfilesSummary)

    if (
      existingTeamRow &&
      areScoutProfilesSummariesEqual(
        existingTeamRow.scoutProfilesSummary,
        normalizedSummary
      )
    ) {
      return {
        leagueId,
        seasonId,
        seasonKey: resolvedSeasonKey,
        target: isHistory ? 'history' : 'current',
        teamId,
        scoutProfilesSummary: normalizedSummary,
        updated: true,
        changed: false,
        writeSkipped: true,
      }
    }

    const updatedAt = new Date().toISOString()
    const nextTableRank = updateTableRankRowScoutProfilesSummary({
      tableRank,
      team,
      scoutProfilesSummary,
    })

    if (isHistory) {
      const nextHistory = history.map(row => (
        isSameSeason(row, requestedSeason)
          ? {
              ...row,
              tableRank: nextTableRank,
              updatedAt,
            }
          : row
      ))

      transaction.set(
        ref,
        {
          history: nextHistory,
          updatedAt,
        },
        { merge: true }
      )
    } else {
      transaction.set(
        ref,
        {
          current: {
            ...sourceSeason,
            tableRank: nextTableRank,
            updatedAt,
          },
          updatedAt,
        },
        { merge: true }
      )
    }

    return {
      leagueId,
      seasonId,
      seasonKey: resolvedSeasonKey,
      target: isHistory ? 'history' : 'current',
      teamId,
      scoutProfilesSummary,
      updated: true,
    }
  })

  if (result.updated && !result.writeSkipped) {
    await syncLeaguesMasterDocument({
      leagues: [league],
    })
  }

  return result
}


const applyScoutProfilesSummaries = ({ tableRank = [], summaries = [] } = {}) => (
  (Array.isArray(summaries) ? summaries : []).reduce(
    (nextTableRank, item) => updateTableRankRowScoutProfilesSummary({
      tableRank: nextTableRank,
      team: item?.team || {},
      scoutProfilesSummary: item?.scoutProfilesSummary || {},
    }),
    Array.isArray(tableRank) ? tableRank : []
  )
)

export async function updateLeagueSeasonTableRankScoutProfilesSummaries({ league = {}, season = {}, target = 'current', summaries = [] } = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonId = clean(season.seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = leagueDocRef(leagueId)

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const baseDoc = buildLeagueBaseDoc({
      ...league,
      id: leagueId,
    }, currentData)
    const { seasonKey } = normalizeSeasonIdentity({ season: {
      ...season,
      seasonId,
    } })
    const isHistory = clean(target) === 'history'
    const updatedAt = new Date().toISOString()
    let nextData = baseDoc

    if (isHistory) {
      const history = (Array.isArray(baseDoc.history) ? baseDoc.history : []).map(row => {
        if (!isSameSeason(row, {
          seasonId,
          seasonKey,
        })) return row

        return {
          ...row,
          tableRank: applyScoutProfilesSummaries({
            tableRank: row.tableRank,
            summaries,
          }),
          updatedAt,
        }
      })

      nextData = {
        ...baseDoc,
        history,
      }
    } else {
      nextData = {
        ...baseDoc,
        current: {
          ...cleanSeasonComputedFields(baseDoc.current || buildSeasonDoc({
            ...season,
            seasonId,
            seasonKey,
          })),
          tableRank: applyScoutProfilesSummaries({
            tableRank: baseDoc.current?.tableRank || [],
            summaries,
          }),
          updatedAt,
        },
      }
    }

    transaction.set(ref, nextData, { merge: true })

    return {
      leagueId,
      seasonId,
      seasonKey,
      target: isHistory ? 'history' : 'current',
      rowsCount: Array.isArray(summaries) ? summaries.length : 0,
    }
  })
}
