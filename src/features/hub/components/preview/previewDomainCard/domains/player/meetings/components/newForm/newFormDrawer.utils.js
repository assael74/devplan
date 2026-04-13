// previewDomainCard/domains/player/meetings/components/newForm/newFormDrawer.utils.js

const safe = (v) => (v == null ? '' : String(v).trim())

const isValidDateFormat = (value) => {
  const date = safe(value)
  if (!date) return false

  return /^\d{4}-\d{2}-\d{2}$/.test(date) || /^\d{2}\/\d{2}\/\d{4}$/.test(date)
}

export function buildInitialDraft(context = {}) {
  const entity = context?.entity || null
  const playerId = safe(context?.playerId || entity?.id || context?.player?.id)

  return {
    meetingDate: '',
    meetingHour: '',
    meetingFor: '',
    playerId,
    type: '',
  }
}

export function getValidity(draft = {}) {
  const type = safe(draft?.type)
  const meetingDate = safe(draft?.meetingDate)
  const meetingFor = safe(draft?.meetingFor)

  return {
    okType: !!type,
    okDate: !!meetingDate && isValidDateFormat(meetingDate),
    okFor: !!meetingFor,
  }
}

export function getIsValid(validity = {}) {
  return Boolean(validity?.okType && validity?.okDate && validity?.okFor)
}

export function getIsDirty(draft = {}, initial = {}) {
  return JSON.stringify(draft) !== JSON.stringify(initial)
}
