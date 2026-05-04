// preview/previewDomainCard/domains/team/games/logic/teamGames.kpi.logic.js

const formatMissingTooltip = (missingFields) => {
  if (!Array.isArray(missingFields) || !missingFields.length) return ''

  return `חסרים נתוני ליגה:\n${missingFields
    .map((field) => `• ${field.label}`)
    .join('\n')}`
}

const formatMismatchTooltip = (mismatchFields) => {
  if (!Array.isArray(mismatchFields) || !mismatchFields.length) return ''

  return `אין התאמה בין נתוני הקבוצה לנתוני המשחקים:\n${mismatchFields
    .map(
      (field) =>
        `• ${field.label}: נתוני הקבוצה ${field.teamValue} / נתוני המשחקים ${field.gamesValue}`
    )
    .join('\n')}`
}

export const buildTeamGamesStatusTooltip = (readiness) => {
  const missingFields = Array.isArray(readiness?.missingFields)
    ? readiness.missingFields
    : []

  const mismatchFields = Array.isArray(readiness?.sync?.mismatchFields)
    ? readiness.sync.mismatchFields
    : []

  const parts = [
    formatMissingTooltip(missingFields),
    formatMismatchTooltip(mismatchFields),
  ].filter(Boolean)

  if (!parts.length) {
    return 'נתוני הליגה ונתוני המשחקים תקינים ומסונכרנים.'
  }

  return parts.join('\n\n')
}

export const resolveTeamGamesStatusChip = (summary) => {
  const readiness = summary?.readiness || {}
  const lightReady = readiness?.lightReady === true
  const isSynced = readiness?.sync?.isSynced === true

  if (!lightReady) {
    return {
      label: 'חסרים נתוני ליגה',
      color: 'danger',
      icon: 'warning',
    }
  }

  if (!isSynced) {
    return {
      label: 'אין התאמה בין המשחקים לקבוצה',
      color: 'danger',
      icon: 'warning',
    }
  }

  return {
    label: 'המשחקים תואמים לקבוצה',
    color: 'success',
    icon: 'success',
  }
}

export const resolveTeamGamesKpiValues = (summary) => {
  const leagueStats = summary?.leagueStats || {}
  const gameStats = summary?.gameStats || {}

  return {
    leagueStats,
    gameStats,

    playedGames: leagueStats?.playedGames ?? 0,
    totalGames: leagueStats?.totalGames ?? 0,
    remainingGames: leagueStats?.remainingGames ?? 0,

    goalsFor: leagueStats?.goalsFor ?? 0,
    goalsAgainst: leagueStats?.goalsAgainst ?? 0,
    goalDifference: leagueStats?.goalDifference ?? 0,

    nextLabel: summary?.nextGame
      ? `${summary.nextGame.dateLabel}${summary.nextGame.hourRaw ? ` | ${summary.nextGame.hourRaw}` : ''}`
      : '—',

    nextSub: summary?.nextGame
      ? `${summary.nextGame.rival} | ${summary.nextGame.homeLabel}`
      : 'אין משחק עתידי',
  }
}
