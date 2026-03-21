import {
  safeId,
  safeArr,
  addMinutes,
  buildEventKey,
} from './calendar.hub.utils.js'
import {
  normalizeCalendarEvent,
  resolveTrainingStartAt,
} from './calendar.hub.base.js'

export function normalizeTrainingEvent(trainingRaw, team) {
  const startAt = resolveTrainingStartAt(trainingRaw)
  if (!startAt) return null

  return normalizeCalendarEvent({
    id: safeId(trainingRaw?.id),
    eventKey: buildEventKey({
      source: 'team',
      type: 'training',
      entityId: team?.id,
      itemId: safeId(trainingRaw?.id),
      startAt,
    }),

    type: 'training',
    source: 'team',

    startAt,
    endAt: addMinutes(startAt, Number(trainingRaw?.durationMin || 90)),
    durationMin: Number(trainingRaw?.durationMin || 90),

    title: trainingRaw?.title || trainingRaw?.name || 'אימון',
    status: trainingRaw?.status || 'planned',

    teamId: team?.id,
    teamName: team?.teamName,
    clubId: team?.clubId,
    clubName: team?.club?.clubName || team?.clubName || '',

    meta: {
      kind: 'training',
      location: trainingRaw?.location || '',
      pitch: trainingRaw?.pitch || '',
      weekId: trainingRaw?.weekId || '',
    },
  })
}

export function collectTeamTrainings(team) {
  const direct = safeArr(team?.trainings)

  const fromWeeks = safeArr(team?.trainingWeeks).flatMap((week) =>
    safeArr(week?.trainings).map((training) => ({
      ...training,
      weekId: week?.id || '',
    }))
  )

  return [...direct, ...fromWeeks]
}
