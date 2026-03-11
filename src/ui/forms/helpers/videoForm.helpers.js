// ui/forms/helpers/form.helpers.js
export const getVideoModes = (contextType) => {
  const isMeetingMode = contextType === 'meeting'
  const isEntityMode = contextType === 'entity'
  const isFloating = contextType === 'floating'

  return {
    isMeetingMode,
    isEntityMode,
    isFloating,
  }
}

export const getVideoDisabled = (contextType, objectType, hasContext = true, locks = {}) => {
  const { isMeetingMode, isEntityMode, isFloating } = getVideoModes(contextType)

  let disableMeeting = !hasContext || !isMeetingMode

  let disablePlayer =
    !hasContext ||
    isFloating ||
    isMeetingMode ||
    (isEntityMode && objectType === 'team')

  let disableTeam =
    !hasContext ||
    isFloating ||
    isMeetingMode ||
    (isEntityMode && objectType === 'player')

  let disableObjectType = isFloating || !hasContext

  // ✅ Locks override
  if (locks?.lockMeetingId) disableMeeting = true
  if (locks?.lockPlayerId) disablePlayer = true
  if (locks?.lockTeamId) disableTeam = true
  if (locks?.lockObjectType) disableObjectType = true

  return { disableMeeting, disablePlayer, disableTeam, disableObjectType }
}

export const getVideoVisible = (contextType, objectType, locks = {}, draft = {}) => {
  const isMeetingMode = contextType === 'meeting'
  const hasPlayer = !!String(draft?.playerId || '').trim()
  const hasTeam = !!String(draft?.teamId || '').trim()

  if (isMeetingMode) {
    return {
      showContextTypeField: !locks?.lockContextType,
      showObjectTypeField: false,
      showMeetingField: true,
      showPlayerField: hasPlayer,
      showTeamField: !hasPlayer && hasTeam,
    }
  }

  return {
    showContextTypeField: !locks?.lockContextType,
    showObjectTypeField: !locks?.lockObjectType,
    showMeetingField: false,
    showPlayerField: objectType === 'player',
    showTeamField: objectType === 'team',
  }
}
