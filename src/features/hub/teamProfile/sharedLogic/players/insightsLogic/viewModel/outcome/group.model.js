// TEAMPROFILE/sharedLogic/players/insightsLogic/viewModel/outcome/group.model.js

import {
  buildDiagnosis,
} from './diagnosis.model.js'

import {
  toOutcomePlayer,
} from './player.model.js'

const emptyArray = []

const toNum = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const avg = ({
  values,
  weights,
}) => {
  const totalWeight = weights.reduce((sum, item) => sum + item, 0)

  if (!totalWeight) return null

  const total = values.reduce((sum, value, index) => {
    return sum + value * weights[index]
  }, 0)

  return Number((total / totalWeight).toFixed(2))
}

const pct = (value, total) => {
  if (!total) return 0

  return Math.round((toNum(value) / toNum(total)) * 100)
}

const sum = (items, key) => {
  return items.reduce((acc, item) => {
    return acc + toNum(item[key])
  }, 0)
}

const getScoreTone = diagnosis => {
  return diagnosis.color || 'neutral'
}

const getScoreLabel = score => {
  return score === null ? '-' : score.toFixed(2)
}

const sortByDamage = players => {
  return [...players].sort((a, b) => {
    return toNum(b.damageScore) - toNum(a.damageScore)
  })
}

const sortByRating = players => {
  return [...players].sort((a, b) => {
    return toNum(b.ratingRaw) - toNum(a.ratingRaw)
  })
}

const buildHealth = players => {
  const checked = players.filter(player => player.ratingRaw !== null)
  const weakPlayers = checked.filter(player => player.isWeak)

  const weakMinutes = sum(weakPlayers, 'minutes')
  const totalMinutes = sum(players, 'minutes')
  const damageScore = sum(weakPlayers, 'damageScore')

  return {
    weakCount: weakPlayers.length,
    weakRate: pct(weakPlayers.length, checked.length),
    weakWeightedTva: Number(sum(weakPlayers, 'tva').toFixed(2)),
    weakMinutes,
    weakMinutesPct: pct(weakMinutes, totalMinutes),
    damageScore: Number(damageScore.toFixed(2)),
  }
}

const buildMetrics = players => {
  const checked = players.filter(player => player.ratingRaw !== null)
  const values = checked.map(player => player.ratingRaw)
  const weights = checked.map(player => Math.max(player.minutes, 1))
  const games = sum(players, 'games')

  return {
    avgRating: avg({ values, weights }),
    totalTva: Number(sum(players, 'tva').toFixed(2)),
    goals: sum(players, 'goals'),
    assists: sum(players, 'assists'),
    involvement: sum(players, 'involvement'),
    involvementPerGame: games
      ? Number((sum(players, 'involvement') / games).toFixed(2))
      : null,
    std: null,
    range: null,
  }
}

const buildSample = players => {
  const checked = players.filter(player => player.ratingRaw !== null)
  const minutes = sum(players, 'minutes')

  return {
    players: players.length,
    checked: checked.length,
    minutes,
    minutesPct: sum(players, 'minutesPct'),
    games: sum(players, 'games'),
    reliability: checked.length ? 'medium' : 'none',
    reliabilityLabel: checked.length ? 'מדגם חלקי' : 'אין מדגם',
  }
}

const buildCards = ({
  score,
  health,
  metrics,
  sample,
  diagnosis,
}) => {
  return [
    {
      id: 'score',
      label: 'ציון מקבץ',
      value: getScoreLabel(score),
      sub: 'משוקלל לפי דקות',
      icon: 'score',
      color: diagnosis.color,
    },
    {
      id: 'weak',
      label: 'מתחת לציפייה',
      value: `${health.weakCount}/${sample.checked}`,
      sub: 'רוחב הבעיה',
      icon: 'warning',
      color: health.weakCount ? 'warning' : 'success',
    },
    {
      id: 'damage',
      label: 'נזק משוקלל',
      value: health.damageScore ? `-${health.damageScore}` : '0',
      sub: 'עומק הבעיה',
      icon: 'trendDown',
      color: health.damageScore ? 'danger' : 'success',
    },
    {
      id: 'impact',
      label: 'TVA',
      value: metrics.totalTva > 0
        ? `+${metrics.totalTva}`
        : `${metrics.totalTva}`,
      sub: 'השפעה מצטברת',
      icon: 'impact',
      color: metrics.totalTva < 0 ? 'danger' : 'success',
    },
  ]
}

const buildDetails = ({
  sample,
  health,
  diagnosis,
}) => {
  const hasProblem = health.weakCount > 0 || health.damageScore > 0

  if (!sample.checked) {
    return [
      {
        id: 'sample',
        label: 'מדגם',
        text: 'אין מספיק נתוני סקורינג כדי לאבחן את המקבץ.',
      },
      {
        id: 'diagnosis',
        label: diagnosis.label,
        text: diagnosis.text,
      },
    ]
  }

  if (!hasProblem) {
    return [
      {
        id: 'health',
        label: 'תקינות המקבץ',
        text: `${sample.checked} שחקנים נבדקו, ללא שחקנים מתחת לציפייה.`,
      },
      {
        id: 'impact',
        label: 'השפעה מצטברת',
        text: 'לא זוהה נזק משמעותי במקבץ.',
      },
      {
        id: 'diagnosis',
        label: diagnosis.label,
        text: diagnosis.text,
      },
    ]
  }

  return [
    {
      id: 'width',
      label: 'רוחב הבעיה',
      text: `${health.weakCount} שחקנים נמצאים מתחת לציפייה (${health.weakRate}%).`,
    },
    {
      id: 'depth',
      label: 'עומק הבעיה',
      text: `נזק משוקלל: ${health.damageScore}. TVA שלילי מצטבר: ${health.weakWeightedTva}.`,
    },
    {
      id: 'diagnosis',
      label: diagnosis.label,
      text: diagnosis.text,
    },
  ]
}

export const buildOutcomeGroup = ({
  item = {},
  players = emptyArray,
  perfMap = {},
} = {}) => {
  const outcomePlayers = players.map(player => {
    return toOutcomePlayer({
      player,
      perfMap,
    })
  })

  const sample = buildSample(outcomePlayers)
  const health = buildHealth(outcomePlayers)
  const metrics = buildMetrics(outcomePlayers)

  const diagnosis = buildDiagnosis({
    checked: sample.checked,
    weakRate: health.weakRate,
    damageScore: health.damageScore,
  })

  const score = metrics.avgRating

  return {
    id: item.id,
    label: item.label,
    icon: item.icon || item.id || 'insights',

    score,
    scoreLabel: getScoreLabel(score),
    scoreTone: getScoreTone(diagnosis),

    diagnosis,
    sample,
    health,
    metrics,

    cards: buildCards({
      score,
      health,
      metrics,
      sample,
      diagnosis,
    }),

    players: outcomePlayers,
    weakPlayers: sortByDamage(
      outcomePlayers.filter(player => player.isWeak)
    ),
    topPlayers: sortByRating(
      outcomePlayers.filter(player => player.isTop)
    ),

    details: buildDetails({
      sample,
      health,
      diagnosis,
    }),
  }
}
