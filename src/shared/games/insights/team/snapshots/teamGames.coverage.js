// shared/games/insights/team/snapshots/teamGames.coverage.js

const toNumber = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const calcPct = (value, total) => {
  const v = toNumber(value)
  const t = toNumber(total)

  if (!t) return 0
  return Math.round((v / t) * 100)
}

const buildCoverageLevel = (pct) => {
  if (pct >= 100) {
    return {
      id: 'full',
      label: 'כיסוי מלא',
      color: 'success',
    }
  }

  if (pct >= 80) {
    return {
      id: 'high',
      label: 'כיסוי גבוה',
      color: 'primary',
    }
  }

  if (pct >= 50) {
    return {
      id: 'partial',
      label: 'כיסוי חלקי',
      color: 'warning',
    }
  }

  if (pct > 0) {
    return {
      id: 'low',
      label: 'כיסוי נמוך',
      color: 'danger',
    }
  }

  return {
    id: 'none',
    label: 'אין כיסוי',
    color: 'neutral',
  }
}

export const buildTeamGamesCoverageStatus = ({
  teamSnapshot,
  gamesSnapshot,
} = {}) => {
  const teamPlayedGames = toNumber(teamSnapshot?.playedGames)
  const teamTotalGames = toNumber(teamSnapshot?.totalGames)

  const gamesPlayedGames = toNumber(gamesSnapshot?.playedGames)
  const gamesTotalGames = toNumber(gamesSnapshot?.totalGames)
  const gamesUpcomingGames = toNumber(gamesSnapshot?.remainingGames)

  const playedCoveragePct = calcPct(gamesPlayedGames, teamPlayedGames)
  const seasonCoveragePct = calcPct(gamesTotalGames, teamTotalGames)

  const playedLevel = buildCoverageLevel(playedCoveragePct)
  const seasonLevel = buildCoverageLevel(seasonCoveragePct)

  const isFullPlayedCoverage =
    teamPlayedGames > 0 && gamesPlayedGames === teamPlayedGames

  const isFullSeasonCoverage =
    teamTotalGames > 0 && gamesTotalGames === teamTotalGames

  return {
    played: {
      expected: teamPlayedGames,
      actual: gamesPlayedGames,
      pct: playedCoveragePct,
      isFull: isFullPlayedCoverage,
      ...playedLevel,
    },

    season: {
      expected: teamTotalGames,
      actual: gamesTotalGames,
      pct: seasonCoveragePct,
      isFull: isFullSeasonCoverage,
      ...seasonLevel,
    },

    counts: {
      teamPlayedGames,
      teamTotalGames,
      gamesPlayedGames,
      gamesTotalGames,
      gamesUpcomingGames,
    },

    isFullPlayedCoverage,
    isFullSeasonCoverage,

    text:
      teamPlayedGames > 0
        ? `${gamesPlayedGames}/${teamPlayedGames} משחקים ששוחקו קיימים בדאטה`
        : `${gamesPlayedGames} משחקים ששוחקו קיימים בדאטה`,

    seasonText:
      teamTotalGames > 0
        ? `${gamesTotalGames}/${teamTotalGames} משחקי ליגה קיימים בדאטה`
        : `${gamesTotalGames} משחקי ליגה קיימים בדאטה`,
  }
}
