// src/features/playersDatabase/services/read/workTasks.read.js

import { getLeagueById } from './league.js'

function clean(value) {
  return String(value === undefined || value === null ? '' : value).trim()
}

function getLeagueSeasons(leagueDoc = {}) {
  return [
    leagueDoc.current,
    ...(Array.isArray(leagueDoc.history) ? leagueDoc.history : []),
  ].filter(Boolean)
}

function buildTeamKey(row = {}) {
  const birthTeamId = clean(row.birthTeamId || row.teamId)
  if (birthTeamId) return birthTeamId

  const clubId = clean(row.clubId)
  const birthTeamSlot = Number(row.birthTeamSlot || 1)
  if (!clubId) return ''

  return `${clubId}:${birthTeamSlot}`
}

function buildLeagueIds({ birthYear, leagueRows = [] }) {
  return [...new Set(
    (Array.isArray(leagueRows) ? leagueRows : [])
      .filter(row => String(row.birthYear) === String(birthYear))
      .filter(row => row.tableStatus !== 'missing')
      .map(row => clean(row.leagueId || row.id))
      .filter(Boolean)
  )]
}

export function buildLeagueTeamsForBirthYear({
  birthYear,
  leagueRows = [],
  leagueDocuments = [],
} = {}) {
  const safeBirthYear = clean(birthYear)
  if (!safeBirthYear) return []

  const leagueIds = new Set(buildLeagueIds({
    birthYear: safeBirthYear,
    leagueRows,
  }))
  const teamMap = new Map()

  ;(Array.isArray(leagueDocuments) ? leagueDocuments : [])
    .filter(Boolean)
    .filter(leagueDoc => {
      const leagueId = clean(leagueDoc.leagueId || leagueDoc.id)
      return !leagueIds.size || leagueIds.has(leagueId)
    })
    .forEach(leagueDoc => {
      const leagueId = clean(leagueDoc.leagueId || leagueDoc.id)

      getLeagueSeasons(leagueDoc)
        .filter(season => String(season.birthYear) === String(safeBirthYear))
        .forEach(season => {
          const tableRank = Array.isArray(season.tableRank)
            ? season.tableRank
            : []

          tableRank.forEach(row => {
            const key = buildTeamKey(row)
            if (!key) return

            const current = teamMap.get(key) || {
              key,
              clubId: clean(row.clubId),
              birthTeamId: clean(row.birthTeamId || row.teamId),
              birthTeamSlot: Number(row.birthTeamSlot || 1),
              teamId: clean(row.teamId || row.birthTeamId),
              teamName: clean(row.teamName || row.name || row.displayName),
              appearances: [],
            }

            if (!current.teamName) {
              current.teamName = clean(row.teamName || row.name || row.displayName)
            }

            current.appearances.push({
              leagueId,
              seasonId: clean(season.seasonId),
              seasonKey: clean(season.seasonKey),
              playersCount: Number(row.playersCount || 0),
              hasPlayers: Boolean(row.hasPlayers),
              hasStats: Boolean(row.hasStats),
              statsComplete: Boolean(row.statsComplete),
            })

            teamMap.set(key, current)
          })
        })
    })

  return [...teamMap.values()]
}

export async function readLeagueTeamsForBirthYear({
  birthYear,
  leagueRows = [],
} = {}) {
  const safeBirthYear = clean(birthYear)
  if (!safeBirthYear) return []

  const leagueIds = buildLeagueIds({
    birthYear: safeBirthYear,
    leagueRows,
  })
  const leagueDocuments = await Promise.all(
    leagueIds.map(leagueId => getLeagueById(leagueId))
  )

  return buildLeagueTeamsForBirthYear({
    birthYear: safeBirthYear,
    leagueRows,
    leagueDocuments,
  })
}
