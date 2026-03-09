import { safeArr, safeId, normalizeIds } from '../../utils/data.utils.js'
import { buildArrayIndex } from '../../utils/entity.utils.js'
import {
  ensureEntityMap,
  getPlayerIdsFromMeeting,
  pickFirstId,
} from '../../utils/entity.utils.js'

const getMeetingIdsFromVideo = (video) =>
  normalizeIds(Array.isArray(video?.meetingIds) ? video.meetingIds : video?.meetingId)

const getDirectPlayerIdsFromVideo = (video) =>
  normalizeIds(Array.isArray(video?.playerIds) ? video.playerIds : video?.playerId)

const getTagIdsFromVideo = (video) =>
  normalizeIds(
    video?.tags ??
    video?.tagIds ??
    video?.tagsIds ??
    video?.videoTags ??
    video?.videoTagIds ??
    video?.tagId
  )

export const buildVideosByMeetingId = (videosArr) =>
  buildArrayIndex(videosArr, (video) => getMeetingIdsFromVideo(video))

export const buildVideosByPlayerId = (videosArr, meetingsById) => {
  const meetingMapOk = meetingsById && typeof meetingsById.get === 'function'

  return buildArrayIndex(videosArr, (video) => {
    const directIds = getDirectPlayerIdsFromVideo(video)
    if (!meetingMapOk) return directIds

    const meetingIds = getMeetingIdsFromVideo(video)
    const derivedIds = meetingIds.flatMap((meetingId) => {
      const meeting = meetingsById.get(safeId(meetingId))
      return meeting ? getPlayerIdsFromMeeting(meeting) : []
    })

    return [...directIds, ...derivedIds]
  })
}

export const buildVideosByTeamId = (videosArr, meetingsById) => {
  const meetingMapOk = meetingsById && typeof meetingsById.get === 'function'

  return buildArrayIndex(videosArr, (video) => {
    const keys = [video?.teamId]
    if (!meetingMapOk) return keys

    const meetingIds = getMeetingIdsFromVideo(video)
    for (const meetingId of meetingIds) {
      const meeting = meetingsById.get(safeId(meetingId))
      if (meeting?.teamId) keys.push(meeting.teamId)
    }

    return keys
  })
}

export const buildVideosWithEntities = (
  videosArr,
  { meetingsArr, playersArr, teamsArr, tagsArr } = {}
) => {
  const meetingsMap = ensureEntityMap(meetingsArr, { idKey: 'id', extraKeys: ['ui.id'] })
  const playersMap = ensureEntityMap(playersArr, { idKey: 'id', extraKeys: ['ui.id'] })
  const teamsMap = ensureEntityMap(teamsArr, { idKey: 'id', extraKeys: ['ui.id'] })
  const tagsMap = ensureEntityMap(tagsArr, { idKey: 'id', extraKeys: ['slug'] })

  const resolveMeeting = (video) => {
    const meetingId = pickFirstId(video?.meetingId, video?.meetingIds)
    return meetingId ? meetingsMap.get(meetingId) || null : null
  }

  const resolvePlayer = (video, meeting) => {
    const playerId = pickFirstId(video?.playerId, video?.playerIds)
    if (playerId) return playersMap.get(playerId) || null

    const derivedPlayerId = meeting
      ? pickFirstId(meeting?.playerId, meeting?.playersId)
      : ''

    return derivedPlayerId ? playersMap.get(derivedPlayerId) || null : null
  }

  const resolveTeam = (video, meeting, player) => {
    const teamId = pickFirstId(video?.teamId, meeting?.teamId, player?.teamId)
    return teamId ? teamsMap.get(teamId) || null : null
  }

  const resolveTagsFull = (video) =>
    getTagIdsFromVideo(video)
      .map((id) => tagsMap.get(safeId(id)) || null)
      .filter(Boolean)
      .filter((tag) => tag?.isActive !== false)

  return safeArr(videosArr).map((video) => {
    if (video?.contextType === 'floating') {
      return {
        ...video,
        meeting: null,
        player: null,
        team: null,
        tagsFull: resolveTagsFull(video),
      }
    }

    const meeting = resolveMeeting(video)
    const player = resolvePlayer(video, meeting)
    const team = resolveTeam(video, meeting, player)

    return {
      ...video,
      meeting,
      player,
      team,
      tagsFull: resolveTagsFull(video),
    }
  })
}
