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
    const values = [
      club?.city,
      club?.active === false ? 'בארכיון' : 'פעיל',
    ].filter(Boolean)

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
  }
}

export function buildClubModel(club) {
  if (!club?.id) return null

  const subtitle = [
    club?.city,
    club?.active === false ? 'בארכיון' : '',
  ].filter(Boolean).join(' · ')

  const avatar = resolveEntityAvatar({
    entityType: 'club',
    entity: club,
  })

  return {
    entity: club,
    avatar,
    entityType: 'club',
    title: club?.clubName || club?.name || 'מועדון',
    subtitle,
    profileRoute: `/clubs/${club.id}`,
    domains: CLUB_TABS.map((tab) => buildDomain(club, tab)),
  }
}
