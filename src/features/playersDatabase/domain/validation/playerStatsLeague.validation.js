import { resolvePlayersDatabaseLeagueGameTime } from '../../catalog/leagues.catalog.js'

// This is a validation allowance for observed stoppage time only. It does not
// alter the canonical age-group game duration or persisted teamMinutes.
const STATS_LOAD_ADDED_TIME_ALLOWANCE_PER_GAME = 6

const toNonNegativeNumber = value => {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : 0
}

const addIssue = (issues, issue) => issues.push({
  blocking: true,
  ...issue,
})

const rowValue = (row, key) => {
  const source = row && typeof row === 'object' ? row : {}
  const playerStats = source.playerStats && typeof source.playerStats === 'object'
    ? source.playerStats
    : {}
  const value = playerStats[key] !== undefined && playerStats[key] !== null
    ? playerStats[key]
    : source[key]

  return toNonNegativeNumber(value)
}

// Player statistics are observed input. This validator deliberately never
// normalizes, clamps, or reconciles the input: it only reports contradictions
// against the official League performance context before persistence.
export const validatePlayerStatsAgainstLeague = ({
  players = [],
  teamPerformance = null,
  ageGroupId = '',
} = {}) => {
  const rows = Array.isArray(players) ? players : []
  const issues = []
  const teamGamePlayed = Number(teamPerformance?.teamGamePlayed)
  const goalsFor = Number(teamPerformance?.goalsFor)
  const hasLeagueContext = Number.isFinite(teamGamePlayed) && teamGamePlayed >= 0 &&
    Number.isFinite(goalsFor) && goalsFor >= 0

  if (!hasLeagueContext) {
    const checks = [{
      code: 'missing_league_performance',
      label: 'נתוני ליגה',
      valid: false,
      actual: null,
      limit: null,
      difference: null,
      message: 'לא נמצאו נתוני ליגה רשמיים לקבוצה ולעונה; אי אפשר לאמת או לטעון סטטיסטיקות.',
    }]

    addIssue(issues, {
      code: 'missing_league_performance',
      message: checks[0].message,
    })

    return {
      valid: false,
      issues,
      rowIssues: {},
      groupIssues: issues,
      checks,
      context: null,
    }
  }

  const gameMinutes = resolvePlayersDatabaseLeagueGameTime(ageGroupId)
  const effectiveGameMinutes = gameMinutes + STATS_LOAD_ADDED_TIME_ALLOWANCE_PER_GAME
  const canonicalPlayerMinutesLimit = teamGamePlayed * gameMinutes
  const playerMinutesLimit = teamGamePlayed * effectiveGameMinutes
  const rowIssues = {}
  const addRowIssue = ({ rowIndex, field, code, message }) => {
    const issue = { blocking: true, rowIndex, field, code, message }
    issues.push(issue)
    if (!rowIssues[rowIndex]) rowIssues[rowIndex] = []
    rowIssues[rowIndex].push(issue)
  }

  let startsTotal = 0
  let goalsTotal = 0
  let minutesTotal = 0

  rows.forEach((row, rowIndex) => {
    const games = rowValue(row, 'games')
    const starts = rowValue(row, 'starts')
    const substituteIn = rowValue(row, 'substituteIn')
    const substitutedOut = rowValue(row, 'substitutedOut')
    const minutes = rowValue(row, 'minutes')
    const goals = rowValue(row, 'goals')

    startsTotal += starts
    goalsTotal += goals
    minutesTotal += minutes

    if (games > teamGamePlayed) addRowIssue({ rowIndex, field: 'games', code: 'games_exceed_league_games', message: `משחקי השחקן (${games}) עולים על משחקי הליגה (${teamGamePlayed}).` })
    if (starts > games) addRowIssue({ rowIndex, field: 'starts', code: 'starts_exceed_games', message: `פתיחות בהרכב (${starts}) עולות על משחקי השחקן (${games}).` })
    if (substituteIn > games) addRowIssue({ rowIndex, field: 'substituteIn', code: 'sub_in_exceed_games', message: `כניסות כמחליף (${substituteIn}) עולות על משחקי השחקן (${games}).` })
    if (substitutedOut > starts) addRowIssue({ rowIndex, field: 'substitutedOut', code: 'sub_out_exceed_starts', message: `החלפות החוצה (${substitutedOut}) עולות על הפתיחות (${starts}).` })
    if (games > 0 && minutes > canonicalPlayerMinutesLimit) addRowIssue({ rowIndex, field: 'minutes', code: 'minutes_exceed_100_pct', message: `דקות השחקן (${minutes}) עולות על 100% מדקות הליגה הקנוניות (${canonicalPlayerMinutesLimit}).` })
    if (minutes > playerMinutesLimit) addRowIssue({ rowIndex, field: 'minutes', code: 'minutes_exceed_league_capacity', message: `דקות השחקן (${minutes}) עולות על מסגרת הליגה האפשרית (${playerMinutesLimit}).` })
    if (minutes > 0 && games === 0) addRowIssue({ rowIndex, field: 'minutes', code: 'minutes_without_games', message: 'דקות משחק אינן אפשריות כאשר מספר המשחקים הוא 0.' })
    if (goals > goalsFor) addRowIssue({ rowIndex, field: 'goals', code: 'player_goals_exceed_team_goals', message: `שערי השחקן (${goals}) עולים על שערי הקבוצה בליגה (${goalsFor}).` })
  })

  const checks = [
    {
      code: 'starts_total_exceed_league_capacity',
      label: 'פתח בהרכב',
      actual: startsTotal,
      limit: teamGamePlayed * 11,
      message: 'סך הפתיחות מול 11 שחקנים בכל משחק ליגה.',
    },
    {
      code: 'goals_total_exceed_league_goals',
      label: 'שערים',
      actual: goalsTotal,
      limit: goalsFor,
      message: 'סך שערי השחקנים מול שערי הקבוצה הרשמיים בליגה.',
    },
    {
      code: 'minutes_total_exceed_league_capacity',
      label: 'דקות',
      actual: minutesTotal,
      limit: playerMinutesLimit * 11,
      message: 'סך דקות השחקנים מול 11 שחקנים בכל דקת משחק ליגה.',
    },
  ].map(check => ({
    ...check,
    difference: check.actual - check.limit,
    valid: check.actual <= check.limit,
  }))

  const minutesCheck = checks.find(check => (
    check.code === 'minutes_total_exceed_league_capacity'
  ))

  if (minutesCheck) {
    const canApplyEqualReduction = minutesCheck.difference > 0 &&
      rows.length > 0 &&
      rows.every(row => rowValue(row, 'minutes') >= 1)

    minutesCheck.adjustment = canApplyEqualReduction
      ? {
        type: 'equal_minutes_reduction',
        amountPerPlayer: 1,
        playersCount: rows.length,
      }
      : null
  }

  checks.filter(check => !check.valid).forEach(check => {
    addIssue(issues, {
      code: check.code,
      message: `${check.label}: הערך המצטבר (${check.actual}) עולה על הגבול (${check.limit}) בפער של ${check.difference}.`,
    })
  })

  return {
    valid: issues.length === 0,
    issues,
    rowIssues,
    groupIssues: issues.filter(issue => !Number.isInteger(issue.rowIndex)),
    checks,
    context: {
      teamGamePlayed,
      goalsFor,
      goalsAgainst: toNonNegativeNumber(teamPerformance?.goalsAgainst),
      gameMinutes,
      addedTimeAllowancePerGame: STATS_LOAD_ADDED_TIME_ALLOWANCE_PER_GAME,
      effectiveGameMinutes,
      canonicalPlayerMinutesLimit,
      playerMinutesLimit,
    },
  }
}
