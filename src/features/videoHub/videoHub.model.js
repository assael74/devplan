export const VIDEO_TAB = {
  GENERAL: 'general',
  ANALYSIS: 'analysis',
}

export const VIDEO_TYPE = {
  GENERAL: 'general',
  ANALYSIS: 'analysis',
}

// MVP model (אחיד, עם ענפים לפי type)
export const makeVideo = (v = {}) => ({
  id: v.id || crypto.randomUUID(),
  type: v.type || VIDEO_TYPE.GENERAL,
  title: String(v.title || '').trim(),
  tags: Array.isArray(v.tags) ? v.tags : [],
  createdAt: v.createdAt || Date.now(),

  // analysis only
  teamId: v.teamId || null,
  playerId: v.playerId || null,

  // general only
  source: v.source || null, // 'youtube' | 'instagram' | 'link'
  url: v.url || '',
  videoLink: v.videoLink || '',
  sharedAt: Array.isArray(v.sharedAt) ? v.sharedAt : [], // timestamps
  sharedWith: v.sharedWith || { teams: [], players: [] }, // ids
})
