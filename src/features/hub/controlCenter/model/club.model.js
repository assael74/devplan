// src/features/hub/controlCenter/model/club.model.js

import { CLUB_TABS } from '../../clubProfile/clubProfile.routes.js'
import { resolveEntityAvatar } from '../../../../ui/core/avatars/fallbackAvatar.js'

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function getPlayers(club) {
  const playersById = new Map()

  for (const team of asArray(club?.teams)) {
    for (const player of asArray(team?.players)) {
      if (!player?.id) continue
      playersById.set(String(player.id), player)
    }
  }

  return Array.from(playersById.values())
}

function getCount(club, key) {
  if (key === 'teams') return asArray(club?.teams).length
  if (key === 'players') return getPlayers(club).length
  return null
}

function getSummary(club, key, count) {
  if (key === 'management') {
    const values = [club?.city, club?.active === false ? 'בארכיון' : 'פעיל'].filter(Boolean)

    return {
      primary: values.join(' · ') || 'פרטי מועדון',
      secondary: 'צפייה ועדכון בפרופיל המלא',
    }
  }

  if (key === 'teams') {
    return {
      primary: `${count || 0} קבוצות`,
      secondary: 'מעבר לניהול קבוצות המועדון',
    }
  }

  if (key === 'players') {
    return {
      primary: `${count || 0} שחקנים`,
      secondary: 'שחקנים מכל קבוצות המועדון',
    }
  }

  return {
    primary: `${count || 0} רשומות`,
    secondary: 'מעבר לתהליך המלא',
  }
}

const DOMAIN_PRIORITY = {
  teams: 10,
  players: 20,
  management: 30,
}

function getDomainStatus(key, count) {
  if (['teams', 'players'].includes(key)) return count > 0 ? 'ok' : 'missing'
  return 'info'
}

function buildDomain(club, tab) {
  const count = getCount(club, tab.key)
  const summary = getSummary(club, tab.key, count)

  return {
    id: tab.key,
    label: tab.label,
    iconId: tab.iconKey,
    colorKey: tab.color,
    route: `/clubs/${club.id}/${tab.key}`,
    count,
    primary: summary.primary,
    secondary: summary.secondary,
    status: getDomainStatus(tab.key, count),
    priority: DOMAIN_PRIORITY[tab.key] || 999,
    actionText: 'פתח',
  }
}

function getProfileCompleteness(club) {
  const fields = [club?.clubName || club?.name, club?.city || club?.clubCity]
  const completed = fields.filter(Boolean).length

  return Math.round((completed / fields.length) * 100)
}

function buildAttentionItems({ teamsCount, playersCount, isArchived }) {
  return [
    isArchived ? { id: 'archived', status: 'attention', text: 'המועדון נמצא בארכיון' } : null,
    teamsCount ? null : { id: 'missingTeams', status: 'missing', text: 'לא הוגדרו קבוצות במועדון' },
    playersCount ? null : { id: 'missingPlayers', status: 'missing', text: 'לא נמצאו שחקנים במועדון' },
  ].filter(Boolean)
}

function buildKpis({ completeness, teamsCount, playersCount, isArchived }) {
  return [
    { id: 'profileCompleteness', label: 'שלמות מועדון', value: `${completeness}%`, secondary: 'פרטי מועדון ומיקום' },
    { id: 'teams', label: 'קבוצות', value: teamsCount, secondary: 'קבוצות במועדון' },
    { id: 'players', label: 'שחקנים', value: playersCount, secondary: 'שחקנים משויכים' },
    { id: 'status', label: 'סטטוס', value: isArchived ? 'בארכיון' : 'פעיל', secondary: 'מצב פעילות' },
  ]
}

export function buildClubModel(club) {
  if (!club?.id) return null

  const subtitle = [club?.city || club?.clubCity, club?.active === false ? 'בארכיון' : ''].filter(Boolean).join(' · ')

  const avatar = resolveEntityAvatar({
    entityType: 'club',
    entity: club,
  })

  const teamsCount = getCount(club, 'teams')
  const playersCount = getCount(club, 'players')
  const isArchived = club?.active === false
  const completeness = getProfileCompleteness(club)
  const attentionItems = buildAttentionItems({ teamsCount, playersCount, isArchived })

  return {
    entity: club,
    avatar,
    entityType: 'club',
    title: club?.clubName || club?.name || 'מועדון',
    subtitle,
    profileRoute: `/clubs/${club.id}`,
    actionLabel: 'לניהול המועדון',
    healthStatus: attentionItems.length ? 'attention' : 'ok',
    kpis: buildKpis({ completeness, teamsCount, playersCount, isArchived }),
    attentionItems,
    domains: CLUB_TABS
      .map((tab) => buildDomain(club, tab))
      .sort((a, b) => a.priority - b.priority),
  }
}
