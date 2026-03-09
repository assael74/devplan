// features/videoHub/videoHub.context.js
const safeId = (v) => (v == null ? '' : String(v))

export function buildVideoHubContext(core) {
  const clubs = Array.isArray(core?.clubs) ? core.clubs : []
  const teams = Array.isArray(core?.teams) ? core.teams : []
  const players = Array.isArray(core?.players) ? core.players : []
  const meetings = Array.isArray(core?.meetings) ? core.meetings : []
  const tags = Array.isArray(core?.tags) ? core.tags : []

  // “context contract” שמשרת SelectFields + Create forms
  return {
    clubs,
    teams,
    players,
    meetings,
    tags,

    clubById: core?.clubById || new Map(),
    teamById: core?.teamById || new Map(),
    playerById: core?.playerById || new Map(),
    meetingsById: core?.meetingsById || new Map(),

    // אופציונלי: אם יש לך components שמצפים גם ל-short docs
    clubsShorts: core?.clubsShorts || [],
    teamsShorts: core?.teamsShorts || [],
    playersShorts: core?.playersShorts || [],
    meetingsShorts: core?.meetingsShorts || [],

    // signal
    loading: core?.loading === true,
    error: core?.error || null,

    // מזהה סטנדרטי (אם בעתיד תצטרך)
    ctxKey: `videoHub:${safeId(core?.clubs?.length)}:${safeId(core?.teams?.length)}:${safeId(core?.players?.length)}`,
  }
}
