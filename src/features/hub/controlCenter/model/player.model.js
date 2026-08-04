// src/features/hub/controlCenter/model/player.model.js

import {
  PLAYER_PROJECT_TABS,
  PLAYER_TABS,
  PRIVATE_PLAYER_TABS,
} from '../../playerProfile/playerProfile.routes.js'
import { normalizePlayerPayments } from '../../playerProfile/sharedLogic/payments/payments.normalize.js'
import { resolveEntityAvatar } from '../../../../ui/core/avatars/fallbackAvatar.js'
import playerImage from '../../../../ui/core/images/playerImage.jpg'

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function countValues(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 0

  return Object.values(value).filter((item) => item !== null && item !== '').length
}

function getTabs(player) {
  if (player?.type === 'project') return PLAYER_PROJECT_TABS

  if (player?.isPrivatePlayer === true || player?.playerSource === 'private') {
    return PRIVATE_PLAYER_TABS
  }

  return PLAYER_TABS
}

function getCount(player, key) {
  if (key === 'meetings') return asArray(player?.meetings).length
  if (key === 'games') return asArray(player?.playerGames || player?.games).length
  if (key === 'videoAnalysis') return asArray(player?.videos || player?.videoAnalysis).length
  if (key === 'payments') return asArray(player?.payments || player?.playerPayments).length
  if (key === 'trainings') return asArray(player?.trainings || player?.trainingWeeks).length

  if (key === 'activity') {
    return asArray(player?.followUps).filter((item) => {
      return item?.kind === 'followUp' && item?.status === 'open'
    }).length
  }

  if (key === 'abilities') {
    return asArray(player?.abilities).length || countValues(player?.abilitiesState)
  }

  return null
}

function money(value) {
  const amount = Number(value || 0)

  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(amount)
}

function getPaymentSummary(player) {
  const payments = normalizePlayerPayments(player)
  const active = payments.find((item) => {
    return item?.typeId === 'privateAgreement' && item?.agreementStatus !== 'closed'
  })

  if (!active) {
    return {
      primary: payments.length ? `${payments.length} תשלומים` : 'לא נפתח תשלום',
      secondary: payments.length ? 'היסטוריית תשלומים' : 'פתיחת תשלום בכרטיס השחקן',
    }
  }

  return {
    primary: `${money(active.paidAmount)} שולם`,
    secondary: `${money(active.remainingAmount)} נותר לתשלום`,
  }
}

function getSummary(player, key, count) {
  if (key === 'info') {
    const values = [player?.position, player?.team?.teamYear || player?.birthYear].filter(Boolean)

    return {
      primary: values.join(' · ') || 'פרטי שחקן',
      secondary: 'מידע אישי ושיוך מקצועי',
    }
  }

  if (key === 'abilities') {
    return {
      primary: `${count || 0} יכולות עודכנו`,
      secondary: 'הערכה מקצועית ופוטנציאל',
    }
  }

  if (key === 'games') {
    return {
      primary: `${count || 0} משחקים`,
      secondary: 'הופעות, דקות ונתוני משחק',
    }
  }

  if (key === 'performance') {
    return {
      primary: 'מדדי ביצוע',
      secondary: 'מגמות וניתוח מקצועי',
    }
  }

  if (key === 'meetings') {
    return {
      primary: `${count || 0} מפגשים`,
      secondary: 'פגישות, תובנות וקטעי וידאו',
    }
  }

  if (key === 'trainings') {
    return {
      primary: `${count || 0} אימונים`,
      secondary: 'מעקב אחר פעילות האימונים',
    }
  }

  if (key === 'videoAnalysis') {
    return {
      primary: `${count || 0} ניתוחי וידאו`,
      secondary: 'צפייה, תגים ותובנות',
    }
  }

  if (key === 'payments') return getPaymentSummary(player)

  if (key === 'activity') {
    return {
      primary: `${count || 0} משימות פתוחות`,
      secondary: 'הערות ומעקב שוטף',
    }
  }

  return {
    primary: `${count || 0} רשומות`,
    secondary: 'מעבר לתהליך המלא',
  }
}

