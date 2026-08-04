// src/features/hub/controlCenter/model/team.model.js

import { TEAM_TABS } from '../../teamProfile/teamProfile.routes.js'
import { resolveEntityAvatar } from '../../../../ui/core/avatars/fallbackAvatar.js'

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function countValues(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 0

  return Object.values(value).filter((item) => item !== null && item !== '').length
}

function getCount(team, key) {
  if (key === 'players') return asArray(team?.players || team?.teamPlayers).length
  if (key === 'games') return asArray(team?.teamGames || team?.games).length
  if (key === 'videos') return asArray(team?.videos || team?.videoAnalysis).length
  if (key === 'trainings') return asArray(team?.trainings || team?.trainingWeeks).length

  if (key === 'abilities') {
    return asArray(team?.abilities).length || countValues(team?.abilitiesState)
  }

  return null
}

function getSummary(team, key, count) {
  if (key === 'management') {
    const values = [team?.club?.clubName || team?.clubName, team?.teamYear || team?.birthYear].filter(Boolean)

    return {
      primary: values.join(' · ') || 'פרטי קבוצה',
      secondary: 'מידע, יעדים וניהול הקבוצה',
    }
  }

  if (key === 'trainings') {
    return {
      primary: `${count || 0} אימונים`,
      secondary: 'תכנון ומעקב אחר אימונים',
    }
  }

  if (key === 'players') {
    return {
      primary: `${count || 0} שחקנים`,
      secondary: 'סגל, תפקידים וסטטוס שחקנים',
    }
  }

  if (key === 'games') {
    return {
      primary: `${count || 0} משחקים`,
      secondary: 'תוצאות, הכנה ונתוני משחק',
    }
  }

  if (key === 'performance') {
    const position = team?.position || team?.Position
    const points = team?.points
    const values = [
      position ? `מקום ${position}` : '',
      Number.isFinite(Number(points)) ? `${points} נקודות` : '',
    ].filter(Boolean)

    return {
      primary: values.join(' · ') || 'מדדי ביצוע',
      secondary: 'מגמות וניתוח ביצועי הקבוצה',
    }
  }

  if (key === 'abilities') {
    return {
      primary: `${count || 0} יכולות עודכנו`,
      secondary: 'תמונת מצב מקצועית של הסגל',
    }
  }

  if (key === 'videos') {
    return {
      primary: `${count || 0} ניתוחי וידאו`,
      secondary: 'וידאו קבוצתי וניתוחי שחקנים',
    }
  }

  return {
    primary: `${count || 0} רשומות`,
    secondary: 'מעבר לתהליך המלא',
  }
}

const DOMAIN_PRIORITY = {
  games: 10,
  players: 20,
  performance: 30,
  trainings: 40,
  abilities: 50,
  videos: 60,
  management: 70,
}

function getDomainStatus(key, count) {
  if (['players', 'games'].includes(key)) return count > 0 ? 'ok' : 'missing'
  if (['abilities', 'videos', 'trainings'].includes(key)) return count > 0 ? 'ok' : 'empty'
  return 'info'
}

function buildDomain(team, tab) {
  const count = getCount(team, tab.key)
  const summary = getSummary(team, tab.key, count)

  return {
    id: tab.key,
    label: tab.label,
    iconId: tab.iconKey,
    colorKey: tab.color,
    route: `/teams/${team.id}/${tab.key}`,
    count,
    primary: summary.primary,
    secondary: summary.secondary,
    status: getDomainStatus(tab.key, count),
    priority: DOMAIN_PRIORITY[tab.key] || 999,
    actionText: 'פתח',
  }
}

function getProfileCompleteness(team) {
  const fields = [
    team?.teamName || team?.name,
    team?.club?.clubName || team?.clubName,
    team?.teamYear || team?.birthYear,
    team?.leagueName,
  ]
  const completed = fields.filter(Boolean).length

  return Math.round((completed / fields.length) * 100)
}

function buildAttentionItems({ playersCount, gamesCount }) {
  return [
    playersCount ? null : { id: 'missingPlayers', status: 'missing', text: 'לא משויך סגל שחקנים' },
    gamesCount ? null : { id: 'missingGames', status: 'missing', text: 'חסרים נתוני משחקים' },
  ].filter(Boolean)
}

function buildKpis({ completeness, playersCount, gamesCount, videosCount }) {
  return [
    { id: 'profileCompleteness', label: 'שלמות קבוצה', value: `${completeness}%`, secondary: 'פרטי קבוצה ושיוך' },
    { id: 'players', label: 'שחקנים', value: playersCount, secondary: 'שחקנים בסגל' },
    { id: 'games', label: 'משחקים', value: gamesCount, secondary: 'נתוני משחק זמינים' },
    { id: 'videos', label: 'וידאו', value: videosCount, secondary: 'ניתוחים משויכים' },
  ]
}

export function buildTeamModel(team) {
  if (!team?.id) return null

  const subtitle = [
    team?.club?.clubName || team?.clubName,
    team?.teamYear || team?.birthYear,
    team?.leagueName,
  ].filter(Boolean).join(' · ')

  const avatar = resolveEntityAvatar({
    entityType: 'team',
    entity: team,
    parentEntity: team?.club,
    subline: team?.teamYear || '',
  })

  const playersCount = getCount(team, 'players')
  const gamesCount = getCount(team, 'games')
  const videosCount = getCount(team, 'videos')
  const completeness = getProfileCompleteness(team)
  const attentionItems = buildAttentionItems({ playersCount, gamesCount })

  return {
    entity: team,
    avatar,
    entityType: 'team',
    title: team?.teamName || team?.name || 'קבוצה',
    subtitle,
    profileRoute: `/teams/${team.id}`,
    actionLabel: 'לניהול הקבוצה',
    healthStatus: attentionItems.length ? 'attention' : 'ok',
    kpis: buildKpis({ completeness, playersCount, gamesCount, videosCount }),
    attentionItems,
    domains: TEAM_TABS
      .map((tab) => buildDomain(team, tab))
      .sort((a, b) => a.priority - b.priority),
  }
}
