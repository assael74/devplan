// features/videoHub/videoHub.context.js

import {
  VIDEO_SEED_TAGS,
  VIDEO_SEED_TAG_BY_ID,
} from '../../../shared/video/index.js'

const safeId = value => (value == null ? '' : String(value))

export function buildVideoHubContext(core) {
  const clubs = Array.isArray(core?.clubs) ? core.clubs : []
  const teams = Array.isArray(core?.teams) ? core.teams : []
  const players = Array.isArray(core?.players) ? core.players : []
  const meetings = Array.isArray(core?.meetings) ? core.meetings : []

  return {
    clubs,
    teams,
    players,
    meetings,
    tags: VIDEO_SEED_TAGS,
    tagOptions: VIDEO_SEED_TAGS,
    videoTags: VIDEO_SEED_TAGS,
    analysisTags: VIDEO_SEED_TAGS,
    tagsById: VIDEO_SEED_TAG_BY_ID,

    clubById: core?.clubById || new Map(),
    teamById: core?.teamById || new Map(),
    playerById: core?.playerById || new Map(),
    meetingsById: core?.meetingsById || new Map(),

    clubsShorts: core?.clubsShorts || [],
    teamsShorts: core?.teamsShorts || [],
    playersShorts: core?.playersShorts || [],
    meetingsShorts: core?.meetingsShorts || [],

    loading: core?.loading === true,
    error: core?.error || null,

    ctxKey: `videoHub:${safeId(core?.clubs?.length)}:${safeId(core?.teams?.length)}:${safeId(core?.players?.length)}`,
  }
}
