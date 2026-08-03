// src/features/hub/controlCenter/model/team.model.js

import { TEAM_TABS } from '../../teamProfile/teamProfile.routes.js'
import { resolveEntityAvatar } from '../../../../ui/core/avatars/fallbackAvatar.js'

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function countValues(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 0

  return Object.values(value).filter((item) => {
    return item !== null && item !== ''
  }).length
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
    const values = [
      team?.club?.clubName || team?.clubName,
      team?.teamYear || team?.birthYear,
    ].filter(Boolean)

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
  }
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

  return {
    entity: team,
    avatar,
    entityType: 'team',
    title: team?.teamName || team?.name || 'קבוצה',
    subtitle,
    profileRoute: `/teams/${team.id}`,
    domains: TEAM_TABS.map((tab) => buildDomain(team, tab)),
  }
}
