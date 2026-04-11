// src/features/notifications/logic/notifications.display.logic.js

import { getFullDateIl } from '../../../shared/format/dateUtiles'
import { getNotificationCategoryMeta } from './notifications.logic'
import { buildNotificationEntities } from './notifications.entities.logic'

function getPlayerAvatar(player) {
  return (player?.photo || '' )
}

function getTeamLogo(team) {
  return (team?.photo ||'')
}

function getClubLogo(club) {
  return (club?.photo || '')
}

function buildMeetingDisplay(notification = {}, entities = {}) {
  const meetingType =
    notification?.meetingType ||
    notification?.context?.meetingType ||
    ''

  const reminderType =
    notification?.reminderType ||
    notification?.context?.reminderType ||
    '24h'

  const meetingDate =
    notification?.meetingDate ||
    notification?.context?.meetingDate ||
    ''

  const meetingHour =
    notification?.meetingHour ||
    notification?.context?.meetingHour ||
    ''

  const playerName =
    entities?.player?.playerFullName ||
    notification?.context?.playerName ||
    notification?.playerName ||
    ''

  const teamName =
    entities?.team?.teamName ||
    notification?.context?.teamName ||
    notification?.teamName ||
    ''

  const formattedDate = meetingDate ? getFullDateIl(meetingDate) : ''
  const timingLabel = reminderType === '60m' ? 'בעוד כשעה' : 'מחר'

  if (meetingType === 'personal') {
    return {
      title: `פגישה אישית ${timingLabel}`,
      body: [playerName, formattedDate, meetingHour].filter(Boolean).join(' · '),
      avatar: getPlayerAvatar(entities?.player),
      logo: getTeamLogo(entities?.team) || getClubLogo(entities?.club),
    }
  }

  if (meetingType === 'team') {
    return {
      title: `פגישת קבוצה ${timingLabel}`,
      body: [meetingHour, formattedDate, teamName].filter(Boolean).join(' · '),
      avatar: '',
      logo: getTeamLogo(entities?.team) || getClubLogo(entities?.club),
    }
  }

  return {
    title: notification?.title || 'פגישה מתקרבת',
    body: [meetingHour, formattedDate, playerName || teamName].filter(Boolean).join(' · ') || notification?.body || '',
    avatar: getPlayerAvatar(entities?.player),
    logo: getTeamLogo(entities?.team) || getClubLogo(entities?.club),
  }
}

function buildAbilitiesDisplay(notification = {}, entities = {}) {
  const actorName =
    notification?.actorName ||
    notification?.context?.actorName ||
    ''

  const playerName =
    entities?.player?.playerFullName ||
    notification?.context?.playerName ||
    notification?.playerName ||
    ''

  return {
    title: 'התקבל טופס חדש',
    body: [actorName, playerName].filter(Boolean).join(' · ') || notification?.body || '',
    avatar: getPlayerAvatar(entities?.player),
    logo: getTeamLogo(entities?.team) || getClubLogo(entities?.club),
  }
}

function buildGeneralDisplay(notification = {}, entities = {}) {
  return {
    title: notification?.title || 'התראה',
    body: notification?.body || '',
    avatar: getPlayerAvatar(entities?.player),
    logo: getTeamLogo(entities?.team) || getClubLogo(entities?.club),
  }
}

export function buildNotificationDisplay(notification = {}, maps = {}) {
  const entities = buildNotificationEntities(notification, maps)
  const meta = getNotificationCategoryMeta(notification?.category)

  let display = null

  switch (notification?.category) {
    case 'meeting_upcoming':
    case 'meeting':
      display = buildMeetingDisplay(notification, entities)
      break

    case 'abilities_form_submitted':
      display = buildAbilitiesDisplay(notification, entities)
      break

    default:
      display = buildGeneralDisplay(notification, entities)
      break
  }

  return {
    ...notification,
    entities,
    meta,
    display,
  }
}
