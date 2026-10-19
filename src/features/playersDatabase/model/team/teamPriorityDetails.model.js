// src/features/playersDatabase/model/team/teamPriorityDetails.model.js

import { formatPerGameRate } from '../shared/rate.model.js'
import { buildTeamScoutPriorityBreakdown } from '../../../../shared/scouting/teams/teamScout.performance.js'

const formatNumber = value => String(Number(value.toFixed(2)))

const buildContribution = component => ({
  formula: `${formatNumber(component.normalized)} × ${component.weight * 100}% = ${formatNumber(component.points)}`,
})

const formatNormalization = (rate, component) => (
  `ציון הרכיב ${component.normalized}/100: יחס ${rate}% מתוך סף מלא של ${component.fullScoreRate}%.`
)

const resolveImpact = (value, quality = false) => {
  if (value === null) return null
  if (quality ? value >= 65 : value > 100) return { level: 'positive', label: 'מקדם' }
  if (quality ? value < 33.33 : value < 100) return { level: 'negative', label: 'לא מקדם' }
  return { level: 'neutral', label: 'לא מקדם' }
}

const toNumber = value => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const firstNumber = (...values) => {
  for (const value of values) {
    const number = toNumber(value)
    if (number !== null) return number
  }
  return null
}

const summaryByLevel = {
  elite: 'כמה מדדים תומכים בבדיקה מקצועית בעדיפות מרבית.',
  high: 'שילוב המדדים מצדיק בדיקה מקצועית מוקדמת.',
  positive: 'יש בסיס לבדיקה מקצועית, אך התמונה אינה חזקה בכל המדדים.',
  neutral: 'שילוב המדדים אינו מצביע כרגע על יתרון ברור לבדיקה.',
  low: 'אין כרגע תמיכה מספקת במדדים לתעדוף בדיקה.',
}

