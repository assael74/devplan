// preview/previewDomainCard/domains/team/games/logic/teamGames.readiness.logic.js

const safeArray = (v) => (Array.isArray(v) ? v : [])

const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export const TEAM_LEAGUE_FIELD_LABELS = {
  league: 'ליגה',
  leagueLevel: 'רמת ליגה',
  leaguePosition: 'מיקום בליגה',
  points: 'נקודות',
  leagueGoalsFor: 'שערי זכות',
  leagueRound: 'מחזור נוכחי',
  leagueNumGames: 'כמות משחקים בליגה',
  leagueGoalsAgainst: 'שערי חובה',
}

export const TEAM_GAMES_SYNC_LABELS = {
  playedGames: 'משחקים ששוחקו',
  points: 'נקודות',
  goalsFor: 'שערי זכות',
  goalsAgainst: 'שערי חובה',
}

export const formatTeamLeagueMissingFields = (fields = []) => {
  return safeArray(fields)
    .map((field) => ({
      id: field,
      label: TEAM_LEAGUE_FIELD_LABELS[field] || field,
    }))
    .filter((item) => item.label)
}

const buildGap = (teamValue, gamesValue) => {
  return toNum(gamesValue) - toNum(teamValue)
}

export const buildTeamGamesSyncStatus = ({ leagueStats, gameStats }) => {
  const leaguePoints = gameStats?.leaguePoints || {}

  const team = {
    playedGames: toNum(leagueStats?.playedGames),
    points: toNum(leagueStats?.points),
    goalsFor: toNum(leagueStats?.goalsFor),
    goalsAgainst: toNum(leagueStats?.goalsAgainst),
  }

  const games = {
    playedGames: toNum(leaguePoints?.playedGames),
    points: toNum(leaguePoints?.achieved),
    goalsFor: toNum(gameStats?.goalsFor),
    goalsAgainst: toNum(gameStats?.goalsAgainst),
  }

  const gaps = {
    playedGames: buildGap(team.playedGames, games.playedGames),
    points: buildGap(team.points, games.points),
    goalsFor: buildGap(team.goalsFor, games.goalsFor),
    goalsAgainst: buildGap(team.goalsAgainst, games.goalsAgainst),
  }

  const mismatchFields = Object.entries(gaps)
    .filter(([, gap]) => gap !== 0)
    .map(([field, gap]) => ({
      id: field,
      label: TEAM_GAMES_SYNC_LABELS[field] || field,
      gap,
      teamValue: team[field],
      gamesValue: games[field],
    }))

  return {
    isSynced: mismatchFields.length === 0,
    team,
    games,
    gaps,
    mismatchFields,
  }
}

export const buildTeamGamesReadiness = ({ leagueStats, gameStats }) => {
  const missingFields = formatTeamLeagueMissingFields(leagueStats?.missingFields)
  const sync = buildTeamGamesSyncStatus({ leagueStats, gameStats })

  const lightReady = leagueStats?.isReady === true
  const mediumReady = lightReady && sync.isSynced

  return {
    lightReady,
    mediumReady,
    heavyReady: false,

    missingFields,
    sync,

    status: lightReady
      ? mediumReady
        ? 'ready'
        : 'leagueReadyGamesMismatch'
      : 'missingLeagueData',

    chips: [
      {
        id: 'league-ready',
        label: lightReady ? 'נתוני ליגה מלאים' : 'חסרים נתוני ליגה',
        color: lightReady ? 'success' : 'warning',
        icon: lightReady ? 'success' : 'warning',
      },
      {
        id: 'games-sync',
        label: sync.isSynced ? 'המשחקים תואמים לקבוצה' : 'אין התאמה בין המשחקים לקבוצה',
        color: sync.isSynced ? 'success' : 'danger',
        icon: sync.isSynced ? 'sync' : 'warning',
      },
    ],
  }
}
