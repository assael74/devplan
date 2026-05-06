// shared/games/insights/team/sections/squad/squad.texts.js

import {
  formatNumber,
  formatPercent,
  formatTargetGoals,
  formatTargetRange,
} from '../../common/index.js'

import {
  getAttackStatus,
  getIntegrationStatus,
  getLineupStatus,
  getUsageRowsByGroup,
} from './squad.rules.js'

export function buildUsageGapText(row) {
  const countText =
    row.count !== null && row.count !== undefined ? `${row.count} שחקנים · ` : ''

  return `${row.label}: בפועל ${countText}${formatPercent(
    row.value
  )}, יעד ${formatTargetRange(row.target)}`
}

export function buildEvaluationGapText(row) {
  const suffix = row.suffix || ''
  const value = `${formatNumber(row.value)}${suffix}`

  if (row.target?.greenMin !== undefined && row.target?.greenMin !== null) {
    return `${row.label}: בפועל ${value}, יעד לפחות ${row.target.greenMin}${suffix}`
  }

  if (row.target?.greenMax !== undefined && row.target?.greenMax !== null) {
    return `${row.label}: בפועל ${value}, יעד עד ${row.target.greenMax}${suffix}`
  }

  return `${row.label}: בפועל ${value}`
}

export function buildScorersBenchmarkText(metrics, performance) {
  const scorers = metrics.scorersProfile
  const targets = metrics.scorersEvaluation?.targets

  if (!scorers?.hasScorersData || !targets) return ''

  return `יעד ${performance.targetLabel || 'שהוגדר'}: ${formatTargetGoals(
    performance.targetGoalsFor
  )}. בפועל: ${scorers.uniqueScorers} כובשים, ${
    scorers.scorers5Plus
  } עם 5+ שערים, ${scorers.scorers10Plus} עם 10+ שערים.`
}

export function buildAttackText(metrics, performance) {
  const status = getAttackStatus(metrics)
  const scorers = metrics.scorersProfile
  const evaluation = metrics.scorersEvaluation

  if (status === 'empty') {
    return 'אין מספיק נתונים להערכת התרומה ההתקפית.'
  }

  if (scorers?.hasScorersData && evaluation?.summary?.isStrong) {
    return 'יש מספיק פתרונות התקפיים מכמה שחקנים.'
  }

  if (scorers?.hasScorersData && evaluation?.summary?.isRisk) {
    return 'הקבוצה תלויה מדי במספר מצומצם של כובשים.'
  }

  if (scorers?.hasScorersData) {
    return 'פיזור התרומה ההתקפית דורש המשך בדיקה.'
  }

  return 'פיזור התרומה ההתקפית עדיין לא ברור.'
}

export function buildLineupText(metrics, performance) {
  const status = getLineupStatus(metrics)
  const rows = getUsageRowsByGroup(metrics, 'lineup')
  const redRows = rows.filter((row) => row.evaluation.isRed)
  const greenRows = rows.filter((row) => row.evaluation.isGreen)

  if (status === 'empty') {
    return 'אין מספיק נתונים להערכת יציבות ההרכב.'
  }

  if (redRows.length) {
    return 'חסרה יציבות בהרכב וצריך לזהות גרעין מוביל.'
  }

  if (greenRows.length >= 2) {
    return 'יש בסיס הרכב יציב שתומך בקצב הביצוע.'
  }

  return 'יציבות ההרכב עדיין באזור ביניים.'
}

export function buildIntegrationText(metrics, performance) {
  const status = getIntegrationStatus(metrics)
  const rows = getUsageRowsByGroup(metrics, 'integration')
  const redRows = rows.filter((row) => row.evaluation.isRed)
  const greenRows = rows.filter((row) => row.evaluation.isGreen)

  if (status === 'empty') {
    return 'אין מספיק נתונים להערכת חלוקת הדקות.'
  }

  if (redRows.length) {
    return 'חלוקת הדקות צרה מדי ביחס ליעד הקבוצה.'
  }

  if (greenRows.length >= 2) {
    return 'חלוקת הדקות מצביעה על שימוש רחב ובריא בסגל.'
  }

  return 'חלוקת הדקות עדיין באזור ביניים.'
}

export function buildAttackDetails(metrics, performance) {
  const scorers = metrics.scorersProfile
  const targets = metrics.scorersEvaluation?.targets

  const details = [
    {
      id: 'attack_state',
      label: 'תמונת מצב',
      text: scorers?.hasScorersData
        ? `${scorers.uniqueScorers} כובשים שונים, ${scorers.scorers5Plus} עם 5+ שערים, תלות טופ 3: ${formatPercent(scorers.top3DependencyPct)}.`
        : `${metrics.goalContributors} שחקנים מעורבים ישירות בשערים.`,
    },
  ]

  if (targets) {
    details.push({
      id: 'attack_reference',
      label: 'נקודת ייחוס',
      text: `ליעד ${performance.targetLabel || 'שהוגדר'} נדרש פיזור רחב של כובשים משמעותיים.`,
    })
  }

  details.push({
    id: 'attack_check',
    label: 'מה לבדוק',
    text: 'האם מספיק שחקנים מגיעים למצבי הבקעה קבועים ולא רק משלימים שערים נקודתיים.',
  })

  return details
}

export function buildLineupDetails(metrics, performance) {
  return [
    {
      id: 'lineup_state',
      label: 'תמונת מצב',
      text: `${metrics.starters} שחקנים פתחו בהרכב מתוך ${metrics.usedPlayers} שחקנים ששולבו.`,
    },
    {
      id: 'lineup_reference',
      label: 'נקודת ייחוס',
      text: `היעד נבחן לפי גרעין פותח ברור לצד ריכוז דקות סביר.`,
    },
    {
      id: 'lineup_check',
      label: 'מה לבדוק',
      text: 'האם יציבות ההרכב מייצרת המשכיות מקצועית או נובעת ממחסור בעומק.',
    },
  ]
}

export function buildIntegrationDetails(metrics, performance) {
  return [
    {
      id: 'integration_state',
      label: 'תמונת מצב',
      text: `${metrics.usedPlayers} שחקנים שולבו מתוך ${metrics.squadSize} שחקני סגל פעילים.`,
    },
    {
      id: 'integration_reference',
      label: 'נקודת ייחוס',
      text: `היעד נבחן לפי כמות שחקנים שמקבלים דקות משמעותיות ולא רק הופעות קצרות.`,
    },
    {
      id: 'integration_check',
      label: 'מה לבדוק',
      text: 'האם הרוטציה תורמת לעומק הקבוצה או פוגעת ביציבות הביצוע.',
    },
  ]
}