export const buildTeamPriorityDetails = ({
  side = 'offense',
  view = {},
  teamName = '',
  team = {},
} = {}) => {
  const defense = side === 'defense'
  const subject = defense ? 'ההגנה' : 'ההתקפה'
  const quality = toNumber(view.quality?.rate)
  const target = toNumber(view.target?.rate)
  const ranking = toNumber(view.ranking?.rate)
  const complete = quality !== null && target !== null && ranking !== null
  const score = toNumber(view.priority?.score)
  const breakdown = buildTeamScoutPriorityBreakdown({ qualityRate: quality, targetRate: target, rankingRate: ranking })
  const matchingScore = breakdown && breakdown.score === score && Math.round(breakdown.total) === breakdown.roundedScore
  const contributions = matchingScore
    ? Object.fromEntries(breakdown.components.map(component => [component.id, buildContribution(component)]))
    : {}
  const context = team.priorityContext || {}
  const calculatedSide = context[side] || {}
  const matchingTarget = target !== null && calculatedSide.targetRate === target
  const matchingQuality = quality !== null && calculatedSide.qualityRate === quality
  const benchmark = matchingTarget ? context.benchmark : null
  const action = defense ? 'סופגת' : 'כובשת'
  const better = defense ? 'פחות' : 'יותר'
  const worse = defense ? 'יותר' : 'פחות'
  const games = firstNumber(team.games, team.teamGamePlayed, team.appearances)
  const goals = toNumber(defense ? team.goalsAgainst : team.goalsFor)
  const tableRank = toNumber(team.tableRank)
  const sideRank = firstNumber(
    matchingQuality ? (defense ? context.goalsAgainstRank : context.goalsForRank) : null,
    view.rank,
    defense ? team.tableDefenseRank : team.tableAttackRank,
  )
  const teamsCount = firstNumber(context.teamsCount, team.teamsCount)
  const pace = games > 0 && goals !== null
    ? goals / games
    : games === 0 ? null : toNumber(defense ? team.goalsAgainstPerGame : team.goalsForPerGame)
  const rankLabel = defense ? 'דירוג הגנה' : 'דירוג התקפה'
  const rankEvidence = sideRank > 0
    ? `${rankLabel}: ${sideRank}${teamsCount > 0 ? ` מתוך ${teamsCount}` : ''}`
    : ''
  const totalsEvidence = goals !== null && games > 0
    ? `${goals} ${defense ? 'ספיגות' : 'שערים'} ב־${games} משחקים`
    : ''
  const rankingEvidence = [
    sideRank > 0 ? `${rankLabel}: ${sideRank}` : '',
    tableRank > 0 ? `מקום ${tableRank} בטבלה` : '',
  ].filter(Boolean).join(' · ')
  const expectedPace = toNumber(defense ? benchmark?.goalsAgainstPerGame : benchmark?.goalsForPerGame)
  const expectedSeason = toNumber(defense ? benchmark?.goalsAgainst : benchmark?.goalsFor)
  const projectedSeason = toNumber(defense ? context.projectedGoalsAgainst : context.projectedGoalsFor)
  const goalLabel = defense ? 'ספיגות' : 'שערים'
  const targetEvidence = expectedPace !== null && pace !== null
    ? `בפועל ${formatPerGameRate(pace)} · יעד מותאם ${formatNumber(expectedPace)} ${goalLabel} למשחק`
    : pace !== null ? `${formatPerGameRate(pace)} ${goalLabel} למשחק` : ''
  const targetFacts = expectedPace !== null && games > 0 && goals !== null
    ? `${goals} ${goalLabel} ב־${games} משחקים, לעומת יעד של כ־${formatPerGameRate(expectedPace * games)}.`
    : ''
  const calculation = matchingScore ? {
    formula: `${breakdown.components.map(component => formatNumber(component.points)).join(' + ')} = ${formatNumber(breakdown.total)}`,
    result: breakdown.capped
      ? `לאחר עיגול והגבלת הציון בשל איכות נמוכה: ${breakdown.score}`
      : `לאחר עיגול: ${breakdown.score} מתוך 100`,
  } : null

  let summary = 'המידע חלקי, ולכן אין בסיס למסקנה מלאה על הביצוע.'
  if (complete) {
    const strong = ['high', 'elite'].includes(view.priority?.level)
    summary = strong && quality >= 65 && target > 100 && ranking < 100
      ? 'האיכות והביצוע מול הצפי מעלים את העדיפות, למרות הפער מול המיקום.'
      : summaryByLevel[view.priority?.level] || summary
  }

  return {
    title: defense ? 'עדיפות הגנתית' : 'עדיפות התקפית',
    context: String(teamName || '').trim(),
    sourceColumn: defense ? 'goalsAgainst' : 'goalsFor',
    score,
    summary,
    calculation,
    calculationUnavailable: score !== null && !matchingScore
      ? 'פירוק הציון לא זמין: הנתונים אינם תואמים לציון השמור.'
      : '',
    items: [
      {
        id: 'quality',
        title: 'ביחס לליגה',
        impact: resolveImpact(quality, true),
        contribution: contributions.quality,
        text: quality === null
          ? 'אין נתונים להשוואה לקבוצות הליגה.'
          : `${subject} נמצאת בחלק ${quality >= 65 ? 'העליון' : quality < 33.33 ? 'התחתון' : 'האמצעי'} של הליגה ${defense ? 'במיעוט ספיגות' : 'בכיבוש שערים'}.`,
        evidence: quality === null ? 'לא זמין' : rankEvidence || totalsEvidence,
      },
      {
        id: 'target',
        title: 'מול הצפי',
        impact: resolveImpact(target),
        contribution: contributions.target,
        text: target === null
          ? 'אין נתונים להשוואה לצפי עבור המיקום ורמת הליגה.'
          : target === 100
            ? `קצב ${defense ? 'הספיגה' : 'הכיבוש'} תואם את הצפי למיקום ולרמת הליגה.`
            : `הקבוצה ${action} ${target > 100 ? better : worse} מהצפוי למיקום ולרמת הליגה שלה.`,
        evidence: target === null
          ? 'לא זמין'
          : targetEvidence,
        calculationNote: contributions.target ? formatNormalization(target, breakdown.components[1]) : '',
        periodEvidence: targetFacts,
        seasonEvidence: expectedSeason !== null && projectedSeason !== null
          ? `לעונה של ${benchmark.leagueNumGames} משחקים: תחזית ${projectedSeason} מול יעד ${expectedSeason} ${goalLabel}.`
          : '',
        benchmarkUnavailable: target !== null && expectedPace === null ? 'יעד מותאם: לא זמין' : '',
      },
      {
        id: 'ranking',
        title: 'ביחס למיקום בטבלה',
        impact: resolveImpact(ranking),
        contribution: contributions.ranking,
        text: ranking === null
          ? 'אין נתונים להשוואה בין הדירוג המקצועי למיקום בטבלה.'
          : ranking === 100
            ? `דירוג ${subject} תואם את מיקום הקבוצה בטבלה.`
            : `דירוג ${subject} ${ranking > 100 ? 'טוב יותר' : 'פחות טוב'} ממיקום הקבוצה בטבלה.`,
        evidence: ranking === null
          ? 'לא זמין'
          : rankingEvidence,
        calculationNote: contributions.ranking ? formatNormalization(ranking, breakdown.components[2]) : '',
      },
    ],
  }
}
