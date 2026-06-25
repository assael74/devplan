// src/features/playersDatabase/services/playersDatabasePlayers.service.js

import { listLeagues } from './pdbLeague.firestore.js'

const toNumber = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const fmt = value =>
  toNumber(value).toLocaleString('he-IL')

const getTeamSummaries = leagues =>
  leagues.flatMap(league =>
    Object.values(league?.teamsIndex || {})
  )

const sum = (rows, field) =>
  rows.reduce((acc, row) => acc + toNumber(row?.[field]), 0)

export async function getPlayersDatabaseKpis() {
  const leagues = await listLeagues()
  const teams = getTeamSummaries(leagues)
  const loadedTeams = teams.filter(team => toNumber(team.playersCount) > 0)

  return [
    {
      id: 'players',
      label: 'שחקנים במאגר',
      value: fmt(sum(teams, 'playersCount')),
      note: 'מתוך אינדקס הליגות',
    },
    {
      id: 'stats',
      label: 'שחקנים עם סטטס',
      value: fmt(sum(teams, 'statsCount')),
      note: 'מסמכי סטטיסטיקה',
    },
    {
      id: 'profiles',
      label: 'התאמות סקאוט',
      value: fmt(sum(teams, 'scoutProfilesCount')),
      note: 'אחרי הקשר קבוצתי',
    },
    {
      id: 'loadedTeams',
      label: 'קבוצות טעונות',
      value: fmt(loadedTeams.length),
      note: `${fmt(teams.length)} קבוצות באינדקס`,
    },
  ]
}

export async function getPlayersDatabaseFilterOptions() {
  const leagues = await listLeagues()
  const teams = getTeamSummaries(leagues)
  const unique = (field, labelField = field) => {
    const seen = new Set()

    return teams.reduce((acc, row) => {
      const value = String(row?.[field] ?? '').trim()
      if (!value || seen.has(value)) return acc

      seen.add(value)
      acc.push({
        value,
        label: String(row?.[labelField] ?? value).trim() || value,
      })
      return acc
    }, [])
  }

  return {
    clubId: unique('clubId', 'clubName'),
    leagueId: unique('leagueId'),
    ageGroupId: unique('ageGroupId'),
  }
}

export async function listPlayersDatabasePlayers() {
  return {
    rows: [],
    nextCursor: null,
    hasMore: false,
    totalApprox: 0,
  }
}

export async function getPlayersDatabasePlayerDetails() {
  return null
}
