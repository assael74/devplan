// functions/src/triggers/meetings/onMeetingCreated.trigger.js

const { onDocumentUpdated } = require('firebase-functions/v2/firestore')
const { clean } = require('../../shared/clean')
const {
  scheduleNotify,
  REGION,
} = require('../../services/notifications/scheduleNotify')

const MEETING_INFO_DOC_PATH = 'meetingShorts/8V1UmfUSpQwdx9LdWzeD'

function getList(data) {
  return Array.isArray(data?.list) ? data.list : []
}

function mapById(list = []) {
  const map = new Map()

  for (const item of list) {
    const id = clean(item?.id)
    if (!id) continue
    map.set(id, item)
  }

  return map
}

function getAddedItems(beforeList = [], afterList = []) {
  const beforeMap = mapById(beforeList)
  const added = []

  for (const item of afterList) {
    const id = clean(item?.id)
    if (!id) continue
    if (!beforeMap.has(id)) added.push(item)
  }

  return added
}

function resolveMeetingStartMs(meeting) {
  const startAtMs = Number(meeting?.startAtMs)

  if (!Number.isNaN(startAtMs) && startAtMs > 0) {
    return startAtMs
  }

  return null
}

async function handleCreatedMeeting(meeting) {
  const meetingId = clean(meeting?.id)
  if (!meetingId) {
    console.log('onMeetingCreated skip: missing meetingId')
    return
  }

  const meetingType = clean(meeting?.type)
  if (meetingType !== 'personal') {
    console.log('onMeetingCreated skip: unsupported meetingType', {
      meetingId,
      meetingType,
    })
    return
  }

  const recipientUserId = clean(meeting?.createdById)
  if (!recipientUserId) {
    console.log('onMeetingCreated skip: missing recipientUserId', {
      meetingId,
    })
    return
  }

  const playerId = clean(meeting?.playerId)
  const playerName = clean(meeting?.meetingFor)
  const meetingDate = clean(meeting?.meetingDate)
  const meetingHour = clean(meeting?.meetingHour)
  const startAtMs = resolveMeetingStartMs(meeting)

  if (!startAtMs) {
    console.log('onMeetingCreated skip: missing or invalid startAtMs', {
      meetingId,
      startAtMs,
    })
    return
  }

  const notifyAt = new Date(
    Math.max(Date.now() + 60_000, startAtMs - 60 * 60 * 1000)
  )

  await scheduleNotify({
    when: notifyAt,
    payload: {
      kind: 'meeting_upcoming',
      recipientUserId,
      meetingId,
      playerId,
      playerName,
      meetingType,
      meetingDate,
      meetingHour,
      reminderType: '60m',
      deepLink: playerId ? `/players/${playerId}?tab=meetings` : '',
    },
  })
}

const onMeetingCreated = onDocumentUpdated(
  {
    region: REGION,
    document: MEETING_INFO_DOC_PATH,
  },
  async (event) => {
    const beforeData = event.data?.before?.data?.() || {}
    const afterData = event.data?.after?.data?.() || {}

    const beforeList = getList(beforeData)
    const afterList = getList(afterData)

    const addedItems = getAddedItems(beforeList, afterList)

    if (!addedItems.length) {
      console.log('onMeetingCreated skip: no added items detected')
      return
    }

    for (const meeting of addedItems) {
      await handleCreatedMeeting(meeting)
    }
  }
)

module.exports = {
  onMeetingCreated,
}
