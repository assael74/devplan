import { getFullDateIl } from '../../../../../../shared/format/dateUtiles.js'

const safe = value => (value == null ? '' : String(value)).trim()

const firstValue = (...values) => {
  for (const value of values) {
    const text = safe(value)
    if (text) return text
  }
  return ''
}

const normalizeArray = value => (Array.isArray(value) ? value : value ? [value] : [])

const getPlayerName = player =>
  firstValue(
    player?.playerName,
    [player?.playerFirstName, player?.playerLastName].filter(Boolean).join(' '),
    player?.name,
  )

const getTeamName = team => firstValue(team?.teamName, team?.name)

const getMonthYearLabel = video => {
  const year = safe(video?.year)
  const month = safe(video?.month).padStart(2, '0')

  if (year && month && month !== '00') return `${month}/${year}`
  if (year) return year

  return ''
}

const getMeetingDateLabel = video => {
  return firstValue(
    getFullDateIl(video?.meeting?.meetingDate),
    getFullDateIl(video?.meetingDate),
    video?.meetingDate,
  )
}

const hasMeeting = video =>
  safe(video?.contextType) === 'meeting' ||
  safe(video?.objectType) === 'meeting' ||
  safe(video?.meetingId) ||
  Boolean(video?.meeting)

const resolveEntity = video => {
  const playerName = firstValue(
    getPlayerName(video?.player),
    video?.playerName,
    normalizeArray(video?.players).map(getPlayerName).filter(Boolean).join(' · '),
  )
  const teamName = firstValue(getTeamName(video?.team), video?.teamName)

  if (playerName) {
    return {
      type: 'player',
      label: playerName,
      initials: playerName.slice(0, 2),
      tone: 'player',
      avatarSrc: video?.player?.photo || video?.player?.avatar || '',
    }
  }

  if (teamName) {
    return {
      type: 'team',
      label: teamName,
      initials: teamName.slice(0, 2),
      tone: 'team',
      avatarSrc: video?.team?.photo || video?.team?.logo || '',
    }
  }

  return {
    type: 'none',
    label: 'לא משויך',
    initials: '?',
    tone: 'none',
    avatarSrc: '',
  }
}

const getTypeMeta = (video, entity) => {
  const meeting = hasMeeting(video)

  if (meeting && entity.type === 'team') {
    return { label: 'פגישת קבוצה', tone: 'meeting', iconId: 'calendar' }
  }

  if (meeting) {
    return { label: 'פגישה אישית', tone: 'meeting', iconId: 'calendar' }
  }

  if (entity.type === 'team') {
    return { label: 'ניתוח קבוצתי', tone: 'analysis', iconId: 'videoAnalysis' }
  }

  return { label: 'ניתוח אישי', tone: 'analysis', iconId: 'videoAnalysis' }
}

export const buildVideoAnalysisCardModel = video => {
  const title = firstValue(video?.title, video?.name, 'וידאו')
  const entity = resolveEntity(video)
  const type = getTypeMeta(video, entity)
  const meetingDate = getMeetingDateLabel(video)
  const monthYear = getMonthYearLabel(video)
  const dateLabel = hasMeeting(video) ? firstValue(meetingDate, monthYear) : monthYear

  const summary = firstValue(
    video?.summary,
    video?.description,
    video?.notes,
    hasMeeting(video)
      ? `סיכום וידאו מתוך ${type.label}`
      : entity.type === 'team'
        ? 'סקירת קבוצה קצרה לניתוח וידאו'
        : 'דוח אישי קצר לניתוח וידאו',
  )

  return {
    title,
    entity,
    type,
    dateLabel,
    monthYear,
    meetingDate,
    summary,
    isMeeting: hasMeeting(video),
  }
}
