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

  return Object.values(value).filter((item) => {
    return item !== null && item !== ''
  }).length
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
      secondary: payments.length ? 'היסטוריית תשלומים' : 'פתיחת תשלום בפרופיל המלא',
    }
  }

  return {
    primary: `${money(active.paidAmount)} שולם`,
    secondary: `${money(active.remainingAmount)} נותר לתשלום`,
  }
}

function getSummary(player, key, count) {
  if (key === 'info') {
    const values = [
      player?.position,
      player?.team?.teamYear || player?.birthYear,
    ].filter(Boolean)

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
  }
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

  return {
    entity: player,
    avatar,
    entityType: isPrivate ? 'privatePlayer' : 'player',
    title: player?.playerFullName || player?.name || 'שחקן',
    subtitle,
    profileRoute: `/players/${player.id}`,
    domains: getTabs(player).map((tab) => buildDomain(player, tab)),
  }
}
