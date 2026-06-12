// ui/forms/helpers/meetingsForm.helpers.js

const clean = (v) => String(v ?? '').trim()

export function buildMeetingStartAtMs(meetingDate, meetingHour) {
  const date = clean(meetingDate)
  const hour = clean(meetingHour)

  if (!date || !hour) return null

  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = hour.split(':').map(Number)

  if (
    !year || !month || !day ||
    Number.isNaN(hours) || Number.isNaN(minutes)
  ) {
    return null
  }

  const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0)
  const time = localDate.getTime()

  return Number.isNaN(time) ? null : time
}
