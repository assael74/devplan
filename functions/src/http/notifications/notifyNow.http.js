// functions/src/http/notifications/notifyNow.http.js

const { onRequest } = require('firebase-functions/v2/https')
const { clean } = require('../../shared/clean')
const { REGION } = require('../../services/notifications/scheduleNotify')
const {
  createMeetingUpcomingNotification,
} = require('../../services/meetings/createMeetingUpcomingNotification')

const notifyNow = onRequest({ region: REGION }, async (req, res) => {
  try {
    const payload = req.body || {}
    const kind = clean(payload?.kind)

    switch (kind) {
      case 'meeting_upcoming': {
        const notification = await createMeetingUpcomingNotification({
          recipientUserId: payload?.recipientUserId,
          meetingId: payload?.meetingId,
          playerId: payload?.playerId,
          playerName: payload?.playerName,
          meetingType: payload?.meetingType,
          meetingDate: payload?.meetingDate,
          meetingHour: payload?.meetingHour,
          reminderType: payload?.reminderType || '24h',
          deepLink: payload?.deepLink || (
            payload?.playerId
              ? `/players/${payload.playerId}?tab=meetings`
              : ''
          ),
        })

        return res.status(200).json({
          ok: true,
          kind,
          notificationId: notification?.id || null,
        })
      }

      default:
        return res.status(400).json({
          ok: false,
          error: 'unsupported notification kind',
        })
    }
  } catch (error) {
    console.error('notifyNow error', error)

    return res.status(500).json({
      ok: false,
      error: error?.message || 'internal error',
    })
  }
})

module.exports = {
  notifyNow,
}
