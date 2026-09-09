// Supporting player scout presentation helpers.

import { clean } from './playerScoutView.utils.js'

export const buildBadges = ({ primaryProfile, context, opportunity }) => {
  const badges = []
  const competitionItems = Array.isArray(context.items) ? context.items : []
  const league = competitionItems.find(item => item.label === 'רמת ליגה')
  const club = competitionItems.find(item => item.label === 'רמת מועדון')

  if (primaryProfile?.label) {
    badges.push(`פרופיל מרכזי: ${primaryProfile.label}`)
  }

  if (league?.value && league.value !== '-') {
    badges.push(`ליגה רמה ${league.value}`)
  }

  if (club?.value && club.value !== '-') {
    badges.push(`מועדון רמה ${club.value}`)
  }

  if (opportunity?.exposureLevel) {
    badges.push(`חשיפה: ${opportunity.exposureLevel}`)
  }

  return badges.slice(0, 4)
}

export const buildDataDepth = ({ historyRows, row }) => {
  const rows = (Array.isArray(historyRows) ? historyRows : [])
    .filter(item => !item.placeholder && (item.games || item.minutes || item.starts || item.goals))
  const seasonKeys = [...new Set(rows.map(item => clean(item.seasonKey)).filter(Boolean))]
  const currentGames = Number(row.games || 0)
  const periods = rows.length
  const seasons = seasonKeys.length

  if (!periods) {
    return {
      mode: 'emerging',
      label: 'מידע ראשוני',
      note: 'המידע עדיין בתחילת הצטברות.',
      periods: 0,
      seasons: 0,
    }
  }

  if (seasons <= 1 && currentGames < 10) {
    return {
      mode: 'emerging',
      label: 'מידע ראשוני',
      note: currentGames ? `${currentGames} משחקים בתקופה הנוכחית` : 'תקופה קצרה שעדיין מתהווה',
      periods,
      seasons,
    }
  }

  if (seasons <= 1) {
    return {
      mode: 'emerging',
      label: 'עונה אחת',
      note: `${periods} ${periods === 1 ? 'תקופה מתועדת' : 'תקופות מתועדות'} בעונה`,
      periods,
      seasons,
    }
  }

  if (seasons === 2) {
    return {
      mode: 'comparison',
      label: '2 עונות',
      note: 'קיים בסיס להשוואה בין שתי תקופות מקצועיות.',
      periods,
      seasons,
    }
  }

  return {
    mode: 'timeline',
    label: `${seasons} עונות`,
    note: 'קיים בסיס למסלול מקצועי רב־עונתי.',
    periods,
    seasons,
  }
}

export const buildNextActions = ({ player, row }) => {
  const agentStatus = clean(player?.agent?.status)
  const scoringGames = row?.goalDistribution?.scoringGames
  const hasGoalDistribution = scoringGames !== null &&
    scoringGames !== undefined &&
    String(scoringGames).trim() !== ''
  const actions = [
    !['yes', 'no'].includes(agentStatus)
      ? {
          id: 'agent',
          title: 'עדכון סטטוס סוכן',
          description: 'יש לבחור אם לשחקן יש סוכן ולהוסיף טלפונים במידת הצורך.',
          quickAnswer: true,
          type: 'agent',
        }
      : null,
    !hasGoalDistribution
      ? {
          id: 'additional',
          title: 'עדכון פיזור שערים',
          description: 'הזינו כמה הופעות הסתיימו בשער של השחקן.',
          quickAnswer: true,
          type: 'additional',
        }
      : null,
  ].filter(Boolean)

  if (actions.length) return actions

  return [{
    id: 'continue_watch',
    title: 'המשך מעקב',
    description: 'להמשיך לעקוב אחרי המדידה המקצועית הבאה.',
    quickAnswer: false,
    type: 'watch',
  }]
}

