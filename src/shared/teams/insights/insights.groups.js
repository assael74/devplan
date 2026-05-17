// src/shared/teams/insights/insights.groups.js

import {
  buildTeamGroupDiagnosis,
} from './insights.diagnosis.js'

import {
  buildTeamInsightPlayer,
} from './insights.players.js'

const emptyArray = []

const toNum = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
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

const avg = ({
  values,
  weights,
}) => {
  const totalWeight = weights.reduce((sumValue, item) => {
    return sumValue + item
  }, 0)

  if (!totalWeight) return null

  const total = values.reduce((sumValue, value, index) => {
    return sumValue + value * weights[index]
  }, 0)

  return Number((total / totalWeight).toFixed(2))
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

const buildHealth = players => {
  const checked = players.filter(player => player.ratingRaw !== null)
  const weakPlayers = checked.filter(player => player.isWeak)

  const weakMinutes = sum(weakPlayers, 'minutes')
  const totalMinutes = sum(players, 'minutes')
  const damageScore = sum(weakPlayers, 'damageScore')
  const weakWeightedTva = Number(sum(weakPlayers, 'tva').toFixed(2))

  return {
    checked: checked.length,
    total: players.length,

    weakCount: weakPlayers.length,
    weakRate: pct(weakPlayers.length, checked.length),

    weakWeightedTva,
    weakDamage: weakWeightedTva,
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
  const involvement = sum(players, 'involvement')

  return {
    avgRating: avg({ values, weights }),
    totalTva: Number(sum(players, 'tva').toFixed(2)),
    goals: sum(players, 'goals'),
    assists: sum(players, 'assists'),
    involvement,
    involvementPerGame: games
      ? Number((involvement / games).toFixed(2))
      : null,
    std: null,
    range: null,
  }
}

const buildCards = ({ health, metrics, sample, diagnosis }) => {
  return [
    {
      id: 'checked',
      label: 'נבדקו',
      value: `${sample.checked}/${sample.players}`,
      sub: 'שחקנים במדגם',
      icon: 'players',
      color: 'neutral',
    },
    {
      id: 'weak',
      label: 'מתחת למצופה',
      value: health.weakCount,
      sub: diagnosis.hasRisk
        ? 'דורש בדיקה'
        : 'בטווח תקין',
      icon: 'warning',
      color: diagnosis.riskTone,
    },
    {
      id: 'damage',
      label: 'נזק מצטבר',
      value: health.weakWeightedTva
        ? `${health.weakWeightedTva}`
        : '0',
      sub: 'TVA שלילי במקבץ',
      icon: 'trendDown',
      color: health.weakWeightedTva < 0
        ? diagnosis.riskTone
        : 'success',
    },
    {
      id: 'impact',
      label: 'TVA כולל',
      value: metrics.totalTva > 0
        ? `+${metrics.totalTva}`
        : `${metrics.totalTva}`,
      sub: 'השפעה מצטברת',
      icon: 'impact',
      color: metrics.totalTva < 0 ? 'warning' : 'success',
    },
  ]
}

const buildDetails = ({ sample, health, diagnosis }) => {
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

  if (!diagnosis.hasRisk) {
    return [
      {
        id: 'health',
        label: 'תקינות המקבץ',
        text: `${sample.checked} שחקנים נבדקו, ללא סיכון משמעותי.`,
      },
      {
        id: 'impact',
        label: 'השפעה מצטברת',
        text: 'לא זוהה נזק משמעותי בתוך המקבץ.',
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
      id: 'risk',
      label: 'שחקנים לבדיקה',
      text: `${health.weakCount}/${sample.checked} שחקנים נמצאים מתחת לציפייה.`,
    },
    {
      id: 'damage',
      label: 'נזק מצטבר',
      text: `TVA שלילי במקבץ: ${health.weakWeightedTva}. נזק משוקלל: ${health.damageScore}.`,
    },
    {
      id: 'diagnosis',
      label: diagnosis.label,
      text: diagnosis.text,
    },
  ]
}

const buildGroupPlayers = ({ players, scoresMap }) => {
  const safePlayers = Array.isArray(players) ? players : emptyArray

  return safePlayers.map(player => {
    return buildTeamInsightPlayer({
      player,
      scoresMap,
    })
  })
}

export const buildTeamInsightGroup = ({
  item = {},
  players = emptyArray,
  scoresMap = {},
} = {}) => {
  const groupPlayers = buildGroupPlayers({
    players,
    scoresMap,
  })

  const sample = buildSample(groupPlayers)
  const health = buildHealth(groupPlayers)
  const metrics = buildMetrics(groupPlayers)

  const score = metrics.avgRating

  const diagnosis = buildTeamGroupDiagnosis({
    roleId: item.roleId || item.id,
    score,
    totalTva: metrics.totalTva,
    weakCount: health.weakCount,
    checked: sample.checked,
    damageScore: health.damageScore,
  })

  return {
    id: item.id,
    label: item.label,
    icon: item.icon || item.id || 'insights',

    roleId: item.roleId || '',
    aspectId: item.aspectId || '',

    score,
    scoreLabel: getScoreLabel(score),
    scoreTone: diagnosis.groupTone,

    diagnosis,
    sample,
    health,
    metrics,

    cards: buildCards({
      health,
      metrics,
      sample,
      diagnosis,
    }),

    players: groupPlayers,
    weakPlayers: sortByDamage(
      groupPlayers.filter(player => player.isWeak)
    ),
    topPlayers: sortByRating(
      groupPlayers.filter(player => player.isTop)
    ),

    details: buildDetails({
      sample,
      health,
      diagnosis,
    }),
  }
}

const buildSummary = groups => {
  const checkedGroups = groups.filter(group => group.sample.checked > 0)
  const dangerGroups = groups.filter(group => group.diagnosis.groupTone === 'danger')
  const alertGroups = groups.filter(group => {
    return ['danger', 'warning', 'primary'].includes(group.diagnosis.alertTone)
  })

  const scoreGroups = checkedGroups.filter(group => group.score !== null)
  const totalScore = scoreGroups.reduce((sumValue, group) => {
    return sumValue + toNum(group.score)
  }, 0)

  return {
    groups: groups.length,
    checkedGroups: checkedGroups.length,
    alertGroups: alertGroups.length,
    dangerGroups: dangerGroups.length,
    avgScore: scoreGroups.length
      ? Number((totalScore / scoreGroups.length).toFixed(2))
      : null,
    totalDamage: Number(groups.reduce((sumValue, group) => {
      return sumValue + toNum(group.health.damageScore)
    }, 0).toFixed(2)),
  }
}

const getStatus = groups => {
  const hasChecked = groups.some(group => group.sample.checked > 0)

  return hasChecked
    ? {
        id: 'ready',
        label: 'מחושב',
        color: 'success',
      }
    : {
        id: 'empty',
        label: 'אין מדגם',
        color: 'neutral',
      }
}

export const buildTeamInsightAspect = ({
  aspect,
  items = emptyArray,
  scoresMap,
}) => {
  const groups = items.map(item => {
    return buildTeamInsightGroup({
      item: {
        ...item,
        aspectId: aspect.id,
      },
      players: item.players,
      scoresMap,
    })
  })

  return {
    id: aspect.id,
    title: aspect.title,
    icon: aspect.icon,
    status: getStatus(groups),
    groups,
    summary: buildSummary(groups),
  }
}