const DOMAIN_PRIORITY = {
  games: 10,
  abilities: 20,
  performance: 30,
  videoAnalysis: 40,
  info: 50,
  meetings: 60,
  trainings: 70,
  payments: 80,
  activity: 90,
}

function getDomainStatus(key, count) {
  if (key === 'activity') return count > 0 ? 'attention' : 'ok'
  if (['games', 'abilities', 'videoAnalysis'].includes(key)) return count > 0 ? 'ok' : 'missing'
  if (count === 0) return 'empty'
  return 'info'
}

function buildDomain(player, tab) {
  const count = getCount(player, tab.key)
  const summary = getSummary(player, tab.key, count)

  return {
    id: tab.key,
    label: tab.label,
    iconId: tab.iconKey,
    colorKey: tab.color,
    route: `/players/${player.id}/${tab.key}`,
    count,
    primary: summary.primary,
    secondary: summary.secondary,
    status: getDomainStatus(tab.key, count),
    priority: DOMAIN_PRIORITY[tab.key] || 999,
    actionText: 'פתח',
  }
}

function getProfileCompleteness(player) {
  const fields = [
    player?.playerFullName || player?.name,
    player?.club?.clubName || player?.clubName,
    player?.team?.teamName || player?.teamName,
    player?.team?.teamYear || player?.birthYear,
    player?.position,
  ]
  const completed = fields.filter(Boolean).length

  return Math.round((completed / fields.length) * 100)
}

function buildAttentionItems({ gamesCount, abilitiesCount, videosCount, openTasks }) {
  return [
    gamesCount ? null : { id: 'missingGames', status: 'missing', text: 'חסרים נתוני משחקים' },
    abilitiesCount ? null : { id: 'missingAbilities', status: 'missing', text: 'לא עודכנו יכולות' },
    videosCount ? null : { id: 'missingVideos', status: 'missing', text: 'אין ניתוחי וידאו' },
    openTasks ? { id: 'openTasks', status: 'attention', text: `${openTasks} משימות מעקב פתוחות` } : null,
  ].filter(Boolean)
}

function buildKpis({ completeness, gamesCount, videosCount, openTasks }) {
  return [
    { id: 'profileCompleteness', label: 'שלמות כרטיס', value: `${completeness}%`, secondary: 'פרטי שחקן ושיוך' },
    { id: 'games', label: 'משחקים', value: gamesCount, secondary: 'נתוני משחק זמינים' },
    { id: 'videos', label: 'וידאו', value: videosCount, secondary: 'ניתוחים משויכים' },
    { id: 'openTasks', label: 'מעקב', value: openTasks, secondary: openTasks ? 'דורש טיפול' : 'אין משימות פתוחות' },
  ]
}

export function buildPlayerModel(player) {
  if (!player?.id) return null

  const isPrivate = player?.isPrivatePlayer === true || player?.playerSource === 'private'
  const subtitle = [
    player?.club?.clubName || player?.clubName,
    player?.team?.teamName || player?.teamName,
    player?.team?.teamYear || player?.birthYear,
    player?.position,
  ].filter(Boolean).join(' · ')

  const avatar = resolveEntityAvatar({
    entityType: 'player',
    entity: player,
    parentEntity: player?.team || player?.club,
    playerFallback: playerImage,
  })

  const gamesCount = getCount(player, 'games')
  const abilitiesCount = getCount(player, 'abilities')
  const videosCount = getCount(player, 'videoAnalysis')
  const openTasks = getCount(player, 'activity') || 0
  const completeness = getProfileCompleteness(player)
  const attentionItems = buildAttentionItems({ gamesCount, abilitiesCount, videosCount, openTasks })

  return {
    entity: player,
    avatar,
    entityType: isPrivate ? 'privatePlayer' : 'player',
    title: player?.playerFullName || player?.name || 'שחקן',
    subtitle,
    profileRoute: `/players/${player.id}`,
    actionLabel: 'לכרטיס השחקן',
    healthStatus: attentionItems.length ? 'attention' : 'ok',
    kpis: buildKpis({ completeness, gamesCount, videosCount, openTasks }),
    attentionItems,
    domains: getTabs(player)
      .map((tab) => buildDomain(player, tab))
      .sort((a, b) => a.priority - b.priority),
  }
}
